import { GoogleGenerativeAI } from '@google/generative-ai'
import { getEnv } from './env'
import type { CategoryParent } from './sheets'

export interface ParsedPurchaseEmail {
  isPurchaseEmail: boolean
  name: string
  amount: number
  platform: string
  status: 'Đã giao' | 'Đang giao' | 'Đã hủy' | 'Chờ xử lý'
  orderId: string
  parentCategory: string
  childCategory: string
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

export async function parsePurchaseEmail(
  emailText: string,
  categories: CategoryParent[],
): Promise<ParsedPurchaseEmail> {
  const genAI = new GoogleGenerativeAI(getEnv('GEMINI_API_KEY'))
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })

  const prompt = `Bạn là trợ lý phân tích email mua hàng tiếng Việt.
Trả về JSON duy nhất với schema:
{
  "isPurchaseEmail": boolean,
  "name": string,
  "amount": number,
  "platform": string,
  "status": "Đã giao" | "Đang giao" | "Đã hủy" | "Chờ xử lý",
  "orderId": string,
  "parentCategory": string,
  "childCategory": string
}

Quy tắc:
- Nếu không phải email xác nhận mua hàng/đơn hàng thì isPurchaseEmail=false, các field khác để rỗng hoặc 0.
- amount là số VND, không có ký tự đ.
- Chọn parentCategory và childCategory từ danh sách user cấu hình. Nếu không khớp, dùng "Mua sắm" và "Khác".
- status suy luận từ nội dung email.

Danh mục user:
${buildCategoryPrompt(categories)}

Email:
${emailText.slice(0, 12000)}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const parsed = JSON.parse(text) as ParsedPurchaseEmail

  return {
    isPurchaseEmail: Boolean(parsed.isPurchaseEmail),
    name: String(parsed.name ?? ''),
    amount: Number(parsed.amount ?? 0),
    platform: String(parsed.platform ?? ''),
    status: (parsed.status ?? 'Chờ xử lý') as ParsedPurchaseEmail['status'],
    orderId: String(parsed.orderId ?? ''),
    parentCategory: String(parsed.parentCategory ?? 'Mua sắm'),
    childCategory: String(parsed.childCategory ?? 'Khác'),
  }
}
