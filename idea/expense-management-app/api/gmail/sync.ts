import { randomUUID } from 'crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parsePurchaseEmailsBatch } from '../_lib/gemini'
import {
  countPurchaseMessages,
  listPurchaseMessages,
  type DateRange,
} from '../_lib/gmail'
import { methodNotAllowed, ok, serverError, unauthorized } from '../_lib/response'
import {
  appendExpense,
  appendSyncHistory,
  getCategories,
  getExistingMessageIds,
  updateSyncState,
  type SyncErrorItem,
} from '../_lib/sheets'
import { readSession } from '../_lib/session'
import { getSyncMessageThreshold } from '../_lib/env'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  const session = await readSession(req)
  if (!session) return unauthorized(res)

  const body = req.body ?? {}
  const action: string = typeof body.action === 'string' ? body.action : 'execute'
  const dateRange: DateRange | undefined =
    typeof body.afterEpoch === 'number' && typeof body.beforeEpoch === 'number'
      ? { afterEpoch: body.afterEpoch, beforeEpoch: body.beforeEpoch }
      : undefined

  if (dateRange) {
    console.log(`[Sync] action=${action} range: after:${dateRange.afterEpoch} before:${dateRange.beforeEpoch}`)
  } else {
    console.log(`[Sync] action=${action} (no date range — global)`)
  }

  // ── Count action: fast pre-check only, no body fetch ──────────────────────
  if (action === 'count') {
    try {
      const count = await countPurchaseMessages(session, dateRange)
      const threshold = getSyncMessageThreshold()
      const exceedsThreshold = threshold > 0 && count > threshold

      console.log(
        `[Sync] Count=${count} threshold=${threshold} exceedsThreshold=${exceedsThreshold}`,
      )

      return ok(res, { count, threshold, exceedsThreshold })
    } catch (error) {
      return serverError(res, error)
    }
  }

  // ── Execute action: full sync with history logging ─────────────────────────
  try {
    const startedAt = Date.now()

    const categories = await getCategories(session)
    const existingIds = await getExistingMessageIds(session)
    const messages = await listPurchaseMessages(session, dateRange)

    const newMessages = messages.filter((m) => !existingIds.has(m.id))
    const skippedExisting = messages.length - newMessages.length

    console.log(
      `[Sync] Total: ${messages.length} messages, ${skippedExisting} already synced, ${newMessages.length} new to process`,
    )

    let synced = 0
    let skipped = skippedExisting
    const errors: SyncErrorItem[] = []

    if (newMessages.length > 0) {
      const parsedResults = await parsePurchaseEmailsBatch(newMessages, categories)

      // Dedup by composite key: sender + orderId + amount
      // Key rule: keep newest receivedDate per group; mark all messageIds in group as synced
      type EmailWithParsed = { message: (typeof newMessages)[0]; parsed: (typeof parsedResults)[0] }
      const dedupMap = new Map<string, EmailWithParsed>()
      const dedupGroupIds = new Map<string, string[]>() // key → all messageIds in group

      for (let i = 0; i < newMessages.length; i++) {
        const message = newMessages[i]
        const parsed = parsedResults[i]

        if (!parsed.isPurchaseEmail) continue

        const key = `${message.from}__${parsed.orderId}__${parsed.amount}`
        const existing = dedupMap.get(key)

        if (!existing || message.receivedDate > existing.message.receivedDate) {
          dedupMap.set(key, { message, parsed })
        }

        const ids = dedupGroupIds.get(key) ?? []
        ids.push(message.id)
        dedupGroupIds.set(key, ids)
      }

      // Count emails that were deduped away
      const totalPurchaseEmails = [...dedupGroupIds.values()].reduce(
        (sum, ids) => sum + ids.length,
        0,
      )
      const dedupedAway = totalPurchaseEmails - dedupMap.size
      if (dedupedAway > 0) {
        console.log(
          `[Sync] Deduped ${dedupedAway} emails (same sender+orderId+amount, kept newest)`,
        )
      }

      for (const [key, { message, parsed }] of dedupMap) {
        const allIdsInGroup = dedupGroupIds.get(key) ?? [message.id]

        console.log(
          `[Sync] Processing id=${message.id} subject="${message.subject}":`,
          `isPurchaseEmail=${parsed.isPurchaseEmail} amount=${parsed.amount} ${parsed.currency}`,
        )

        if (parsed.amount <= 0) {
          console.log(`[Sync] SKIP: amount=${parsed.amount} (no charge mentioned in email)`)
          for (const id of allIdsInGroup) existingIds.add(id)
          skipped += allIdsInGroup.length
          continue
        }

        try {
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
            allIdsInGroup.length > 1 ? `(covers ${allIdsInGroup.length} emails)` : '',
          )

          for (const id of allIdsInGroup) existingIds.add(id)
          synced++
        } catch (saveErr) {
          const errMsg = saveErr instanceof Error ? saveErr.message : String(saveErr)
          console.error(`[Sync] FAILED to save messageId=${message.id}: ${errMsg}`)
          errors.push({ messageId: message.id, subject: message.subject, error: errMsg })
        }
      }

      // Count non-purchase emails as skipped
      for (let i = 0; i < newMessages.length; i++) {
        if (!parsedResults[i].isPurchaseEmail) skipped++
      }
    }

    const lastSyncedAt = new Date().toISOString()
    await updateSyncState(session, lastSyncedAt)

    // ── Write SyncHistory ──────────────────────────────────────────────────
    const duration = Date.now() - startedAt
    const startDate = dateRange ? new Date(dateRange.afterEpoch * 1000).toISOString().slice(0, 10) : ''
    const endDate = dateRange ? new Date(dateRange.beforeEpoch * 1000).toISOString().slice(0, 10) : ''

    try {
      await appendSyncHistory(session, {
        syncId: randomUUID(),
        userEmail: session.email ?? '',
        startDate,
        endDate,
        totalMessages: messages.length,
        processedCount: newMessages.length,
        successCount: synced,
        failCount: errors.length,
        errorMessages: errors,
        duration,
        syncType: 'manual',
        syncedAt: lastSyncedAt,
      })
    } catch (histErr) {
      // Non-fatal: log but don't fail the sync response
      console.error('[Sync] Failed to write SyncHistory:', histErr)
    }

    ok(res, { synced, skipped, failCount: errors.length, lastSyncedAt, duration })
  } catch (error) {
    serverError(res, error)
  }
}
