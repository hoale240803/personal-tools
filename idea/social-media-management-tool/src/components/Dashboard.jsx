import { FileText, History, Settings, LogOut, Plus } from 'lucide-react'
import CreatePostFlow from './CreatePostFlow'
import HistoryScreen from './HistoryScreen'
import SettingsScreen from './SettingsScreen'

const menuItems = [
  { id: 'create', label: 'Create Post', icon: Plus },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Dashboard({ currentScreen, setCurrentScreen, user, onLogout }) {
  const renderScreen = () => {
    switch (currentScreen) {
      case 'create':
        return <CreatePostFlow />
      case 'history':
        return <HistoryScreen />
      case 'settings':
        return <SettingsScreen />
      default:
        return <CreatePostFlow />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="sidebar flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Social Content</h1>
            <p className="text-xs text-gray-500">Manager</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-2">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentScreen(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                currentScreen === id
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <div className="px-4 py-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            <LogOut size={20} />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderScreen()}
        </div>
      </div>
    </div>
  )
}
