import type { VercelRequest, VercelResponse } from '@vercel/node'
import { methodNotAllowed, ok, serverError, unauthorized } from '../lib/response'
import { getErrorLog, getSyncHistory, markErrorResolved } from '../lib/sheets'
import { readSession } from '../lib/session'

/**
 * /api/gmail/history
 *
 * GET  — Returns sync history records for the authenticated user.
 * POST — Mark an error log entry as resolved (action: 'resolve-error').
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return methodNotAllowed(res)

  const session = await readSession(req)
  if (!session) return unauthorized(res)

  try {
    if (req.method === 'GET') {
      const type = (req.query['type'] as string) ?? 'sync'

      if (type === 'errors') {
        const errors = await getErrorLog(session)
        return ok(res, errors)
      }

      const history = await getSyncHistory(session)
      return ok(res, history)
    }

    // POST — resolve error
    if (req.method === 'POST') {
      const body = req.body ?? {}
      if (body.action === 'resolve-error' && typeof body.errorId === 'string') {
        await markErrorResolved(session, body.errorId)
        return ok(res, { resolved: true, errorId: body.errorId })
      }
      return res.status(400).json({ data: null, error: { message: 'Invalid action' } })
    }
  } catch (error) {
    return serverError(res, error)
  }
}
