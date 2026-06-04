import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useAuth } from "../context/AuthContext";
import { firebaseService } from "../services/firebaseService";
import {
  Leaf,
  TrendingUp,
  Users,
  Recycle,
  Award,
  Calendar,
  ShoppingBag,
  ArrowRight,
  CheckCircle,
  Trophy,
  FileText,
  Camera,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const StatCard = memo(({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div
        className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center`}
      >
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <span className="text-2xl font-bold text-gray-900">{value}</span>
    </div>
    <p className="text-gray-500 text-sm mt-2">{label}</p>
  </div>
));

const VerificationItem = memo(({ item }) => (
  <div className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
    <div>
      <p className="font-medium text-gray-900">
        {item.itemName || "Item Verified"}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {item.timestamp
          ? new Date(item.timestamp).toLocaleDateString()
          : "Recent"}
      </p>
    </div>
    <div className="flex items-center gap-3">
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.selectedStatus === "Recycled"
            ? "bg-green-100 text-green-700"
            : item.selectedStatus === "Upcycled"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-blue-100 text-blue-700"
        }`}
      >
        {item.selectedStatus || "Verified"}
      </span>
      <span className="text-green-600 font-semibold">
        +{item.ecoPointsAwarded || 10}
      </span>
    </div>
  </div>
));

const MarketplaceItem = memo(({ item }) => (
  <div className="p-4 hover:bg-gray-50">
    <h3 className="font-medium text-gray-900">{item.title}</h3>
    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
      {item.description}
    </p>
    <div className="flex justify-between items-center mt-3">
      <span className="text-xs text-gray-400">{item.category}</span>
      <span className="text-green-600 font-semibold text-sm">
        {item.ecoValue || 5} pts
      </span>
    </div>
  </div>
));

const EventItem = memo(({ event }) => (
  <div className="p-4 hover:bg-gray-50">
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex flex-col items-center justify-center shrink-0">
        <span className="text-lg font-bold text-blue-600">
          {event.date ? new Date(event.date).getDate() : "?"}
        </span>
        <span className="text-xs text-blue-500">
          {event.date
            ? new Date(event.date).toLocaleString("default", { month: "short" })
            : ""}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{event.location}</p>
        <p className="text-xs text-gray-400 mt-1">
          {event.participants?.length || 0} participants
        </p>
      </div>
    </div>
  </div>
));

const LeaderboardItem = memo(({ user, idx, currentUserId }) => (
  <div
    className={`px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${user.uid === currentUserId ? "bg-green-50/50" : ""}`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
          idx === 0
            ? "bg-yellow-100 text-yellow-700"
            : idx === 1
              ? "bg-gray-100 text-gray-600"
              : idx === 2
                ? "bg-orange-100 text-orange-700"
                : "bg-gray-50 text-gray-500"
        }`}
      >
        {idx + 1}
      </div>
      <div>
        <p className="font-medium text-gray-900 text-sm">
          {user.fullname || "Anonymous"}
        </p>
        <p className="text-xs text-gray-500">{user.department || "Student"}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-semibold text-green-600">{user.ecoPoints || 0}</p>
      <p className="text-xs text-gray-400">pts</p>
    </div>
  </div>
));

const Dashboard = ({ onOpenScanner }) => {
  const { currentUser, userProfile } = useAuth();
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalReports: 0,
    totalVerifications: 0,
    totalMarketplaceItems: 0,
  });
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentMarketplace, setRecentMarketplace] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [stats, verifications, events, marketplace, leaderboardData] =
        await Promise.all([
          firebaseService.getStatistics(),
          firebaseService.getVerificationHistory(currentUser.uid),
          firebaseService.getUpcomingEvents(),
          firebaseService.getMarketplaceListings(),
          firebaseService.getLeaderboard(),
        ]);
      setStatistics(stats);
      setRecentVerifications(verifications.slice(0, 5));
      setUpcomingEvents(events.slice(0, 3));
      setRecentMarketplace(marketplace.slice(0, 4));
      setLeaderboard(leaderboardData.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const userRank = useMemo(() => {
    const idx = leaderboard.findIndex((u) => u.uid === currentUser?.uid);
    return idx === -1 ? "—" : `#${idx + 1}`;
  }, [leaderboard, currentUser]);

  const statsCards = useMemo(
    () => [
      {
        icon: Leaf,
        label: "Eco Points",
        value: userProfile?.ecoPoints || 0,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        icon: Recycle,
        label: "Items Recycled",
        value: statistics.totalVerifications || 0,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        icon: TrendingUp,
        label: "Carbon Saved",
        value: `${Math.floor((statistics.totalVerifications || 0) * 2.5)} kg`,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        icon: Users,
        label: "Global Rank",
        value: userRank,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
    ],
    [userProfile?.ecoPoints, statistics.totalVerifications, userRank],
  );

  const milestone = useMemo(() => {
    const pts = userProfile?.ecoPoints || 0;
    if (pts < 50)
      return { points: 50, badge: "Eco Explorer", progress: (pts / 50) * 100 };
    if (pts < 100)
      return { points: 100, badge: "Eco Hero", progress: (pts / 100) * 100 };
    if (pts < 250)
      return {
        points: 250,
        badge: "Green Champion",
        progress: (pts / 250) * 100,
      };
    if (pts < 500)
      return {
        points: 500,
        badge: "Sustainability Leader",
        progress: (pts / 500) * 100,
      };
    if (pts < 1000)
      return {
        points: 1000,
        badge: "Campus Legend",
        progress: (pts / 1000) * 100,
      };
    return { points: pts, badge: "Campus Legend", progress: 100 };
  }, [userProfile?.ecoPoints]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back,{" "}
                {userProfile?.fullname?.split(" ")[0] || "Student"}!
              </h1>
              <p className="mt-1 opacity-90">
                Continue your sustainability journey
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                <Award size={14} />
                <span>{userProfile?.badge || "Eco Rookie"}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {userProfile?.ecoPoints || 0}
              </div>
              <div className="text-sm opacity-80">Total Points</div>
            </div>
          </div>
          {milestone.progress < 100 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Next: {milestone.badge}</span>
                <span>{Math.round(milestone.progress)}%</span>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${milestone.progress}%` }}
                />
              </div>
              <p className="text-xs opacity-80 mt-1">
                {milestone.points - (userProfile?.ecoPoints || 0)} more points
                to go!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Verifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                Recent Verifications
              </h2>
              <button
                onClick={onOpenScanner}
                className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <Sparkles size={14} />
                New Scan <ArrowRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentVerifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Recycle size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No verifications yet</p>
                  <button
                    onClick={onOpenScanner}
                    className="text-green-600 text-sm mt-2 inline-flex items-center gap-1 hover:underline"
                  >
                    <Sparkles size={14} />
                    Scan your first item →
                  </button>
                </div>
              ) : (
                recentVerifications.map((item, i) => (
                  <VerificationItem key={item.id || i} item={item} />
                ))
              )}
            </div>
          </div>

          {/* Recent Marketplace */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag size={18} className="text-purple-600" />
                Available for Exchange
              </h2>
              <Link
                to="/dashboard/marketplace"
                className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {recentMarketplace.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-gray-500">
                  <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No items available</p>
                  <Link
                    to="/dashboard/marketplace"
                    className="text-green-600 text-sm mt-2 inline-block"
                  >
                    List an item →
                  </Link>
                </div>
              ) : (
                recentMarketplace.map((item) => (
                  <MarketplaceItem key={item.id} item={item} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Upcoming Events
              </h2>
              <Link
                to="/dashboard/events"
                className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingEvents.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <EventItem key={event.id} event={event} />
                ))
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-600" />
                Top Eco Warriors
              </h2>
              <Link
                to="/dashboard/leaderboard"
                className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {leaderboard.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No data yet</p>
                </div>
              ) : (
                leaderboard.map((user, idx) => (
                  <LeaderboardItem
                    key={user.uid}
                    user={user}
                    idx={idx}
                    currentUserId={currentUser?.uid}
                  />
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenScanner}
                className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-all group"
              >
                <Sparkles
                  size={18}
                  className="mx-auto mb-1 text-green-600 group-hover:scale-110 transition-transform"
                />
                <p className="text-xs text-gray-700">AI Scan</p>
              </button>

              {/* ✅ FIXED: /dashboard/waste-report */}
              <Link
                to="/dashboard/waste-report"
                className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-all group"
              >
                <FileText
                  size={18}
                  className="mx-auto mb-1 text-green-600 group-hover:scale-110 transition-transform"
                />
                <p className="text-xs text-gray-700">Report Waste</p>
              </Link>

              <Link
                to="/dashboard/marketplace"
                className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-all group"
              >
                <ShoppingBag
                  size={18}
                  className="mx-auto mb-1 text-green-600 group-hover:scale-110 transition-transform"
                />
                <p className="text-xs text-gray-700">Exchange</p>
              </Link>
              <Link
                to="/dashboard/events"
                className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-all group"
              >
                <Calendar
                  size={18}
                  className="mx-auto mb-1 text-green-600 group-hover:scale-110 transition-transform"
                />
                <p className="text-xs text-gray-700">Join Event</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Dashboard);
