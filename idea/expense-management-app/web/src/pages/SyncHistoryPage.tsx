import { useEffect, useState } from 'react'
import { Calendar, CheckCircle, ChevronDown, ChevronUp, Clock, AlertTriangle, Zap, Server, Bug, Check, Code } from 'lucide-react'
import { fetchSyncHistory, fetchErrorLog, resolveError } from '../lib/api'
import type { SyncHistoryRecord, ErrorLogEntry } from '../types'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatDateVN(dateStr: string): string {
  if (!dateStr) return 'Tất cả'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(dateStr))
}

type TabType = 'sync' | 'errors'

export function SyncHistoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('sync')
  const [history, setHistory] = useState<SyncHistoryRecord[]>([])
  const [errors, setErrors] = useState<ErrorLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Track expanded row IDs
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      if (activeTab === 'sync') {
        const data = await fetchSyncHistory()
        setHistory(data)
      } else {
        const data = await fetchErrorLog()
        setErrors(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const toggleRow = (syncId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(syncId)) next.delete(syncId)
      else next.add(syncId)
      return next
    })
  }

  const toggleErrorRow = (errorId: string) => {
    setExpandedErrors(prev => {
      const next = new Set(prev)
      if (next.has(errorId)) next.delete(errorId)
      else next.add(errorId)
      return next
    })
  }

  const handleResolve = async (errorId: string) => {
    try {
      await resolveError(errorId)
      setErrors(prev => prev.map(e => e.errorId === errorId ? { ...e, resolved: true } : e))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật')
    }
  }

  const unresolvedCount = errors.filter(e => !e.resolved).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử đồng bộ</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lịch sử các lần lấy dữ liệu từ Gmail và xử lý bằng AI
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('sync')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === 'sync'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            Lịch sử đồng bộ
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('errors')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === 'errors'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Bug className="h-4 w-4" />
            Error Log
            {unresolvedCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-semibold text-white">
                {unresolvedCount}
              </span>
            )}
          </span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          Đang tải...
        </div>
      ) : activeTab === 'sync' ? (
        <SyncHistoryList history={history} expandedRows={expandedRows} toggleRow={toggleRow} />
      ) : (
        <ErrorLogList
          errors={errors}
          expandedErrors={expandedErrors}
          toggleErrorRow={toggleErrorRow}
          onResolve={handleResolve}
        />
      )}
    </div>
  )
}

