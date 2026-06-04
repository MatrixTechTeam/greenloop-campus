import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
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

// ── Sidebar animation config — fast, snappy ──────────────────────────────
const SIDEBAR_VARIANTS = {
  open: {
    x: 0,
    transition: { type: "tween", duration: 0.18, ease: "easeOut" },
  },
  closed: {
    x: "-100%",
    transition: { type: "tween", duration: 0.15, ease: "easeIn" },
  },
};
const OVERLAY_VARIANTS = {
  open: { opacity: 1, transition: { duration: 0.15 } },
  closed: { opacity: 0, transition: { duration: 0.12 } },
};

// ── Memoized Sidebar ────────────────────────────────────────────────────
const Sidebar = memo(
  ({ isOpen, onClose, navItems, userProfile, location, onLogout }) => (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial="closed"
            animate="open"
            exit="closed"
            variants={OVERLAY_VARIANTS}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          <motion.aside
            key="sidebar"
            initial="closed"
            animate="open"
            exit="closed"
            variants={SIDEBAR_VARIANTS}
            className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-xl will-change-transform"
          >
            <div className="h-full flex flex-col">
              <div className="p-5 border-b border-green-100">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-green-800 text-base">
                      GreenLoop
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-green-50 rounded-full transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-green-700 font-semibold text-lg">
                      {userProfile?.fullname?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {userProfile?.fullname || "Student"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userProfile?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-green-100 px-2 py-0.5 rounded-full text-green-700">
                        {userProfile?.ecoPoints || 0} pts
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {userProfile?.badge || "Eco Rookie"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        isActive
                          ? "bg-green-50 text-green-700"
                          : "text-gray-600 hover:bg-green-50"
                      }`}
                    >
                      <item.icon
                        size={19}
                        className={isActive ? "text-green-600" : ""}
                      />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-green-100">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 px-3 py-2.5 w-full text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <LogOut size={19} />
                  <span className="font-medium text-sm">Logout</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  ),
);

// ── Memoized UserDetailsModal ───────────────────────────────────────────
const UserDetailsModal = memo(({ user, rank, onClose }) => {
  if (!user) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-5 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-lg font-bold text-white">User Profile</h2>
          <button
            onClick={onClose}
            className="p-1 bg-white/20 rounded-full hover:bg-white/30"
          >
            <X size={18} className="text-white" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-green-100">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-green-700">
                {user.fullname?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {user.fullname || "Anonymous"}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  {user.badge || "Eco Rookie"}
                </span>
                <span className="text-xs text-gray-400">Rank #{rank}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Mail size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500 truncate">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {user.ecoPoints || 0}
              </p>
              <p className="text-xs text-gray-500">Eco Points</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                #{rank || "-"}
              </p>
              <p className="text-xs text-gray-500">Global Rank</p>
            </div>
          </div>
          {(user.department || user.faculty || user.studentId) && (
            <div>
              <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-2">
                <GraduationCap size={14} className="text-green-600" /> Academic
                Information
              </h4>
              <div className="space-y-2 pl-5">
                {user.department && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase size={13} className="text-gray-400 shrink-0" />
                    <span className="text-gray-600">Department:</span>
                    <span className="text-gray-800">{user.department}</span>
                  </div>
                )}
                {user.faculty && (
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen size={13} className="text-gray-400 shrink-0" />
                    <span className="text-gray-600">Faculty:</span>
                    <span className="text-gray-800">{user.faculty}</span>
                  </div>
                )}
                {user.studentId && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap
                      size={13}
                      className="text-gray-400 shrink-0"
                    />
                    <span className="text-gray-600">Student ID:</span>
                    <span className="text-gray-800">{user.studentId}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {(user.phone || user.location || user.website) && (
            <div>
              <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-2">
                <Phone size={14} className="text-green-600" /> Contact
              </h4>
              <div className="space-y-2 pl-5">
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={13} className="text-gray-400 shrink-0" />
                    <span className="text-gray-800">{user.phone}</span>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={13} className="text-gray-400 shrink-0" />
                    <span className="text-gray-800">{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe size={13} className="text-gray-400 shrink-0" />
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline truncate"
                    >
                      {user.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          {user.bio && (
            <div>
              <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-2">
                <Globe size={14} className="text-green-600" />
                About
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {user.bio}
              </p>
            </div>
          )}
          {user.interests?.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">
                Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
          {user.createdAt && (
            <div className="pt-2 text-center text-xs text-gray-400 border-t border-green-100">
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full mt-2 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

// ── Main MobileLayout ───────────────────────────────────────────────────
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("points");
  const [departmentsList, setDepartmentsList] = useState(["all"]);
  const [facultiesList, setFacultiesList] = useState(["all"]);
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

  const categories = useMemo(
    () => [
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
    ],
    [],
  );

  const conditions = useMemo(
    () => [
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
    ],
    [],
  );

  const navItems = useMemo(() => {
    const items = [
      { path: "/dashboard", icon: Home, label: "Home" },
      { path: "/dashboard/marketplace", icon: Store, label: "Marketplace" },
      { path: "/dashboard/leaderboard", icon: Trophy, label: "Leaderboard" },
      { path: "/dashboard/events", icon: Calendar, label: "Events" },
      { path: "/dashboard/profile", icon: User, label: "Profile" },
    ];
    if (userProfile?.role === "admin")
      items.push({ path: "/dashboard/admin", icon: Shield, label: "Admin" });
    return items;
  }, [userProfile?.role]);

  const bottomNavItems = useMemo(
    () => [
      { path: "/dashboard", icon: Home, label: "Home" },
      { path: "/dashboard/marketplace", icon: Store, label: "Market" },
      { path: "/dashboard/leaderboard", icon: Trophy, label: "Rank" },
      { path: "/dashboard/events", icon: Calendar, label: "Events" },
      { path: "/dashboard/profile", icon: User, label: "Profile" },
    ],
    [],
  );

  // ── Fetch all at once ──
  const fetchAllData = useCallback(async () => {
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
  }, [currentUser]);

  const fetchMarketplaceListings = useCallback(async () => {
    const marketplace = await firebaseService
      .getMarketplaceListings()
      .catch(() => []);
    setListings(marketplace);
  }, []);

  const fetchUpcomingEvents = useCallback(async () => {
    const events = await firebaseService.getUpcomingEvents().catch(() => []);
    setUpcomingEvents(events);
  }, []);

  const fetchLeaderboardData = useCallback(async () => {
    const data = await firebaseService.getLeaderboard(100).catch(() => []);
    setLeaderboard(data);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchNotifications = async () => {
      const notifs = await firebaseService
        .getUserNotifications(currentUser.uid)
        .catch(() => []);
      setNotifications(notifs || []);
      setUnreadCount(notifs?.filter((n) => !n.read).length || 0);
    };
    fetchNotifications();
    fetchAllData();
    const interval = setInterval(() => {
      fetchMarketplaceListings();
      fetchUpcomingEvents();
      fetchLeaderboardData();
    }, 10000);
    return () => clearInterval(interval);
  }, [
    currentUser,
    fetchAllData,
    fetchMarketplaceListings,
    fetchUpcomingEvents,
    fetchLeaderboardData,
  ]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (leaderboard.length > 0) {
      setDepartmentsList([
        "all",
        ...new Set(leaderboard.map((u) => u.department).filter(Boolean)),
      ]);
      setFacultiesList([
        "all",
        ...new Set(leaderboard.map((u) => u.faculty).filter(Boolean)),
      ]);
    }
  }, [leaderboard]);

  // ── Memoized filtered lists ──
  const filteredLeaderboard = useMemo(() => {
    return leaderboard
      .filter((user) => {
        const term = leaderboardSearch.toLowerCase();
        const matchSearch =
          !term ||
          user.fullname?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term);
        const matchDept =
          selectedDepartment === "all" ||
          user.department === selectedDepartment;
        const matchFac =
          selectedFaculty === "all" || user.faculty === selectedFaculty;
        return matchSearch && matchDept && matchFac;
      })
      .sort((a, b) =>
        sortBy === "name"
          ? (a.fullname || "").localeCompare(b.fullname || "")
          : (b.ecoPoints || 0) - (a.ecoPoints || 0),
      );
  }, [
    leaderboard,
    leaderboardSearch,
    selectedDepartment,
    selectedFaculty,
    sortBy,
  ]);

  const filteredListings = useMemo(() => {
    const term = marketplaceSearch.toLowerCase();
    return listings.filter(
      (item) =>
        item.status === "available" &&
        (selectedCategory === "all" || item.category === selectedCategory) &&
        (!term ||
          item.title?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)),
    );
  }, [listings, marketplaceSearch, selectedCategory]);

  const stats = useMemo(() => {
    const dates = recentActivity
      .map((a) => (a.timestamp ? new Date(a.timestamp).toDateString() : ""))
      .filter(Boolean);
    const unique = [...new Set(dates)];
    let streak = 0,
      d = new Date();
    for (let i = 0; i < unique.length; i++) {
      const check = new Date(d);
      check.setDate(d.getDate() - i);
      if (unique.includes(check.toDateString())) streak++;
      else break;
    }
    return [
      { icon: Star, label: "Points", value: userProfile?.ecoPoints || 0 },
      {
        icon: Recycle,
        label: "Recycled",
        value: recentActivity.filter((a) => a.selectedStatus === "Recycled")
          .length,
      },
      { icon: Flame, label: "Streak", value: streak },
      {
        icon: Award,
        label: "Rank",
        value:
          leaderboard.findIndex((u) => u.uid === currentUser?.uid) + 1 || "--",
      },
    ];
  }, [userProfile?.ecoPoints, recentActivity, leaderboard, currentUser?.uid]);

  const handleLogout = useCallback(async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  }, [logout, navigate]);

  const handleJoinEvent = useCallback(
    async (eventId) => {
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
    },
    [currentUser, fetchUpcomingEvents],
  );

  const handleCreateListing = useCallback(
    async (e) => {
      e.preventDefault();
      if (!formData.title || !formData.description || !formData.category) {
        toast.error("Please fill in all required fields");
        return;
      }
      setSellingItem(true);
      try {
        await firebaseService.createMarketplaceListing(
          {
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
          },
          imageFile,
        );
        toast.success("Item listed successfully!");
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
        setShowSellModal(false);
        await fetchMarketplaceListings();
      } catch (error) {
        toast.error("Failed to list item: " + error.message);
      } finally {
        setSellingItem(false);
      }
    },
    [formData, imageFile, currentUser, userProfile, fetchMarketplaceListings],
  );

  const handleClaimItem = useCallback(
    async (listing) => {
      if (!currentUser) {
        toast.error("Please login");
        return;
      }
      if (currentUser.uid === listing.ownerId) {
        toast.error("You can't claim your own item");
        return;
      }
      try {
        await firebaseService.claimListing(listing.id, currentUser.uid);
        toast.success(
          listing.exchangeType === "sell"
            ? `Purchased! -${listing.ecoValue} Eco Points`
            : "Claimed! +5 pts for you, +10 for donor!",
        );
        await fetchMarketplaceListings();
        setShowItemDetails(false);
        setSelectedItem(null);
      } catch (error) {
        toast.error(error.message || "Failed to claim item");
      }
    },
    [currentUser, fetchMarketplaceListings],
  );

  const handleDeleteListing = useCallback(
    async (listingId) => {
      if (!window.confirm("Delete this listing?")) return;
      try {
        await firebaseService.deleteListing(listingId);
        toast.success("Deleted successfully");
        await fetchMarketplaceListings();
        setShowItemDetails(false);
        setSelectedItem(null);
      } catch {
        toast.error("Failed to delete listing");
      }
    },
    [fetchMarketplaceListings],
  );

  const markNotificationRead = useCallback(async (id) => {
    await firebaseService.markNotificationRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await firebaseService
      .markAllNotificationsRead(currentUser.uid)
      .catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success("All marked as read");
  }, [currentUser]);

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

  // ── Render sections ─────────────────────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-5 pb-20">
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
            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Sparkles size={22} className="text-green-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-3 shadow-sm border border-green-100 text-center"
          >
            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-1.5">
              <stat.icon size={14} className="text-green-600" />
            </div>
            <p className="text-base font-bold text-gray-900">{stat.value}</p>
            <p className="text-[10px] text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex gap-3 min-w-max">
          {[
            {
              label: "AI Scan",
              icon: Sparkles,
              onClick: () => setShowScanner(true),
              style: "bg-green-600",
            },
          ].map(({ label, icon: Icon, onClick, style }) => (
            <button
              key={label}
              onClick={onClick}
              className={`flex flex-col items-center gap-2 p-3 min-w-[72px] ${style} rounded-xl active:scale-95 shadow-sm transition-transform`}
            >
              <Icon size={20} className="text-white" />
              <span className="text-xs font-medium text-white">{label}</span>
            </button>
          ))}
          <Link
            to="/dashboard/marketplace"
            className="flex flex-col items-center gap-2 p-3 min-w-[72px] bg-white rounded-xl shadow-sm border border-green-200 active:scale-95 transition-transform"
          >
            <Store size={20} className="text-green-600" />
            <span className="text-xs font-medium text-gray-700">Exchange</span>
          </Link>
          <Link
            to="/dashboard/events"
            className="flex flex-col items-center gap-2 p-3 min-w-[72px] bg-white rounded-xl shadow-sm border border-green-200 active:scale-95 transition-transform"
          >
            <Calendar size={20} className="text-green-600" />
            <span className="text-xs font-medium text-gray-700">Events</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-green-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-green-600" />
            <h2 className="font-semibold text-gray-900 text-sm">
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
                className="px-5 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center">
                    {item.selectedStatus === "Recycled" ? (
                      <Recycle size={15} className="text-green-600" />
                    ) : (
                      <Sparkles size={15} className="text-green-500" />
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
                <span className="text-xs font-semibold text-green-600">
                  +{item.ecoPointsAwarded || 10}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {upcomingEvents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-green-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-green-600" />
              <h2 className="font-semibold text-gray-900 text-sm">
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
                <div
                  key={event.id}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex flex-col items-center justify-center shrink-0">
                    <span className="text-base font-bold text-green-700">
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {event.location}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {event.participants?.length || 0} participants
                    </p>
                  </div>
                  {!hasJoined && !isFull && currentUser && (
                    <button
                      onClick={() => handleJoinEvent(event.id)}
                      disabled={isJoining}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg font-medium active:scale-95 disabled:opacity-50 shrink-0"
                    >
                      {isJoining ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Join"
                      )}
                    </button>
                  )}
                  {hasJoined && (
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg font-medium shrink-0">
                      ✓ Joined
                    </span>
                  )}
                  {isFull && !hasJoined && (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-xs rounded-lg shrink-0">
                      Full
                    </span>
                  )}
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
            <Plus size={16} /> List Item
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                selectedCategory === cat
                  ? "bg-green-600 text-white"
                  : "bg-green-50 text-gray-600 hover:bg-green-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {filteredListings.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSelectedItem(item);
              setShowItemDetails(true);
            }}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-green-100 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="relative h-32 bg-green-50">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
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
                  className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                    item.condition === "excellent"
                      ? "bg-green-100 text-green-700"
                      : item.condition === "good"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-600"
                  }`}
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
            transition={{ duration: 0.15 }}
            className="overflow-hidden bg-white rounded-xl border border-green-100"
          >
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm"
                >
                  {departmentsList.map((d) => (
                    <option key={d} value={d}>
                      {d === "all" ? "All Departments" : d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Faculty
                </label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 rounded-lg text-sm"
                >
                  {facultiesList.map((f) => (
                    <option key={f} value={f}>
                      {f === "all" ? "All Faculties" : f}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("points")}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium ${sortBy === "points" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  Points
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium ${sortBy === "name" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  Name
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedDepartment("all");
                  setSelectedFaculty("all");
                  setLeaderboardSearch("");
                  setSortBy("points");
                }}
                className="w-full py-2 text-xs text-green-600 font-medium border-t border-green-100 pt-2"
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
      <p className="text-xs text-gray-500 px-1">
        Showing {filteredLeaderboard.length} of {leaderboard.length} users
      </p>
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
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUserModal(true);
                  }}
                  className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${isCurrentUser ? "bg-green-50" : "hover:bg-green-50/30"}`}
                >
                  <div className="flex items-center gap-1 w-10 shrink-0">
                    {getRankIcon(rank)}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${getRankBadge(rank)}`}
                    >
                      {rank > 3 ? rank : null}
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
            className="bg-white rounded-xl shadow-sm border border-green-100 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex flex-col items-center justify-center shrink-0">
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
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {event.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {event.location}
                </p>
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
                      className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg font-medium active:scale-95 disabled:opacity-50 hover:bg-green-700 transition-colors"
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
    const p = location.pathname;
    if (p === "/dashboard" || p === "/") return renderDashboard();
    if (p === "/dashboard/marketplace") return renderMarketplace();
    if (p === "/dashboard/leaderboard") return renderLeaderboard();
    if (p === "/dashboard/events") return renderEvents();
    if (p === "/dashboard/profile") return <MobileProfile />;
    if (p === "/dashboard/admin") return <AdminPanel />;
    return renderDashboard();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-shadow duration-200 bg-white border-b border-green-100 ${scrolled ? "shadow-md" : ""}`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 active:scale-95 transition-transform"
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
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className="p-2 relative active:scale-95 transition-transform"
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
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
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
                          <p className="text-xs text-gray-500 mt-0.5">
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

      {/* Sidebar — extracted memoized component */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={navItems}
        userProfile={userProfile}
        location={location}
        onLogout={handleLogout}
      />

      <main className="pt-16 pb-20">
        <div className="px-4 py-4">{renderContent()}</div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-green-100 shadow-lg z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${isActive ? "text-green-600" : "text-gray-500"}`}
              >
                <item.icon size={20} />
                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FAB */}
      <button
        onClick={() => setShowScanner(true)}
        className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-green-600 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Sparkles size={22} className="text-white" />
      </button>

      <AIWasteScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onSave={() => {
          fetchAllData();
          setShowScanner(false);
        }}
      />

      {/* Sell Modal */}
      {showSellModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSellModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-green-100 sticky top-0 bg-white flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">List an Item</h2>
              <button
                onClick={() => setShowSellModal(false)}
                className="p-1 hover:bg-green-50 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateListing} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {["exchange", "sell"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, exchangeType: type }))
                    }
                    className={`p-3 rounded-xl border-2 transition-all capitalize text-sm font-medium ${
                      formData.exchangeType === type
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {[
                {
                  key: "title",
                  type: "text",
                  placeholder: "e.g., Plastic Bottles Collection",
                  label: "Title *",
                  required: true,
                },
                {
                  key: "description",
                  type: "textarea",
                  placeholder: "Describe the item...",
                  label: "Description *",
                  required: true,
                },
              ].map(({ key, type, placeholder, label, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  {type === "textarea" ? (
                    <textarea
                      value={formData[key]}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, [key]: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl resize-none text-sm"
                      rows="3"
                      placeholder={placeholder}
                      required={required}
                    />
                  ) : (
                    <input
                      type={type}
                      value={formData[key]}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, [key]: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                      placeholder={placeholder}
                      required={required}
                    />
                  )}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, category: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                    required
                  >
                    <option value="">Select</option>
                    {categories
                      .filter((c) => c !== "all")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, condition: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                  >
                    {conditions.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points Value
                  </label>
                  <input
                    type="number"
                    value={formData.ecoValue}
                    min="1"
                    max="100"
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        ecoValue: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    placeholder="e.g., Library"
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, location: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <Package className="mx-auto h-10 w-10 text-green-400" />
                      <label className="cursor-pointer text-sm font-medium text-green-600 hover:text-green-700 mt-2 block">
                        Upload a file
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("Image must be less than 5MB");
                              return;
                            }
                            setImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () =>
                              setImagePreview(reader.result);
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSellModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sellingItem}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-medium text-sm disabled:opacity-50 hover:bg-green-700 transition-colors"
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

      {/* Item Details Modal */}
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
                loading="lazy"
              />
            ) : (
              <div className="w-full h-48 bg-green-50 flex items-center justify-center rounded-t-2xl">
                <Package size={48} className="text-green-300" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
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
                <span className="text-xl font-bold text-green-600">
                  +{selectedItem.ecoValue} pts
                </span>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                {selectedItem.description}
              </p>
              <div className="space-y-2 mb-5 p-3 bg-green-50 rounded-xl text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <User size={13} />
                  <span>Listed by: {selectedItem.ownerName || "Student"}</span>
                </div>
                {selectedItem.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={13} />
                    <span>{selectedItem.location}</span>
                  </div>
                )}
              </div>
              {selectedItem.status === "available" &&
                currentUser?.uid !== selectedItem.ownerId && (
                  <button
                    onClick={() => handleClaimItem(selectedItem)}
                    className="w-full py-3 mb-3 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                  >
                    <Send size={16} />
                    {selectedItem.exchangeType === "sell"
                      ? "Purchase Item"
                      : "Claim Item"}
                  </button>
                )}
              {currentUser?.uid === selectedItem.ownerId && (
                <button
                  onClick={() => handleDeleteListing(selectedItem.id)}
                  className="w-full py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                >
                  Delete Listing
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          rank={
            filteredLeaderboard.findIndex((u) => u.uid === selectedUser.uid) + 1
          }
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default MobileLayout;
