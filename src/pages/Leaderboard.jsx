// src/pages/Leaderboard.jsx - With dropdown filters and improved user info
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Award, 
  Users, 
  TrendingUp, 
  Calendar,
  Filter,
  Search,
  Star,
  Leaf,
  Target,
  Share2,
  Download,
  ChevronDown,
  User,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Globe,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [departmentLeaderboard, setDepartmentLeaderboard] = useState([]);
  const [facultyLeaderboard, setFacultyLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [sortBy, setSortBy] = useState('points'); // points, name, rank

  // Get unique departments and faculties from users
  const departments = ['all', ...new Set(leaderboard.map(u => u.department).filter(Boolean))];
  const faculties = ['all', ...new Set(leaderboard.map(u => u.faculty).filter(Boolean))];

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      const individualData = await firebaseService.getLeaderboard();
      setLeaderboard(individualData);
      
      const deptData = await firebaseService.getDepartmentLeaderboard();
      setDepartmentLeaderboard(deptData);
      
      const allUsers = await firebaseService.getLeaderboard(1000);
      const facultyMap = {};
      allUsers.forEach(user => {
        if (user.faculty) {
          if (!facultyMap[user.faculty]) {
            facultyMap[user.faculty] = { totalPoints: 0, count: 0, members: [] };
          }
          facultyMap[user.faculty].totalPoints += user.ecoPoints || 0;
          facultyMap[user.faculty].count += 1;
          facultyMap[user.faculty].members.push(user);
        }
      });
      
      const facultyList = Object.entries(facultyMap).map(([name, data]) => ({
        name,
        totalPoints: data.totalPoints,
        averagePoints: data.totalPoints / data.count,
        memberCount: data.count,
        members: data.members,
      })).sort((a, b) => b.averagePoints - a.averagePoints);
      
      setFacultyLeaderboard(facultyList);
      
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return null;
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-700';
    if (rank === 2) return 'bg-gray-100 text-gray-700';
    if (rank === 3) return 'bg-amber-100 text-amber-700';
    return 'bg-green-50 text-green-600';
  };

  const getPerformanceLabel = (points) => {
    if (points >= 1000) return { label: 'Legendary', color: 'text-purple-600', icon: '🏆' };
    if (points >= 500) return { label: 'Elite', color: 'text-yellow-600', icon: '⭐' };
    if (points >= 250) return { label: 'Advanced', color: 'text-blue-600', icon: '🌟' };
    if (points >= 100) return { label: 'Intermediate', color: 'text-green-600', icon: '🌱' };
    return { label: 'Beginner', color: 'text-gray-500', icon: '🌿' };
  };

  // Filter and sort leaderboard
  const filteredLeaderboard = leaderboard
    .filter(user => {
      const matchesSearch = user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.department?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
      const matchesFaculty = selectedFaculty === 'all' || user.faculty === selectedFaculty;
      return matchesSearch && matchesDepartment && matchesFaculty;
    })
    .sort((a, b) => {
      if (sortBy === 'points') return (b.ecoPoints || 0) - (a.ecoPoints || 0);
      if (sortBy === 'name') return (a.fullname || '').localeCompare(b.fullname || '');
      if (sortBy === 'rank') return (a.rank || 0) - (b.rank || 0);
      return 0;
    });

  const currentUserRank = leaderboard.findIndex(u => u.uid === currentUser?.uid) + 1;
  const currentUserEntry = leaderboard.find(u => u.uid === currentUser?.uid);

  const handleShare = async () => {
    const text = `🌍 I'm ranked #${currentUserRank} on GreenLoop Campus with ${currentUserEntry?.ecoPoints || 0} Eco Points! Join me in making our campus sustainable! ♻️`;
    try {
      await navigator.share?.({ title: 'My GreenLoop Rank', text }) || 
        navigator.clipboard.writeText(text);
      toast.success('Rank shared!');
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleDownloadReport = () => {
    const report = leaderboard.map((user, idx) => ({
      Rank: idx + 1,
      Name: user.fullname,
      Department: user.department,
      Faculty: user.faculty,
      'Eco Points': user.ecoPoints,
      Badge: user.badge,
      'Student ID': user.studentId || 'N/A',
      Phone: user.phone || 'N/A',
      Location: user.location || 'N/A',
    }));
    
    const csv = [Object.keys(report[0]).join(','), ...report.map(row => Object.values(row).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `greenloop-leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  const handleViewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // User Details Modal Component
  const UserDetailsModal = () => {
    if (!selectedUser) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUserModal(false)}>
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-green-100 p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">User Details</h2>
            <button onClick={() => setShowUserModal(false)} className="p-1 hover:bg-green-50 rounded-lg">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          <div className="p-5 space-y-4">
            {/* Avatar and Basic Info */}
            <div className="flex items-center gap-4 pb-4 border-b border-green-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-green-700">{selectedUser.fullname?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedUser.fullname || 'Anonymous'}</h3>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                    {selectedUser.badge || 'Eco Rookie'}
                  </span>
                  <span className="text-xs text-gray-400">#{selectedUser.rank}</span>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{selectedUser.ecoPoints || 0}</p>
                <p className="text-xs text-gray-500">Eco Points</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{selectedUser.rank || '-'}</p>
                <p className="text-xs text-gray-500">Global Rank</p>
              </div>
            </div>
            
            {/* Personal Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <User size={14} className="text-green-600" />
                Personal Information
              </h4>
              
              {selectedUser.department && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap size={14} className="text-gray-400" />
                  <span className="text-gray-600">Department:</span>
                  <span className="text-gray-800">{selectedUser.department}</span>
                </div>
              )}
              
              {selectedUser.faculty && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase size={14} className="text-gray-400" />
                  <span className="text-gray-600">Faculty:</span>
                  <span className="text-gray-800">{selectedUser.faculty}</span>
                </div>
              )}
              
              {selectedUser.studentId && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap size={14} className="text-gray-400" />
                  <span className="text-gray-600">Student ID:</span>
                  <span className="text-gray-800">{selectedUser.studentId}</span>
                </div>
              )}
              
              {selectedUser.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-gray-400" />
                  <span className="text-gray-600">Phone:</span>
                  <span className="text-gray-800">{selectedUser.phone}</span>
                </div>
              )}
              
              {selectedUser.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-gray-600">Location:</span>
                  <span className="text-gray-800">{selectedUser.location}</span>
                </div>
              )}
              
              {selectedUser.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe size={14} className="text-gray-400" />
                  <span className="text-gray-600">Website:</span>
                  <a href={selectedUser.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                    {selectedUser.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              
              {selectedUser.bio && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Bio</p>
                  <p className="text-sm text-gray-700">{selectedUser.bio}</p>
                </div>
              )}
            </div>
            
            {/* Interests */}
            {selectedUser.interests && selectedUser.interests.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.interests.map((interest, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setShowUserModal(false)}
              className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

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
            <Trophy size={28} className="text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-gray-500 mt-1">Top Eco Warriors making a difference</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Share2 size={16} />
            Share My Rank
          </button>
        </div>
      </div>

      {/* User's Stats Card */}
      {currentUserEntry && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">#{currentUserRank}</span>
              </div>
              <div>
                <p className="text-sm text-green-100">Your Rank</p>
                <p className="text-2xl font-bold">{currentUserEntry.fullname}</p>
                <p className="text-sm text-green-100">{currentUserEntry.department || 'Student'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-100">Eco Points</p>
              <p className="text-3xl font-bold">{currentUserEntry.ecoPoints || 0}</p>
              <p className="text-sm text-green-100">{currentUserEntry.badge || 'Eco Rookie'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex gap-1">
        {[
          { id: 'individual', label: 'Individual', icon: Users },
          { id: 'department', label: 'Departments', icon: Users },
          { id: 'faculty', label: 'Faculties', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Individual Leaderboard with Filters */}
      {activeTab === 'individual' && (
        <>
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                />
              </div>
              
              {/* Department Filter Dropdown */}
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 appearance-none bg-white"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              {/* Faculty Filter Dropdown */}
              <div className="relative">
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 appearance-none bg-white"
                >
                  {faculties.map(fac => (
                    <option key={fac} value={fac}>
                      {fac === 'all' ? 'All Faculties' : fac}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {/* Sort Options */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500 mr-2">Sort by:</span>
              <button
                onClick={() => setSortBy('points')}
                className={`text-xs px-2 py-1 rounded transition-colors ${sortBy === 'points' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Points
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`text-xs px-2 py-1 rounded transition-colors ${sortBy === 'name' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Name
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-500">
            Showing {filteredLeaderboard.length} of {leaderboard.length} users
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50 border-b border-green-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Badge</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-50">
                  {filteredLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredLeaderboard.map((user, index) => {
                      const rank = index + 1;
                      const performance = getPerformanceLabel(user.ecoPoints || 0);
                      const isCurrentUser = user.uid === currentUser?.uid;
                      
                      return (
                        <tr 
                          key={user.uid} 
                          className={`hover:bg-green-50/30 transition-colors cursor-pointer ${isCurrentUser ? 'bg-green-50' : ''}`}
                          onClick={() => handleViewUserDetails(user)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getRankIcon(rank)}
                              <span className={`font-semibold ${rank <= 3 ? 'text-lg' : 'text-sm'} ${getRankBadge(rank)} px-2 py-0.5 rounded-full`}>
                                #{rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                                <span className="text-green-700 font-semibold">
                                  {user.fullname?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.fullname || 'Anonymous'}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{user.department || 'Not specified'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Star size={16} className="text-yellow-500" />
                              <span className="font-bold text-gray-900">{user.ecoPoints || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm">{user.badge || 'Eco Rookie'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewUserDetails(user);
                              }}
                              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Department Leaderboard */}
      {activeTab === 'department' && (
        <div className="grid grid-cols-1 gap-4">
          {departmentLeaderboard.map((dept, index) => (
            <div key={dept.name} className="bg-white rounded-xl shadow-sm border border-green-100 p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-green-50 text-green-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{dept.name}</h3>
                    <p className="text-sm text-gray-500">{dept.memberCount} members</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Average Points</p>
                  <p className="text-2xl font-bold text-green-600">{Math.round(dept.averagePoints)}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Points</span>
                  <span className="font-semibold text-gray-900">{dept.totalPoints}</span>
                </div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${(dept.averagePoints / (departmentLeaderboard[0]?.averagePoints || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Faculty Leaderboard */}
      {activeTab === 'faculty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facultyLeaderboard.map((faculty, index) => (
            <div key={faculty.name} className="bg-white rounded-xl shadow-sm border border-green-100 p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-100' : 'bg-green-50'
                  }`}>
                    {index === 0 ? <Crown size={20} className="text-yellow-600" /> : <Award size={20} className="text-green-600" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{faculty.name}</h3>
                    <p className="text-xs text-gray-500">{faculty.memberCount} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{Math.round(faculty.averagePoints)}</p>
                  <p className="text-xs text-gray-500">avg points</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Points</span>
                  <span className="font-semibold">{faculty.totalPoints}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${(faculty.averagePoints / (facultyLeaderboard[0]?.averagePoints || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      {activeTab === 'individual' && filteredLeaderboard.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center">
          <Target size={32} className="mx-auto text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Want to climb the ranks?</h3>
          <p className="text-gray-600 mb-4">Earn more points by recycling, upcycling, and participating in campus events!</p>
          <div className="flex gap-3 justify-center">
            <Link to="/dashboard/verify" className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors inline-flex items-center gap-2">
              <Leaf size={16} />
              Verify an Item
            </Link>
            <Link to="/dashboard/events" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
              <Calendar size={16} />
              Join Events
            </Link>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && <UserDetailsModal />}
    </div>
  );
};

export default Leaderboard;