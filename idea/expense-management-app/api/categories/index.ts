import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  badRequest,
  methodNotAllowed,
  ok,
  serverError,
  unauthorized,
} from '../lib/response'
import { readSession } from '../lib/session'
import { getCategories, saveCategories, type CategoryParent } from '../lib/sheets'

function isValidCategories(input: unknown): input is CategoryParent[] {
  return (
    Array.isArray(input) &&
    input.every(
      (parent) =>
        parent &&
        typeof parent === 'object' &&
        typeof parent.id === 'string' &&
        typeof parent.name === 'string' &&
        Array.isArray(parent.children) &&
        parent.children.every(
          (child: unknown) =>
            child &&
            typeof child === 'object' &&
            typeof (child as { id: unknown }).id === 'string' &&
            typeof (child as { name: unknown }).name === 'string',
        ),
    )
  )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = await readSession(req)
  if (!session) return unauthorized(res)

  if (req.method === 'GET') {
    try {
      const categories = await getCategories(session)
      ok(res, categories)
    } catch (error) {
      serverError(res, error)
    }
    return
  }

  if (req.method === 'PUT') {
    if (!isValidCategories(req.body)) {
      return badRequest(res, 'Body must be an array of category parents with children')
    }

    try {
      await saveCategories(session, req.body)
      ok(res, req.body)
    } catch (error) {
      serverError(res, error)
    }
    return
  }

  methodNotAllowed(res)
}
