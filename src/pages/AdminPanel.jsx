// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebaseService';
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
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
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
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    sendTo: 'all', // all, students, volunteers, admins
  });

  useEffect(() => {
    if (userProfile?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    fetchAllData();
  }, [userProfile]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all users
      const leaderboard = await firebaseService.getLeaderboard(1000);
      setUsers(leaderboard);
      
      // Fetch reports
      const allReports = await firebaseService.getReports();
      setReports(allReports);
      
      // Fetch verifications
      const allVerifications = await firebaseService.getAllVerifications();
      setVerifications(allVerifications);
      
      // Fetch marketplace
      const marketplaceItems = await firebaseService.getMarketplaceListings();
      setMarketplace(marketplaceItems);
      
      // Fetch events
      const allEvents = await firebaseService.getAllEvents();
      setEvents(allEvents);
      
      // Calculate statistics
      let totalEcoPoints = 0;
      let totalRecycled = 0;
      let totalUpcycled = 0;
      
      users.forEach(user => {
        totalEcoPoints += user.ecoPoints || 0;
      });
      
      verifications.forEach(ver => {
        if (ver.selectedStatus === 'Recycled') totalRecycled++;
        if (ver.selectedStatus === 'Upcycled') totalUpcycled++;
      });
      
      setStatistics({
        totalUsers: users.length,
        totalReports: allReports.length,
        totalVerifications: allVerifications.length,
        totalMarketplaceItems: marketplaceItems.length,
        totalEvents: allEvents.length,
        totalEcoPoints,
        totalRecycled,
        totalUpcycled,
      });
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await firebaseService.updateUserProfile(userId, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchAllData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const deleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await firebaseService.deleteReport(reportId);
        toast.success('Report deleted');
        fetchAllData();
      } catch (error) {
        console.error('Error deleting report:', error);
        toast.error('Failed to delete report');
      }
    }
  };

  const verifyReport = async (reportId) => {
    try {
      await firebaseService.updateReportStatus(reportId, 'verified');
      toast.success('Report verified');
      fetchAllData();
    } catch (error) {
      console.error('Error verifying report:', error);
      toast.error('Failed to verify report');
    }
  };

  const deleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await firebaseService.deleteListing(listingId);
        toast.success('Listing deleted');
        fetchAllData();
      } catch (error) {
        console.error('Error deleting listing:', error);
        toast.error('Failed to delete listing');
      }
    }
  };

  const deleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await firebaseService.deleteEvent(eventId);
        toast.success('Event deleted');
        fetchAllData();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    try {
      let targetUsers = [];
      if (notificationData.sendTo === 'all') {
        targetUsers = users;
      } else {
        targetUsers = users.filter(u => u.role === notificationData.sendTo);
      }
      
      for (const user of targetUsers) {
        await firebaseService.createNotification(
          user.uid,
          notificationData.title,
          notificationData.message
        );
      }
      
      toast.success(`Notification sent to ${targetUsers.length} users`);
      setShowNotificationModal(false);
      setNotificationData({ title: '', message: '', sendTo: 'all' });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notifications');
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <span className="badge bg-purple-100 text-purple-700">Admin</span>;
      case 'volunteer': return <span className="badge bg-blue-100 text-blue-700">Volunteer</span>;
      default: return <span className="badge bg-gray-100 text-gray-700">Student</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified': return <span className="badge bg-green-100 text-green-700">Verified</span>;
      case 'pending': return <span className="badge bg-yellow-100 text-yellow-700">Pending</span>;
      case 'rejected': return <span className="badge bg-red-100 text-red-700">Rejected</span>;
      default: return <span className="badge bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = reports.filter(report =>
    report.wasteType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statCards = [
    { icon: Users, label: 'Total Users', value: statistics.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: FileText, label: 'Waste Reports', value: statistics.totalReports, color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: CheckCircle, label: 'Verifications', value: statistics.totalVerifications, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Package, label: 'Marketplace', value: statistics.totalMarketplaceItems, color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Calendar, label: 'Events', value: statistics.totalEvents, color: 'text-pink-600', bg: 'bg-pink-50' },
    { icon: Star, label: 'Total Eco Points', value: statistics.totalEcoPoints, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: TrendingUp, label: 'Recycled Items', value: statistics.totalRecycled, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Award, label: 'Upcycled Items', value: statistics.totalUpcycled, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-500 mt-2">You don't have permission to access this page.</p>
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
            Admin Panel
          </h1>
          <p className="text-gray-500 mt-1">Manage users, reports, and platform content</p>
        </div>
        <button
          onClick={() => setShowNotificationModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Bell size={18} />
          Send Notification
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            </div>
            <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex flex-wrap gap-1">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'verifications', label: 'Verifications', icon: CheckCircle },
          { id: 'marketplace', label: 'Marketplace', icon: Package },
          { id: 'events', label: 'Events', icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      {(activeTab === 'users' || activeTab === 'reports') && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-semibold">{user.fullname?.charAt(0) || 'U'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.fullname}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.department || '-'}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">{user.ecoPoints || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <select
                          value={user.role || 'student'}
                          onChange={(e) => updateUserRole(user.uid, e.target.value)}
                          className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                        >
                          <option value="student">Student</option>
                          <option value="volunteer">Volunteer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{report.userName || 'Anonymous'}</td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm">{report.wasteType}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {report.description}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => verifyReport(report.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Verify"
                        >
                          <Check size={16} />
                        </button>
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

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Send Broadcast Notification</h2>
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
                  onChange={(e) => setNotificationData({ ...notificationData, sendTo: e.target.value })}
                  className="input-field"
                >
                  <option value="all">All Users</option>
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
                  onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                  className="input-field"
                  placeholder="Notification title"
                  required
                />
              </div>
              
              <div>
                <label className="input-label">Message</label>
                <textarea
                  value={notificationData.message}
                  onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                  className="input-field resize-none"
                  rows="4"
                  placeholder="Notification message"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowNotificationModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Send size={16} />
                  Send Broadcast
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