import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import EcoPointsBadge from './EcoPointsBadge'
import NotificationToast from './NotificationToast'

export default function Navbar() {
  const { logout } = useAuth()
  return (
    <header className="h-16 glass border-b border-primary-200 flex items-center justify-between px-6">
      <h1 className="font-display text-xl font-bold text-eco-leaf">GreenLoop</h1>
      <div className="flex items-center gap-4">
        <EcoPointsBadge />
        <NotificationToast />
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  )
}
