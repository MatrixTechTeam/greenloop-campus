import { useState } from 'react'
import { Bell } from 'lucide-react'

export default function NotificationToast() {
  const [open, setOpen] = useState(false)
  const notifications = [] // TODO: connect to Firestore real-time

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative text-gray-500 hover:text-primary-600 transition-colors">
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 glass rounded-xl shadow-lg p-4 z-50">
          {notifications.length === 0
            ? <p className="text-sm text-gray-400 text-center">No notifications yet</p>
            : notifications.map((n, i) => <div key={i}>{n.message}</div>)
          }
        </div>
      )}
    </div>
  )
}
