import { Link2, User, Bell, Palette, HelpCircle, LogOut } from 'lucide-react'
import { useState } from 'react'

export default function SettingsScreen() {
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    tiktok: true,
    instagram: true,
    facebook: false,
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
  })

  const handleConnect = (platform) => {
    setConnectedPlatforms({
      ...connectedPlatforms,
      [platform]: !connectedPlatforms[platform],
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Social Media Connections */}
        <div className="card-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Link2 size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Social Media Connections</h2>
          </div>

          <div className="space-y-4">
            {/* TikTok */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎵</span>
                <div>
                  <p className="font-medium text-gray-900">TikTok</p>
                  <p className="text-sm text-gray-600">
                    {connectedPlatforms.tiktok ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleConnect('tiktok')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  connectedPlatforms.tiktok
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-primary text-white hover:bg-purple-700'
                }`}
              >
                {connectedPlatforms.tiktok ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {/* Instagram */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📷</span>
                <div>
                  <p className="font-medium text-gray-900">Instagram</p>
                  <p className="text-sm text-gray-600">
                    {connectedPlatforms.instagram ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleConnect('instagram')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  connectedPlatforms.instagram
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-primary text-white hover:bg-purple-700'
                }`}
              >
                {connectedPlatforms.instagram ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {/* Facebook */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📘</span>
                <div>
                  <p className="font-medium text-gray-900">Facebook</p>
                  <p className="text-sm text-gray-600">
                    {connectedPlatforms.facebook ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleConnect('facebook')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  connectedPlatforms.facebook
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-primary text-white hover:bg-purple-700'
                }`}
              >
                {connectedPlatforms.facebook ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Connect your social media accounts to enable automatic posting across platforms.
          </p>
        </div>

        {/* Notifications */}
        <div className="card-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bell size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) =>
                  setNotifications({ ...notifications, email: e.target.checked })
                }
                className="w-4 h-4 text-primary rounded"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Get notified about posts and analytics</p>
              </div>
            </label>

            <label className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={(e) =>
                  setNotifications({ ...notifications, push: e.target.checked })
                }
                className="w-4 h-4 text-primary rounded"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive instant updates on your device</p>
              </div>
            </label>
          </div>
        </div>

        {/* Style Profile */}
        <div className="card-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Palette size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Style Profile</h2>
          </div>

          <p className="text-gray-600 mb-6">Choose your personal style and tone for content</p>

          <div className="space-y-3 mb-6">
            {['Professional', 'Casual', 'Fun & Playful', 'Educational'].map((style) => (
              <label key={style} className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="style"
                  defaultChecked={style === 'Casual'}
                  className="w-4 h-4 text-primary"
                />
                <span className="ml-3 font-medium text-gray-900">{style}</span>
              </label>
            ))}
          </div>

          <button className="text-primary hover:text-purple-700 font-medium text-sm">
            Edit Profile
          </button>
        </div>

        {/* Help & Support */}
        <div className="card-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <HelpCircle size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Help & Support</h2>
          </div>

          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors">
              → Documentation
            </button>
            <button className="w-full text-left px-4 py-3 text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors">
              → Contact Support
            </button>
            <button className="w-full text-left px-4 py-3 text-primary hover:bg-gray-50 rounded-lg font-medium transition-colors">
              → Report Bug
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
