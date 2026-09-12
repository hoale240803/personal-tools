import { Eye, Share2, Trash2, MoreVertical } from 'lucide-react'

const mockHistory = [
  {
    id: 1,
    title: 'Creating amazing content 🎵',
    description: 'New Tiktok Series 📺🎯',
    status: 'published',
    platforms: ['tiktok', 'instagram'],
    date: 'Aug 21, 2025 - 10:33 AM',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 2,
    title: 'Travel Vibes',
    description: 'All travel content 📸 🌍',
    status: 'published',
    platforms: ['instagram'],
    date: 'Aug 19, 2025 - 02:12 AM',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 3,
    title: 'Summer Mood',
    description: 'Sharing summer content collection',
    status: 'draft',
    platforms: ['facebook', 'instagram'],
    date: 'Aug 19, 2025 - 10:12 AM',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 4,
    title: 'Product Review',
    description: 'Checking this amazing product',
    status: 'failed',
    platforms: ['tiktok'],
    date: 'Aug 18, 2025 - 03:25 PM',
    image: 'https://via.placeholder.com/150',
  },
]

const PLATFORM_ICONS = {
  tiktok: '🎵',
  instagram: '📷',
  facebook: '📘',
}

const statusConfig = {
  published: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  draft: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  failed: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
}

export default function HistoryScreen() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post History</h1>
        <p className="text-gray-600">View all your posts and their publishing status</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-8 border-b border-gray-200">
        {['All', 'Published', 'Draft', 'Failed'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              tab === 'All'
                ? 'text-primary border-primary'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {mockHistory.map((post) => {
          const { bg, text, dot } = statusConfig[post.status]
          return (
            <div key={post.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-6">
                {/* Image */}
                <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center text-2xl">
                    🖼️
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{post.description}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  {/* Platforms & Status */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex gap-2">
                      {post.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                        >
                          {PLATFORM_ICONS[platform]}
                        </span>
                      ))}
                    </div>

                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${dot}`}></span>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>

                    <span className="text-xs text-gray-500 ml-auto">{post.date}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Eye size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Share2 size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State Message */}
      <div className="mt-12 text-center text-gray-500">
        <p className="text-sm">Showing {mockHistory.length} posts</p>
      </div>
    </div>
  )
}