// ── Sync History List ─────────────────────────────────────────────────────────
function SyncHistoryList({
  history,
  expandedRows,
  toggleRow,
}: {
  history: SyncHistoryRecord[]
  expandedRows: Set<string>
  toggleRow: (id: string) => void
}) {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="font-medium text-slate-700">Chưa có lịch sử đồng bộ</p>
        <p className="mt-1 text-sm text-slate-500">Lịch sử sẽ xuất hiện sau khi bạn đồng bộ lần đầu tiên.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((record) => {
        const isExpanded = expandedRows.has(record.syncId)
        const hasErrors = record.failCount > 0
        
        return (
          <div 
            key={record.syncId}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300"
          >
            <div 
              className={`flex cursor-pointer flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between ${isExpanded ? 'bg-slate-50 border-b border-slate-100' : ''}`}
              onClick={() => hasErrors && toggleRow(record.syncId)}
            >
              <div className="flex flex-1 items-start gap-4">
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${record.syncType === 'pipeline' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {record.syncType === 'pipeline' ? <Zap className="h-5 w-5" /> : <Server className="h-5 w-5" />}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {record.syncType === 'pipeline' ? 'Tự động (Push)' : 'Thủ công (Manual)'}
                    </h3>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-sm text-slate-500">
                      {new Date(record.syncedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>
                        {record.startDate && record.endDate 
                          ? `${formatDateVN(record.startDate)} - ${formatDateVN(record.endDate)}` 
                          : 'Tất cả thời gian'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{formatDuration(record.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-6">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-500">Thành công</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600">
                      <CheckCircle className="h-4 w-4" />
                      {record.successCount} / {record.totalMessages}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-500">Thất bại</span>
                    <span className={`flex items-center gap-1 font-semibold ${hasErrors ? 'text-rose-600' : 'text-slate-400'}`}>
                      <AlertTriangle className="h-4 w-4" />
                      {record.failCount}
                    </span>
                  </div>
                </div>

                {hasErrors && (
                  <div className="flex h-8 w-8 items-center justify-center text-slate-400">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                )}
              </div>
            </div>

            {isExpanded && hasErrors && (
              <div className="bg-slate-50 p-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-900">Chi tiết lỗi ({record.failCount})</h4>
                <div className="space-y-2">
                  {record.errorMessages.map((err, idx) => (
                    <div key={idx} className="rounded-lg border border-rose-100 bg-white p-3 text-sm">
                      <div className="mb-1 flex items-start justify-between gap-4">
                        <span className="font-medium text-slate-900">{err.subject || '(Không có tiêu đề)'}</span>
                        <span className="shrink-0 font-mono text-xs text-slate-400">ID: {err.messageId}</span>
                      </div>
                      <p className="text-rose-600">{err.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Error Log List ────────────────────────────────────────────────────────────
function ErrorLogList({
  errors,
  expandedErrors,
  toggleErrorRow,
  onResolve,
}: {
  errors: ErrorLogEntry[]
  expandedErrors: Set<string>
  toggleErrorRow: (id: string) => void
  onResolve: (id: string) => void
}) {
  if (errors.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <Bug className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 font-medium text-slate-700">Không có lỗi nào</p>
        <p className="mt-1 text-sm text-slate-500">Hệ thống đang hoạt động bình thường.</p>
      </div>
    )
  }

  const sourceLabels: Record<string, { label: string; color: string }> = {
    'cron:flush': { label: 'Cron Flush', color: 'bg-amber-100 text-amber-700' },
    'cron:watch': { label: 'Cron Watch', color: 'bg-blue-100 text-blue-700' },
    'pipeline:webhook': { label: 'Webhook', color: 'bg-indigo-100 text-indigo-700' },
    'pipeline:batch': { label: 'Batch Process', color: 'bg-purple-100 text-purple-700' },
  }

  return (
    <div className="space-y-3">
      {errors.map((entry) => {
        const isExpanded = expandedErrors.has(entry.errorId)
        const sourceInfo = sourceLabels[entry.source] ?? { label: entry.source, color: 'bg-slate-100 text-slate-700' }

        return (
          <div
            key={entry.errorId}
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
              entry.resolved
                ? 'border-slate-200 opacity-60'
                : 'border-rose-200 hover:border-rose-300'
            }`}
          >
            <div
              className={`flex cursor-pointer flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between ${
                isExpanded ? 'border-b border-slate-100 bg-slate-50' : ''
              }`}
              onClick={() => toggleErrorRow(entry.errorId)}
            >
              <div className="flex flex-1 items-start gap-3">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  entry.resolved ? 'bg-slate-100 text-slate-400' : 'bg-rose-100 text-rose-600'
                }`}>
                  {entry.resolved ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${sourceInfo.color}`}>
                      {sourceInfo.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(entry.timestamp).toLocaleString('vi-VN')}
                    </span>
                    {entry.resolved && (
                      <span className="inline-flex rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Đã xử lý
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-900 line-clamp-2">
                    {entry.message}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {!entry.resolved && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onResolve(entry.errorId) }}
                    className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                    title="Đánh dấu đã xử lý"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
                <div className="flex h-7 w-7 items-center justify-center text-slate-400">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="space-y-3 bg-slate-50 p-4">
                {/* Error details */}
                <div>
                  <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Error Message
                  </h4>
                  <p className="rounded-lg border border-rose-100 bg-white p-3 text-sm text-rose-700">
                    {entry.message}
                  </p>
                </div>

                {/* Stack trace */}
                <div>
                  <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <Code className="h-3.5 w-3.5" />
                    Stack Trace
                  </h4>
                  <pre className="max-h-64 overflow-auto rounded-lg border border-slate-200 bg-slate-900 p-3 text-xs leading-relaxed text-slate-300">
                    {entry.stackTrace}
                  </pre>
                </div>

                {/* Context */}
                {Object.keys(entry.context).length > 0 && (
                  <div>
                    <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Context
                    </h4>
                    <pre className="overflow-auto rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
                      {JSON.stringify(entry.context, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>Error ID: <span className="font-mono">{entry.errorId}</span></span>
                  <span>User: {entry.userEmail}</span>
                  <span>Severity: {entry.severity}</span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
