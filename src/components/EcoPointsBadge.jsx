import { useEffect, useState } from 'react'
import { Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getUserPoints } from '../services/firebaseService'

export default function EcoPointsBadge() {
  const { user } = useAuth()
  const [points, setPoints] = useState(0)

  useEffect(() => {
    if (user) getUserPoints(user.uid).then(setPoints)
  }, [user])

  return (
    <div className="flex items-center gap-1.5 bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full text-sm font-semibold">
      <Leaf size={14} />
      <span>{points} pts</span>
    </div>
  )
}
