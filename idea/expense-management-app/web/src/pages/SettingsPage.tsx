import { useEffect, useState } from 'react'
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Clock,
  FolderTree,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import {
  cancelGmailWatch,
  fetchCategories,
  fetchGmailStatus,
  saveCategories,
  setupGmailWatch,
} from '../lib/api'
import type { CategoryParent } from '../types'

type SyncMode = 'webhook' | 'cron'

export function SettingsPage() {
  const [categories, setCategories] = useState<CategoryParent[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [newParentName, setNewParentName] = useState('')
  const [newChildNames, setNewChildNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Sync Mode state
  const [syncMode, setSyncMode] = useState<SyncMode | null>(null)
  const [watchExpiration, setWatchExpiration] = useState<string | null>(null)
  const [watchLoading, setWatchLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [syncStatusLoading, setSyncStatusLoading] = useState(true)
  const [watchMessage, setWatchMessage] = useState<string | null>(null)
  const [watchError, setWatchError] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data)
        setExpanded(Object.fromEntries(data.map((c) => [c.id, true])))
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Không tải được danh mục'))
      .finally(() => setLoading(false))
  }, [])

  // Load current sync mode on mount
  useEffect(() => {
    setSyncStatusLoading(true)
    fetchGmailStatus()
      .then((status) => {
        setSyncMode(status.syncMode ?? 'cron')
        setWatchExpiration(status.watchExpiration ?? null)
      })
      .catch(() => {
        setSyncMode('cron')
      })
      .finally(() => setSyncStatusLoading(false))
  }, [])

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const addParent = () => {
    const name = newParentName.trim()
    if (!name) return
    setCategories((prev) => [...prev, { id: `p-${Date.now()}`, name, children: [] }])
    setNewParentName('')
  }

  const addChild = (parentId: string) => {
    const name = (newChildNames[parentId] ?? '').trim()
    if (!name) return
    setCategories((prev) =>
      prev.map((parent) =>
        parent.id === parentId
          ? { ...parent, children: [...parent.children, { id: `c-${Date.now()}`, name }] }
          : parent,
      ),
    )
    setNewChildNames((prev) => ({ ...prev, [parentId]: '' }))
  }

  const removeParent = (parentId: string) => {
    setCategories((prev) => prev.filter((p) => p.id !== parentId))
  }

  const removeChild = (parentId: string, childId: string) => {
    setCategories((prev) =>
      prev.map((parent) =>
        parent.id === parentId
          ? { ...parent, children: parent.children.filter((c) => c.id !== childId) }
          : parent,
      ),
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await saveCategories(categories)
      setMessage('Đã lưu danh mục vào Google Sheets.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleActivateWebhook = async () => {
    setWatchLoading(true)
    setWatchError(null)
    setWatchMessage(null)
    try {
      const result = await setupGmailWatch()
      setSyncMode('webhook')
      setWatchExpiration(result.expiration)
      setWatchMessage(result.message)
    } catch (err) {
      setWatchError(err instanceof Error ? err.message : 'Đăng ký thất bại')
    } finally {
      setWatchLoading(false)
    }
  }

  const handleCancelWebhook = async () => {
    setCancelLoading(true)
    setWatchError(null)
    setWatchMessage(null)
    setShowCancelConfirm(false)
    try {
      const result = await cancelGmailWatch()
      setSyncMode('cron')
      setWatchExpiration(null)
      setWatchMessage(result.message)
    } catch (err) {
      setWatchError(err instanceof Error ? err.message : 'Huỷ thất bại')
    } finally {
      setCancelLoading(false)
    }
  }

  const isWebhookActive = syncMode === 'webhook'
  const isWebhookExpired =
    watchExpiration ? new Date(watchExpiration).getTime() < Date.now() : false

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
        Đang tải danh mục...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cài đặt danh mục</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cấu hình danh mục cha / con — Gemini sẽ dùng để phân loại chi tiêu
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Đang lưu...' : 'Lưu vào Sheets'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700">
          <FolderTree className="h-4 w-4 text-emerald-600" />
          Danh mục cha &amp; con
        </div>

        <div className="space-y-3">
          {categories.map((parent) => (
            <div key={parent.id} className="rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleExpand(parent.id)}
                  className="rounded p-1 text-slate-500 hover:bg-white"
                >
                  {expanded[parent.id] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <span className="flex-1 font-semibold text-slate-900">{parent.name}</span>
                <span className="text-xs text-slate-500">{parent.children.length} danh mục con</span>
                <button
                  type="button"
                  onClick={() => removeParent(parent.id)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  title="Xóa danh mục cha"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {expanded[parent.id] && (
                <div className="border-t border-slate-200 px-4 py-3">
                  <ul className="space-y-2">
                    {parent.children.map((child) => (
                      <li
                        key={child.id}
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
                      >
                        <span className="text-slate-700">
                          <span className="mr-2 text-slate-400">↳</span>
                          {child.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeChild(parent.id, child.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={newChildNames[parent.id] ?? ''}
                      onChange={(e) =>
                        setNewChildNames((prev) => ({ ...prev, [parent.id]: e.target.value }))
                      }
                      placeholder="Thêm danh mục con..."
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
                      onKeyDown={(e) => e.key === 'Enter' && addChild(parent.id)}
                    />
                    <button
                      type="button"
                      onClick={() => addChild(parent.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      <Plus className="h-4 w-4" />
                      Thêm
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
          <input
            type="text"
            value={newParentName}
            onChange={(e) => setNewParentName(e.target.value)}
            placeholder="Tên danh mục cha mới..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10"
            onKeyDown={(e) => e.key === 'Enter' && addParent()}
          />
          <button
            type="button"
            onClick={addParent}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Thêm danh mục cha
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <h2 className="text-sm font-semibold text-slate-800">Cách Gemini dùng danh mục</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Khi đọc email mua hàng, Gemini sẽ so khớp nội dung với danh sách danh mục bạn cấu hình
          ở đây. Nếu không khớp, app sẽ gán danh mục mặc định <strong>Mua sắm &gt; Khác</strong>.
        </p>
      </div>

      {/* ── Sync Mode Panel ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
          <Bell className="h-4 w-4 text-indigo-600" />
          Phương thức đồng bộ Email
        </div>
        <p className="mb-5 text-sm text-slate-500">
          Chọn cách app theo dõi email mua hàng từ Gmail của bạn.
        </p>

        {watchError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {watchError}
          </div>
        )}
        {watchMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {watchMessage}
          </div>
        )}

        {syncStatusLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Đang tải trạng thái...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">

            {/* ── Card: Webhook Realtime ─────────────────────────────────── */}
            <div
              className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all ${
                isWebhookActive && !isWebhookExpired
                  ? 'border-indigo-500 bg-indigo-50/60 shadow-md shadow-indigo-100'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
              }`}
            >
              {/* Active pulse ring */}
              {isWebhookActive && !isWebhookExpired && (
                <span className="absolute right-4 top-4 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" />
                </span>
              )}

              <div className="mb-3 flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    isWebhookActive && !isWebhookExpired
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Wifi className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Webhook Realtime</div>
                  {isWebhookActive && !isWebhookExpired && (
                    <span className="text-xs font-medium text-indigo-600">● Đang hoạt động</span>
                  )}
                  {isWebhookExpired && isWebhookActive && (
                    <span className="text-xs font-medium text-amber-600">⚠ Watch đã hết hạn</span>
                  )}
                </div>
              </div>

              <p className="mb-4 text-xs leading-relaxed text-slate-500">
                Email mua hàng được xử lý <strong className="text-slate-700">ngay khi nhận</strong> qua Gmail Pub/Sub.
                Watch tự gia hạn mỗi 6 ngày. Cron-sync sẽ được tắt khi dùng chế độ này.
              </p>

              {isWebhookActive && !isWebhookExpired && watchExpiration && (
                <div className="mb-4 flex items-center gap-1.5 rounded-lg bg-indigo-100 px-3 py-2 text-xs text-indigo-700">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  Hết hạn: {new Date(watchExpiration).toLocaleString('vi-VN')}
                </div>
              )}

              {isWebhookActive && !isWebhookExpired ? (
                /* Cancel confirm flow */
                showCancelConfirm ? (
                  <div className="space-y-2">
                    <p className="text-xs text-rose-700">Xác nhận chuyển sang Cron Schedule?</p>
                    <div className="flex gap-2">
                      <button
                        id="confirm-cancel-watch-btn"
                        type="button"
                        onClick={handleCancelWebhook}
                        disabled={cancelLoading}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                      >
                        {cancelLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                        {cancelLoading ? 'Đang huỷ...' : 'Xác nhận huỷ'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(false)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Giữ lại
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    id="cancel-watch-btn"
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                  >
                    <WifiOff className="h-3.5 w-3.5" />
                    Huỷ / Chuyển sang Cron
                  </button>
                )
              ) : (
                <button
                  id="activate-watch-btn"
                  type="button"
                  onClick={handleActivateWebhook}
                  disabled={watchLoading}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {watchLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wifi className="h-4 w-4" />
                  )}
                  {watchLoading
                    ? 'Đang đăng ký...'
                    : isWebhookExpired
                      ? 'Gia hạn Watch'
                      : 'Bật Webhook Realtime'}
                </button>
              )}
            </div>

            {/* ── Card: Cron Schedule ────────────────────────────────────── */}
            <div
              className={`rounded-2xl border-2 p-5 transition-all ${
                syncMode === 'cron'
                  ? 'border-emerald-400 bg-emerald-50/50 shadow-md shadow-emerald-100'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    syncMode === 'cron' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Cron Schedule</div>
                  {syncMode === 'cron' && (
                    <span className="text-xs font-medium text-emerald-600">● Đang hoạt động</span>
                  )}
                </div>
              </div>

              <p className="mb-4 text-xs leading-relaxed text-slate-500">
                App tự động quét Gmail <strong className="text-slate-700">mỗi 6 giờ</strong> để tìm email mua hàng mới.
                Không cần cấu hình Pub/Sub. Phù hợp khi không có GCP project.
              </p>

              <div className="mb-4 flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-2 text-xs text-emerald-700">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                Lịch chạy: mỗi 6 giờ (00:00, 06:00, 12:00, 18:00 UTC)
              </div>

              <div
                className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  syncMode === 'cron'
                    ? 'cursor-default bg-emerald-500 text-white'
                    : 'cursor-default border border-slate-200 bg-white text-slate-400'
                }`}
              >
                <Clock className="h-4 w-4" />
                {syncMode === 'cron' ? 'Đang dùng Cron Schedule' : 'Cron Schedule (không hoạt động)'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
