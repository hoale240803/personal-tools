import type { Expense } from '../types'

export function getCurrentMonthValue(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function formatMonthLabel(monthValue: string): string {
  const [year, month] = monthValue.split('-')
  return `Tháng ${month}/${year}`
}

export function matchesMonth(purchaseDate: string, monthValue: string): boolean {
  return purchaseDate.startsWith(monthValue)
}

export function matchesSearch(expense: Expense, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  return [
    expense.name,
    expense.category,
    expense.platform,
    expense.orderId,
    expense.status,
  ].some((field) => field.toLowerCase().includes(q))
}

export function filterExpenses(
  expenses: Expense[],
  monthValue: string,
  searchQuery: string,
): Expense[] {
  return expenses
    .filter((e) => matchesMonth(e.purchaseDate, monthValue))
    .filter((e) => matchesSearch(e, searchQuery))
    .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))
}
