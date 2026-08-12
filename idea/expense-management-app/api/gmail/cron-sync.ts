import { randomUUID } from 'crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parsePurchaseEmailsBatch } from '../lib/gemini'
import { listPurchaseMessages, type DateRange } from '../lib/gmail'
import { methodNotAllowed, ok, serverError } from '../lib/response'
import {
  appendExpense,
  appendSyncHistory,
  getCategories,
  getExistingMessageIds,
  getSyncState,
  updateSyncState,
  type SyncErrorItem,
} from '../lib/sheets'
import { loadDevSession, type SessionData } from '../lib/session'
import { getEnvOptional } from '../lib/env'
import { createOAuth2Client } from '../lib/google'
import { logError } from '../lib/error-logger'

/**
 * GET /api/gmail/cron-sync
 *
 * Periodic polling cron — reads Gmail purchase emails directly every 6 hours.
 * Acts as a safety-net fallback for the Pub/Sub webhook pipeline:
 *   - Catches emails missed when Gmail Watch expires
 *   - Works without PUBSUB_TOPIC_NAME configured
 *   - Not limited by subject keyword filter (uses Gemini AI on full body)
 *   - Covers historical mail on first-time setup
 *
 * Schedule: every 6 hours — cron: "0 *\/6 * * *"
 *
 * Authentication:
 *   - Vercel Cron: Authorization: Bearer <CRON_SECRET>
 *   - Dev/manual: session cookie or .dev-session.json fallback
 *
 * Multi-user:
 *   USER_SESSIONS env var (JSON array):
 *   [{ "email": "...", "refreshToken": "...", "spreadsheetId": "..." }]
 */

interface CronUser {
  email: string
  refreshToken: string
  spreadsheetId: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res)

  // ── Auth: Vercel Cron sends CRON_SECRET, dev uses session cookie ──────────
  const cronSecret = getEnvOptional('CRON_SECRET')
  const authHeader = req.headers['authorization']
  const isCronAuth = !!cronSecret && authHeader === `Bearer ${cronSecret}`

  // For dev/manual use, allow dev session fallback
  const devSession = !isCronAuth ? loadDevSession() : null

  if (!isCronAuth && !devSession) {
    return res.status(401).json({ data: null, error: { message: 'Unauthorized' } })
  }

  console.log(`[CronSync] Triggered — auth=${isCronAuth ? 'cron' : 'dev-session'}`)

  try {
    const users = await resolveCronUsers(devSession)

    if (users.length === 0) {
      console.log('[CronSync] No users to process — set USER_SESSIONS env var')
      return ok(res, { processed: 0, users: [] })
    }

    const results: { email: string; synced: number; skipped: number; failed: number }[] = []

    for (const { session, email } of users) {
      try {
        console.log(`[CronSync] Processing user: ${email}`)
        const result = await syncUserEmails(session, email)
        results.push({ email, ...result })
      } catch (error) {
        console.error(`[CronSync] Failed for ${email}:`, error)
        await logError({
          source: 'cron:cron-sync',
          error,
          userEmail: email,
          session,
          context: { trigger: 'periodic-cron' },
        })
        results.push({ email, synced: 0, skipped: 0, failed: -1 })
      }
    }

    console.log(`[CronSync] Done. Processed ${results.length} user(s):`, results)
    return ok(res, { processed: results.length, users: results })
  } catch (error) {
    console.error('[CronSync] Unexpected error:', error)
    return serverError(res, error)
  }
}

// ── Resolve list of users to process ─────────────────────────────────────────

async function resolveCronUsers(
  devSession: SessionData | null,
): Promise<{ session: SessionData; email: string }[]> {
  const raw = getEnvOptional('USER_SESSIONS')

  if (raw) {
    let cronUsers: CronUser[]
    try {
      cronUsers = JSON.parse(raw) as CronUser[]
    } catch {
      console.error('[CronSync] Failed to parse USER_SESSIONS — must be a valid JSON array')
      return []
    }

    const resolved: { session: SessionData; email: string }[] = []
    for (const user of cronUsers) {
      if (!user.email || !user.refreshToken || !user.spreadsheetId) {
        console.warn(`[CronSync] Skipping malformed user entry: ${JSON.stringify(user)}`)
        continue
      }
      try {
        const session = await refreshSessionForUser(user)
        resolved.push({ session, email: user.email })
      } catch (err) {
        console.error(`[CronSync] Failed to refresh token for ${user.email}:`, err)
      }
    }
    return resolved
  }

  // Fallback: dev session (single-user local development)
  if (devSession) {
    console.log('[CronSync] USER_SESSIONS not set — using dev session fallback')
    return [{ session: devSession, email: devSession.email }]
  }

  return []
}

// ── Refresh OAuth access token for a cron user ───────────────────────────────

async function refreshSessionForUser(user: CronUser): Promise<SessionData> {
  const client = createOAuth2Client()
  client.setCredentials({ refresh_token: user.refreshToken })

  const { credentials } = await client.refreshAccessToken()

  if (!credentials.access_token) {
    throw new Error(`Failed to refresh access token for ${user.email}`)
  }

  console.log(`[CronSync] Refreshed access token for ${user.email}`)

  return {
    email: user.email,
    name: user.email,
    picture: '',
    accessToken: credentials.access_token,
    refreshToken: user.refreshToken,
    spreadsheetId: user.spreadsheetId,
  }
}

