// src/components/Layout.jsx - Responsive with Hamburger Menu
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, X, Leaf, LogOut, Home, FileText, Camera, Store, 
  Trophy, Calendar, User, Shield 
} from 'lucide-react';

const Layout = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen, isMobile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/report', icon: FileText, label: 'Report Waste' },
    { path: '/verify', icon: Camera, label: 'Verify' },
    { path: '/marketplace', icon: Store, label: 'Marketplace' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  // Add admin nav item if user is admin
  if (userProfile?.role === 'admin') {
    navItems.push({ path: '/admin', icon: Shield, label: 'Admin Panel' });
  }

  // Overlay for mobile sidebar
  const Overlay = () => (
    <div 
      className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
        sidebarOpen && isMobile ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      onClick={() => setSidebarOpen(false)}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/50 via-white to-sage-50/30">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">GreenLoop</span>
          </div>
          
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Mobile Header Shadow */}
      <div className="md:hidden h-14"></div>

      {/* Sidebar - Desktop always visible, Mobile slides in */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50
        transition-transform duration-300 ease-in-out
        ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2" onClick={() => isMobile && setSidebarOpen(false)}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900">GreenLoop</span>
                <p className="text-xs text-gray-500 capitalize">{userProfile?.role || 'Student'}</p>
              </div>
            </Link>
            
            {/* Close button - only visible on mobile */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target"
                aria-label="Close menu"
              >
                <X size={20} className="text-gray-600" />
              </button>
            )}
          </div>
          
          {/* User Info */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-lg">
                  {userProfile?.fullname?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {userProfile?.fullname || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs font-semibold text-green-600">{userProfile?.ecoPoints || 0} pts</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 truncate">{userProfile?.badge || 'Eco Rookie'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-8 bg-primary-500 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Logout Button */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      <Overlay />

      {/* Main Content - Adjusts for sidebar */}
      <main className={`
        transition-all duration-300
        ${!isMobile ? 'md:ml-72' : 'ml-0'}
      `}>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;