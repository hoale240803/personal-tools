import type { VercelRequest, VercelResponse } from '@vercel/node'
import { methodNotAllowed, ok, unauthorized } from '../_lib/response'
import { readSession } from '../_lib/session'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res)

  const session = await readSession(req)
  if (!session) return unauthorized(res)

  ok(res, {
    name: session.name,
    email: session.email,
    avatarUrl: session.picture,
  })
}
