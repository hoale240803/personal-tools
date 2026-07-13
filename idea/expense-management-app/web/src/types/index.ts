export type ExpenseStatus = 'Đã giao' | 'Đang giao' | 'Đã hủy' | 'Chờ xử lý'

export interface Expense {
  id: string
  purchaseDate: string
  name: string
  category: string
  parentCategory: string
  amount: number
  platform: string
  status: ExpenseStatus
  orderId: string
  imageUrl: string
  gmailMessageId: string
}

export interface CategoryChild {
  id: string
  name: string
}

export interface CategoryParent {
  id: string
  name: string
  children: CategoryChild[]
}

export interface UserProfile {
  name: string
  email: string
  avatarUrl: string
}

export interface SyncErrorItem {
  messageId: string
  subject: string
  error: string
}

export interface SyncHistoryRecord {
  syncId: string
  userEmail: string
  startDate: string
  endDate: string
  totalMessages: number
  processedCount: number
  successCount: number
  failCount: number
  errorMessages: SyncErrorItem[]
  duration: number
  syncType: 'manual' | 'pipeline'
  syncedAt: string
}
