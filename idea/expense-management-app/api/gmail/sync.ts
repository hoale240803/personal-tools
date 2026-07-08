import { randomUUID } from 'crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parsePurchaseEmailsBatch } from '../lib/gemini'
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

    const newMessages = messages.filter((m) => !existingIds.has(m.id))
    const skippedExisting = messages.length - newMessages.length

    console.log(
      `[Sync] Total: ${messages.length} messages, ${skippedExisting} already synced, ${newMessages.length} new to process`,
    )

    let synced = 0
    let skipped = skippedExisting

    if (newMessages.length > 0) {
      const parsedResults = await parsePurchaseEmailsBatch(newMessages, categories)

      for (let i = 0; i < newMessages.length; i++) {
        const message = newMessages[i]
        const parsed = parsedResults[i]

        console.log(
          `[Sync] Processing id=${message.id} subject="${message.subject}":`,
          `isPurchaseEmail=${parsed.isPurchaseEmail} amount=${parsed.amount} ${parsed.currency}`,
        )

        if (!parsed.isPurchaseEmail) {
          console.log(`[Sync] SKIP: Gemini says isPurchaseEmail=false`)
          skipped++
          continue
        }

        if (parsed.amount <= 0) {
          console.log(`[Sync] SKIP: amount=${parsed.amount} (free trial or no charge)`)
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

        console.log(
          `[Sync] SAVED: "${parsed.name || message.subject}" ${parsed.amount} ${parsed.currency}`,
        )
        existingIds.add(message.id)
        synced++
      }
    }

    const lastSyncedAt = new Date().toISOString()
    await updateSyncState(session, lastSyncedAt)

    ok(res, { synced, skipped, lastSyncedAt })
  } catch (error) {
    serverError(res, error)
  }
}
