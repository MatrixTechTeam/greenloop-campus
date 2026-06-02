import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="flex h-screen bg-primary-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <footer className="h-10 flex items-center justify-center border-t border-primary-100 bg-white/40 backdrop-blur-sm">
          <p className="text-xs text-gray-400 tracking-wide">
            Powered by <span className="text-primary-600 font-semibold">GreenSpark</span> · Built for the 2026 Eco Hackathon
          </p>
        </footer>
      </div>
    </div>
  )
}
