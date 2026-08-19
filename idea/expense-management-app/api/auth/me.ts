import type { VercelRequest, VercelResponse } from '@vercel/node'
import { methodNotAllowed, ok, unauthorized } from '../lib/response'
import { readSession, refreshSessionIfNeeded } from '../lib/session'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res)

  const session = await readSession(req)
  if (!session) return unauthorized(res)

  // Rolling session: renew cookie if < 7 days remaining, keeping user logged in
  await refreshSessionIfNeeded(req, res)

  ok(res, {
    name: session.name,
    email: session.email,
    avatarUrl: session.picture,
  })
}
