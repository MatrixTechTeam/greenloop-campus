// src/components/MobileLayout.jsx - Simplified version without modals that cause DOM errors
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { firebaseService } from "../services/firebaseService";
import AIWasteScanner from "./AIWasteScanner";
import MobileProfile from "../pages/MobileProfile";
import AdminPanel from "../pages/AdminPanel";
import {
  Menu,
  X,
  Leaf,
  LogOut,
  Home,
  Store,
  Trophy,
  Calendar,
  User,
  Shield,
  Sparkles,
  Award,
  TrendingUp,
  Bell,
  Search,
  Star,
  Recycle,
  Flame,
  CheckCircle,
  Clock,
  Package,
  Gift,
  ArrowRight,
  MapPin,
  Plus,
  Send,
  Loader2,
  Trash2,
  ChevronDown,
  Filter,
  Medal,
  Crown,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Globe,
  BookOpen,
  Flag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const MobileLayout = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Leaderboard filters
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("points");
  const [departmentsList, setDepartmentsList] = useState(["all"]);
  const [facultiesList, setFacultiesList] = useState(["all"]);

  // Marketplace states - simplified
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [sellingItem, setSellingItem] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "good",
    ecoValue: 5,
    location: "",
    exchangeType: "exchange",
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [listings, setListings] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningEventId, setJoiningEventId] = useState(null);

  const [marketplaceSearch, setMarketplaceSearch] = useState("");
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    "plastic",
    "glass",
    "paper",
    "metal",
    "electronics",
    "textiles",
    "books",
    "furniture",
    "other",
  ];

  const conditions = [
    {
      value: "excellent",
      label: "Excellent",
      color: "bg-green-100 text-green-700",
    },
    { value: "good", label: "Good", color: "bg-green-50 text-green-600" },
    { value: "fair", label: "Fair", color: "bg-yellow-50 text-yellow-600" },
    {
      value: "poor",
      label: "Poor (for upcycling)",
      color: "bg-orange-50 text-orange-600",
    },
  ];

  // Fetch data
  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifications = async () => {
      try {
        const notifs = await firebaseService.getUserNotifications(
          currentUser.uid,
        );
        setNotifications(notifs || []);
        setUnreadCount(notifs?.filter((n) => !n.read).length || 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    fetchAllData();

    const interval = setInterval(() => {
      fetchMarketplaceListings();
      fetchUpcomingEvents();
      fetchLeaderboardData();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  // Update departments and faculties when leaderboard data changes
  useEffect(() => {
    if (leaderboard.length > 0) {
      const departments = [
        "all",
        ...new Set(leaderboard.map((u) => u.department).filter(Boolean)),
      ];
      const faculties = [
        "all",
        ...new Set(leaderboard.map((u) => u.faculty).filter(Boolean)),
      ];
      setDepartmentsList(departments);
      setFacultiesList(faculties);
    }
  }, [leaderboard]);

  const fetchAllData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [verifications, events, marketplace, leaderboardData] =
        await Promise.all([
          firebaseService
            .getVerificationHistory(currentUser.uid)
            .catch(() => []),
          firebaseService.getUpcomingEvents().catch(() => []),
          firebaseService.getMarketplaceListings().catch(() => []),
          firebaseService.getLeaderboard(100).catch(() => []),
        ]);
      setRecentActivity(verifications.slice(0, 5));
      setUpcomingEvents(events);
      setListings(marketplace);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      const data = await firebaseService.getLeaderboard(100).catch(() => []);
      setLeaderboard(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const fetchMarketplaceListings = async () => {
    try {
      const marketplace = await firebaseService
        .getMarketplaceListings()
        .catch(() => []);
      setListings(marketplace);
    } catch (error) {
      console.error("Error fetching marketplace:", error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const events = await firebaseService.getUpcomingEvents().catch(() => []);
      setUpcomingEvents(events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleJoinEvent = async (eventId) => {
    if (!currentUser) {
      toast.error("Please login to join events");
      return;
    }
    setJoiningEventId(eventId);
    try {
      await firebaseService.joinEvent(eventId, currentUser.uid);
      toast.success("Successfully joined the event! +25 Eco Points");
      await fetchUpcomingEvents();
    } catch (error) {
      toast.error(error.message || "Failed to join event");
    } finally {
      setJoiningEventId(null);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSellingItem(true);
    try {
      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        ecoValue: parseInt(formData.ecoValue),
        location: formData.location || userProfile?.location || "Campus",
        ownerId: currentUser.uid,
        ownerName: userProfile?.fullname || "Student",
        exchangeType: formData.exchangeType,
        status: "available",
        createdAt: new Date(),
      };
      await firebaseService.createMarketplaceListing(listingData, imageFile);
      toast.success("Item listed successfully!");
      resetMarketplaceForm();
      setShowSellModal(false);
      await fetchMarketplaceListings();
    } catch (error) {
      toast.error("Failed to list item: " + error.message);
    } finally {
      setSellingItem(false);
    }
  };

  const handleClaimItem = async (listing) => {
    if (!currentUser) {
      toast.error("Please login to claim items");
      return;
    }
    if (currentUser.uid === listing.ownerId) {
      toast.error("You can't claim your own item");
      return;
    }
    try {
      await firebaseService.claimListing(listing.id, currentUser.uid);
      const message =
        listing.exchangeType === "sell"
          ? `Item purchased! -${listing.ecoValue} Eco Points`
          : `Item claimed! +5 Eco Points for you, +10 for the donor!`;
      toast.success(message);
      await fetchMarketplaceListings();
      setShowItemDetails(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error(error.message || "Failed to claim item");
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;
    try {
      await firebaseService.deleteListing(listingId);
      toast.success("Listing deleted successfully");
      await fetchMarketplaceListings();
      setShowItemDetails(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error("Failed to delete listing");
    }
  };

  const resetMarketplaceForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      condition: "good",
      ecoValue: 5,
      location: "",
      exchangeType: "exchange",
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await firebaseService.markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await firebaseService.markAllNotificationsRead(currentUser.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
  };

  // Filtered leaderboard
  const filteredLeaderboard = leaderboard
    .filter((user) => {
      const matchesSearch =
        leaderboardSearch === "" ||
        user.fullname
          ?.toLowerCase()
          .includes(leaderboardSearch.toLowerCase()) ||
        user.email?.toLowerCase().includes(leaderboardSearch.toLowerCase());
      const matchesDepartment =
        selectedDepartment === "all" || user.department === selectedDepartment;
      const matchesFaculty =
        selectedFaculty === "all" || user.faculty === selectedFaculty;
      return matchesSearch && matchesDepartment && matchesFaculty;
    })
    .sort((a, b) => {
      if (sortBy === "points") return (b.ecoPoints || 0) - (a.ecoPoints || 0);
      if (sortBy === "name")
        return (a.fullname || "").localeCompare(b.fullname || "");
      return 0;
    });

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
      item.description?.toLowerCase().includes(marketplaceSearch.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.status === "available";
  });

  const calculateStreak = () => {
    const dates = recentActivity
      .map((a) => (a.timestamp ? new Date(a.timestamp).toDateString() : ""))
      .filter((d) => d);
    const uniqueDates = [...new Set(dates)];
    let streak = 0,
      currentDate = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(currentDate.getDate() - i);
      if (uniqueDates.includes(checkDate.toDateString())) streak++;
      else break;
    }
    return streak || 0;
  };

  const stats = [
    { icon: Star, label: "Points", value: userProfile?.ecoPoints || 0 },
    {
      icon: Recycle,
      label: "Recycled",
      value: recentActivity.filter((a) => a.selectedStatus === "Recycled")
        .length,
    },
    { icon: Flame, label: "Streak", value: calculateStreak() },
    {
      icon: Award,
      label: "Rank",
      value:
        leaderboard.findIndex((u) => u.uid === currentUser?.uid) + 1 || "--",
    },
  ];

  const getRankBadge = (rank) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-700";
    if (rank === 2) return "bg-gray-200 text-gray-600";
    if (rank === 3) return "bg-amber-100 text-amber-700";
    return "bg-green-50 text-green-600";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={14} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={14} className="text-gray-400" />;
    if (rank === 3) return <Medal size={14} className="text-amber-500" />;
    return null;
  };

  // Navigation items
  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/dashboard/marketplace", icon: Store, label: "Marketplace" },
    { path: "/dashboard/leaderboard", icon: Trophy, label: "Leaderboard" },
    { path: "/dashboard/events", icon: Calendar, label: "Events" },
    { path: "/dashboard/profile", icon: User, label: "Profile" },
  ];
  if (userProfile?.role === "admin")
    navItems.push({ path: "/dashboard/admin", icon: Shield, label: "Admin" });

  const bottomNavItems = [
    { path: "/dashboard", icon: Home, label: "Home", view: "dashboard" },
    {
      path: "/dashboard/marketplace",
      icon: Store,
      label: "Market",
      view: "marketplace",
    },
    {
      path: "/dashboard/leaderboard",
      icon: Trophy,
      label: "Rank",
      view: "leaderboard",
    },
    {
      path: "/dashboard/events",
      icon: Calendar,
      label: "Events",
      view: "events",
    },
    {
      path: "/dashboard/profile",
      icon: User,
      label: "Profile",
      view: "profile",
    },
  ];

  const renderDashboard = () => (
    <div className="space-y-5 pb-20">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-100">Welcome back,</p>
            <h1 className="text-xl font-bold">
              {userProfile?.fullname?.split(" ")[0] || "Student"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-green-100">
                {userProfile?.badge || "Eco Rookie"}
              </span>
              <span className="text-xs text-green-200">•</span>
              <span className="text-xs font-medium">
                {userProfile?.ecoPoints || 0} pts
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg active:scale-95"
          >
            <Sparkles size={22} className="text-green-600" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-3 shadow-sm border border-green-100 text-center"
          >
            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <stat.icon size={14} className="text-green-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            <p className="text-[10px] text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex gap-3 min-w-max">
          <button
            onClick={() => setShowScanner(true)}
            className="flex flex-col items-center gap-2 p-3 min-w-[80px] bg-green-600 rounded-xl active:scale-95 shadow-sm"
          >
            <Sparkles size={22} className="text-white" />
            <span className="text-xs font-medium text-white">AI Scan</span>
          </button>
          <Link
            to="/waste-report"
            className="flex flex-col items-center gap-2 p-3 min-w-[80px] bg-gradient-to-r from-red-600 to-red-500 rounded-xl active:scale-95 shadow-sm"
          >
            <Flag size={22} className="text-white" />
            <span className="text-xs font-medium text-white">Report Waste</span>
          </Link>
          <Link
            to="/dashboard/marketplace"
            className="flex flex-col items-center gap-2 p-3 min-w-[80px] bg-white rounded-xl shadow-sm border border-green-200 active:scale-95"
          >
            <Store size={22} className="text-green-600" />
            <span className="text-xs font-medium text-gray-700">Exchange</span>
          </Link>
          <Link
            to="/dashboard/events"
            className="flex flex-col items-center gap-2 p-3 min-w-[80px] bg-white rounded-xl shadow-sm border border-green-200 active:scale-95"
          >
            <Calendar size={22} className="text-green-600" />
            <span className="text-xs font-medium text-gray-700">Events</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-green-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-green-600" />
            <h2 className="font-semibold text-gray-900 text-base">
              Recent Activity
            </h2>
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="text-xs text-green-600 font-medium"
          >
            New Scan
          </button>
        </div>
        <div className="divide-y divide-green-50">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles size={20} className="text-green-400" />
              </div>
              <p className="text-sm text-gray-500">No scans yet</p>
              <button
                onClick={() => setShowScanner(true)}
                className="text-sm text-green-600 font-medium mt-2"
              >
                Scan your first item →
              </button>
            </div>
          ) : (
            recentActivity.map((item, idx) => (
              <div
                key={idx}
                className="px-5 py-3 flex items-center justify-between hover:bg-green-50/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                    {item.selectedStatus === "Recycled" ? (
                      <Recycle size={16} className="text-green-600" />
                    ) : (
                      <Sparkles size={16} className="text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.itemName || "Item Scanned"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleDateString()
                        : "Recent"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-green-600">
                    +{item.ecoPointsAwarded || 10}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Events Preview */}
      {upcomingEvents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-green-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-green-600" />
              <h2 className="font-semibold text-gray-900 text-base">
                Upcoming Events
              </h2>
            </div>
            <Link
              to="/dashboard/events"
              className="text-xs text-green-600 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-green-50">
            {upcomingEvents.slice(0, 3).map((event) => {
              const hasJoined = event.participants?.includes(currentUser?.uid);
              const isFull =
                event.maxParticipants > 0 &&
                event.participants?.length >= event.maxParticipants;
              const isJoining = joiningEventId === event.id;
              return (
                <div key={event.id} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-green-700">
                        {event.date ? new Date(event.date).getDate() : "?"}
                      </span>
                      <span className="text-[10px] text-green-500">
                        {event.date
                          ? new Date(event.date).toLocaleString("default", {
                              month: "short",
                            })
                          : ""}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {event.location}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {event.participants?.length || 0} participants
                      </p>
                    </div>
                    {!hasJoined && !isFull && currentUser && (
                      <button
                        onClick={() => handleJoinEvent(event.id)}
                        disabled={isJoining}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg font-medium active:scale-95 disabled:opacity-50"
                      >
                        {isJoining ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          "Join"
                        )}
                      </button>
                    )}
                    {hasJoined && (
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg font-medium">
                        ✓ Joined
                      </span>
                    )}
                    {isFull && !hasJoined && (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">
                        Full
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderMarketplace = () => (
    <div className="space-y-4 pb-20">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Marketplace</h1>
            <p className="text-sm text-green-100 mt-1">
              Exchange or sell reusable items
            </p>
          </div>
          <button
            onClick={() => setShowSellModal(true)}
            className="px-4 py-2 bg-white text-green-700 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Sell/Exchange
          </button>
        </div>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400"
        />
        <input
          type="text"
          placeholder="Search items..."
          value={marketplaceSearch}
          onChange={(e) => setMarketplaceSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-3 bg-white rounded-xl border border-green-200 text-sm focus:outline-none focus:border-green-400"
        />
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${selectedCategory === cat ? "bg-green-600 text-white" : "bg-green-50 text-gray-600 hover:bg-green-100"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredListings.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSelectedItem(item);
              setShowItemDetails(true);
            }}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-green-100 cursor-pointer active:scale-98 transition-transform hover:shadow-md"
          >
            <div className="relative h-32 bg-green-50">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={32} className="text-green-300" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-green-600 rounded-full px-2 py-0.5">
                <span className="text-white text-[10px] font-semibold">
                  {item.ecoValue} pts
                </span>
              </div>
              {item.exchangeType === "sell" && (
                <div className="absolute top-2 left-2 bg-green-500 rounded-full px-2 py-0.5">
                  <span className="text-white text-[10px] font-semibold">
                    For Sale
                  </span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {item.title}
              </h3>
              <p className="text-gray-500 text-xs mt-0.5 truncate">
                {item.ownerName || "Student"}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${item.condition === "excellent" ? "bg-green-100 text-green-700" : item.condition === "good" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"}`}
                >
                  {item.condition}
                </span>
                <span className="text-[10px] text-gray-400">
                  {item.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-green-100">
          <Package size={48} className="mx-auto text-green-300 mb-3" />
          <p className="text-gray-500">No items found</p>
          <button
            onClick={() => setShowSellModal(true)}
            className="text-green-600 font-medium text-sm mt-2"
          >
            List your first item →
          </button>
        </div>
      )}
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-4 pb-20">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Leaderboard</h1>
            <p className="text-sm text-green-100 mt-1">Top Eco Warriors</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 bg-white/20 rounded-xl text-sm font-medium flex items-center gap-2"
          >
            <Filter size={14} /> Filters
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white rounded-xl border border-green-100"
          >
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Filter by Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm"
                >
                  {departmentsList.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === "all" ? "All Departments" : dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Filter by Faculty
                </label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm"
                >
                  {facultiesList.map((fac) => (
                    <option key={fac} value={fac}>
                      {fac === "all" ? "All Faculties" : fac}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Sort By
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy("points")}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium ${sortBy === "points" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}
                  >
                    ⭐ Points
                  </button>
                  <button
                    onClick={() => setSortBy("name")}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium ${sortBy === "name" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}
                  >
                    🔤 Name
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedDepartment("all");
                  setSelectedFaculty("all");
                  setLeaderboardSearch("");
                  setSortBy("points");
                }}
                className="w-full py-2 text-xs text-green-600 font-medium border-t border-green-100 mt-2 pt-2"
              >
                Reset Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400"
        />
        <input
          type="text"
          placeholder="Search users..."
          value={leaderboardSearch}
          onChange={(e) => setLeaderboardSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-3 bg-white rounded-xl border border-green-200 text-sm focus:outline-none focus:border-green-400"
        />
      </div>

      <div className="text-xs text-gray-500 px-1 flex justify-between items-center">
        <span>
          Showing {filteredLeaderboard.length} of {leaderboard.length} users
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
        <div className="divide-y divide-green-50">
          {filteredLeaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            filteredLeaderboard.map((user, idx) => {
              const rank = idx + 1;
              const isCurrentUser = user.uid === currentUser?.uid;
              return (
                <div
                  key={user.uid}
                  className={`px-4 py-3 flex items-center gap-3 ${isCurrentUser ? "bg-green-50" : "hover:bg-green-50/30"} transition-colors`}
                >
                  <div className="flex items-center gap-2 w-12">
                    {getRankIcon(rank)}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${getRankBadge(rank)}`}
                    >
                      {rank <= 3 ? null : rank}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {user.fullname || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.department || user.faculty || "Student"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-green-600 text-sm">
                      {user.ecoPoints || 0}
                    </p>
                    <p className="text-[10px] text-gray-400">pts</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-4 pb-20">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 text-white shadow-lg">
        <h1 className="text-xl font-bold">Events</h1>
        <p className="text-sm text-green-100 mt-1">
          Join & earn 25 points per event
        </p>
      </div>
      {upcomingEvents.map((event) => {
        const hasJoined = event.participants?.includes(currentUser?.uid);
        const isFull =
          event.maxParticipants > 0 &&
          event.participants?.length >= event.maxParticipants;
        const isJoining = joiningEventId === event.id;
        return (
          <div
            key={event.id}
            className="bg-white rounded-xl shadow-sm border border-green-100 p-4 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-green-700">
                  {event.date ? new Date(event.date).getDate() : "?"}
                </span>
                <span className="text-[10px] text-green-500">
                  {event.date
                    ? new Date(event.date).toLocaleString("default", {
                        month: "short",
                      })
                    : ""}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">
                    {event.participants?.length || 0}
                    {event.maxParticipants
                      ? ` / ${event.maxParticipants}`
                      : ""}{" "}
                    participants
                  </p>
                  {!hasJoined && !isFull && currentUser && (
                    <button
                      onClick={() => handleJoinEvent(event.id)}
                      disabled={isJoining}
                      className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg font-medium active:scale-95 disabled:opacity-50 hover:bg-green-700"
                    >
                      {isJoining ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "Join →"
                      )}
                    </button>
                  )}
                  {hasJoined && (
                    <span className="px-4 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg font-medium">
                      ✓ Joined
                    </span>
                  )}
                  {isFull && !hasJoined && (
                    <span className="px-4 py-1.5 bg-gray-100 text-gray-500 text-sm rounded-lg font-medium">
                      Full
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {upcomingEvents.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-green-100">
          <Calendar size={48} className="mx-auto text-green-300 mb-3" />
          <p className="text-gray-500">No upcoming events</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/") return renderDashboard();
    if (path === "/dashboard/marketplace") return renderMarketplace();
    if (path === "/dashboard/leaderboard") return renderLeaderboard();
    if (path === "/dashboard/events") return renderEvents();
    if (path === "/dashboard/profile") return <MobileProfile />;
    if (path === "/dashboard/admin") return <AdminPanel />;
    return renderDashboard();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "bg-white shadow-md" : "bg-white/95 backdrop-blur-sm"} border-b border-green-100`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 active:scale-95"
          >
            <Menu size={22} className="text-green-700" />
          </button>
          <div className="flex items-center gap-1">
            <Leaf size={18} className="text-green-600" />
            <span className="font-semibold text-green-800 text-base">
              GreenLoop
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={toggleNotifications}
                className="p-2 relative active:scale-95"
              >
                <Bell size={20} className="text-green-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-green-100 z-50 max-h-96 overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-green-100 px-4 py-3 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-green-600"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-green-50">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell
                          size={32}
                          className="mx-auto text-green-300 mb-2"
                        />
                        <p className="text-sm text-gray-500">
                          No notifications yet
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            setShowNotifications(false);
                          }}
                          className={`px-4 py-3 cursor-pointer hover:bg-green-50 ${!notif.read ? "bg-green-50" : ""}`}
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {notif.title}
                          </p>
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
            <div className="px-2 py-1 bg-green-100 rounded-full">
              <span className="text-xs font-medium text-green-700">
                {userProfile?.ecoPoints || 0}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 shadow-xl"
            >
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-green-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-green-800 text-lg">
                        GreenLoop
                      </span>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 hover:bg-green-50 rounded-full"
                    >
                      <X size={18} className="text-gray-500" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-700 font-semibold text-lg">
                        {userProfile?.fullname?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {userProfile?.fullname || "Student"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userProfile?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-green-100 px-2 py-0.5 rounded-full text-green-700">
                          {userProfile?.ecoPoints || 0} pts
                        </span>
                        <span className="text-xs text-gray-500">
                          {userProfile?.badge || "Eco Rookie"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-green-50"}`}
                      >
                        <item.icon
                          size={20}
                          className={isActive ? "text-green-600" : ""}
                        />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-green-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 w-full text-red-600 rounded-xl hover:bg-red-50"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="pt-16 pb-20">
        <div className="px-4 py-4">{renderContent()}</div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-green-100 shadow-lg z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${isActive ? "text-green-600" : "text-gray-500"}`}
              >
                <item.icon size={20} />
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.3 }}
        onClick={() => setShowScanner(true)}
        className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-green-600 rounded-full shadow-lg flex items-center justify-center active:scale-95"
      >
        <Sparkles size={22} className="text-white" />
      </motion.button>

      <AIWasteScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onSave={() => {
          fetchAllData();
          setShowScanner(false);
        }}
      />

      {/* Modals - Simplified to avoid DOM errors */}
      {showSellModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSellModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-green-100 sticky top-0 bg-white flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">List an Item</h2>
              <button
                onClick={() => setShowSellModal(false)}
                className="p-1 hover:bg-green-50 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateListing} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exchange Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, exchangeType: "exchange" })
                    }
                    className={`p-3 rounded-xl border-2 transition-all ${formData.exchangeType === "exchange" ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-600"}`}
                  >
                    <Recycle size={18} className="mx-auto mb-1" /> Exchange
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, exchangeType: "sell" })
                    }
                    className={`p-3 rounded-xl border-2 transition-all ${formData.exchangeType === "sell" ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-600"}`}
                  >
                    <Gift size={18} className="mx-auto mb-1" /> Sell
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  placeholder="e.g., Plastic Bottles Collection"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl resize-none"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                    required
                  >
                    <option value="">Select</option>
                    {categories
                      .filter((c) => c !== "all")
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  >
                    {conditions.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points Value
                  </label>
                  <input
                    type="number"
                    value={formData.ecoValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ecoValue: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                    placeholder="e.g., Library, Cafeteria"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-green-200 border-dashed rounded-xl bg-green-50/30">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Package className="mx-auto h-12 w-12 text-green-400" />
                      <label className="cursor-pointer text-sm font-medium text-green-600 hover:text-green-700">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSellModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sellingItem}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {sellingItem ? (
                    <Loader2 size={16} className="animate-spin mx-auto" />
                  ) : (
                    "List Item"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showItemDetails && selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowItemDetails(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.imageUrl ? (
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="w-full h-48 object-cover rounded-t-2xl"
              />
            ) : (
              <div className="w-full h-48 bg-green-50 flex items-center justify-center rounded-t-2xl">
                <Package size={48} className="text-green-300" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedItem.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${conditions.find((c) => c.value === selectedItem.condition)?.color || "bg-gray-100 text-gray-600"}`}
                    >
                      {selectedItem.condition}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {selectedItem.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-600">
                    +{selectedItem.ecoValue} pts
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{selectedItem.description}</p>
              <div className="space-y-2 mb-6 p-4 bg-green-50 rounded-xl text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span>Listed by: {selectedItem.ownerName || "Student"}</span>
                </div>
                {selectedItem.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{selectedItem.location}</span>
                  </div>
                )}
              </div>
              {selectedItem.status === "available" &&
                currentUser?.uid !== selectedItem.ownerId && (
                  <button
                    onClick={() => handleClaimItem(selectedItem)}
                    className="w-full py-3 mb-3 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <Send size={16} />{" "}
                    {selectedItem.exchangeType === "sell"
                      ? "Purchase Item"
                      : "Claim Item"}
                  </button>
                )}
              {currentUser?.uid === selectedItem.ownerId && (
                <button
                  onClick={() => handleDeleteListing(selectedItem.id)}
                  className="w-full py-3 border border-red-300 text-red-600 rounded-xl font-medium"
                >
                  Delete Listing
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileLayout;
