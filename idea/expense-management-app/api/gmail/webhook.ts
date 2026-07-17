import { randomUUID } from 'crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parsePurchaseEmailsBatch } from '../_lib/gemini'
import {
  BASE_PURCHASE_QUERY_TERMS,
  getGmailHistory,
  getMessageById,
} from '../_lib/gmail'
import { methodNotAllowed, ok, serverError } from '../_lib/response'
import {
  appendExpense,
  appendSyncHistory,
  countPendingMessages,
  enqueuePendingMessage,
  getCategories,
  getExistingMessageIds,
  getPendingMessages,
  markPendingMessagesProcessed,
  type SyncErrorItem,
} from '../_lib/sheets'
import { readSessionByEmail } from '../_lib/session'
import { getEnv, getEnvOptional } from '../_lib/env'
import { logError } from '../_lib/error-logger'

/**
 * POST /api/gmail/webhook
 *
 * Receives Google Cloud Pub/Sub push notifications when new Gmail messages arrive.
 * Verifies the JWT, extracts email address + historyId, discovers new messages via
 * Gmail History API, queues them in the PendingQueue sheet, and triggers batch
 * processing when >= 5 messages are pending.
 *
 * Pub/Sub push format:
 * {
 *   "message": {
 *     "data": "<base64-encoded JSON>",   // { "emailAddress": "...", "historyId": "..." }
 *     "messageId": "...",
 *     "attributes": {}
 *   },
 *   "subscription": "projects/.../subscriptions/..."
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  // Hoist variables for access in catch block (error logging)
  let session: Awaited<ReturnType<typeof readSessionByEmail>> = null
  let emailAddress = ''
  let historyId = ''
  let queued = 0

  try {
    // ── 1. Verify Pub/Sub JWT ───────────────────────────────────────────────
    const authHeader = req.headers['authorization']
    if (!authHeader?.startsWith('Bearer ')) {
      console.warn('[Webhook] Missing or malformed Authorization header')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.slice('Bearer '.length)
    const audience = getEnvOptional('PUBSUB_AUDIENCE') ?? getEnv('VERCEL_URL')

    const isValid = await verifyPubSubJwt(token, audience)
    if (!isValid) {
      console.warn('[Webhook] Pub/Sub JWT verification failed')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // ── 2. Decode Pub/Sub message ───────────────────────────────────────────
    const pubsubMessage = req.body?.message
    if (!pubsubMessage?.data) {
      console.warn('[Webhook] No Pub/Sub message data')
      return ok(res, { received: true }) // ACK to avoid retry loop
    }

    let gmailNotification: { emailAddress?: string; historyId?: string }
    try {
      const decoded = Buffer.from(pubsubMessage.data, 'base64').toString('utf-8')
      gmailNotification = JSON.parse(decoded)
    } catch {
      console.warn('[Webhook] Failed to decode Pub/Sub data')
      return ok(res, { received: true })
    }

    emailAddress = gmailNotification.emailAddress ?? ''
    historyId = gmailNotification.historyId ?? ''
    if (!emailAddress || !historyId) {
      console.warn('[Webhook] Missing emailAddress or historyId in notification')
      return ok(res, { received: true })
    }

    console.log(`[Webhook] Notification for ${emailAddress} historyId=${historyId}`)

    // ── 3. Find session for this user ───────────────────────────────────────
    session = await readSessionByEmail(emailAddress)
    if (!session) {
      console.warn(`[Webhook] No active session for ${emailAddress} — skipping`)
      return ok(res, { received: true })
    }

    // ── 4. Fetch new message IDs from Gmail History ─────────────────────────
    // We use the historyId stored in SyncState as our starting point
    const newMessageIds = await getGmailHistory(session, historyId)

    if (newMessageIds.length === 0) {
      console.log('[Webhook] No new messages from history — ACK')
      return ok(res, { received: true, queued: 0 })
    }

    // ── 5. Enqueue relevant messages ────────────────────────────────────────
    const existingIds = await getExistingMessageIds(session)

    for (const messageId of newMessageIds) {
      // Skip already-synced messages
      if (existingIds.has(messageId)) {
        console.log(`[Webhook] messageId=${messageId} already in Expenses, skipping`)
        continue
      }

      // Fetch minimal metadata (subject) to filter noise before queueing
      const msg = await getMessageById(session, messageId)
      if (!msg) continue

      // Simple purchase signal check on subject line (full AI parse happens in batch)
      const isPotentialPurchase = PURCHASE_SUBJECT_TERMS.some((term) =>
        msg.subject.toLowerCase().includes(term),
      )
      if (!isPotentialPurchase) {
        console.log(`[Webhook] messageId=${messageId} subject="${msg.subject}" — not a purchase signal, skipping queue`)
        continue
      }

      await enqueuePendingMessage(session, {
        messageId,
        userEmail: emailAddress,
        historyId,
        subject: msg.subject,
      })
      queued++
    }

    console.log(`[Webhook] Queued ${queued} new messages for ${emailAddress}`)

    // ── 6. Trigger batch if >= 5 pending ────────────────────────────────────
    const pendingCount = await countPendingMessages(session, emailAddress)
    console.log(`[Webhook] Pending messages for ${emailAddress}: ${pendingCount}`)

    if (pendingCount >= 5) {
      console.log(`[Webhook] Threshold reached (${pendingCount}) — processing batch`)
      await processPipelineBatch(session, emailAddress)
    }

    return ok(res, { received: true, queued, pendingCount })
  } catch (error) {
    console.error('[Webhook] Unexpected error:', error)
    // Best-effort error logging — session may not exist if error happened early
    if (session) {
      await logError({
        source: 'pipeline:webhook',
        error,
        userEmail: emailAddress,
        session,
        context: { historyId, queued },
      })
    }
    // Still return 200 to ACK the Pub/Sub message and avoid infinite retries
    return ok(res, { received: true, error: true })
  }
}

// ── Purchase subject keyword filter ─────────────────────────────────────────
// Lightweight pre-filter to skip obvious noise before expensive batch processing
const PURCHASE_SUBJECT_TERMS = [
  'order', 'delivered', 'shipped', 'invoice', 'billing', 'payment',
  'subscription', 'purchase', 'đơn hàng', 'xác nhận', 'giao hàng',
  'shopee', 'lazada', 'amazon', 'temu', 'aliexpress', 'doordash',
]

// ── Pipeline batch processor ─────────────────────────────────────────────────
async function processPipelineBatch(
  session: Parameters<typeof getPendingMessages>[0],
  userEmail: string,
) {
  const startedAt = Date.now()
  const pendingItems = await getPendingMessages(session, userEmail)

  if (pendingItems.length === 0) return

  console.log(`[Pipeline] Processing batch of ${pendingItems.length} messages for ${userEmail}`)

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
      console.log(`[Pipeline] messageId=${message.id} already synced, skip`)
      continue
    }

    if (!parsed.isPurchaseEmail || parsed.amount <= 0) {
      console.log(
        `[Pipeline] SKIP id=${message.id} isPurchase=${parsed.isPurchaseEmail} amount=${parsed.amount}`,
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
      console.log(`[Pipeline] SAVED: "${parsed.name || message.subject}" ${parsed.amount}`)
    } catch (saveErr) {
      const errMsg = saveErr instanceof Error ? saveErr.message : String(saveErr)
      console.error(`[Pipeline] FAILED messageId=${message.id}: ${errMsg}`)
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
    console.error('[Pipeline] Failed to write SyncHistory:', histErr)
  }

  console.log(
    `[Pipeline] Done: synced=${synced} failed=${errors.length} duration=${duration}ms`,
  )
}

// ── Pub/Sub JWT verification ─────────────────────────────────────────────────
// Uses Google's public JWK endpoint to verify the token signature.
async function verifyPubSubJwt(token: string, audience: string): Promise<boolean> {
  try {
    const [headerB64, payloadB64] = token.split('.')
    if (!headerB64 || !payloadB64) return false

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'))

    // Verify audience and issuer
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
    if (!aud.includes(audience) && !aud.includes(`https://${audience}`)) {
      console.warn(`[Webhook] JWT audience mismatch. Expected ${audience}, got ${payload.aud}`)
      // In development, skip audience check
      if (process.env['NODE_ENV'] !== 'production') {
        console.warn('[Webhook] DEV mode: skipping audience check')
      } else {
        return false
      }
    }

    if (
      payload.iss !== 'https://accounts.google.com' &&
      payload.iss !== 'accounts.google.com'
    ) {
      console.warn(`[Webhook] JWT issuer mismatch: ${payload.iss}`)
      return false
    }

    // Verify token not expired
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      console.warn('[Webhook] JWT expired')
      return false
    }

    // Verify email is from Google Pub/Sub service account
    if (
      payload.email &&
      !payload.email.endsWith('@system.gserviceaccount.com') &&
      !payload.email.endsWith('gserviceaccount.com')
    ) {
      console.warn(`[Webhook] Unexpected JWT email: ${payload.email}`)
      return false
    }

    return true
  } catch (err) {
    console.error('[Webhook] JWT verification error:', err)
    return false
  }
}

// Re-export for reference in webhook handler
export { BASE_PURCHASE_QUERY_TERMS }
