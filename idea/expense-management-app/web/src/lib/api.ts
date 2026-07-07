import type { CategoryParent, Expense, UserProfile } from '../types'

interface ApiResponse<T> {
  data: T | null
  error: { message: string } | null
}

interface ExpensesResult {
  items: Expense[]
  total: number
  page: number
  limit: number
  totalPages: number
  summary: {
    totalAmount: number
    deliveredCount: number
    pendingCount: number
  }
}

interface SyncResult {
  synced: number
  skipped: number
  lastSyncedAt: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  const body = (await res.json()) as ApiResponse<T>

  if (!res.ok || body.error) {
    throw new Error(body.error?.message ?? `Request failed (${res.status})`)
  }

  return body.data as T
}

export function loginWithGoogle() {
  window.location.href = '/api/auth/login'
}

export function fetchCurrentUser() {
  return request<UserProfile>('/api/auth/me')
}

export async function logout() {
  await request<{ loggedOut: boolean }>('/api/auth/logout', { method: 'POST' })
}

export function fetchExpenses(params: {
  month: string
  page: number
  limit: number
  search?: string
}) {
  const query = new URLSearchParams({
    month: params.month,
    page: String(params.page),
    limit: String(params.limit),
  })
  if (params.search?.trim()) query.set('search', params.search.trim())

  return request<ExpensesResult>(`/api/expenses?${query}`)
}

export function fetchCategories() {
  return request<CategoryParent[]>('/api/categories')
}

export function saveCategories(categories: CategoryParent[]) {
  return request<CategoryParent[]>('/api/categories', {
    method: 'PUT',
    body: JSON.stringify(categories),
  })
}

export function syncGmail() {
  return request<SyncResult>('/api/gmail/sync', { method: 'POST' })
}

export function fetchGmailStatus() {
  return request<{ lastSyncedAt: string | null }>('/api/gmail/status')
}
