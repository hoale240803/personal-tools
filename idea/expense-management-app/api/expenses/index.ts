import type { VercelRequest, VercelResponse } from '@vercel/node'
import { DEFAULT_PAGE_SIZE } from '../lib/env'
import {
  badRequest,
  created,
  methodNotAllowed,
  ok,
  serverError,
  unauthorized,
} from '../lib/response'
import { appendExpense, deleteExpense, getExpenses, updateExpense, type ExpenseRow } from '../lib/sheets'
import { readSession } from '../lib/session'

function generateId(): string {
  return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await readSession(req)
  if (!session) return unauthorized(res)

  try {
    switch (req.method) {
      case 'GET': {
        const month = typeof req.query.month === 'string' ? req.query.month : ''
        if (!/^\d{4}-\d{2}$/.test(month)) {
          return badRequest(res, 'Query param "month" must be YYYY-MM')
        }

        const day = typeof req.query.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.day)
          ? req.query.day
          : undefined
        const page = Math.max(1, Number(req.query.page ?? 1))
        const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? DEFAULT_PAGE_SIZE)))
        const search = typeof req.query.search === 'string' ? req.query.search : undefined

        const result = await getExpenses(session, { month, day, page, limit, search })
        return ok(res, result)
      }

      case 'POST': {
        const body = req.body as Partial<ExpenseRow>
        if (!body.name || !body.purchaseDate || body.amount == null) {
          return badRequest(res, 'Missing required fields: name, purchaseDate, amount')
        }

        const expense: ExpenseRow = {
          id: generateId(),
          purchaseDate: String(body.purchaseDate),
          name: String(body.name),
          parentCategory: String(body.parentCategory ?? 'Mua sắm'),
          category: String(body.category ?? 'Khác'),
          amount: Number(body.amount),
          platform: String(body.platform ?? ''),
          status: String(body.status ?? 'Chờ xử lý'),
          orderId: String(body.orderId ?? ''),
          imageUrl: String(body.imageUrl ?? ''),
          gmailMessageId: String(body.gmailMessageId ?? ''),
          createdAt: new Date().toISOString(),
        }

        await appendExpense(session, expense)
        return created(res, expense)
      }

      case 'PUT': {
        const body = req.body as Partial<ExpenseRow> & { id: string }
        if (!body.id) {
          return badRequest(res, 'Missing required field: id')
        }

        const { id, ...updates } = body
        const updated = await updateExpense(session, id, updates)
        return ok(res, updated)
      }

      case 'DELETE': {
        const id = typeof req.query.id === 'string'
          ? req.query.id
          : typeof req.body?.id === 'string'
            ? req.body.id
            : ''
        if (!id) {
          return badRequest(res, 'Missing required field: id')
        }

        await deleteExpense(session, id)
        return ok(res, { deleted: true, id })
      }

      default:
        return methodNotAllowed(res)
    }
  } catch (error) {
    serverError(res, error)
  }
}
