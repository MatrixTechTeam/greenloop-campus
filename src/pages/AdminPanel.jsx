// src/pages/AdminPanel.jsx - Fixed imports
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext"; // Fixed path
import { firebaseService } from "../services/firebaseService";
import {
  Shield,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Eye,
  Check,
  X,
  Loader2,
  BarChart3,
  Package,
  Calendar,
  Bell,
  Send,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Ban,
  Star,
  TrendingUp,
  Award,
  Clock,
  Plus,
  Edit,
  RefreshCw,
  Activity,
  PieChart,
  TrendingDown,
  Zap,
  MapPin,
} from "lucide-react";
import { db } from "../config/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import toast from "react-hot-toast";

const AdminPanel = () => {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [marketplace, setMarketplace] = useState([]);
  const [events, setEvents] = useState([]);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalReports: 0,
    totalVerifications: 0,
    totalMarketplaceItems: 0,
    totalEvents: 0,
    totalEcoPoints: 0,
    totalRecycled: 0,
    totalUpcycled: 0,
    activeUsers: 0,
    pendingReports: 0,
    availableItems: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
    sendTo: "all",
  });
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    category: "cleanup",
    maxParticipants: "",
  });

  const dataRef = useRef({
    users: [],
    reports: [],
    verifications: [],
    marketplace: [],
    events: [],
  });

  const computeAndSetStats = () => {
    const { users, reports, verifications, marketplace, events } =
      dataRef.current;
    let totalEcoPoints = 0,
      totalRecycled = 0,
      totalUpcycled = 0,
      activeUsers = 0,
      pendingReports = 0,
      availableItems = 0;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    users.forEach((u) => {
      totalEcoPoints += u.ecoPoints || 0;
      if (
        u.lastActive &&
        new Date(u.lastActive?.toDate?.() || u.lastActive) > weekAgo
      )
        activeUsers++;
    });
    verifications.forEach((v) => {
      if (v.selectedStatus === "Recycled") totalRecycled++;
      if (v.selectedStatus === "Upcycled") totalUpcycled++;
    });
    reports.forEach((r) => {
      if (r.status === "pending") pendingReports++;
    });
    marketplace.forEach((m) => {
      if (m.status === "available") availableItems++;
    });

    setStatistics({
      totalUsers: users.length,
      totalReports: reports.length,
      totalVerifications: verifications.length,
      totalMarketplaceItems: marketplace.length,
      totalEvents: events.length,
      totalEcoPoints,
      totalRecycled,
      totalUpcycled,
      activeUsers,
      pendingReports,
      availableItems,
    });
    setLastUpdated(new Date());
  };

  useEffect(() => {
    if (userProfile?.role !== "admin") {
      setLoading(false);
      return;
    }

    // Safety: force loading off after 5s no matter what
    const timeout = setTimeout(() => setLoading(false), 5000);

    const unsubs = [];

    unsubs.push(
      onSnapshot(
        query(collection(db, "users"), orderBy("ecoPoints", "desc")),
        (snap) => {
          const data = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
          dataRef.current.users = data;
          setUsers(data);
          computeAndSetStats();
          setLoading(false);
        },
        () => setLoading(false),
      ),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, "reports"), orderBy("createdAt", "desc")),
        (snap) => {
          const data = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate(),
          }));
          dataRef.current.reports = data;
          setReports(data);
          computeAndSetStats();
        },
        () => {},
      ),
    );

    unsubs.push(
      onSnapshot(
        query(
          collection(db, "verificationReports"),
          orderBy("timestamp", "desc"),
          limit(100),
        ),
        (snap) => {
          const data = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            timestamp: d.data().timestamp?.toDate(),
          }));
          dataRef.current.verifications = data;
          setVerifications(data);
          computeAndSetStats();
        },
        () => {},
      ),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, "marketplace"), orderBy("createdAt", "desc")),
        (snap) => {
          const data = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate(),
          }));
          dataRef.current.marketplace = data;
          setMarketplace(data);
          computeAndSetStats();
        },
        () => {},
      ),
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, "events"), orderBy("date", "desc")),
        (snap) => {
          const data = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            date: d.data().date?.toDate(),
          }));
          dataRef.current.events = data;
          setEvents(data);
          computeAndSetStats();
          setLoading(false);
        },
        () => setLoading(false),
      ),
    );

    return () => {
      unsubs.forEach((u) => u());
      clearTimeout(timeout);
    };
  }, [userProfile]);

  const updateUserRole = async (userId, newRole) => {
    try {
      await firebaseService.updateUserProfile(userId, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
    } catch {
      toast.error("Failed to update user role");
    }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      await firebaseService.deleteReport(reportId);
      toast.success("Report deleted");
    } catch {
      toast.error("Failed to delete report");
    }
  };

  const verifyReport = async (reportId) => {
    try {
      await firebaseService.updateReportStatus(reportId, "verified");
      toast.success("Report verified");
    } catch {
      toast.error("Failed to verify report");
    }
  };

  const deleteListing = async (listingId) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await firebaseService.deleteListing(listingId);
      toast.success("Listing deleted");
    } catch {
      toast.error("Failed to delete listing");
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await firebaseService.deleteEvent(eventId);
      toast.success("Event deleted");
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (
      !eventData.title ||
      !eventData.description ||
      !eventData.location ||
      !eventData.date ||
      !eventData.time
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const eventToSave = {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        date: new Date(`${eventData.date}T${eventData.time}`),
        category: eventData.category,
        maxParticipants: parseInt(eventData.maxParticipants) || 0,
        participants: [],
        createdBy: currentUser.uid,
        createdAt: new Date(),
      };
      if (editingEvent) {
        await firebaseService.updateEvent(editingEvent.id, eventToSave);
        toast.success("Event updated!");
      } else {
        await firebaseService.createEvent(eventToSave);
        toast.success("Event created!");
      }
      setShowEventModal(false);
      setEditingEvent(null);
      setEventData({
        title: "",
        description: "",
        location: "",
        date: "",
        time: "",
        category: "cleanup",
        maxParticipants: "",
      });
    } catch {
      toast.error("Failed to save event");
    }
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    try {
      const targetUsers =
        notificationData.sendTo === "all"
          ? users
          : users.filter((u) => u.role === notificationData.sendTo);
      for (const user of targetUsers) {
        await firebaseService.createNotification(
          user.uid,
          notificationData.title,
          notificationData.message,
        );
      }
      toast.success(`Notification sent to ${targetUsers.length} users`);
      setShowNotificationModal(false);
      setNotificationData({ title: "", message: "", sendTo: "all" });
    } catch {
      toast.error("Failed to send notifications");
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-purple-100 text-purple-700",
      volunteer: "bg-blue-100 text-blue-700",
    };
    return (
      <span className={`badge ${styles[role] || "bg-gray-100 text-gray-700"}`}>
        {role || "student"}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      verified: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      rejected: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`badge ${styles[status] || "bg-gray-100 text-gray-700"}`}
      >
        {status}
      </span>
    );
  };

  const statCards = [
    {
      icon: Users,
      label: "Total Users",
      value: statistics.totalUsers,
      change: "+12%",
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: "up",
    },
    {
      icon: Activity,
      label: "Active Users",
      value: statistics.activeUsers,
      change: "this week",
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      icon: FileText,
      label: "Waste Reports",
      value: statistics.totalReports,
      subValue: `${statistics.pendingReports} pending`,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      icon: CheckCircle,
      label: "Verifications",
      value: statistics.totalVerifications,
      subValue: `${statistics.totalRecycled} recycled`,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: Package,
      label: "Marketplace",
      value: statistics.availableItems,
      subValue: `${statistics.totalMarketplaceItems} total`,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: Calendar,
      label: "Events",
      value: statistics.totalEvents,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      icon: Star,
      label: "Total Points",
      value: statistics.totalEcoPoints.toLocaleString(),
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      icon: TrendingUp,
      label: "Recycled Items",
      value: statistics.totalRecycled,
      subValue: `${statistics.totalUpcycled} upcycled`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  const eventCategories = [
    {
      value: "cleanup",
      label: "Cleanup Drive",
      color: "bg-green-100 text-green-700",
    },
    {
      value: "workshop",
      label: "Workshop",
      color: "bg-blue-100 text-blue-700",
    },
    {
      value: "seminar",
      label: "Seminar",
      color: "bg-purple-100 text-purple-700",
    },
    {
      value: "campaign",
      label: "Campaign",
      color: "bg-orange-100 text-orange-700",
    },
    {
      value: "competition",
      label: "Competition",
      color: "bg-pink-100 text-pink-700",
    },
  ];

  if (userProfile?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-500 mt-2">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={28} className="text-primary-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()} • Real-time data
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEventModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Create Event
          </button>
          <button
            onClick={() => setShowNotificationModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Bell size={18} /> Broadcast
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}
              >
                <stat.icon size={18} className={stat.color} />
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
                {stat.change && (
                  <div
                    className={`text-xs flex items-center gap-1 justify-end ${stat.trend === "up" ? "text-green-600" : "text-gray-500"}`}
                  >
                    {stat.trend === "up" && <TrendingUp size={10} />}
                    {stat.change}
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
            {stat.subValue && (
              <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex flex-wrap gap-1">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "users", label: "Users", icon: Users },
          { id: "reports", label: "Reports", icon: FileText },
          { id: "marketplace", label: "Marketplace", icon: Package },
          { id: "events", label: "Events", icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {(activeTab === "users" || activeTab === "reports") && (
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-primary-600" /> Recent
              Activity
            </h3>
            <div className="space-y-3">
              {verifications.slice(0, 5).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600">
                    {v.userName} verified {v.itemName}
                  </span>
                  <span className="text-green-600 font-medium">
                    +{v.ecoPointsAwarded} pts
                  </span>
                </div>
              ))}
              {verifications.length === 0 && (
                <p className="text-gray-400 text-sm">No activity yet</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award size={18} className="text-yellow-500" /> Top Users
            </h3>
            <div className="space-y-3">
              {users.slice(0, 5).map((u, i) => (
                <div key={u.uid} className="flex items-center gap-3 text-sm">
                  <span className="w-6 text-center font-bold text-gray-400">
                    #{i + 1}
                  </span>
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-xs">
                    {u.fullname?.charAt(0) || "U"}
                  </div>
                  <span className="flex-1 text-gray-700">{u.fullname}</span>
                  <span className="text-green-600 font-semibold">
                    {u.ecoPoints || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "User",
                    "Department",
                    "Role",
                    "Points",
                    "Joined",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users
                  .filter(
                    (u) =>
                      u.fullname
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
                  )
                  .map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-semibold">
                              {user.fullname?.charAt(0) || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.fullname}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.department || "-"}
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-600">
                          {user.ecoPoints || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(
                              user.createdAt?.toDate?.() || user.createdAt,
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role || "student"}
                          onChange={(e) =>
                            updateUserRole(user.uid, e.target.value)
                          }
                          className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                        >
                          <option value="student">Student</option>
                          <option value="volunteer">Volunteer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "User",
                    "Type",
                    "Description",
                    "Status",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports
                  .filter(
                    (r) =>
                      r.wasteType
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      r.userName
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                  )
                  .map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {report.userName || "Anonymous"}
                      </td>
                      <td className="px-6 py-4 text-sm capitalize">
                        {report.wasteType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {report.description}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {report.status === "pending" && (
                            <button
                              onClick={() => verifyReport(report.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Verify"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteReport(report.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Marketplace Tab */}
      {activeTab === "marketplace" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "Item",
                    "Owner",
                    "Category",
                    "Status",
                    "Points",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {marketplace.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package size={16} className="text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.ownerName || "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">
                      {item.category}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${item.status === "available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      {item.ecoValue || 5} pts
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteListing(item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      eventCategories.find((c) => c.value === event.category)
                        ?.color || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {eventCategories.find((c) => c.value === event.category)
                      ?.label || "Event"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setEventData({
                          title: event.title,
                          description: event.description,
                          location: event.location,
                          date: event.date
                            ? new Date(event.date).toISOString().split("T")[0]
                            : "",
                          time: event.date
                            ? new Date(event.date).toTimeString().slice(0, 5)
                            : "",
                          category: event.category,
                          maxParticipants:
                            event.maxParticipants?.toString() || "",
                        });
                        setShowEventModal(true);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {event.description}
                </p>
                <div className="space-y-1 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>
                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : "TBD"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{event.participants?.length || 0} participants</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {events.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No events yet
              </h3>
              <p className="text-gray-500">
                Create your first event to engage the campus community
              </p>
              <button
                onClick={() => setShowEventModal(true)}
                className="btn-primary mt-4 inline-flex items-center gap-2"
              >
                <Plus size={18} /> Create Event
              </button>
            </div>
          )}
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h2>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="input-label">Event Title *</label>
                <input
                  type="text"
                  value={eventData.title}
                  onChange={(e) =>
                    setEventData({ ...eventData, title: e.target.value })
                  }
                  className="input-field"
                  placeholder="Campus Cleanup Day"
                  required
                />
              </div>
              <div>
                <label className="input-label">Description *</label>
                <textarea
                  value={eventData.description}
                  onChange={(e) =>
                    setEventData({ ...eventData, description: e.target.value })
                  }
                  className="input-field resize-none"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="input-label">Location *</label>
                <input
                  type="text"
                  value={eventData.location}
                  onChange={(e) =>
                    setEventData({ ...eventData, location: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Date *</label>
                  <input
                    type="date"
                    value={eventData.date}
                    onChange={(e) =>
                      setEventData({ ...eventData, date: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Time *</label>
                  <input
                    type="time"
                    value={eventData.time}
                    onChange={(e) =>
                      setEventData({ ...eventData, time: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Category</label>
                  <select
                    value={eventData.category}
                    onChange={(e) =>
                      setEventData({ ...eventData, category: e.target.value })
                    }
                    className="input-field"
                  >
                    {eventCategories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Max Participants</label>
                  <input
                    type="number"
                    value={eventData.maxParticipants}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        maxParticipants: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingEvent ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Send Broadcast Notification</h2>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={sendNotification} className="p-6 space-y-4">
              <div>
                <label className="input-label">Send to</label>
                <select
                  value={notificationData.sendTo}
                  onChange={(e) =>
                    setNotificationData({
                      ...notificationData,
                      sendTo: e.target.value,
                    })
                  }
                  className="input-field"
                >
                  <option value="all">
                    All Users ({statistics.totalUsers})
                  </option>
                  <option value="student">Students Only</option>
                  <option value="volunteer">Volunteers Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
              <div>
                <label className="input-label">Title</label>
                <input
                  type="text"
                  value={notificationData.title}
                  onChange={(e) =>
                    setNotificationData({
                      ...notificationData,
                      title: e.target.value,
                    })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">Message</label>
                <textarea
                  value={notificationData.message}
                  onChange={(e) =>
                    setNotificationData({
                      ...notificationData,
                      message: e.target.value,
                    })
                  }
                  className="input-field resize-none"
                  rows="4"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
