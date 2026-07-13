import { useCallback, useEffect, useState } from 'react'
import { Calendar, RefreshCw, Search, AlertCircle, X } from 'lucide-react'
import { Pagination } from '../components/Pagination'
import { PAGE_SIZE } from '../constants'
import { fetchExpenses, fetchGmailStatus, countGmailMessages, syncGmailExecute, type SyncDateRange } from '../lib/api'
import type { Expense } from '../types'
import { formatMonthLabel } from '../utils/expenseFilters'
import { formatCurrency, formatDate, getStatusColor } from '../utils/format'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function addOneDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

function firstDayOfNextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m, 1))
  return d.toISOString().slice(0, 10)
}

/**
 * Convert a YYYY-MM-DD date string to epoch seconds at midnight in the user's local timezone.
 * This ensures Gmail API queries align with the dates the user sees in their browser.
 */
function dateToLocalEpoch(dateStr: string): number {
  // new Date('YYYY-MM-DD') parses as UTC; we want local midnight instead
  const [y, m, d] = dateStr.split('-').map(Number)
  return Math.floor(new Date(y, m - 1, d).getTime() / 1000)
}

/**
 * Build a SyncDateRange from a start date and end date (YYYY-MM-DD strings).
 * Epochs are calculated at local midnight to match the user's timezone.
 */
function buildDateRange(startDate: string, endDate: string): SyncDateRange {
  return {
    afterEpoch: dateToLocalEpoch(startDate),
    beforeEpoch: dateToLocalEpoch(endDate),
  }
}

function formatDateVN(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(dateStr))
}

