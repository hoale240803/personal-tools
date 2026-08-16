import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setupGmailWatch, stopGmailWatch } from '../lib/gmail'
import { methodNotAllowed, ok, serverError, unauthorized } from '../lib/response'
import { updateSyncMode } from '../lib/sheets'
import { readSession } from '../lib/session'
import { getEnv } from '../lib/env'

/**
 * POST /api/gmail/watch
 *
 * body: {} (default) → register/renew Gmail Watch (webhook mode)
 * body: { action: 'cancel' } → stop Gmail Watch (switch to cron mode)
 *
 * Registers or renews Gmail push notifications via Google Cloud Pub/Sub.
 * When active, purchase emails are processed in realtime via the webhook pipeline.
 * When cancelled, the system falls back to the periodic cron-sync job.
 *
 * Required env (for register):
 *   PUBSUB_TOPIC_NAME — e.g. "projects/my-project/topics/gmail-push"
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  const session = await readSession(req)
  if (!session) return unauthorized(res)

  const action = (req.body?.action as string | undefined) ?? 'register'

  // ── CANCEL: switch to cron mode ────────────────────────────────────────────
  if (action === 'cancel') {
    try {
      console.log(`[Watch] Stopping Gmail watch for ${session.email}`)
      await stopGmailWatch(session)
      await updateSyncMode(session, 'cron', null)
      console.log(`[Watch] Gmail watch stopped for ${session.email} — switched to cron mode`)

      return ok(res, {
        cancelled: true,
        syncMode: 'cron',
        message: `Gmail Watch đã huỷ cho ${session.email}. Hệ thống chuyển sang Cron Schedule.`,
      })
    } catch (error) {
      return serverError(res, error)
    }
  }

  // ── REGISTER: start/renew Gmail Watch (webhook mode) ──────────────────────
  try {
    const topicName = getEnv('PUBSUB_TOPIC_NAME')

    console.log(`[Watch] Registering Gmail watch for ${session.email} → topic: ${topicName}`)

    const { historyId, expiration } = await setupGmailWatch(session, topicName)

    // Store historyId + syncMode in SyncState
    await updateSyncStateHistoryId(session, historyId)
    await updateSyncMode(session, 'webhook', new Date(Number(expiration)).toISOString())

    const expirationDate = new Date(Number(expiration)).toISOString()
    console.log(`[Watch] Gmail watch active until ${expirationDate} (historyId: ${historyId})`)

    return ok(res, {
      historyId,
      expiration: expirationDate,
      syncMode: 'webhook',
      message: `Gmail Watch đã đăng ký cho ${session.email}. Hết hạn: ${new Date(expirationDate).toLocaleString('vi-VN')}`,
    })
  } catch (error) {
    return serverError(res, error)
  }
}

/**
 * Stores the Gmail watch historyId in the SyncState sheet's lastHistoryId column.
 * This is used by the webhook to know where to start reading Gmail history from.
 */
async function updateSyncStateHistoryId(session: Parameters<typeof updateSyncMode>[0], historyId: string) {
  const { getSheetsClient } = await import('../lib/google')
  const { SHEET_NAMES } = await import('../lib/env')

  const sheets = getSheetsClient(session)
  const spreadsheetId = session.spreadsheetId
  if (!spreadsheetId) throw new Error('Session missing spreadsheetId')

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAMES.syncState}!A2:E`,
  })

  const rows = (data.values ?? []).map((row) => [...row.map(String)])
  const index = rows.findIndex((row) => row[0] === session.email)

  if (index >= 0) {
    rows[index][1] = historyId // col B = lastHistoryId
  } else {
    rows.push([session.email, historyId, '', '', ''])
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAMES.syncState}!A2:E${rows.length + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  })
}
