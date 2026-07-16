import { useEffect, useState } from 'react'
import { Bell, ChevronDown, ChevronRight, FolderTree, Plus, RefreshCw, Save, Trash2 } from 'lucide-react'
import { fetchCategories, saveCategories, setupGmailWatch } from '../lib/api'
import type { CategoryParent } from '../types'

export function SettingsPage() {
  const [categories, setCategories] = useState<CategoryParent[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [newParentName, setNewParentName] = useState('')
  const [newChildNames, setNewChildNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Gmail Watch state
  const [watchLoading, setWatchLoading] = useState(false)
  const [watchExpiration, setWatchExpiration] = useState<string | null>(null)
  const [watchMessage, setWatchMessage] = useState<string | null>(null)
  const [watchError, setWatchError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data)
        setExpanded(Object.fromEntries(data.map((c) => [c.id, true])))
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Không tải được danh mục'))
      .finally(() => setLoading(false))
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

      {/* Gmail Push Notification */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700">
          <Bell className="h-4 w-4 text-indigo-600" />
          Gmail Push Notification (Watch)
        </div>

        <p className="mb-4 text-sm text-slate-500">
          Đăng ký nhận thông báo từ Gmail khi có email mới. Watch hết hạn sau 7 ngày — hệ thống tự gia hạn qua Vercel Cron mỗi 6 ngày.
        </p>

        {watchError && (
          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {watchError}
          </div>
        )}
        {watchMessage && (
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {watchMessage}
          </div>
        )}

        {watchExpiration && (
          <div className="mb-4 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            <span className="font-medium">Hết hạn:</span>{' '}
            {new Date(watchExpiration).toLocaleString('vi-VN')}
          </div>
        )}

        <button
          type="button"
          onClick={async () => {
            setWatchLoading(true)
            setWatchError(null)
            setWatchMessage(null)
            try {
              const result = await setupGmailWatch()
              setWatchExpiration(result.expiration)
              setWatchMessage(result.message)
            } catch (err) {
              setWatchError(err instanceof Error ? err.message : 'Đăng ký thất bại')
            } finally {
              setWatchLoading(false)
            }
          }}
          disabled={watchLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${watchLoading ? 'animate-spin' : ''}`} />
          {watchLoading ? 'Đang đăng ký...' : 'Đăng ký / Gia hạn Watch'}
        </button>
      </div>
    </div>
  )
}
