import type { SessionData } from './session'
import { getSheetsClient } from './google'
import type { SyncMode } from './env'
import {
  CATEGORY_HEADERS,
  ERROR_LOG_HEADERS,
  EXPENSE_HEADERS,
  PENDING_QUEUE_HEADERS,
  SHEET_NAMES,
  SYNC_HISTORY_HEADERS,
  SYNC_STATE_HEADERS,
} from './env'

export interface ExpenseRow {
  id: string
  purchaseDate: string
  name: string
  parentCategory: string
  category: string
  amount: number
  platform: string
  status: string
  orderId: string
  imageUrl: string
  gmailMessageId: string
  createdAt: string
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
  syncType: 'manual' | 'pipeline' | 'cron'
  syncedAt: string
}

export interface PendingQueueItem {
  messageId: string
  userEmail: string
  historyId: string
  subject: string
  queuedAt: string
  status: 'pending' | 'processing' | 'done'
}

function spreadsheetId(session: SessionData): string {
  if (!session.spreadsheetId) throw new Error('Session is missing spreadsheetId — please log out and log in again')
  return session.spreadsheetId
}

function rowToExpense(cells: string[]): ExpenseRow {
  return {
    id: cells[0] ?? '',
    purchaseDate: cells[1] ?? '',
    name: cells[2] ?? '',
    parentCategory: cells[3] ?? '',
    category: cells[4] ?? '',
    amount: Number(cells[5] ?? 0),
    platform: cells[6] ?? '',
    status: cells[7] ?? '',
    orderId: cells[8] ?? '',
    imageUrl: cells[9] ?? '',
    gmailMessageId: cells[10] ?? '',
    createdAt: cells[11] ?? '',
  }
}

async function ensureSheetHeaders(session: SessionData) {
  const sheets = getSheetsClient(session)
  const id = spreadsheetId(session)

  const meta = await sheets.spreadsheets.get({ spreadsheetId: id })
  const existing = new Set(meta.data.sheets?.map((s) => s.properties?.title) ?? [])

  const requests = []
  if (!existing.has(SHEET_NAMES.expenses)) {
    requests.push({ addSheet: { properties: { title: SHEET_NAMES.expenses } } })
  }
  if (!existing.has(SHEET_NAMES.categories)) {
    requests.push({ addSheet: { properties: { title: SHEET_NAMES.categories } } })
  }
  if (!existing.has(SHEET_NAMES.syncState)) {
    requests.push({ addSheet: { properties: { title: SHEET_NAMES.syncState } } })
  }
  if (!existing.has(SHEET_NAMES.syncHistory)) {
    requests.push({ addSheet: { properties: { title: SHEET_NAMES.syncHistory } } })
  }
  if (!existing.has(SHEET_NAMES.pendingQueue)) {
    requests.push({ addSheet: { properties: { title: SHEET_NAMES.pendingQueue } } })
  }
  if (!existing.has(SHEET_NAMES.errorLog)) {
    requests.push({ addSheet: { properties: { title: SHEET_NAMES.errorLog } } })
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: id,
      requestBody: { requests },
    })
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `${SHEET_NAMES.expenses}!A1:L1`,
    valueInputOption: 'RAW',
    requestBody: { values: [EXPENSE_HEADERS as unknown as string[]] },
  })
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `${SHEET_NAMES.categories}!A1:D1`,
    valueInputOption: 'RAW',
    requestBody: { values: [CATEGORY_HEADERS as unknown as string[]] },
  })
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `${SHEET_NAMES.syncState}!A1:E1`,
    valueInputOption: 'RAW',
    requestBody: { values: [SYNC_STATE_HEADERS as unknown as string[]] },
  })
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `${SHEET_NAMES.syncHistory}!A1:L1`,
    valueInputOption: 'RAW',
    requestBody: { values: [SYNC_HISTORY_HEADERS as unknown as string[]] },
  })
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `${SHEET_NAMES.pendingQueue}!A1:F1`,
    valueInputOption: 'RAW',
    requestBody: { values: [PENDING_QUEUE_HEADERS as unknown as string[]] },
  })
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `${SHEET_NAMES.errorLog}!A1:I1`,
    valueInputOption: 'RAW',
    requestBody: { values: [ERROR_LOG_HEADERS as unknown as string[]] },
  })
}

