// src/pages/Leaderboard.jsx
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
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [departmentLeaderboard, setDepartmentLeaderboard] = useState([]);
  const [facultyLeaderboard, setFacultyLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('individual'); // individual, department, faculty
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFrame, setTimeFrame] = useState('all'); // all, monthly, weekly

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeFrame]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch individual leaderboard
      const individualData = await firebaseService.getLeaderboard();
      setLeaderboard(individualData);
      
      // Fetch department leaderboard
      const deptData = await firebaseService.getDepartmentLeaderboard();
      setDepartmentLeaderboard(deptData);
      
      // Calculate faculty leaderboard from users data
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
    return 'bg-gray-50 text-gray-500';
  };

  const getPerformanceLabel = (points) => {
    if (points >= 1000) return { label: 'Legendary', color: 'text-purple-600', icon: '🏆' };
    if (points >= 500) return { label: 'Elite', color: 'text-yellow-600', icon: '⭐' };
    if (points >= 250) return { label: 'Advanced', color: 'text-blue-600', icon: '🌟' };
    if (points >= 100) return { label: 'Intermediate', color: 'text-green-600', icon: '🌱' };
    return { label: 'Beginner', color: 'text-gray-500', icon: '🌿' };
  };

  const filteredLeaderboard = leaderboard.filter(user => 
    user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={handleShare}
            className="btn-secondary flex items-center gap-2"
          >
            <Share2 size={16} />
            Share My Rank
          </button>
        </div>
      </div>

      {/* User's Stats Card */}
      {currentUserEntry && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">#{currentUserRank}</span>
              </div>
              <div>
                <p className="text-sm opacity-80">Your Rank</p>
                <p className="text-2xl font-bold">{currentUserEntry.fullname}</p>
                <p className="text-sm opacity-80">{currentUserEntry.department || 'Student'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Eco Points</p>
              <p className="text-3xl font-bold">{currentUserEntry.ecoPoints || 0}</p>
              <p className="text-sm opacity-80">{currentUserEntry.badge || 'Eco Rookie'}</p>
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
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar (for Individual tab) */}
      {activeTab === 'individual' && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, department, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      )}

      {/* Individual Leaderboard */}
      {activeTab === 'individual' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
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
                        className={`hover:bg-gray-50 transition-colors ${isCurrentUser ? 'bg-primary-50' : ''}`}
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
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                              <span className="text-primary-700 font-semibold">
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
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Department Leaderboard */}
      {activeTab === 'department' && (
        <div className="grid grid-cols-1 gap-4">
          {departmentLeaderboard.map((dept, index) => (
            <div key={dept.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-primary-50 text-primary-600'
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
                  <p className="text-2xl font-bold text-primary-600">{Math.round(dept.averagePoints)}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Points</span>
                  <span className="font-semibold text-gray-900">{dept.totalPoints}</span>
                </div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all"
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
            <div key={faculty.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-100' : 'bg-primary-50'
                  }`}>
                    {index === 0 ? <Crown size={20} className="text-yellow-600" /> : <Award size={20} className="text-primary-600" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{faculty.name}</h3>
                    <p className="text-xs text-gray-500">{faculty.memberCount} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">{Math.round(faculty.averagePoints)}</p>
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
                    className="h-full bg-primary-500 rounded-full transition-all"
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
        <div className="bg-gradient-to-r from-primary-50 to-emerald-50 rounded-xl p-6 text-center">
          <Target size={32} className="mx-auto text-primary-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Want to climb the ranks?</h3>
          <p className="text-gray-600 mb-4">Earn more points by recycling, upcycling, and participating in campus events!</p>
          <div className="flex gap-3 justify-center">
            <Link to="/verify" className="btn-primary inline-flex items-center gap-2">
              <Leaf size={16} />
              Verify an Item
            </Link>
            <Link to="/events" className="btn-secondary inline-flex items-center gap-2">
              <Calendar size={16} />
              Join Events
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;