import { randomUUID } from 'crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parsePurchaseEmail } from '../lib/gemini'
import { listPurchaseMessages } from '../lib/gmail'
import { methodNotAllowed, ok, serverError, unauthorized } from '../lib/response'
import {
  appendExpense,
  getCategories,
  getExistingMessageIds,
  updateSyncState,
} from '../lib/sheets'
import { readSession } from '../lib/session'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  const session = await readSession(req)
  if (!session) return unauthorized(res)

  try {
    const categories = await getCategories(session)
    const existingIds = await getExistingMessageIds(session)
    const messages = await listPurchaseMessages(session)

    let synced = 0
    let skipped = 0

    for (const message of messages) {
      if (existingIds.has(message.id)) {
        skipped++
        continue
      }

      const parsed = await parsePurchaseEmail(message.body, categories)
      if (!parsed.isPurchaseEmail || parsed.amount <= 0) {
        skipped++
        continue
      }

      await appendExpense(session, {
        id: randomUUID(),
        purchaseDate: message.receivedDate,
        name: parsed.name || message.subject,
        parentCategory: parsed.parentCategory,
        category: `${parsed.parentCategory} > ${parsed.childCategory}`,
        amount: parsed.amount,
        platform: parsed.platform,
        status: parsed.status,
        orderId: parsed.orderId,
        imageUrl: message.imageUrl,
        gmailMessageId: message.id,
        createdAt: new Date().toISOString(),
      })

      existingIds.add(message.id)
      synced++
    }

    const lastSyncedAt = new Date().toISOString()
    await updateSyncState(session, lastSyncedAt)

    ok(res, { synced, skipped, lastSyncedAt })
  } catch (error) {
    serverError(res, error)
  }
}