async function readExpenseRows(session: SessionData): Promise<ExpenseRow[]> {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.expenses}!A2:L`,
  })

  return (data.values ?? [])
    .filter((row) => row[0])
    .map((row) => rowToExpense(row.map(String)))
}

export async function getExpenses(
  session: SessionData,
  options: { month: string; day?: string; page: number; limit: number; search?: string },
) {
  const all = await readExpenseRows(session)
  let filtered = all.filter((row) =>
    options.day ? row.purchaseDate === options.day : row.purchaseDate.startsWith(options.month),
  )

  if (options.search) {
    const q = options.search.toLowerCase()
    filtered = filtered.filter((row) =>
      [row.name, row.category, row.platform, row.orderId, row.status].some((field) =>
        field.toLowerCase().includes(q),
      ),
    )
  }

  filtered.sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / options.limit))
  const page = Math.min(Math.max(1, options.page), totalPages)
  const start = (page - 1) * options.limit
  const items = filtered.slice(start, start + options.limit)

  return {
    items,
    total,
    page,
    limit: options.limit,
    totalPages,
    summary: {
      totalAmount: filtered.reduce((sum, row) => sum + row.amount, 0),
      deliveredCount: filtered.filter((row) => row.status === 'Đã giao').length,
      pendingCount: filtered.filter((row) => row.status === 'Đang giao').length,
    },
  }
}

export async function getExistingMessageIds(session: SessionData): Promise<Set<string>> {
  const rows = await readExpenseRows(session)
  return new Set(rows.map((row) => row.gmailMessageId).filter(Boolean))
}

export async function appendExpense(session: SessionData, expense: ExpenseRow) {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.expenses}!A:L`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [
        [
          expense.id,
          expense.purchaseDate,
          expense.name,
          expense.parentCategory,
          expense.category,
          expense.amount,
          expense.platform,
          expense.status,
          expense.orderId,
          expense.imageUrl,
          expense.gmailMessageId,
          expense.createdAt,
        ],
      ],
    },
  })
}

export async function updateExpense(
  session: SessionData,
  id: string,
  updates: Partial<Omit<ExpenseRow, 'id' | 'createdAt'>>,
) {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  const sid = spreadsheetId(session)

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: sid,
    range: `${SHEET_NAMES.expenses}!A2:L`,
  })

  const rows = data.values ?? []
  const rowIndex = rows.findIndex((row) => String(row[0]) === id)
  if (rowIndex < 0) throw new Error(`Expense not found: ${id}`)

  const existing = rowToExpense(rows[rowIndex].map(String))
  const updated: ExpenseRow = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
  }

  const sheetRow = rowIndex + 2 // +1 for header, +1 for 1-indexed
  await sheets.spreadsheets.values.update({
    spreadsheetId: sid,
    range: `${SHEET_NAMES.expenses}!A${sheetRow}:L${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [
        [
          updated.id,
          updated.purchaseDate,
          updated.name,
          updated.parentCategory,
          updated.category,
          updated.amount,
          updated.platform,
          updated.status,
          updated.orderId,
          updated.imageUrl,
          updated.gmailMessageId,
          updated.createdAt,
        ],
      ],
    },
  })

  return updated
}

export async function deleteExpense(session: SessionData, id: string) {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  const sid = spreadsheetId(session)

  // Get sheet metadata to find the sheetId for batchUpdate
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sid })
  const expensesSheet = meta.data.sheets?.find(
    (s) => s.properties?.title === SHEET_NAMES.expenses,
  )
  if (!expensesSheet?.properties?.sheetId && expensesSheet?.properties?.sheetId !== 0) {
    throw new Error('Expenses sheet not found')
  }
  const sheetId = expensesSheet.properties.sheetId

  // Find the row index
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: sid,
    range: `${SHEET_NAMES.expenses}!A2:A`,
  })

  const ids = (data.values ?? []).map((row) => String(row[0]))
  const rowIndex = ids.indexOf(id)
  if (rowIndex < 0) throw new Error(`Expense not found: ${id}`)

  // Delete the row (rowIndex + 1 for header row offset)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sid,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex + 1, // +1 for the header row
              endIndex: rowIndex + 2,
            },
          },
        },
      ],
    },
  })
}

export async function getCategories(session: SessionData): Promise<CategoryParent[]> {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.categories}!A2:D`,
  })

  const parents = new Map<string, CategoryParent>()

  for (const row of data.values ?? []) {
    const [parentId, parentName, childId, childName] = row.map(String)
    if (!parentId || !parentName) continue

    if (!parents.has(parentId)) {
      parents.set(parentId, { id: parentId, name: parentName, children: [] })
    }

    if (childId && childName) {
      parents.get(parentId)!.children.push({ id: childId, name: childName })
    }
  }

  return Array.from(parents.values())
}

