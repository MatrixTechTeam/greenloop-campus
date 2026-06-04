// src/components/Layout.jsx - Complete with all routes
import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { firebaseService } from "../services/firebaseService";
import {
  Menu,
  Leaf,
  LogOut,
  Home,
  FileText,
  Camera,
  Store,
  Trophy,
  Calendar,
  User,
  Shield,
  Bell,
  Search,
  Flag,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import AIWasteScanner from "./AIWasteScanner";

const Layout = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const notifs = await firebaseService.getUserNotifications(
        currentUser.uid,
      );
      setNotifications(notifs || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/dashboard/waste-report", icon: Flag, label: "Report Waste" },
    { path: "/dashboard/verify", icon: Camera, label: "Verify" },
    { path: "/dashboard/marketplace", icon: Store, label: "Exchange" },
    { path: "/dashboard/leaderboard", icon: Trophy, label: "Leaderboard" },
    { path: "/dashboard/events", icon: Calendar, label: "Events" },
    { path: "/dashboard/profile", icon: User, label: "Profile" },
  ];

  if (userProfile?.role === "admin") {
    navItems.push({ path: "/dashboard/admin", icon: Shield, label: "Admin" });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation Bar */}
      <div
        className={`fixed top-0 right-0 left-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 transition-all duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
        style={{ left: sidebarCollapsed ? "80px" : "280px" }}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* AI Scanner Button */}
            <button
              onClick={() => setShowScanner(true)}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Sparkles size={16} />
              AI Scan
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-gray-500">
                        No notifications
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${!notif.read ? "bg-green-50" : ""}`}
                        >
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {userProfile?.fullname}
                </p>
                <p className="text-xs text-gray-500">{userProfile?.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {userProfile?.fullname?.charAt(0) || "U"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Logo */}
        <div
          className={`p-5 border-b border-gray-200 flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-lg text-gray-900">GreenLoop</span>
            )}
          </div>
        </div>

        {/* User Profile (Collapsed) */}
        {sidebarCollapsed && (
          <div className="p-3 border-b border-gray-200 flex justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {userProfile?.fullname?.charAt(0) || "U"}
              </span>
            </div>
          </div>
        )}

        {/* User Info (Expanded) */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-semibold">
                  {userProfile?.fullname?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {userProfile?.fullname}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userProfile?.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-green-600">
                    {userProfile?.ecoPoints || 0} pts
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {userProfile?.badge || "Eco Rookie"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-100"
                } ${sidebarCollapsed ? "justify-center" : ""}`}
              >
                <item.icon size={20} />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 w-full text-red-600 rounded-lg hover:bg-red-50 transition-all ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-16 ${sidebarCollapsed ? "pl-20" : "pl-72"}`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* AI Waste Scanner Modal */}
      <AIWasteScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onSave={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};

export default Layout;
