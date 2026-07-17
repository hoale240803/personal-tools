import type { VercelResponse } from '@vercel/node'

export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: { message: string }
}

export function json<T>(res: VercelResponse, status: number, data: T) {
  res.status(status).json(data)
}

export function ok<T>(res: VercelResponse, data: T) {
  json(res, 200, { data, error: null } satisfies ApiSuccess<T>)
}

export function created<T>(res: VercelResponse, data: T) {
  json(res, 201, { data, error: null } satisfies ApiSuccess<T>)
}

export function fail(res: VercelResponse, status: number, message: string) {
  json(res, status, { data: null, error: { message } } satisfies ApiError)
}

export function unauthorized(res: VercelResponse, message = 'Unauthorized') {
  fail(res, 401, message)
}

export function badRequest(res: VercelResponse, message: string) {
  fail(res, 400, message)
}

export function methodNotAllowed(res: VercelResponse) {
  fail(res, 405, 'Method not allowed')
}

export function serverError(res: VercelResponse, error: unknown) {
  const message = error instanceof Error ? error.message : 'Internal server error'
  console.error(error)
  fail(res, 500, message)
}