export async function saveCategories(session: SessionData, categories: CategoryParent[]) {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)

  const rows: string[][] = []
  for (const parent of categories) {
    if (parent.children.length === 0) {
      rows.push([parent.id, parent.name, '', ''])
      continue
    }
    for (const child of parent.children) {
      rows.push([parent.id, parent.name, child.id, child.name])
    }
  }

  await sheets.spreadsheets.values.clear({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.categories}!A2:D`,
  })

  if (rows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId(session),
      range: `${SHEET_NAMES.categories}!A2`,
      valueInputOption: 'RAW',
      requestBody: { values: rows },
    })
  }
}

export async function getSyncState(session: SessionData) {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.syncState}!A2:E`,
  })

  const row = (data.values ?? []).find((r) => r[0] === session.email)
  return {
    lastSyncedAt: row?.[2] ? String(row[2]) : null,
    syncMode: (row?.[3] ? String(row[3]) : 'cron') as SyncMode,
    watchExpiration: row?.[4] ? String(row[4]) : null,
  }
}

export async function updateSyncState(
  session: SessionData,
  lastSyncedAt: string,
  options?: { syncMode?: SyncMode; watchExpiration?: string | null },
) {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.syncState}!A2:E`,
  })

  const rows = (data.values ?? []).map((row) => [...row.map(String)])
  const index = rows.findIndex((row) => row[0] === session.email)

  if (index >= 0) {
    const existing = rows[index]
    rows[index] = [
      session.email,
      existing[1] ?? '',                            // lastHistoryId
      lastSyncedAt,                                  // lastSyncedAt
      options?.syncMode ?? existing[3] ?? 'cron',   // syncMode
      options?.watchExpiration !== undefined
        ? (options.watchExpiration ?? '')             // allow explicit null → clear
        : (existing[4] ?? ''),                       // watchExpiration
    ]
  } else {
    rows.push([
      session.email,
      '',
      lastSyncedAt,
      options?.syncMode ?? 'cron',
      options?.watchExpiration ?? '',
    ])
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.syncState}!A2:E${rows.length + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  })
}

/**
 * Update only the syncMode and watchExpiration fields in SyncState,
 * without touching lastSyncedAt or lastHistoryId.
 */
export async function updateSyncMode(
  session: SessionData,
  syncMode: SyncMode,
  watchExpiration?: string | null,
) {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.syncState}!A2:E`,
  })

  const rows = (data.values ?? []).map((row) => [...row.map(String)])
  const index = rows.findIndex((row) => row[0] === session.email)

  if (index >= 0) {
    const existing = rows[index]
    rows[index] = [
      session.email,
      existing[1] ?? '',
      existing[2] ?? '',
      syncMode,
      watchExpiration !== undefined ? (watchExpiration ?? '') : (existing[4] ?? ''),
    ]
  } else {
    rows.push([session.email, '', '', syncMode, watchExpiration ?? ''])
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.syncState}!A2:E${rows.length + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  })
}

// ─── SyncHistory ──────────────────────────────────────────────────────────────

export async function appendSyncHistory(session: SessionData, record: SyncHistoryRecord) {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.syncHistory}!A:L`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [
        [
          record.syncId,
          record.userEmail,
          record.startDate,
          record.endDate,
          record.totalMessages,
          record.processedCount,
          record.successCount,
          record.failCount,
          JSON.stringify(record.errorMessages),
          record.duration,
          record.syncType,
          record.syncedAt,
        ],
      ],
    },
  })
}

export async function getSyncHistory(
  session: SessionData,
  limit = 50,
): Promise<SyncHistoryRecord[]> {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.syncHistory}!A2:L`,
  })

  const rows = (data.values ?? [])
    .filter((row) => row[0] && row[1] === session.email)
    .map((row) => {
      let errorMessages: SyncErrorItem[] = []
      try {
        errorMessages = JSON.parse(String(row[8] ?? '[]'))
      } catch {
        errorMessages = []
      }
      return {
        syncId: String(row[0] ?? ''),
        userEmail: String(row[1] ?? ''),
        startDate: String(row[2] ?? ''),
        endDate: String(row[3] ?? ''),
        totalMessages: Number(row[4] ?? 0),
        processedCount: Number(row[5] ?? 0),
        successCount: Number(row[6] ?? 0),
        failCount: Number(row[7] ?? 0),
        errorMessages,
        duration: Number(row[9] ?? 0),
        syncType: (String(row[10] ?? 'manual')) as SyncHistoryRecord['syncType'],
        syncedAt: String(row[11] ?? ''),
      } satisfies SyncHistoryRecord
    })

  // Return newest first, limited
  return rows.reverse().slice(0, limit)
}

