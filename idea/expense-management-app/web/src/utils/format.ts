export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(dateStr))
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Đã giao':
      return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
    case 'Đang giao':
      return 'bg-sky-100 text-sky-700 ring-sky-200'
    case 'Đã hủy':
      return 'bg-rose-100 text-rose-700 ring-rose-200'
    default:
      return 'bg-amber-100 text-amber-700 ring-amber-200'
  }
}
