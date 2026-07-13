import { useEffect, useState } from 'react'
import { Calendar, CheckCircle, ChevronDown, ChevronUp, Clock, AlertTriangle, Zap, Server } from 'lucide-react'
import { fetchSyncHistory } from '../lib/api'
import type { SyncHistoryRecord } from '../types'

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

export function SyncHistoryPage() {
  const [history, setHistory] = useState<SyncHistoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Track expanded row IDs
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSyncHistory()
      setHistory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch sử đồng bộ')
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lịch sử đồng bộ</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lịch sử các lần lấy dữ liệu từ Gmail và xử lý bằng AI
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          Đang tải lịch sử...
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-medium text-slate-700">Chưa có lịch sử đồng bộ</p>
          <p className="mt-1 text-sm text-slate-500">Lịch sử sẽ xuất hiện sau khi bạn đồng bộ lần đầu tiên.</p>
        </div>
      ) : (
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
      )}
    </div>
  )
}
