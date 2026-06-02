import { X, Recycle, Zap, Tag, Lightbulb } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

export default function AIAnalysisModal({ isOpen, result, loading, onClose }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-eco-leaf">AI Analysis</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? <LoadingSpinner /> : result ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-500 text-sm"><Tag size={14} /> Waste Type</span>
              <span className="font-semibold capitalize">{result.wasteType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-500 text-sm"><Recycle size={14} /> Recyclable</span>
              <span className={result.recyclable ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                {result.recyclable ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-500 text-sm"><Zap size={14} /> Eco Points</span>
              <span className="font-semibold text-primary-600">+{result.ecoPoints} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-gray-500 text-sm"><Tag size={14} /> Category</span>
              <span className="font-semibold capitalize">{result.category}</span>
            </div>
            <div className="bg-primary-50 rounded-xl p-3 text-sm text-primary-800 flex gap-2">
              <Lightbulb size={16} className="text-primary-500 mt-0.5 shrink-0" />
              <span>{result.tips}</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No analysis available.</p>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full bg-primary-600 text-white py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
