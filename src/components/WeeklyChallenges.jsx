import { useEffect, useState } from 'react'
import { Zap, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getWeeklyChallenges, getUserChallengeProgress } from '../services/firebaseService'
import GlassCard from './GlassCard'
import LoadingSpinner from './LoadingSpinner'

export default function WeeklyChallenges() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([getWeeklyChallenges(), getUserChallengeProgress(user.uid)]).then(([ch, pr]) => {
      setChallenges(ch)
      setProgress(pr)
      setLoading(false)
    })
  }, [user])

  const getDaysLeft = () => {
    const now = new Date()
    const endOfWeek = new Date()
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()))
    return Math.ceil((endOfWeek - now) / (1000 * 60 * 60 * 24))
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-eco-leaf" />
          <h2 className="font-display text-lg font-bold text-eco-leaf">Weekly Challenges</h2>
        </div>
        <span className="flex items-center gap-1 text-xs text-orange-500 bg-orange-50 px-3 py-1 rounded-full font-medium">
          <Clock size={11} />
          {getDaysLeft()}d left
        </span>
      </div>

      {loading ? <LoadingSpinner /> : challenges.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No challenges this week yet</p>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge) => {
            const userProgress = progress[challenge.id] ?? 0
            const pct = Math.min((userProgress / challenge.target) * 100, 100)
            const completed = pct >= 100
            return (
              <div key={challenge.id} className={`p-3 rounded-xl border transition-all ${completed ? 'border-primary-300 bg-primary-50' : 'border-gray-100 bg-white/40'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{challenge.title}</p>
                    <p className="text-xs text-gray-400">{challenge.description}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${completed ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    +{challenge.bonusPoints} pts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${completed ? 'bg-primary-500' : 'bg-eco-moss'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{userProgress}/{challenge.target}</span>
                </div>
                {completed && <p className="text-xs text-primary-600 font-medium mt-1.5">Completed</p>}
              </div>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}
