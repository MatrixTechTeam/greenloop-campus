import { useEffect, useState } from 'react'
import { Wind } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserReports } from '../services/firebaseService'
import { calculateTotalCO2, getCO2Equivalent, CO2_SAVINGS } from '../utils/carbonData'
import GlassCard from './GlassCard'

const typeColors = {
  plastic: '#3b82f6', paper: '#f59e0b', glass: '#06b6d4',
  metal: '#8b5cf6', organic: '#22c55e', electronic: '#ef4444', hazardous: '#f97316',
}

export default function CarbonTracker() {
  const { user } = useAuth()
  const [co2Saved, setCo2Saved] = useState(0)
  const [breakdown, setBreakdown] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getUserReports(user.uid).then((reports) => {
      setCo2Saved(calculateTotalCO2(reports))
      const bd = {}
      reports.forEach((r) => {
        const type = r.wasteType?.toLowerCase()
        if (!type) return
        bd[type] = (bd[type] || 0) + (CO2_SAVINGS[type] || 0)
      })
      setBreakdown(bd)
      setLoading(false)
    })
  }, [user])

  const maxVal = Math.max(...Object.values(breakdown), 0.01)

  return (
    <GlassCard className="col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wind size={18} className="text-eco-leaf" />
          <h2 className="font-display text-lg font-bold text-eco-leaf">Carbon Footprint Saved</h2>
        </div>
        <span className="text-xs text-gray-400 bg-primary-50 px-3 py-1 rounded-full">All time</span>
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center text-gray-400 text-sm">Calculating...</div>
      ) : (
        <>
          <div className="flex items-end gap-2 mb-1">
            <span className="font-display text-4xl font-bold text-primary-600">{co2Saved.toFixed(2)}</span>
            <span className="text-gray-500 text-sm mb-1.5">kg CO2</span>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Equivalent to <span className="text-primary-700 font-medium">{getCO2Equivalent(co2Saved)}</span>
          </p>
          {Object.keys(breakdown).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(breakdown).map(([type, val]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 capitalize">{type}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(val / maxVal) * 100}%`, backgroundColor: typeColors[type] || '#22c55e' }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-14 text-right">{val.toFixed(2)} kg</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">Start reporting waste to track your impact</p>
          )}
        </>
      )}
    </GlassCard>
  )
}
