// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useMediaQuery } from './hooks/useMediaQuery';
import Layout from './components/Layout';
import MobileLayout from './components/MobileLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WasteReport from './pages/WasteReport';
import VerifyRecycling from './pages/VerifyRecycling';
import Marketplace from './pages/Marketplace';
import Leaderboard from './pages/Leaderboard';
import Events from './pages/Events';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import AIWasteScanner from './components/AIWasteScanner'; // Add this import

const Leaf = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L12 7M12 2L9 5M12 2L15 5"/>
    <path d="M5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12Z"/>
    <path d="M12 7V19"/>
  </svg>
);

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { currentUser, loading } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const LayoutComponent = isMobile ? MobileLayout : Layout;
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      <Route path="/" element={<ProtectedRoute><LayoutComponent /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="report" element={<WasteReport />} />
        <Route path="verify" element={<VerifyRecycling />} />
        <Route path="scanner" element={<AIWasteScanner />} /> {/* Add scanner route */}
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="events" element={<Events />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>
      
      <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;