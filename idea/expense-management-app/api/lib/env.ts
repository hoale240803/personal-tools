export function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

export function getEnvOptional(name: string): string | undefined {
  return process.env[name]
}

/**
 * Returns the message count threshold above which the UI warns the user to narrow
 * their sync date range (to avoid long-running serverless executions).
 *
 * Configure via env: SYNC_MESSAGE_THRESHOLD=25
 * Set to -1 (or leave unset) to disable the threshold check entirely.
 */
export function getSyncMessageThreshold(): number {
  const raw = process.env['SYNC_MESSAGE_THRESHOLD']
  if (!raw) return -1
  const parsed = parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : -1
}

export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
]

export const SHEET_NAMES = {
  expenses: 'Expenses',
  categories: 'Categories',
  syncState: 'SyncState',
  syncHistory: 'SyncHistory',
  pendingQueue: 'PendingQueue',
  errorLog: 'ErrorLog',
} as const

export const EXPENSE_HEADERS = [
  'id',
  'purchaseDate',
  'name',
  'parentCategory',
  'category',
  'amount',
  'platform',
  'status',
  'orderId',
  'imageUrl',
  'gmailMessageId',
  'createdAt',
] as const

export const CATEGORY_HEADERS = ['parentId', 'parentName', 'childId', 'childName'] as const

// userEmail | lastHistoryId | lastSyncedAt | syncMode | watchExpiration
export const SYNC_STATE_HEADERS = ['userEmail', 'lastHistoryId', 'lastSyncedAt', 'syncMode', 'watchExpiration'] as const

export type SyncMode = 'webhook' | 'cron'

// syncId | userEmail | startDate | endDate | totalMessages | processedCount | successCount | failCount | errorMessages (JSON) | duration (ms) | syncType | syncedAt
export const SYNC_HISTORY_HEADERS = [
  'syncId',
  'userEmail',
  'startDate',
  'endDate',
  'totalMessages',
  'processedCount',
  'successCount',
  'failCount',
  'errorMessages',
  'duration',
  'syncType',
  'syncedAt',
] as const

// messageId | userEmail | historyId | subject | queuedAt | status
export const PENDING_QUEUE_HEADERS = [
  'messageId',
  'userEmail',
  'historyId',
  'subject',
  'queuedAt',
  'status',
] as const

export const ERROR_LOG_HEADERS = [
  'errorId',
  'timestamp',
  'source',
  'severity',
  'userEmail',
  'message',
  'stackTrace',
  'context',
  'resolved',
] as const

export const DEFAULT_PAGE_SIZE = 20
