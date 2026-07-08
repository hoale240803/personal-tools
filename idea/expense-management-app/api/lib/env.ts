export function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

export function getEnvOptional(name: string): string | undefined {
  return process.env[name]
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

export const SYNC_STATE_HEADERS = ['userEmail', 'lastHistoryId', 'lastSyncedAt'] as const

export const DEFAULT_PAGE_SIZE = 20