export function ExpensesPage() {
  const [pickerDate, setPickerDate] = useState(todayIso)
  const [mode, setMode] = useState<'month' | 'day'>('month')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [summary, setSummary] = useState({ totalAmount: 0, deliveredCount: 0, pendingCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  // Sync warning modal state
  const [showSyncWarning, setShowSyncWarning] = useState(false)
  const [syncCount, setSyncCount] = useState(0)
  const [syncStartDate, setSyncStartDate] = useState('')
  const [syncEndDate, setSyncEndDate] = useState('')
  const [originalDateRange, setOriginalDateRange] = useState<SyncDateRange | undefined>(undefined)

  const monthValue = pickerDate.slice(0, 7)
  const dayValue = mode === 'day' ? pickerDate : undefined

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setPage(1)
  }, [pickerDate, mode, debouncedSearch])

  const loadExpenses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchExpenses({
        month: monthValue,
        day: dayValue,
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      })
      setExpenses(result.items)
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setSummary(result.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [monthValue, dayValue, page, debouncedSearch])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  useEffect(() => {
    fetchGmailStatus()
      .then((status) => setLastSyncedAt(status.lastSyncedAt))
      .catch(() => {})
  }, [])

  const handleSync = async (scoped = false) => {
    setSyncing(true)
    setSyncMessage(null)
    try {
      const dateRange = scoped
        ? mode === 'day'
          ? buildDateRange(pickerDate, addOneDay(pickerDate))
          : buildDateRange(`${monthValue}-01`, firstDayOfNextMonth(monthValue))
        : undefined

      const countResult = await countGmailMessages(dateRange)
      if (countResult.exceedsThreshold) {
        setSyncCount(countResult.count)
        // Pre-fill the warning modal's date inputs with the scoped dates
        if (scoped) {
          setSyncStartDate(mode === 'day' ? pickerDate : `${monthValue}-01`)
          setSyncEndDate(mode === 'day' ? addOneDay(pickerDate) : firstDayOfNextMonth(monthValue))
        } else {
          setSyncStartDate('')
          setSyncEndDate('')
        }
        setOriginalDateRange(dateRange)
        setShowSyncWarning(true)
        setSyncing(false)
        return
      }

      await executeSync(dateRange)
    } catch (err) {
      setSyncMessage(err instanceof Error ? err.message : 'Lỗi kiểm tra đồng bộ')
      setSyncing(false)
    }
  }

  const executeSync = async (dateRange?: SyncDateRange) => {
    setSyncing(true)
    setSyncMessage(null)
    setShowSyncWarning(false)
    try {
      const result = await syncGmailExecute(dateRange)
      setLastSyncedAt(result.lastSyncedAt)
      setSyncMessage(`Đã đồng bộ ${result.synced} email mới, bỏ qua ${result.skipped}.`)
      await loadExpenses()
    } catch (err) {
      setSyncMessage(err instanceof Error ? err.message : 'Đồng bộ thất bại')
    } finally {
      setSyncing(false)
    }
  }

  const scopedLabel = mode === 'day'
    ? `Đồng bộ ${formatDateVN(pickerDate)}`
    : `Đồng bộ ${formatMonthLabel(monthValue)}`

  const periodLabel = mode === 'day' ? formatDateVN(pickerDate) : formatMonthLabel(monthValue)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Theo dõi chi phí</h1>
          <p className="mt-1 text-sm text-slate-500">
            Dữ liệu tự động từ email mua hàng — phân tích bởi Gemini
          </p>
          {lastSyncedAt && (
            <p className="mt-1 text-xs text-slate-400">
              Lần đồng bộ gần nhất: {new Date(lastSyncedAt).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => handleSync(false)}
          disabled={syncing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Đang đồng bộ...' : 'Đồng bộ Gmail'}
        </button>
      </div>

      {syncMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {syncMessage}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <input
              type="date"
              value={pickerDate}
              onChange={(e) => { if (e.target.value) setPickerDate(e.target.value) }}
              className="border-0 bg-transparent text-sm text-slate-900 outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => setMode(mode === 'day' ? 'month' : 'day')}
            className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
              mode === 'day'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            {mode === 'day' ? '📅 Theo ngày' : '🗓 Theo tháng'}
          </button>
          <button
            type="button"
            onClick={() => handleSync(true)}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700 transition hover:bg-sky-100 disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
            {scopedLabel}
          </button>
        </div>
        <p className="text-sm text-slate-500">{periodLabel}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label={`Tổng chi ${periodLabel.toLowerCase()}`}
          value={formatCurrency(summary.totalAmount)}
          tone="red"
        />
        <KpiCard label="Đã giao" value={String(summary.deliveredCount)} tone="green" />
        <KpiCard label="Đang giao" value={String(summary.pendingCount)} tone="orange" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, platform, order ID..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-emerald-500/0 transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
        <p className="text-sm text-slate-500">{total} giao dịch</p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          Đang tải dữ liệu...
        </div>
      ) : total === 0 ? (
        <EmptyState label={periodLabel} />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Hình ảnh</th>
                  <th className="px-4 py-3 font-medium">Ngày mua</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Danh mục</th>
                  <th className="px-4 py-3 font-medium">Chi phí</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Order ID</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <ExpenseRow key={expense.id} expense={expense} />
                ))}
              </tbody>
            </table>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>

          <div className="space-y-3 lg:hidden">
            {expenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          </div>
        </>
      )}

      {showSyncWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-semibold">Khối lượng dữ liệu lớn</h3>
              </div>
              <button
                onClick={() => setShowSyncWarning(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="mb-4 text-sm text-slate-600">
                Tìm thấy <strong className="text-slate-900">{syncCount}</strong> email mua hàng trong khoảng thời gian này.
                Quá trình phân tích bằng AI có thể mất nhiều thời gian hoặc timeout.
                Vui lòng thu hẹp khoảng thời gian đồng bộ để xử lý nhanh hơn.
              </p>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">Từ ngày</label>
                  <input
                    type="date"
                    value={syncStartDate}
                    onChange={(e) => setSyncStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="pt-5 text-slate-300">-</div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">Đến ngày</label>
                  <input
                    type="date"
                    value={syncEndDate}
                    onChange={(e) => setSyncEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <button
                  onClick={() => executeSync(originalDateRange)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Vẫn đồng bộ tất cả
                </button>
                <button
                  onClick={() =>
                    executeSync(
                      syncStartDate && syncEndDate
                        ? buildDateRange(syncStartDate, syncEndDate)
                        : originalDateRange
                    )
                  }
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  Xác nhận đồng bộ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="font-medium text-slate-700">Không có giao dịch trong {label}</p>
      <p className="mt-1 text-sm text-slate-500">Bấm &quot;Đồng bộ Gmail&quot; để import email mua hàng.</p>
    </div>
  )
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'green' | 'red' | 'orange'
}) {
  const tones = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    red: 'border-rose-200 bg-rose-50 text-rose-800',
    orange: 'border-amber-200 bg-amber-50 text-amber-800',
  }

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}

function ExpenseRow({ expense }: { expense: Expense }) {
  return (
    <tr className="border-b border-slate-100 transition hover:bg-slate-50/80">
      <td className="px-4 py-3">
        {expense.imageUrl ? (
          <img
            src={expense.imageUrl}
            alt={expense.name}
            className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
            N/A
          </div>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
        {formatDate(expense.purchaseDate)}
      </td>
      <td className="max-w-[220px] px-4 py-3 font-medium text-slate-900">{expense.name}</td>
      <td className="px-4 py-3">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          {expense.category}
        </span>
      </td>
      <td className="px-4 py-3 font-semibold text-rose-600">{formatCurrency(expense.amount)}</td>
      <td className="px-4 py-3 text-slate-600">{expense.platform}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(expense.status)}`}
        >
          {expense.status}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-slate-500">{expense.orderId}</td>
    </tr>
  )
}

function ExpenseCard({ expense }: { expense: Expense }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        {expense.imageUrl ? (
          <img
            src={expense.imageUrl}
            alt={expense.name}
            className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
            N/A
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900">{expense.name}</h3>
            <span className="shrink-0 font-bold text-rose-600">{formatCurrency(expense.amount)}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{formatDate(expense.purchaseDate)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {expense.category}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {expense.platform}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusColor(expense.status)}`}
            >
              {expense.status}
            </span>
          </div>
          <p className="mt-2 font-mono text-xs text-slate-400">{expense.orderId}</p>
        </div>
      </div>
    </article>
  )
}
