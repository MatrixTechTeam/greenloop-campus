import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, MapPin, CheckCircle, ShoppingBag,
  Trophy, CalendarDays, User, Settings
} from 'lucide-react'

const navItems = [
  { path: '/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/report',      label: 'Report Waste', icon: MapPin },
  { path: '/verify',      label: 'Verify',       icon: CheckCircle },
  { path: '/marketplace', label: 'Marketplace',  icon: ShoppingBag },
  { path: '/leaderboard', label: 'Leaderboard',  icon: Trophy },
  { path: '/events',      label: 'Events',       icon: CalendarDays },
  { path: '/profile',     label: 'Profile',      icon: User },
  { path: '/admin',       label: 'Admin',        icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="w-64 glass border-r border-primary-200 flex flex-col py-6 px-4 gap-1">
      {navItems.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
            ${isActive ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-primary-100 hover:text-primary-800'}`
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </aside>
  )
}
