import { NavLink } from 'react-router-dom'
import { LayoutGrid, LogOut, Settings, Wallet } from 'lucide-react'
import type { UserProfile } from '../types'

interface AppLayoutProps {
  user: UserProfile
  onLogout: () => void
  children: React.ReactNode
}

const navItems = [
  { to: '/', label: 'Theo dõi chi phí', icon: Wallet },
  { to: '/settings', label: 'Cài đặt', icon: Settings },
]

export function AppLayout({ user, onLogout, children }: AppLayoutProps) {
  return (
    <div className="min-h-svh bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-900">Expense Tracker</p>
              <p className="text-xs text-slate-500">Tự động từ Gmail</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 rounded-xl bg-slate-100 p-1 sm:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900',
                  ].join(' ')
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-9 w-9 rounded-full border border-slate-200 bg-slate-100"
            />
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="flex gap-1 border-t border-slate-100 px-4 py-2 sm:hidden">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
