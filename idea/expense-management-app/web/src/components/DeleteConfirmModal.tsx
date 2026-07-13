import { AlertTriangle, X, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { Expense } from '../types'

interface DeleteConfirmModalProps {
  expense: Expense
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function DeleteConfirmModal({ expense, onConfirm, onClose }: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onConfirm()
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">Xác nhận xóa</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600">
            Bạn có chắc chắn muốn xóa giao dịch{' '}
            <strong className="text-slate-900">&quot;{expense.name}&quot;</strong>?
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Hành động này sẽ xóa vĩnh viễn dữ liệu khỏi Google Sheets và không thể hoàn tác.
          </p>

          <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
