import { randomUUID } from 'crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parsePurchaseEmailsBatch } from '../lib/gemini'
import { getMessageById } from '../lib/gmail'
import { logError } from '../lib/error-logger'
import { methodNotAllowed, ok } from '../lib/response'
import {
  appendExpense,
  appendSyncHistory,
  getCategories,
  getExistingMessageIds,
  getPendingMessages,
  markPendingMessagesProcessed,
  type SyncErrorItem,
} from '../lib/sheets'
import { readSession, readSessionByEmail } from '../lib/session'
import { getEnvOptional, SHEET_NAMES } from '../lib/env'
import { getSheetsClient } from '../lib/google'

/**
 * GET /api/gmail/flush
 *
 * Daily cron endpoint — processes ALL remaining pending messages regardless of
 * batch threshold. Called by Vercel Cron at 23:59 VN (16:59 UTC) to ensure no
 * messages are left unprocessed at end of day.
 *
 * Also callable manually for testing:
 *   curl http://localhost:3000/api/gmail/flush
 *
 * Authentication:
 *   - Vercel Cron: checks CRON_SECRET header
 *   - Dev/manual: uses session cookie
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res)

  // ── Auth: Vercel Cron sends CRON_SECRET, dev uses session cookie ──────────
  const cronSecret = getEnvOptional('CRON_SECRET')
  const authHeader = req.headers['authorization']
  const isCronAuth = cronSecret && authHeader === `Bearer ${cronSecret}`

  // For dev/manual use, allow session-based auth
  const sessionFromCookie = !isCronAuth ? await readSession(req) : null

  if (!isCronAuth && !sessionFromCookie) {
    return res.status(401).json({ data: null, error: { message: 'Unauthorized' } })
  }

  console.log(`[Flush] Triggered — auth=${isCronAuth ? 'cron' : 'session'}`)

  try {
    // ── Find all users with pending messages ──────────────────────────────
    const usersWithPending = await findUsersWithPending(sessionFromCookie)

    if (usersWithPending.length === 0) {
      console.log('[Flush] No pending messages for any user — nothing to do')
      return ok(res, { flushed: 0, users: [] })
    }

    const results: { email: string; synced: number; failed: number }[] = []

    for (const { email, session } of usersWithPending) {
      try {
        console.log(`[Flush] Processing pending messages for ${email}`)
        const result = await processPipelineBatch(session, email)
        results.push({ email, synced: result.synced, failed: result.failed })
      } catch (error) {
        console.error(`[Flush] Failed for ${email}:`, error)
        await logError({
          source: 'cron:flush',
          error,
          userEmail: email,
          session,
          context: { trigger: 'daily-flush-cron' },
        })
        results.push({ email, synced: 0, failed: -1 })
      }
    }

    console.log(`[Flush] Done. Processed ${results.length} user(s)`)
    return ok(res, { flushed: results.length, users: results })
  } catch (error) {
    console.error('[Flush] Unexpected error:', error)
    // Best-effort error logging
    if (sessionFromCookie) {
      await logError({
        source: 'cron:flush',
        error,
        session: sessionFromCookie,
        context: { trigger: 'daily-flush-cron', phase: 'top-level' },
      })
    }
    return ok(res, { flushed: 0, error: true })
  }
}

// ── Find users with pending messages ──────────────────────────────────────────
async function findUsersWithPending(
  sessionFromCookie: Awaited<ReturnType<typeof readSession>>,
): Promise<{ email: string; session: NonNullable<typeof sessionFromCookie> }[]> {
  // For a personal tool, we use the cookie session or dev session.
  // The PendingQueue sheet is scoped to the spreadsheet, so we just need
  // any valid session to read it.
  if (sessionFromCookie) {
    const sheets = getSheetsClient(sessionFromCookie)
    const spreadsheetId = sessionFromCookie.spreadsheetId
    if (!spreadsheetId) return []

    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAMES.pendingQueue}!A2:F`,
    })

    // Collect unique emails that have status=pending
    const pendingEmails = new Set<string>()
    for (const row of data.values ?? []) {
      if (String(row[5]) === 'pending') {
        pendingEmails.add(String(row[1]))
      }
    }

    // For each pending email, resolve session
    const results: { email: string; session: NonNullable<typeof sessionFromCookie> }[] = []
    for (const email of pendingEmails) {
      const session = await readSessionByEmail(email)
      if (session) {
        results.push({ email, session })
      }
    }
    return results
  }

  return []
}

// ── Pipeline batch processor (shared logic with webhook.ts) ──────────────────
async function processPipelineBatch(
  session: Parameters<typeof getPendingMessages>[0],
  userEmail: string,
): Promise<{ synced: number; failed: number }> {
  const startedAt = Date.now()
  const pendingItems = await getPendingMessages(session, userEmail)

  if (pendingItems.length === 0) return { synced: 0, failed: 0 }

  console.log(`[Flush] Processing batch of ${pendingItems.length} messages for ${userEmail}`)

  const categories = await getCategories(session)
  const existingIds = await getExistingMessageIds(session)

  // Fetch full message bodies for all pending items
  const messages = (
    await Promise.all(
      pendingItems.map((item) => getMessageById(session, item.messageId)),
    )
  ).filter((m): m is NonNullable<typeof m> => m !== null)

  const parsedResults = await parsePurchaseEmailsBatch(messages, categories)

  let synced = 0
  const errors: SyncErrorItem[] = []
  const processedMessageIds = pendingItems.map((i) => i.messageId)

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    const parsed = parsedResults[i]

    if (existingIds.has(message.id)) {
      console.log(`[Flush] messageId=${message.id} already synced, skip`)
      continue
    }

    if (!parsed.isPurchaseEmail || parsed.amount <= 0) {
      console.log(
        `[Flush] SKIP id=${message.id} isPurchase=${parsed.isPurchaseEmail} amount=${parsed.amount}`,
      )
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

      existingIds.add(message.id)
      synced++
      console.log(`[Flush] SAVED: "${parsed.name || message.subject}" ${parsed.amount}`)
    } catch (saveErr) {
      const errMsg = saveErr instanceof Error ? saveErr.message : String(saveErr)
      console.error(`[Flush] FAILED messageId=${message.id}: ${errMsg}`)
      errors.push({ messageId: message.id, subject: message.subject, error: errMsg })
    }
  }

  // Mark all as done regardless (prevents stuck queue items)
  await markPendingMessagesProcessed(session, processedMessageIds)

  // Write SyncHistory
  const duration = Date.now() - startedAt
  const syncedAt = new Date().toISOString()

  try {
    await appendSyncHistory(session, {
      syncId: randomUUID(),
      userEmail,
      startDate: '',
      endDate: '',
      totalMessages: messages.length,
      processedCount: messages.length,
      successCount: synced,
      failCount: errors.length,
      errorMessages: errors,
      duration,
      syncType: 'pipeline',
      syncedAt,
    })
  } catch (histErr) {
    console.error('[Flush] Failed to write SyncHistory:', histErr)
  }

  console.log(
    `[Flush] Done: synced=${synced} failed=${errors.length} duration=${duration}ms`,
  )

  return { synced, failed: errors.length }
}
