import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getGoogleAuthUrl } from '../_lib/google'
import { methodNotAllowed, serverError } from '../_lib/response'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res)

  try {
    res.redirect(302, getGoogleAuthUrl())
  } catch (error) {
    serverError(res, error)
  }
}
