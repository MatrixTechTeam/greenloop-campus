// src/pages/MobileProfile.jsx - Fix missing ChevronRight import
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { 
  User, Mail, Calendar, Edit2, Save, X, Camera, Leaf, Award, 
  TrendingUp, Recycle, Star, CheckCircle, MapPin, Phone, Globe, 
  LogOut, Settings, Heart, Clock, Trophy, BookOpen, Briefcase, 
  GraduationCap, Shield, Zap, Flame, Gift, Bell, HelpCircle,
  Sparkles, CircleDot, RefreshCw, Moon, Sun, Smartphone, Lock,
  Trash2, Download, Share2, Info, ExternalLink, ChevronRight  // ← Add ChevronRight here
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const MobileProfile = () => {
  const { currentUser, userProfile, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showHelpSupport, setShowHelpSupport] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [userStats, setUserStats] = useState({
    totalVerifications: 0,
    totalReports: 0,
    totalListings: 0,
    totalEventsJoined: 0,
    monthlyPoints: 0,
    rank: 0,
    streak: 0,
    badges: [],
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    department: '',
    faculty: '',
    studentId: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    interests: [],
  });

  const interestsList = [
    'Recycling', 'Upcycling', 'Composting', 'Zero Waste', 
    'Plastic Free', 'Renewable Energy', 'Conservation', 'Education'
  ];

  // Load user preferences from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedPushEnabled = localStorage.getItem('pushNotifications') !== 'false';
    const savedEmailEnabled = localStorage.getItem('emailNotifications') !== 'false';
    
    setDarkMode(savedDarkMode);
    setPushEnabled(savedPushEnabled);
    setEmailEnabled(savedEmailEnabled);
    
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullname: userProfile.fullname || '',
        email: userProfile.email || '',
        department: userProfile.department || '',
        faculty: userProfile.faculty || '',
        studentId: userProfile.studentId || '',
        phone: userProfile.phone || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
        interests: userProfile.interests || [],
      });
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!currentUser) return;
      
      try {
        const verifications = await firebaseService.getVerificationHistory(currentUser.uid);
        const reports = await firebaseService.getReports();
        const myReports = reports.filter(r => r.userId === currentUser.uid);
        const myListings = await firebaseService.getMyListings(currentUser.uid);
        const events = await firebaseService.getUpcomingEvents();
        const joinedEvents = events.filter(e => e.participants?.includes(currentUser.uid));
        const leaderboard = await firebaseService.getLeaderboard();
        const rank = leaderboard.findIndex(u => u.uid === currentUser.uid) + 1;
        
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        const monthlyPoints = verifications
          .filter(v => v.timestamp && new Date(v.timestamp) >= oneMonthAgo)
          .reduce((sum, v) => sum + (v.ecoPointsAwarded || 0), 0);
        
        const activityDates = verifications.map(v => 
          new Date(v.timestamp).toDateString()
        ).filter((v, i, a) => a.indexOf(v) === i);
        let streak = 0;
        let currentDate = new Date();
        while (activityDates.includes(currentDate.toDateString())) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        }
        
        const badges = [];
        if ((userProfile?.ecoPoints || 0) >= 100) badges.push({ name: '100 Points Club', icon: '⭐', color: 'bg-green-100' });
        if ((userProfile?.ecoPoints || 0) >= 500) badges.push({ name: '500 Points Club', icon: '🌟', color: 'bg-green-100' });
        if (verifications.length >= 10) badges.push({ name: 'Verification Master', icon: '✅', color: 'bg-green-100' });
        if (joinedEvents.length >= 5) badges.push({ name: 'Event Champion', icon: '🎪', color: 'bg-green-100' });
        if (myListings.length >= 5) badges.push({ name: 'Generous Donor', icon: '🎁', color: 'bg-green-100' });
        if (streak >= 7) badges.push({ name: 'Weekly Warrior', icon: '🔥', color: 'bg-green-100' });
        
        setUserStats({
          totalVerifications: verifications.length,
          totalReports: myReports.length,
          totalListings: myListings.length,
          totalEventsJoined: joinedEvents.length,
          monthlyPoints,
          rank,
          streak,
          badges,
        });
        
        setRecentActivity(verifications.slice(0, 5));
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };
    
    fetchUserStats();
  }, [currentUser, userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest) => {
    if (formData.interests.includes(interest)) {
      setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
    } else {
      setFormData({ ...formData, interests: [...formData.interests, interest] });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast.success(newDarkMode ? 'Dark mode enabled' : 'Light mode enabled');
  };

  const togglePushNotifications = () => {
    const newState = !pushEnabled;
    setPushEnabled(newState);
    localStorage.setItem('pushNotifications', newState);
    toast.success(newState ? 'Push notifications enabled' : 'Push notifications disabled');
  };

  const toggleEmailNotifications = () => {
    const newState = !emailEnabled;
    setEmailEnabled(newState);
    localStorage.setItem('emailNotifications', newState);
    toast.success(newState ? 'Email notifications enabled' : 'Email notifications disabled');
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all cached data? This will log you out.')) {
      localStorage.clear();
      sessionStorage.clear();
      await logout();
      navigate('/login');
      toast.success('Cache cleared successfully');
    }
  };

  const handleExportData = async () => {
    try {
      const data = {
        profile: userProfile,
        stats: userStats,
        recentActivity: recentActivity,
        exportDate: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `greenloop-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleShareProfile = () => {
    const text = `🌱 Join me on GreenLoop! I've earned ${userProfile?.ecoPoints || 0} Eco Points and I'm ranked #${userStats.rank} on the leaderboard. Download GreenLoop to start your sustainability journey!`;
    if (navigator.share) {
      navigator.share({ title: 'GreenLoop Profile', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Profile link copied to clipboard');
    }
  };

  const getBadgeIcon = (badge) => {
    if (badge?.includes('Campus Legend')) return '🏆';
    if (badge?.includes('Sustainability Leader')) return '🌟';
    if (badge?.includes('Green Champion')) return '💚';
    if (badge?.includes('Eco Hero')) return '⭐';
    if (badge?.includes('Eco Explorer')) return '🌱';
    return '🌿';
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const statCards = [
    { icon: CheckCircle, label: 'Verified', value: userStats.totalVerifications, color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Recycle, label: 'Reports', value: userStats.totalReports, color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Gift, label: 'Shared', value: userStats.totalListings, color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Calendar, label: 'Events', value: userStats.totalEventsJoined, color: 'text-green-600', bg: 'bg-green-100' },
    { icon: TrendingUp, label: 'Monthly', value: userStats.monthlyPoints, color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Trophy, label: 'Rank', value: `#${userStats.rank}`, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-5 pb-20">
      {/* Profile Header Card - Green Gradient */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              {userProfile.profilePicture ? (
                <img src={userProfile.profilePicture} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{userProfile.fullname?.charAt(0) || 'U'}</span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg">
              <Camera size={14} className="text-green-600" />
            </button>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white/20 rounded-full active:scale-95 transition-transform hover:bg-white/30"
          >
            <Settings size={18} className="text-white" />
          </button>
        </div>
        
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white">{userProfile.fullname}</h1>
            <span className="text-2xl">{getBadgeIcon(userProfile.badge)}</span>
          </div>
          <p className="text-sm text-green-100 mt-0.5">{userProfile.email}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
              {userProfile.department || 'Student'}
            </span>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">
              {userProfile.ecoPoints || 0} Points
            </span>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white flex items-center gap-1">
              <Flame size={10} /> {userStats.streak} day streak
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid - White Cards with Green Accents */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-3 shadow-sm border border-green-100 text-center">
            <div className={`w-8 h-8 ${stat.bg} rounded-full flex items-center justify-center mx-auto mb-2`}>
              <stat.icon size={14} className={stat.color} />
            </div>
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            <p className="text-[10px] text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress to Next Badge */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-green-600" />
            <span className="text-sm font-semibold text-gray-900">Next Badge</span>
          </div>
          <span className="text-xs text-gray-500">{userProfile?.ecoPoints || 0}/500 points</span>
        </div>
        <div className="h-2 bg-green-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-600 rounded-full transition-all"
            style={{ width: `${Math.min(100, ((userProfile?.ecoPoints || 0) / 500) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-green-600 mt-2">
          {500 - (userProfile?.ecoPoints || 0)} more points to reach Sustainability Leader!
        </p>
      </div>

      {/* Badges Section */}
      {userStats.badges.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            <Star size={16} className="text-green-600" />
            <h3 className="font-semibold text-gray-900 text-sm">Achievement Badges</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {userStats.badges.map((badge, idx) => (
              <div key={idx} className="bg-green-50 rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-green-200">
                <span className="text-sm">{badge.icon}</span>
                <span className="text-xs font-medium text-green-700">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Info Section */}
      <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-green-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User size={16} className="text-green-600" />
            <h2 className="font-semibold text-gray-900 text-base">Personal Information</h2>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="text-green-600 active:scale-95 transition-transform">
              <Edit2 size={16} />
            </button>
          )}
        </div>
        
        {!isEditing ? (
          <div className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <GraduationCap size={14} className="text-green-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-sm text-gray-800">{userProfile.department || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase size={14} className="text-green-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Faculty</p>
                <p className="text-sm text-gray-800">{userProfile.faculty || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen size={14} className="text-green-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Student ID</p>
                <p className="text-sm text-gray-800">{userProfile.studentId || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={14} className="text-green-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm text-gray-800">{userProfile.phone || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={14} className="text-green-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm text-gray-800">{userProfile.location || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe size={14} className="text-green-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Bio</p>
                <p className="text-sm text-gray-800">{userProfile.bio || 'No bio yet'}</p>
              </div>
            </div>
            {userProfile.website && (
              <div className="flex items-start gap-3">
                <Globe size={14} className="text-green-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Website</p>
                  <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:text-green-700">
                    {userProfile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
              className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
              placeholder="Full Name"
            />
            <select
              name="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Environmental Science">Environmental Science</option>
              <option value="Business">Business</option>
              <option value="Arts">Arts</option>
              <option value="Sciences">Sciences</option>
              <option value="Other">Other</option>
            </select>
            <select
              name="faculty"
              value={formData.faculty}
              onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
              className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
            >
              <option value="">Select Faculty</option>
              <option value="Engineering">Faculty of Engineering</option>
              <option value="Science">Faculty of Science</option>
              <option value="Social Sciences">Faculty of Social Sciences</option>
              <option value="Arts">Faculty of Arts</option>
              <option value="Management">Faculty of Management</option>
              <option value="Agriculture">Faculty of Agriculture</option>
            </select>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm"
              placeholder="Student ID (optional)"
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm"
              placeholder="Phone Number (optional)"
            />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm"
              placeholder="Location (optional)"
            />
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm"
              placeholder="Website (optional)"
            />
            <textarea
              name="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm resize-none"
              rows="2"
              placeholder="Tell us about yourself..."
            />
            
            {/* Interests Section */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">Interests</label>
              <div className="flex flex-wrap gap-2">
                {interestsList.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      formData.interests.includes(interest)
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 text-gray-700 border border-green-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-green-600 text-white font-medium py-2 rounded-lg text-sm hover:bg-green-700 transition-colors" disabled={loading}>
                {loading ? <div className="spinner-sm mx-auto" /> : <><Save size={14} className="inline mr-1" /> Save</>}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-green-50 text-green-700 font-medium py-2 rounded-lg text-sm border border-green-200">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-green-100">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-green-600" />
            <h2 className="font-semibold text-gray-900 text-base">Recent Activity</h2>
          </div>
        </div>
        <div className="divide-y divide-green-50">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles size={20} className="text-green-400" />
              </div>
              <p className="text-sm text-gray-500">No activity yet</p>
              <button onClick={() => navigate('/verify')} className="text-sm text-green-600 font-medium mt-2 hover:text-green-700">
                Start verifying →
              </button>
            </div>
          ) : (
            recentActivity.map((item, idx) => (
              <div key={idx} className="px-5 py-3 flex items-center justify-between hover:bg-green-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.itemName || 'Item Verified'}</p>
                    <p className="text-xs text-gray-400">
                      {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-green-600">+{item.ecoPointsAwarded || 10}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => {
                setShowSettings(false);
                setShowNotificationSettings(false);
                setShowPrivacySettings(false);
                setShowHelpSupport(false);
              }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-green-100">
                  <h2 className="text-lg font-bold text-green-700">Settings</h2>
                  <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-green-50 rounded-full transition-colors">
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                
                {/* Notification Settings */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowNotificationSettings(!showNotificationSettings);
                      setShowPrivacySettings(false);
                      setShowHelpSupport(false);
                    }}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-xl w-full hover:bg-green-100 transition-colors"
                  >
                    <Bell size={20} className="text-green-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 text-sm">Notifications</p>
                      <p className="text-xs text-gray-500">Manage your notification preferences</p>
                    </div>
                    <ChevronRight size={16} className="text-green-500" />
                  </button>
                  
                  {/* Expanded Notification Settings */}
                  <AnimatePresence>
                    {showNotificationSettings && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-12 pr-3"
                      >
                        <div className="space-y-2 pb-2">
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Push Notifications</p>
                              <p className="text-xs text-gray-400">Get real-time updates</p>
                            </div>
                            <button
                              onClick={togglePushNotifications}
                              className={`w-10 h-5 rounded-full transition-all ${pushEnabled ? 'bg-green-600' : 'bg-gray-300'}`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-0.5 ${pushEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                              <p className="text-xs text-gray-400">Receive weekly summaries</p>
                            </div>
                            <button
                              onClick={toggleEmailNotifications}
                              className={`w-10 h-5 rounded-full transition-all ${emailEnabled ? 'bg-green-600' : 'bg-gray-300'}`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-0.5 ${emailEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Privacy & Security */}
                  <button
                    onClick={() => {
                      setShowPrivacySettings(!showPrivacySettings);
                      setShowNotificationSettings(false);
                      setShowHelpSupport(false);
                    }}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-xl w-full hover:bg-green-100 transition-colors"
                  >
                    <Shield size={20} className="text-green-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 text-sm">Privacy & Security</p>
                      <p className="text-xs text-gray-500">Manage your privacy settings</p>
                    </div>
                    <ChevronRight size={16} className="text-green-500" />
                  </button>
                  
                  {/* Expanded Privacy Settings */}
                  <AnimatePresence>
                    {showPrivacySettings && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-12 pr-3"
                      >
                        <div className="space-y-2 pb-2">
                          <button
                            onClick={handleExportData}
                            className="flex items-center justify-between w-full py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-700">Export My Data</p>
                              <p className="text-xs text-gray-400">Download your information</p>
                            </div>
                            <Download size={16} className="text-green-600" />
                          </button>
                          <button
                            onClick={handleClearData}
                            className="flex items-center justify-between w-full py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-700">Clear Cache</p>
                              <p className="text-xs text-gray-400">Remove locally stored data</p>
                            </div>
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Help & Support */}
                  <button
                    onClick={() => {
                      setShowHelpSupport(!showHelpSupport);
                      setShowNotificationSettings(false);
                      setShowPrivacySettings(false);
                    }}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-xl w-full hover:bg-green-100 transition-colors"
                  >
                    <HelpCircle size={20} className="text-green-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 text-sm">Help & Support</p>
                      <p className="text-xs text-gray-500">Get help or contact support</p>
                    </div>
                    <ChevronRight size={16} className="text-green-500" />
                  </button>
                  
                  {/* Expanded Help & Support */}
                  <AnimatePresence>
                    {showHelpSupport && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-12 pr-3"
                      >
                        <div className="space-y-2 pb-2">
                          <a
                            href="mailto:support@greenloop.com"
                            className="flex items-center justify-between w-full py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-700">Email Support</p>
                              <p className="text-xs text-gray-400">support@greenloop.com</p>
                            </div>
                            <ExternalLink size={16} className="text-green-600" />
                          </a>
                          <Link
                            to="/faq"
                            className="flex items-center justify-between w-full py-2"
                            onClick={() => setShowSettings(false)}
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-700">FAQ</p>
                              <p className="text-xs text-gray-400">Frequently asked questions</p>
                            </div>
                            <ChevronRight size={16} className="text-green-600" />
                          </Link>
                          <Link
                            to="/terms"
                            className="flex items-center justify-between w-full py-2"
                            onClick={() => setShowSettings(false)}
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-700">Terms of Service</p>
                              <p className="text-xs text-gray-400">Read our terms</p>
                            </div>
                            <ChevronRight size={16} className="text-green-600" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Share Profile */}
                  <button
                    onClick={handleShareProfile}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-xl w-full hover:bg-green-100 transition-colors"
                  >
                    <Share2 size={20} className="text-green-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 text-sm">Share Profile</p>
                      <p className="text-xs text-gray-500">Share your achievements</p>
                    </div>
                  </button>

                  {/* About */}
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <Info size={20} className="text-green-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 text-sm">About GreenLoop</p>
                      <p className="text-xs text-gray-500">Version 2.0.0</p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="mt-4 pt-3 border-t border-green-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 bg-red-50 rounded-xl w-full hover:bg-red-100 transition-colors"
                  >
                    <LogOut size={20} className="text-red-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-red-600 text-sm">Logout</p>
                      <p className="text-xs text-red-400">Sign out of your account</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileProfile;