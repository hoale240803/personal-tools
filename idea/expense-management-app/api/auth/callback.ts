import type { VercelRequest, VercelResponse } from '@vercel/node'
import { exchangeCodeForSession } from '../lib/google'
import { methodNotAllowed, serverError } from '../lib/response'
import { createSessionToken, getAppOrigin, setSessionCookie } from '../lib/session'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res)

  const code = typeof req.query.code === 'string' ? req.query.code : null
  if (!code) {
    res.redirect(302, `${getAppOrigin(req)}/?error=missing_code`)
    return
  }

  try {
    const session = await exchangeCodeForSession(code)
    const token = await createSessionToken(session)
    setSessionCookie(res, token)
    res.redirect(302, `${getAppOrigin(req)}/`)
  } catch (error) {
    console.error(error)
    serverError(res, error)
  }
}
