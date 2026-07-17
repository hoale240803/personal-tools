import type { VercelRequest, VercelResponse } from '@vercel/node'
import { methodNotAllowed, ok } from '../_lib/response'
import { clearSessionCookie } from '../_lib/session'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res)

  clearSessionCookie(res)
  ok(res, { loggedOut: true })
}