// ── Core sync logic for a single user ────────────────────────────────────────

async function syncUserEmails(
  session: SessionData,
  userEmail: string,
): Promise<{ synced: number; skipped: number; failed: number }> {
  const startedAt = Date.now()

  // ── Determine incremental date range ──────────────────────────────────────
  const { lastSyncedAt } = await getSyncState(session)

  let dateRange: DateRange
  if (lastSyncedAt) {
    const afterEpoch = Math.floor(new Date(lastSyncedAt).getTime() / 1000)
    const beforeEpoch = Math.floor(Date.now() / 1000)
    dateRange = { afterEpoch, beforeEpoch }
    console.log(`[CronSync] ${userEmail}: incremental range ${lastSyncedAt} → now`)
  } else {
    // First-time: sync last 30 days
    const beforeEpoch = Math.floor(Date.now() / 1000)
    const afterEpoch = beforeEpoch - 30 * 24 * 60 * 60
    dateRange = { afterEpoch, beforeEpoch }
    console.log(`[CronSync] ${userEmail}: no lastSyncedAt — syncing last 30 days`)
  }

  // ── Fetch purchase messages from Gmail ────────────────────────────────────
  const categories = await getCategories(session)
  const existingIds = await getExistingMessageIds(session)
  const messages = await listPurchaseMessages(session, dateRange)

  const newMessages = messages.filter((m) => !existingIds.has(m.id))
  let skipped = messages.length - newMessages.length

  console.log(
    `[CronSync] ${userEmail}: ${messages.length} total, ${skipped} already synced, ${newMessages.length} new`,
  )

  let synced = 0
  const errors: SyncErrorItem[] = []

  if (newMessages.length > 0) {
    const parsedResults = await parsePurchaseEmailsBatch(newMessages, categories)

    // ── Dedup: same sender + orderId + amount → keep newest ───────────────
    type EmailWithParsed = { message: (typeof newMessages)[0]; parsed: (typeof parsedResults)[0] }
    const dedupMap = new Map<string, EmailWithParsed>()
    const dedupGroupIds = new Map<string, string[]>()

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

    const totalPurchaseEmails = [...dedupGroupIds.values()].reduce(
      (sum, ids) => sum + ids.length,
      0,
    )
    const dedupedAway = totalPurchaseEmails - dedupMap.size
    if (dedupedAway > 0) {
      console.log(
        `[CronSync] ${userEmail}: deduped ${dedupedAway} emails (same sender+orderId+amount)`,
      )
    }

    // ── Save each unique purchase ──────────────────────────────────────────
    for (const [key, { message, parsed }] of dedupMap) {
      const allIdsInGroup = dedupGroupIds.get(key) ?? [message.id]

      console.log(
        `[CronSync] Processing id=${message.id} subject="${message.subject}":`,
        `isPurchaseEmail=${parsed.isPurchaseEmail} amount=${parsed.amount} ${parsed.currency}`,
      )

      if (parsed.amount <= 0) {
        console.log(`[CronSync] SKIP: amount=${parsed.amount} (no charge in email)`)
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
          `[CronSync] SAVED: "${parsed.name || message.subject}" ${parsed.amount} ${parsed.currency}`,
          allIdsInGroup.length > 1 ? `(covers ${allIdsInGroup.length} emails)` : '',
        )

        for (const id of allIdsInGroup) existingIds.add(id)
        synced++
      } catch (saveErr) {
        const errMsg = saveErr instanceof Error ? saveErr.message : String(saveErr)
        console.error(`[CronSync] FAILED to save messageId=${message.id}: ${errMsg}`)
        errors.push({ messageId: message.id, subject: message.subject, error: errMsg })
      }
    }

    // Non-purchase emails count as skipped
    for (let i = 0; i < newMessages.length; i++) {
      if (!parsedResults[i].isPurchaseEmail) skipped++
    }
  }

  // ── Update SyncState ──────────────────────────────────────────────────────
  const lastSyncedAtNew = new Date().toISOString()
  await updateSyncState(session, lastSyncedAtNew)

  // ── Write SyncHistory ─────────────────────────────────────────────────────
  const duration = Date.now() - startedAt
  const startDate = new Date(dateRange.afterEpoch * 1000).toISOString().slice(0, 10)
  const endDate = new Date(dateRange.beforeEpoch * 1000).toISOString().slice(0, 10)

  try {
    await appendSyncHistory(session, {
      syncId: randomUUID(),
      userEmail,
      startDate,
      endDate,
      totalMessages: messages.length,
      processedCount: newMessages.length,
      successCount: synced,
      failCount: errors.length,
      errorMessages: errors,
      duration,
      syncType: 'cron',
      syncedAt: lastSyncedAtNew,
    })
  } catch (histErr) {
    console.error('[CronSync] Failed to write SyncHistory:', histErr)
  }

  console.log(
    `[CronSync] ${userEmail}: done — synced=${synced} skipped=${skipped} failed=${errors.length} duration=${duration}ms`,
  )

  return { synced, skipped, failed: errors.length }
}
