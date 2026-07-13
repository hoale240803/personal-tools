import { useEffect, useState } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import type { Expense } from '../types'
import type { ExpenseFormData } from '../lib/api'
import { fetchCategories } from '../lib/api'
import type { CategoryParent } from '../types'

const STATUS_OPTIONS = ['Đã giao', 'Đang giao', 'Đã hủy', 'Chờ xử lý'] as const

interface ExpenseFormModalProps {
  expense: Expense | null  // null = Add mode
  onSave: (data: ExpenseFormData) => Promise<void>
  onClose: () => void
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function ExpenseFormModal({ expense, onSave, onClose }: ExpenseFormModalProps) {
  const isEdit = expense !== null

  const [name, setName] = useState(expense?.name ?? '')
  const [purchaseDate, setPurchaseDate] = useState(expense?.purchaseDate ?? todayIso())
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? '')
  const [parentCategory, setParentCategory] = useState(expense?.parentCategory ?? '')
  const [childCategory, setChildCategory] = useState(expense?.category ?? '')
  const [platform, setPlatform] = useState(expense?.platform ?? '')
  const [status, setStatus] = useState(expense?.status ?? 'Chờ xử lý')
  const [orderId, setOrderId] = useState(expense?.orderId ?? '')
  const [imageUrl, setImageUrl] = useState(expense?.imageUrl ?? '')

  const [categories, setCategories] = useState<CategoryParent[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  const selectedParent = categories.find((c) => c.name === parentCategory)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Tên sản phẩm không được để trống')
      return
    }
    if (!purchaseDate) {
      setError('Ngày mua không được để trống')
      return
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) < 0) {
      setError('Số tiền phải là số hợp lệ')
      return
    }

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        purchaseDate,
        amount: Number(amount),
        parentCategory: parentCategory || 'Mua sắm',
        category: childCategory || 'Khác',
        platform: platform.trim(),
        status,
        orderId: orderId.trim(),
        imageUrl: imageUrl.trim(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">
                Tên sản phẩm <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: iPhone 15 Pro Max"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Date + Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  Ngày mua <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                  Số tiền <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Parent Category + Child Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Danh mục cha</label>
                <select
                  value={parentCategory}
                  onChange={(e) => {
                    setParentCategory(e.target.value)
                    setChildCategory('')
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Chọn danh mục...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Danh mục con</label>
                <select
                  value={childCategory}
                  onChange={(e) => setChildCategory(e.target.value)}
                  disabled={!selectedParent}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                >
                  <option value="">Chọn danh mục con...</option>
                  {selectedParent?.children.map((child) => (
                    <option key={child.id} value={child.name}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Platform + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Platform</label>
                <input
                  type="text"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="VD: Amazon, Shopee"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Order ID */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="VD: 113-8904501-8536268"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
