import { Zap } from 'lucide-react'

export default function AIPreparingState() {
  const tasks = [
    'Analyzing your image and description',
    'Generating captions and hashtags',
    'Suggesting CTA and keywords',
    'Optimizing for each platform',
  ]

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card-lg p-12 max-w-md w-full text-center">
        {/* AI Icon Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="flex items-center justify-center w-full h-full">
              <Zap size={48} className="text-primary animate-bounce" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI is preparing your content...</h2>
        <p className="text-gray-600 mb-8">
          Generating optimized captions, hashtags, CTA, and keywords based on your post
        </p>

        {/* Progress Indicator */}
        <div className="space-y-3 mb-8">
          {tasks.map((task, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              style={{
                opacity: index <= 1 ? 1 : 0.5,
              }}
            >
              {index < 2 ? (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">✓</span>
                </div>
              ) : index === 2 ? (
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0"></div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
              )}
              <span className="text-sm font-medium text-gray-700">{task}</span>
            </div>
          ))}
        </div>

        {/* Loading Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-blue-500 animate-pulse"
            style={{
              animation: 'progress 3s ease-in-out infinite',
              width: '65%',
            }}
          ></div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          This usually takes 30-60 seconds...
        </p>

        <style>{`
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 100%; }
            100% { width: 0%; }
          }
        `}</style>
      </div>
    </div>
  )
}
