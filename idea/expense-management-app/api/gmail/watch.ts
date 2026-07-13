import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setupGmailWatch } from '../lib/gmail'
import { methodNotAllowed, ok, serverError, unauthorized } from '../lib/response'
import { updateSyncState } from '../lib/sheets'
import { readSession } from '../lib/session'
import { getEnv } from '../lib/env'

/**
 * POST /api/gmail/watch
 *
 * Registers or renews Gmail push notifications via Google Pub/Sub.
 * Should be called:
 *   1. When a user first sets up the app (after login).
 *   2. By the Vercel Cron job every 6 days (Gmail watch expires after 7 days).
 *
 * Required env:
 *   PUBSUB_TOPIC_NAME — e.g. "projects/my-project/topics/gmail-push"
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  const session = await readSession(req)
  if (!session) return unauthorized(res)

  try {
    const topicName = getEnv('PUBSUB_TOPIC_NAME')

    console.log(`[Watch] Registering Gmail watch for ${session.email} → topic: ${topicName}`)

    const { historyId, expiration } = await setupGmailWatch(session, topicName)

    // Store the new historyId in SyncState so the webhook can use it as starting point
    // We piggyback on the existing lastHistoryId column in SyncState
    await updateSyncStateHistoryId(session, historyId)

    const expirationDate = new Date(Number(expiration)).toISOString()
    console.log(`[Watch] Gmail watch active until ${expirationDate} (historyId: ${historyId})`)

    ok(res, {
      historyId,
      expiration: expirationDate,
      message: `Gmail watch registered for ${session.email}. Expires: ${expirationDate}`,
    })
  } catch (error) {
    serverError(res, error)
  }
}

/**
 * Stores the Gmail watch historyId in the SyncState sheet's lastHistoryId column.
 * This is used by the webhook to know where to start reading Gmail history from.
 */
async function updateSyncStateHistoryId(session: Parameters<typeof updateSyncState>[0], historyId: string) {
  const { getSheetsClient } = await import('../lib/google')
  const { SHEET_NAMES } = await import('../lib/env')

  const sheets = getSheetsClient(session)
  const spreadsheetId = session.spreadsheetId
  if (!spreadsheetId) throw new Error('Session missing spreadsheetId')

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAMES.syncState}!A2:C`,
  })

  const rows = (data.values ?? []).map((row) => [...row.map(String)])
  const index = rows.findIndex((row) => row[0] === session.email)

  if (index >= 0) {
    rows[index][1] = historyId // col B = lastHistoryId
  } else {
    rows.push([session.email, historyId, ''])
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_NAMES.syncState}!A2:C${rows.length + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  })
}
