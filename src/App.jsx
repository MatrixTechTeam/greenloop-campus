// src/App.jsx - White splash screen with green icon for mobile
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
import WasteReport from "./pages/WasteReport";
import VerifyRecycling from "./pages/VerifyRecycling";
import Marketplace from "./pages/Marketplace";
import Leaderboard from "./pages/Leaderboard";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf } from "lucide-react";

// Splash Screen Component for Mobile - White background, Green icon
const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
    >
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
            <Leaf className="w-12 h-12 text-green-600" />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-green-200 rounded-full animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GreenLoop</h1>
        <p className="text-green-600 text-sm">
          AI-Powered Sustainability Platform
        </p>
        <div className="flex justify-center gap-2 mt-6">
          <div
            className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const LeafIcon = ({ className }) => (
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
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <LeafIcon className="w-4 h-4 text-green-600 animate-pulse" />
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
  const [showSplash, setShowSplash] = useState(true);
  const [splashComplete, setSplashComplete] = useState(false);

  // Show splash screen only on mobile devices, no landing page for mobile
  useEffect(() => {
    if (isMobile) {
      const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
      if (!hasSeenSplash) {
        setShowSplash(true);
        sessionStorage.setItem("hasSeenSplash", "true");
      } else {
        setShowSplash(false);
        setSplashComplete(true);
      }
    } else {
      setShowSplash(false);
      setSplashComplete(true);
    }
  }, [isMobile]);

  if (loading) return <LoadingSpinner />;

  // Mobile users: Show splash then go to auth/dashboard (no landing page)
  if (isMobile) {
    return (
      <>
        <AnimatePresence>
          {showSplash && (
            <SplashScreen
              onComplete={() => {
                setShowSplash(false);
                setSplashComplete(true);
              }}
            />
          )}
        </AnimatePresence>

        {splashComplete && (
          <Routes>
            {/* Mobile users go directly to login or dashboard, no landing page */}
            <Route
              path="/"
              element={
                <Navigate to={currentUser ? "/dashboard" : "/login"} replace />
              }
            />
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

            {/* Protected Dashboard Routes with Nested Routes */}
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
              <Route path="verify" element={<VerifyRecycling />} />
              <Route path="waste-report" element={<WasteReport />} />
            </Route>

            {/* Catch all */}
            <Route
              path="*"
              element={
                <Navigate to={currentUser ? "/dashboard" : "/login"} replace />
              }
            />
          </Routes>
        )}
      </>
    );
  }

  // Desktop users: Show landing page
  return (
    <Routes>
      {/* Landing Page - Desktop only */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
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

      {/* Protected Dashboard Routes with Nested Routes */}
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
        <Route path="verify" element={<VerifyRecycling />} />
        <Route path="waste-report" element={<WasteReport />} />
      </Route>

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
