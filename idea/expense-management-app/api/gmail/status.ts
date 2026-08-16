import type { VercelRequest, VercelResponse } from '@vercel/node'
import { methodNotAllowed, ok, serverError, unauthorized } from '../lib/response'
import { getSyncState } from '../lib/sheets'
import { readSession } from '../lib/session'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res)

  const session = await readSession(req)
  if (!session) return unauthorized(res)

  try {
    const { lastSyncedAt, syncMode, watchExpiration } = await getSyncState(session)
    ok(res, { lastSyncedAt, syncMode, watchExpiration })
  } catch (error) {
    serverError(res, error)
  }
}
