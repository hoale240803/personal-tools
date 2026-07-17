import type { VercelRequest, VercelResponse } from '@vercel/node'
import { methodNotAllowed, ok, serverError, unauthorized } from '../_lib/response'
import { getSyncState } from '../_lib/sheets'
import { readSession } from '../_lib/session'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res)

  const session = await readSession(req)
  if (!session) return unauthorized(res)

  try {
    const state = await getSyncState(session)
    ok(res, state)
  } catch (error) {
    serverError(res, error)
  }
}
