import { GoogleGenerativeAI } from '@google/generative-ai'
import { getEnv } from './env'
import type { CategoryParent } from './sheets'

export interface ParsedPurchaseEmail {
  isPurchaseEmail: boolean
  name: string
  amount: number
  currency: string
  platform: string
  status: 'Đã giao' | 'Đang giao' | 'Đã hủy' | 'Chờ xử lý'
  orderId: string
  parentCategory: string
  childCategory: string
}

export interface EmailInput {
  id: string
  subject: string
  body: string
}

function buildCategoryPrompt(categories: CategoryParent[]): string {
  if (categories.length === 0) {
    return 'Không có danh mục tùy chỉnh. Dùng parentCategory="Mua sắm", childCategory="Khác" nếu không chắc.'
  }

  return categories
    .map((parent) => {
      const children = parent.children.map((c) => c.name).join(', ') || '(không có con)'
      return `- ${parent.name}: ${children}`
    })
    .join('\n')
}

function normalizeResult(raw: Partial<ParsedPurchaseEmail>): ParsedPurchaseEmail {
  return {
    isPurchaseEmail: Boolean(raw.isPurchaseEmail),
    name: String(raw.name ?? ''),
    amount: Number(raw.amount ?? 0),
    currency: String(raw.currency ?? ''),
    platform: String(raw.platform ?? ''),
    status: (raw.status ?? 'Chờ xử lý') as ParsedPurchaseEmail['status'],
    orderId: String(raw.orderId ?? ''),
    parentCategory: String(raw.parentCategory ?? 'Mua sắm'),
    childCategory: String(raw.childCategory ?? 'Khác'),
  }
}

function defaultResult(): ParsedPurchaseEmail {
  return normalizeResult({ isPurchaseEmail: false })
}

export async function parsePurchaseEmailsBatch(
  emails: EmailInput[],
  categories: CategoryParent[],
  batchSize = 5,
): Promise<ParsedPurchaseEmail[]> {
  if (emails.length === 0) return []

  const genAI = new GoogleGenerativeAI(getEnv('GEMINI_API_KEY'))
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    generationConfig: { responseMimeType: 'application/json' },
  })

  const allResults: ParsedPurchaseEmail[] = []

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(emails.length / batchSize)

    const emailsSection = batch
      .map(
        (email, idx) =>
          `[${idx}] Subject: "${email.subject}"\nBody:\n${email.body.slice(0, 8000)}`,
      )
      .join('\n\n---\n\n')

    const prompt = `Bạn là trợ lý phân tích email liên quan đến chi tiêu / mua hàng.
Phân tích ${batch.length} email dưới đây và trả về JSON array gồm đúng ${batch.length} objects, theo đúng thứ tự index [0] đến [${batch.length - 1}].

Schema của mỗi object:
{
  "isPurchaseEmail": boolean,
  "name": string,
  "amount": number,
  "currency": string,
  "platform": string,
  "status": "Đã giao" | "Đang giao" | "Đã hủy" | "Chờ xử lý",
  "orderId": string,
  "parentCategory": string,
  "childCategory": string
}

Quy tắc:
- isPurchaseEmail=true nếu email liên quan đến: xác nhận đơn hàng, giao hàng, thanh toán (dù thành công hay thất bại), đăng ký dịch vụ có phí, hóa đơn, invoice.
- isPurchaseEmail=false khi: email hoàn toàn không liên quan đến chi tiêu (marketing thuần túy, newsletter, khuyến mãi chưa mua, v.v.), hoặc email là hoàn tiền / reimbursement / refund / cashback (tiền trả lại cho người dùng, không phải chi tiêu).
- amount là số tiền thực tế trong email (USD, VND, EUR...), trả về số thực không có ký hiệu tiền tệ. Nếu là free trial nhưng email có đề cập số tiền sẽ bị charge khi renewal (ví dụ "$14.99/month after trial") thì lấy số tiền đó. Chỉ trả về 0 khi email hoàn toàn không đề cập bất kỳ số tiền nào.
- currency là mã tiền tệ (VND, USD, EUR...). Nếu không rõ thì để "".
- Chọn parentCategory và childCategory từ danh sách user cấu hình. Nếu không khớp, dùng "Mua sắm" và "Khác".
- status suy luận từ nội dung email: "Đã giao" nếu delivered, "Đang giao" nếu shipped/on the way, "Đã hủy" nếu cancelled, "Chờ xử lý" cho các trường hợp còn lại (payment failed, processing, pending...).

Danh mục user:
${buildCategoryPrompt(categories)}

Emails:
${emailsSection}`

    console.log(
      `[Gemini] Batch ${batchNum}/${totalBatches}: sending ${batch.length} emails (ids: ${batch.map((e) => e.id).join(', ')})`,
    )

    let parsed: Partial<ParsedPurchaseEmail>[] = []
    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()

      console.log(`[Gemini] Batch ${batchNum}/${totalBatches} raw response:`, text)

      try {
        parsed = JSON.parse(text)
        if (!Array.isArray(parsed)) {
          console.warn(`[Gemini] Batch ${batchNum}: response is not an array, wrapping`)
          parsed = [parsed]
        }
      } catch (err) {
        console.error(`[Gemini] Batch ${batchNum}: failed to parse JSON response`, err)
        parsed = []
      }
    } catch (err) {
      console.error(
        `[Gemini] Batch ${batchNum}/${totalBatches} failed (will retry on next sync):`,
        err,
      )
    }

    for (let j = 0; j < batch.length; j++) {
      const item = parsed[j]
      const normalized = item ? normalizeResult(item) : defaultResult()

      console.log(`[Gemini] Batch ${batchNum}[${j}] id=${batch[j].id}:`, {
        isPurchaseEmail: normalized.isPurchaseEmail,
        name: normalized.name,
        amount: normalized.amount,
        currency: normalized.currency,
        platform: normalized.platform,
        status: normalized.status,
        orderId: normalized.orderId,
      })

      allResults.push(normalized)
    }
  }

  return allResults
}
