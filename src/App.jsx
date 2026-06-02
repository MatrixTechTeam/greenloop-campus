// src/App.jsx - Fixed infinite loop
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
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
  
  // Don't render anything while loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Public Routes - no layout */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      
      {/* Protected Routes - with Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
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
      
      {/* Catch all redirect */}
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