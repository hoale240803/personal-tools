import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { fetchCurrentUser, loginWithGoogle, logout } from './lib/api'
import { ExpensesPage } from './pages/ExpensesPage'
import { LoginPage } from './pages/LoginPage'
import { SettingsPage } from './pages/SettingsPage'
import { SyncHistoryPage } from './pages/SyncHistoryPage'
import type { UserProfile } from './types'

function App() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = useCallback(async () => {
    await logout()
    setUser(null)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-50 text-sm text-slate-500">
        Đang tải...
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={loginWithGoogle} />
  }

  return (
    <BrowserRouter>
      <AppLayout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<ExpensesPage />} />
          <Route path="/history" element={<SyncHistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
