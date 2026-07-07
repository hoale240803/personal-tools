import type { VercelRequest, VercelResponse } from '@vercel/node'
import { DEFAULT_PAGE_SIZE } from '../lib/env'
import {
  badRequest,
  methodNotAllowed,
  ok,
  serverError,
  unauthorized,
} from '../lib/response'
import { getExpenses } from '../lib/sheets'
import { readSession } from '../lib/session'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res)

  const session = await readSession(req)
  if (!session) return unauthorized(res)

  const month = typeof req.query.month === 'string' ? req.query.month : ''
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return badRequest(res, 'Query param "month" must be YYYY-MM')
  }

  const page = Math.max(1, Number(req.query.page ?? 1))
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? DEFAULT_PAGE_SIZE)))
  const search = typeof req.query.search === 'string' ? req.query.search : undefined

  try {
    const result = await getExpenses(session, { month, page, limit, search })
    ok(res, result)
  } catch (error) {
    serverError(res, error)
  }
}
