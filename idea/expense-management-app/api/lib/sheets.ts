import type { SessionData } from './session'
import { getSheetsClient } from './google'
import {
  CATEGORY_HEADERS,
  EXPENSE_HEADERS,
  getEnv,
  SHEET_NAMES,
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

function spreadsheetId() {
  return getEnv('SPREADSHEET_ID')
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
  const id = spreadsheetId()

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
    range: `${SHEET_NAMES.syncState}!A1:C1`,
    valueInputOption: 'RAW',
    requestBody: { values: [SYNC_STATE_HEADERS as unknown as string[]] },
  })
}

async function readExpenseRows(session: SessionData): Promise<ExpenseRow[]> {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${SHEET_NAMES.expenses}!A2:L`,
  })

  return (data.values ?? [])
    .filter((row) => row[0])
    .map((row) => rowToExpense(row.map(String)))
}

export async function getExpenses(
  session: SessionData,
  options: { month: string; page: number; limit: number; search?: string },
) {
  const all = await readExpenseRows(session)
  let filtered = all.filter((row) => row.purchaseDate.startsWith(options.month))

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
    spreadsheetId: spreadsheetId(),
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

export async function getCategories(session: SessionData): Promise<CategoryParent[]> {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
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
    spreadsheetId: spreadsheetId(),
    range: `${SHEET_NAMES.categories}!A2:D`,
  })

  if (rows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId(),
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
    spreadsheetId: spreadsheetId(),
    range: `${SHEET_NAMES.syncState}!A2:C`,
  })

  const row = (data.values ?? []).find((r) => r[0] === session.email)
  return {
    lastSyncedAt: row?.[2] ? String(row[2]) : null,
  }
}

export async function updateSyncState(session: SessionData, lastSyncedAt: string) {
  await ensureSheetHeaders(session)
  const sheets = getSheetsClient(session)
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${SHEET_NAMES.syncState}!A2:C`,
  })

  const rows = (data.values ?? []).map((row) => [...row.map(String)])
  const index = rows.findIndex((row) => row[0] === session.email)

  if (index >= 0) {
    rows[index] = [session.email, rows[index][1] ?? '', lastSyncedAt]
  } else {
    rows.push([session.email, '', lastSyncedAt])
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: `${SHEET_NAMES.syncState}!A2:C${rows.length + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  })
}
