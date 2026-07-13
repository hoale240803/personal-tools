import type { CategoryParent, Expense, SyncHistoryRecord, UserProfile } from '../types'

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

interface SyncCountResult {
  count: number
  threshold: number
  exceedsThreshold: boolean
}

interface SyncExecuteResult {
  synced: number
  skipped: number
  failCount: number
  lastSyncedAt: string
  duration: number
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
  day?: string
  page: number
  limit: number
  search?: string
}) {
  const query = new URLSearchParams({
    month: params.month,
    page: String(params.page),
    limit: String(params.limit),
  })
  if (params.day) query.set('day', params.day)
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

export interface SyncDateRange {
  afterEpoch: number
  beforeEpoch: number
}

/** Step 1: Count messages only — fast, no body fetch */
export function countGmailMessages(dateRange?: SyncDateRange) {
  return request<SyncCountResult>('/api/gmail/sync', {
    method: 'POST',
    body: JSON.stringify({ action: 'count', ...dateRange }),
  })
}

/** Step 2: Full sync — fetch bodies, parse with Gemini, save to Sheets */
export function syncGmailExecute(dateRange?: SyncDateRange) {
  return request<SyncExecuteResult>('/api/gmail/sync', {
    method: 'POST',
    body: JSON.stringify({ action: 'execute', ...dateRange }),
  })
}

/** @deprecated Use countGmailMessages + syncGmailExecute instead */
export function syncGmail(dateRange?: SyncDateRange) {
  return syncGmailExecute(dateRange)
}

export function fetchGmailStatus() {
  return request<{ lastSyncedAt: string | null }>('/api/gmail/status')
}

export function fetchSyncHistory() {
  return request<SyncHistoryRecord[]>('/api/gmail/history')
}

export function setupGmailWatch() {
  return request<{ historyId: string; expiration: string; message: string }>(
    '/api/gmail/watch',
    { method: 'POST' },
  )
}

export interface ExpenseFormData {
  name: string
  purchaseDate: string
  amount: number
  parentCategory: string
  category: string
  platform: string
  status: string
  orderId: string
  imageUrl: string
}

export function createExpense(data: ExpenseFormData) {
  return request<Expense>('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateExpense(id: string, data: Partial<ExpenseFormData>) {
  return request<Expense>('/api/expenses', {
    method: 'PUT',
    body: JSON.stringify({ id, ...data }),
  })
}

export function deleteExpense(id: string) {
  return request<{ deleted: boolean; id: string }>(`/api/expenses?id=${id}`, {
    method: 'DELETE',
  })
}