// ─── PendingQueue ─────────────────────────────────────────────────────────────

export async function enqueuePendingMessage(
  session: SessionData,
  item: Pick<PendingQueueItem, 'messageId' | 'userEmail' | 'historyId' | 'subject'>,
) {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)

  // Avoid duplicates: check if messageId already exists in queue
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.pendingQueue}!A2:F`,
  })
  const exists = (data.values ?? []).some(
    (row) => String(row[0]) === item.messageId && String(row[4]) !== 'done',
  )
  if (exists) {
    console.log(`[PendingQueue] messageId=${item.messageId} already queued, skipping`)
    return
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.pendingQueue}!A:F`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [
        [
          item.messageId,
          item.userEmail,
          item.historyId,
          item.subject,
          new Date().toISOString(),
          'pending',
        ],
      ],
    },
  })
  console.log(`[PendingQueue] Enqueued messageId=${item.messageId} for ${item.userEmail}`)
}

export async function getPendingMessages(
  session: SessionData,
  userEmail: string,
): Promise<PendingQueueItem[]> {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.pendingQueue}!A2:F`,
  })

  return (data.values ?? [])
    .filter((row) => String(row[1]) === userEmail && String(row[5]) === 'pending')
    .map((row) => ({
      messageId: String(row[0] ?? ''),
      userEmail: String(row[1] ?? ''),
      historyId: String(row[2] ?? ''),
      subject: String(row[3] ?? ''),
      queuedAt: String(row[4] ?? ''),
      status: 'pending' as const,
    }))
}

export async function countPendingMessages(
  session: SessionData,
  userEmail: string,
): Promise<number> {
  const items = await getPendingMessages(session, userEmail)
  return items.length
}

export async function markPendingMessagesProcessed(
  session: SessionData,
  messageIds: string[],
) {
  if (messageIds.length === 0) return
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.pendingQueue}!A2:F`,
  })

  const rows = data.values ?? []
  const idSet = new Set(messageIds)
  const updatedRows = rows.map((row) => {
    if (idSet.has(String(row[0]))) {
      return [row[0], row[1], row[2], row[3], row[4], 'done']
    }
    return row
  })

  if (updatedRows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId(session),
      range: `${SHEET_NAMES.pendingQueue}!A2:F${updatedRows.length + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: updatedRows },
    })
  }
  console.log(`[PendingQueue] Marked ${messageIds.length} messages as done`)
}

// ─── ErrorLog ─────────────────────────────────────────────────────────────────

export interface ErrorLogEntry {
  errorId: string
  timestamp: string
  source: string
  severity: 'error' | 'warning'
  userEmail: string
  message: string
  stackTrace: string
  context: Record<string, unknown>
  resolved: boolean
}

export async function appendErrorLog(session: SessionData, entry: ErrorLogEntry) {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.errorLog}!A:I`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [
        [
          entry.errorId,
          entry.timestamp,
          entry.source,
          entry.severity,
          entry.userEmail,
          entry.message,
          entry.stackTrace,
          JSON.stringify(entry.context),
          String(entry.resolved),
        ],
      ],
    },
  })
}

export async function getErrorLog(
  session: SessionData,
  limit = 50,
): Promise<ErrorLogEntry[]> {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.errorLog}!A2:I`,
  })

  const rows = (data.values ?? [])
    .filter((row) => row[0])
    .map((row) => {
      let context: Record<string, unknown> = {}
      try {
        context = JSON.parse(String(row[7] ?? '{}'))
      } catch {
        context = {}
      }
      return {
        errorId: String(row[0] ?? ''),
        timestamp: String(row[1] ?? ''),
        source: String(row[2] ?? ''),
        severity: (String(row[3] ?? 'error')) as ErrorLogEntry['severity'],
        userEmail: String(row[4] ?? ''),
        message: String(row[5] ?? ''),
        stackTrace: String(row[6] ?? ''),
        context,
        resolved: String(row[8]) === 'true',
      } satisfies ErrorLogEntry
    })

  // Return newest first, limited
  return rows.reverse().slice(0, limit)
}

export async function markErrorResolved(session: SessionData, errorId: string) {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.errorLog}!A2:I`,
  })

  const rows = data.values ?? []
  const rowIndex = rows.findIndex((row) => String(row[0]) === errorId)
  if (rowIndex < 0) return

  const sheetRow = rowIndex + 2
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(session),
    range: `${SHEET_NAMES.errorLog}!I${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [['true']] },
  })
}

