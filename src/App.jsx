import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import WasteReport from './pages/WasteReport'
import VerifyRecycling from './pages/VerifyRecycling'
import Marketplace from './pages/Marketplace'
import Leaderboard from './pages/Leaderboard'
import Events from './pages/Events'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="report" element={<WasteReport />} />
            <Route path="verify" element={<VerifyRecycling />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="events" element={<Events />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
