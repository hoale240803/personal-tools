import { Edit2, Eye, Share2 } from 'lucide-react'

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

export default function ReviewPost({ formData, onBack, onNext }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
          5
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Review & Edit</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview Column */}
        <div className="lg:col-span-2">
          <div className="card-lg p-6">
            {/* Image Preview */}
            <div className="mb-6">
              <img
                src={formData.image}
                alt="Post preview"
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Content Preview */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Description</h3>
                <p className="text-gray-900 leading-relaxed">{formData.description}</p>
              </div>

              {formData.hashtags && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Hashtags</h3>
                  <p className="text-gray-900">
                    {formData.hashtags.split(' ').map((tag, i) => (
                      <span key={i} className="text-primary hover:underline mr-2 cursor-pointer">
                        {tag}
                      </span>
                    ))}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Posting to</h3>
                <div className="flex gap-2">
                  {formData.selectedPlatforms.map((platform) => (
                    <div
                      key={platform}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700"
                    >
                      <span>{PLATFORM_ICONS[platform]}</span>
                      {PLATFORM_NAMES[platform]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Column */}
        <div>
          <div className="card-lg p-6 sticky top-8">
            <h3 className="font-semibold text-gray-900 mb-4">Edit Content</h3>

            <div className="space-y-3">
              {/* Edit Buttons */}
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium text-gray-700 transition-colors">
                <Edit2 size={18} />
                Edit Caption
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium text-gray-700 transition-colors">
                <Edit2 size={18} />
                Edit Hashtags
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium text-gray-700 transition-colors">
                <Eye size={18} />
                Preview
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                ✨ Your post will be optimized for each platform with platform-specific hashtags and formatting.
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                📊 AI will analyze your content and suggest improvements for better engagement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 justify-between mt-8">
        <button onClick={onBack} className="btn-outline">
          Back
        </button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">
          <Share2 size={18} />
          Prepare and Publish
        </button>
      </div>
    </div>
  )
}
