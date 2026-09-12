import { useState } from 'react'
import LoginScreen from './components/LoginScreen'
import Dashboard from './components/Dashboard'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentScreen, setCurrentScreen] = useState('dashboard')
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setCurrentScreen('dashboard')
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <Dashboard 
      currentScreen={currentScreen}
      setCurrentScreen={setCurrentScreen}
      user={user}
      onLogout={handleLogout}
    />
  )
}
