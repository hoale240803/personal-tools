import { CheckCircle, AlertCircle, Eye, RotateCcw } from 'lucide-react'

const PLATFORM_ICONS = {
  tiktok: '🎵',
  instagram: '📷',
  facebook: '📘',
}

const PLATFORM_NAMES = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  facebook: 'Facebook',
}

export default function PublishResult({ result, onCreateNew }) {
  const isSuccess = result.status === 'success'

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="card-lg p-12 max-w-md w-full text-center">
        {/* Status Icon */}
        <div className="mb-8 flex justify-center">
          {isSuccess ? (
            <div className="relative">
              <div className="absolute inset-0 bg-success/20 rounded-full animate-pulse w-24 h-24"></div>
              <CheckCircle size={96} className="text-success relative" strokeWidth={1.5} />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-red-200 rounded-full animate-pulse w-24 h-24"></div>
              <AlertCircle size={96} className="text-error relative" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Message */}
        <h2 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-gray-900' : 'text-error'}`}>
          {isSuccess ? 'Post Published Successfully!' : 'Publish Failed'}
        </h2>

        <p className="text-gray-600 mb-8">
          {isSuccess
            ? 'Your content has been published on the selected platforms.'
            : result.message || 'We couldn\'t publish your post. Please check your connection and try again.'}
        </p>

        {/* Published Platforms */}
        {isSuccess && result.publishedOn && (
          <div className="mb-8 space-y-3">
            {result.publishedOn.map((platform) => (
              <div
                key={platform}
                className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="text-2xl">{PLATFORM_ICONS[platform]}</div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">{PLATFORM_NAMES[platform]}</p>
                  <p className="text-sm text-gray-600">Published ✓</p>
                </div>
                <Eye size={20} className="text-green-600" />
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full btn-secondary flex items-center justify-center gap-2">
            <Eye size={18} />
            View Post
          </button>

          <button
            onClick={onCreateNew}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Create New Post
          </button>
        </div>

        {/* Stats */}
        {isSuccess && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">3</p>
                <p className="text-xs text-gray-600">Platforms</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-xs text-gray-600">Failed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="text-xs text-gray-600">Success</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
