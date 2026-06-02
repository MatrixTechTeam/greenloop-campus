import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { saveFCMToken } from '../services/firebaseService'
import { requestNotificationPermission } from '../services/notificationService'

export default function PushNotifications() {
  const { user } = useAuth()
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (!user) return
    if (!('Notification' in window)) { setStatus('unsupported'); return }
    if (Notification.permission === 'granted') { setStatus('granted'); return }
  }, [user])

  const requestPermission = async () => {
    try {
      const token = await requestNotificationPermission()
      if (token) {
        await saveFCMToken(user.uid, token)
        setStatus('granted')
      } else {
        setStatus('denied')
      }
    } catch {
      setStatus('denied')
    }
  }

  if (status === 'granted' || status === 'unsupported') return null

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <div className="glass rounded-2xl p-4 shadow-xl border border-primary-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Bell size={18} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">Enable Notifications</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Get notified when your waste reports are verified and earn bonus points.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={requestPermission}
                className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Allow
              </button>
              <button
                onClick={() => setStatus('denied')}
                className="text-xs text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          <button onClick={() => setStatus('denied')} className="text-gray-300 hover:text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
