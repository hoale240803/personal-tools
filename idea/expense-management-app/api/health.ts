import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ok } from './lib/response'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  ok(res, { ok: true, service: 'expense-management-app' })
}
