import { useState } from 'react'
import { Upload, Check, Zap, Share2 } from 'lucide-react'
import ReviewPost from './ReviewPost'
import AIPreparingState from './AIPreparingState'
import PublishResult from './PublishResult'

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'facebook', name: 'Facebook', icon: '📘' },
]

export default function CreatePostFlow() {
  const [step, setStep] = useState(1) // 1: Upload, 2: Details, 3: Review, 4: AI Preparing, 5: Result
  const [formData, setFormData] = useState({
    image: null,
    imageName: '',
    description: '',
    hashtags: '',
    selectedPlatforms: [],
    contentType: 'general',
  })
  const [publishResult, setPublishResult] = useState(null)

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData({
          ...formData,
          image: event.target.result,
          imageName: file.name,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePlatformToggle = (platformId) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlatforms: prev.selectedPlatforms.includes(platformId)
        ? prev.selectedPlatforms.filter((id) => id !== platformId)
        : [...prev.selectedPlatforms, platformId],
    }))
  }

  const handleNext = () => {
    if (step === 1 && !formData.image) {
      alert('Please upload an image')
      return
    }
    if (step === 2 && !formData.description) {
      alert('Please enter a description')
      return
    }
    if (step === 2 && formData.selectedPlatforms.length === 0) {
      alert('Please select at least one platform')
      return
    }
    if (step === 3) {
      setStep(4) // Go to AI Preparing
      // Simulate AI preparation
      setTimeout(() => {
        const result = {
          status: Math.random() > 0.2 ? 'success' : 'error',
          publishedOn: formData.selectedPlatforms,
          message:
            Math.random() > 0.2
              ? 'Your content has been published successfully!'
              : 'Failed to publish on some platforms',
        }
        setPublishResult(result)
        setStep(5)
      }, 3000)
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleReset = () => {
    setStep(1)
    setFormData({
      image: null,
      imageName: '',
      description: '',
      hashtags: '',
      selectedPlatforms: [],
      contentType: 'general',
    })
    setPublishResult(null)
  }

  // Step 1: Upload Image
  if (step === 1) {
    return (
      <div className="card-lg p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
        </div>

        <div className="space-y-6">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
            <label className="block cursor-pointer">
              <div className="flex flex-col items-center gap-3 mb-4">
                <Upload size={48} className="text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-900">Drag & drop your image here</p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Preview */}
          {formData.image && (
            <div className="space-y-3">
              <p className="font-semibold text-gray-900">Preview</p>
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <p className="text-sm text-gray-600">{formData.imageName}</p>
            </div>
          )}

          {/* Supported Formats */}
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
            Supported: JPG, PNG (Max 5MB)
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-end pt-4">
            <button onClick={handleReset} className="btn-outline">
              Cancel
            </button>
            <button onClick={handleNext} className="btn-primary" disabled={!formData.image}>
              Next
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Post Details
  if (step === 2) {
    return (
      <div className="card-lg p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
            2
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Post Details</h2>
        </div>

        <div className="space-y-6">
          {/* Content Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Content type</label>
            <div className="grid grid-cols-3 gap-3">
              {['general', 'product', 'promo'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, contentType: type })}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    formData.contentType === type
                      ? 'bg-primary text-white border-2 border-primary'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-100'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us about your post. What you want to share..."
              className="input-field resize-none h-32"
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Hashtags</label>
            <input
              type="text"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              placeholder="#trending #viral #awesome"
              className="input-field"
            />
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Platforms</label>
            <div className="space-y-2">
              {PLATFORMS.map((platform) => (
                <label key={platform.id} className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.selectedPlatforms.includes(platform.id)}
                    onChange={() => handlePlatformToggle(platform.id)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-lg ml-3">{platform.icon}</span>
                  <span className="font-medium text-gray-900 ml-2">{platform.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-between pt-4">
            <button onClick={handleBack} className="btn-outline">
              Back
            </button>
            <button onClick={handleNext} className="btn-primary" disabled={!formData.description || formData.selectedPlatforms.length === 0}>
              Next
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Review
  if (step === 3) {
    return <ReviewPost formData={formData} onBack={handleBack} onNext={handleNext} />
  }

  // Step 4: AI Preparing
  if (step === 4) {
    return <AIPreparingState />
  }

  // Step 5: Result
  if (step === 5 && publishResult) {
    return <PublishResult result={publishResult} onCreateNew={handleReset} />
  }
}
