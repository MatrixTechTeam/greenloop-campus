// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useMediaQuery } from "./hooks/useMediaQuery";
import Layout from "./components/Layout";
import MobileLayout from "./components/MobileLayout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WasteReport from "./pages/WasteReport"; // Add this import
import VerifyRecycling from "./pages/VerifyRecycling";
import Marketplace from "./pages/Marketplace";
import Leaderboard from "./pages/Leaderboard";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import AIWasteScanner from "./components/AIWasteScanner";
import { Toaster } from "react-hot-toast";

const Leaf = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2L12 7M12 2L9 5M12 2L15 5" />
    <path d="M5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12Z" />
    <path d="M12 7V19" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Leaf className="w-4 h-4 text-green-600 animate-pulse" />
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (currentUser) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { currentUser, loading } = useAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const LayoutComponent = isMobile ? MobileLayout : Layout;

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <LayoutComponent />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="events" element={<Events />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>

      {/* Standalone Routes (not inside dashboard layout) */}
      <Route
        path="/waste-report"
        element={
          <ProtectedRoute>
            <WasteReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify"
        element={
          <ProtectedRoute>
            <VerifyRecycling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scanner"
        element={
          <ProtectedRoute>
            <AIWasteScanner />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route
        path="*"
        element={<Navigate to={currentUser ? "/dashboard" : "/"} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              fontSize: "0.875rem",
              background: "#fff",
              color: "#1f2937",
              border: "1px solid #e5e7eb",
            },
            success: {
              iconTheme: { primary: "#16a34a", secondary: "#fff" },
              style: {
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
              },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
              style: {
                background: "#fef2f2",
                border: "1px solid #fecaca",
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
