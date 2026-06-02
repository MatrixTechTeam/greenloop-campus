// src/pages/Profile.jsx - Completely fixed version
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit2, 
  Save, 
  X,
  Camera,
  Leaf,
  Award,
  TrendingUp,
  Recycle,
  Star,
  CheckCircle,
  MapPin,
  Phone,
  Globe,
  LogOut,
  Link as LinkIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const { currentUser, userProfile, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalVerifications: 0,
    totalReports: 0,
    totalListings: 0,
    totalEventsJoined: 0,
    monthlyPoints: 0,
    rank: 0,
  });
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
  });

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
        
        setUserStats({
          totalVerifications: verifications.length,
          totalReports: myReports.length,
          totalListings: myListings.length,
          totalEventsJoined: joinedEvents.length,
          monthlyPoints,
          rank,
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };
    
    fetchUserStats();
  }, [currentUser]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const statCards = [
    { icon: CheckCircle, label: 'Items Verified', value: userStats.totalVerifications, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Recycle, label: 'Waste Reports', value: userStats.totalReports, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Award, label: 'Items Shared', value: userStats.totalListings, color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Calendar, label: 'Events Joined', value: userStats.totalEventsJoined, color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: TrendingUp, label: 'Monthly Points', value: userStats.monthlyPoints, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Star, label: 'Global Rank', value: `#${userStats.rank}`, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

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
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              {userProfile.profilePicture ? (
                <img src={userProfile.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <span className="text-4xl font-bold">{userProfile.fullname?.charAt(0) || 'U'}</span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg">
              <Camera size={14} className="text-primary-600" />
            </button>
          </div>
          
          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h1 className="text-2xl font-bold">{userProfile.fullname}</h1>
              <span className="text-2xl">{getBadgeIcon(userProfile.badge)}</span>
            </div>
            <p className="opacity-90 mt-1">{userProfile.email}</p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {userProfile.department || 'Student'}
              </span>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {userProfile.ecoPoints || 0} Points
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <User size={18} className="text-primary-600" />
                Personal Information
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    className="input-field bg-gray-50"
                    disabled
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!isEditing}
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
                </div>
                <div>
                  <label className="input-label">Faculty</label>
                  <select
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleChange}
                    className="input-field"
                    disabled={!isEditing}
                  >
                    <option value="">Select Faculty</option>
                    <option value="Engineering">Faculty of Engineering</option>
                    <option value="Science">Faculty of Science</option>
                    <option value="Social Sciences">Faculty of Social Sciences</option>
                    <option value="Arts">Faculty of Arts</option>
                    <option value="Management">Faculty of Management</option>
                    <option value="Agriculture">Faculty of Agriculture</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Optional"
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="input-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Optional"
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div>
                <label className="input-label">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="input-field resize-none"
                  rows="3"
                  placeholder="Tell us about your sustainability journey..."
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <label className="input-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Campus, City"
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <label className="input-label">Website / Portfolio</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://..."
                  disabled={!isEditing}
                />
              </div>
              
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
                    {loading ? <div className="spinner-sm"></div> : <Save size={16} />}
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Badge Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="text-6xl mb-3">{getBadgeIcon(userProfile.badge)}</div>
            <h3 className="font-semibold text-gray-900">{userProfile.badge || 'Eco Rookie'}</h3>
            <p className="text-sm text-gray-500 mt-1">Sustainability Level</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm mb-1">
                <span>Next Level</span>
                <span>{userProfile.ecoPoints || 0}/500</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((userProfile.ecoPoints || 0) / 500) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Join Date */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <Calendar size={18} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900">
                  {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '2024'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Website Link */}
          {formData.website && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Globe size={18} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Website</p>
                  <a 
                    href={formData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline truncate block"
                  >
                    {formData.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-primary-50 to-emerald-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/verify" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors">
                <CheckCircle size={14} />
                Verify a new item
              </Link>
              <Link to="/marketplace" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors">
                <Award size={14} />
                List an item for exchange
              </Link>
              <Link to="/events" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors">
                <Calendar size={14} />
                Join upcoming events
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary-600 transition-colors">
                <TrendingUp size={14} />
                Check leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;