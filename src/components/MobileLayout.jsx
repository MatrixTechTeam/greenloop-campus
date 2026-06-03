// src/components/MobileLayout.jsx - White & Green Theme with Report Waste
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebaseService';
import AIWasteScanner from './AIWasteScanner';
import MobileProfile from '../pages/MobileProfile';
import { 
  Menu, X, Leaf, LogOut, Home, FileText, Camera, Store, 
  Trophy, Calendar, User, Shield, ChevronRight, 
  Sparkles, Zap, Heart, Award, TrendingUp, 
  Bell, Search, Star, Recycle, 
  Flame, CheckCircle, Clock, Package, Gift, ArrowRight,
  MapPin, AlertTriangle, Upload, Edit2, Save, Phone, Mail, 
  Globe, Trash2, Eye, Plus, Send, 
  Loader2, Image as ImageIcon, Check, AlertCircle,
  Settings, HelpCircle, Wifi, WifiOff, Edit, MessageCircle, Share2,
  Flag, Radio, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const MobileLayout = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [showScanner, setShowScanner] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Report Waste states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportImage, setReportImage] = useState(null);
  const [reportImageFile, setReportImageFile] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [locationCoords, setLocationCoords] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    wasteType: '',
    description: '',
    quantity: 'small',
    urgency: 'normal',
  });
  
  // Marketplace states
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [sellingItem, setSellingItem] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'good',
    ecoValue: 5,
    location: '',
    exchangeType: 'exchange'
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [listings, setListings] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningEventId, setJoiningEventId] = useState(null);
  
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all', 'plastic', 'glass', 'paper', 'metal', 
    'electronics', 'textiles', 'books', 'furniture', 'other'
  ];

  const wasteTypes = [
    { value: 'plastic', label: 'Plastic', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: 'glass', label: 'Glass', icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
    { value: 'metal', label: 'Metal', icon: Package, color: 'text-gray-600', bg: 'bg-gray-50' },
    { value: 'paper', label: 'Paper', icon: FileText, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { value: 'organic', label: 'Organic', icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { value: 'electronic', label: 'E-Waste', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
    { value: 'hazardous', label: 'Hazardous', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const quantities = [
    { value: 'small', label: 'Small (single item)', points: 5, icon: Package },
    { value: 'medium', label: 'Medium (bag full)', points: 10, icon: Package },
    { value: 'large', label: 'Large (bin full)', points: 20, icon: Package },
  ];

  const urgencies = [
    { value: 'low', label: 'Low - Can wait', color: 'bg-green-100 text-green-700' },
    { value: 'normal', label: 'Normal - Regular', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: 'High - Needs attention', color: 'bg-orange-100 text-orange-700' },
    { value: 'urgent', label: 'Urgent - Immediate', color: 'bg-red-100 text-red-700' },
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-700' },
    { value: 'good', label: 'Good', color: 'bg-green-50 text-green-600' },
    { value: 'fair', label: 'Fair', color: 'bg-yellow-50 text-yellow-600' },
    { value: 'poor', label: 'Poor (for upcycling)', color: 'bg-orange-50 text-orange-600' }
  ];

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchNotifications = async () => {
      try {
        const notifs = await firebaseService.getUserNotifications(currentUser.uid);
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Fetch all data
  useEffect(() => { 
    fetchAllData(); 
  }, [currentUser]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      fetchMarketplaceListings();
      fetchUpcomingEvents();
    }, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('dashboard')) setActiveView('dashboard');
    else if (path.includes('marketplace')) setActiveView('marketplace');
    else if (path.includes('leaderboard')) setActiveView('leaderboard');
    else if (path.includes('events')) setActiveView('events');
    else if (path.includes('profile')) setActiveView('profile');
    else setActiveView('dashboard');
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [sidebarOpen]);

  // Get current location for waste report
  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
        toast.success('Location detected');
      },
      (error) => {
        console.error('Location error:', error);
        toast.error('Could not get location. Please enable GPS.');
        setLocationLoading(false);
      }
    );
  };

  const fetchAllData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [verifications, events, marketplace, leaderboardData] = await Promise.all([
        firebaseService.getVerificationHistory(currentUser.uid).catch(() => []),
        firebaseService.getUpcomingEvents().catch(() => []),
        firebaseService.getMarketplaceListings().catch(() => []),
        firebaseService.getLeaderboard(10).catch(() => [])
      ]);
      setRecentActivity(verifications.slice(0, 5));
      setUpcomingEvents(events);
      setListings(marketplace);
      setLeaderboard(leaderboardData);
    } catch (error) { 
      console.error('Error fetching data:', error); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchMarketplaceListings = async () => {
    try {
      const marketplace = await firebaseService.getMarketplaceListings().catch(() => []);
      setListings(marketplace);
    } catch (error) {
      console.error('Error fetching marketplace:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const events = await firebaseService.getUpcomingEvents().catch(() => []);
      setUpcomingEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Handle Waste Report Submission
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    
    if (!reportFormData.wasteType) {
      toast.error('Please select waste type');
      return;
    }
    
    if (!reportFormData.description) {
      toast.error('Please provide a description');
      return;
    }
    
    if (!locationCoords) {
      toast.error('Please enable location services');
      return;
    }
    
    setReporting(true);
    
    try {
      const selectedQuantity = quantities.find(q => q.value === reportFormData.quantity);
      const pointsEarned = selectedQuantity?.points || 5;
      
      const reportData = {
        userId: currentUser.uid,
        userName: userProfile?.fullname || 'Anonymous',
        wasteType: reportFormData.wasteType,
        description: reportFormData.description,
        quantity: reportFormData.quantity,
        urgency: reportFormData.urgency,
        latitude: locationCoords.lat,
        longitude: locationCoords.lng,
        pointsEarned,
        status: 'pending',
      };
      
      await firebaseService.createWasteReport(reportData, reportImageFile);
      await firebaseService.updateUserPoints(currentUser.uid, pointsEarned);
      
      toast.success(`Waste reported! +${pointsEarned} Eco Points`);
      
      // Reset form and close modal
      resetReportForm();
      setShowReportModal(false);
      
      // Refresh data to show updated points
      await fetchAllData();
      
      // Send notification to admin
      const admins = await firebaseService.getLeaderboard(100);
      const adminUsers = admins.filter(u => u.role === 'admin');
      for (const admin of adminUsers) {
        await firebaseService.createNotification(
          admin.uid,
          'New Waste Report',
          `${userProfile?.fullname} reported ${reportFormData.wasteType} waste at ${reportFormData.quantity} scale`
        );
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    } finally {
      setReporting(false);
    }
  };

  const handleReportImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setReportImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetReportForm = () => {
    setReportFormData({
      wasteType: '',
      description: '',
      quantity: 'small',
      urgency: 'normal',
    });
    setReportImage(null);
    setReportImageFile(null);
    setLocationCoords(null);
  };

  // Real-time event joining
  const handleJoinEvent = async (eventId) => {
    if (!currentUser) {
      toast.error('Please login to join events');
      return;
    }
    
    setJoiningEventId(eventId);
    try {
      await firebaseService.joinEvent(eventId, currentUser.uid);
      toast.success('Successfully joined the event! +25 Eco Points');
      await fetchUpcomingEvents();
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error(error.message || 'Failed to join event');
    } finally {
      setJoiningEventId(null);
    }
  };

  // Create marketplace listing
  const handleCreateListing = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
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
        location: formData.location || userProfile?.location || 'Campus',
        ownerId: currentUser.uid,
        ownerName: userProfile?.fullname || 'Student',
        exchangeType: formData.exchangeType,
        status: 'available',
        createdAt: new Date(),
      };
      
      await firebaseService.createMarketplaceListing(listingData, imageFile);
      toast.success('Item listed successfully!');
      
      resetMarketplaceForm();
      setShowSellModal(false);
      await fetchMarketplaceListings();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to list item: ' + error.message);
    } finally {
      setSellingItem(false);
    }
  };

  // Claim/Exchange item
  const handleClaimItem = async (listing) => {
    if (!currentUser) {
      toast.error('Please login to claim items');
      return;
    }
    
    if (currentUser.uid === listing.ownerId) {
      toast.error("You can't claim your own item");
      return;
    }

    try {
      await firebaseService.claimListing(listing.id, currentUser.uid);
      const message = listing.exchangeType === 'sell' 
        ? `Item purchased! -${listing.ecoValue} Eco Points`
        : `Item claimed! +5 Eco Points for you, +10 for the donor!`;
      toast.success(message);
      await fetchMarketplaceListings();
      setShowItemDetails(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error claiming item:', error);
      toast.error(error.message || 'Failed to claim item');
    }
  };

  // Delete listing
  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      await firebaseService.deleteListing(listingId);
      toast.success('Listing deleted successfully');
      await fetchMarketplaceListings();
      setShowItemDetails(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing');
    }
  };

  const resetMarketplaceForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      condition: 'good',
      ecoValue: 5,
      location: '',
      exchangeType: 'exchange'
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
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
    navigate('/login'); 
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await firebaseService.markNotificationRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await firebaseService.markAllNotificationsRead(currentUser.uid);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/marketplace', icon: Store, label: 'Marketplace' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];
  if (userProfile?.role === 'admin') navItems.push({ path: '/admin', icon: Shield, label: 'Admin' });

  const bottomNavItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/marketplace', icon: Store, label: 'Marketplace' },
    { path: '/leaderboard', icon: Trophy, label: 'Rank' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const filteredListings = listings.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
                          item.description?.toLowerCase().includes(marketplaceSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.status === 'available';
  });
  
  const filteredUsers = leaderboard.filter(u => u.fullname?.toLowerCase().includes(leaderboardSearch.toLowerCase()));

  const calculateStreak = () => {
    const dates = recentActivity.map(a => a.timestamp ? new Date(a.timestamp).toDateString() : '').filter(d => d);
    const uniqueDates = [...new Set(dates)];
    let streak = 0, currentDate = new Date();
    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(currentDate.getDate() - i);
      if (uniqueDates.includes(checkDate.toDateString())) streak++;
      else break;
    }
    return streak || 0;
  };

  const stats = [
    { icon: Star, label: 'Points', value: userProfile?.ecoPoints || 0 },
    { icon: Recycle, label: 'Recycled', value: recentActivity.filter(a => a.selectedStatus === 'Recycled').length },
    { icon: Flame, label: 'Streak', value: calculateStreak() },
    { icon: Award, label: 'Rank', value: leaderboard.findIndex(u => u.uid === currentUser?.uid) + 1 || '--' },
  ];

  const renderDashboard = () => (
    <div className="space-y-5 pb-20">
      {/* Welcome Card - Green Gradient */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-100">Welcome back,</p>
            <h1 className="text-xl font-bold">{userProfile?.fullname?.split(' ')[0] || 'Student'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-green-100">{userProfile?.badge || 'Eco Rookie'}</span>
              <span className="text-xs text-green-200">•</span>
              <span className="text-xs font-medium">{userProfile?.ecoPoints || 0} pts</span>
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

      {/* Stats Grid - White Cards with Green Accents */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-green-100 text-center">
            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <stat.icon size={14} className="text-green-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            <p className="text-[10px] text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions - Added Report Waste */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex gap-3 min-w-max">
          <button onClick={() => setShowScanner(true)} className="flex flex-col items-center gap-2 p-3 min-w-[80px] bg-green-600 rounded-xl active:scale-95 transition-transform shadow-sm">
            <Sparkles size={22} className="text-white" />
            <span className="text-xs font-medium text-white">AI Scan</span>
          </button>
          <button onClick={() => { getCurrentLocation(); setShowReportModal(true); }} className="flex flex-col items-center gap-2 p-3 min-w-[80px] bg-white rounded-xl shadow-sm border border-green-200 active:scale-95 transition-transform">
            <Flag size={22} className="text-red-500" />
            <span className="text-xs font-medium text-gray-700">Report</span>
          </button>
          <button onClick={() => setShowSellModal(true)} className="flex flex-col items-center gap-2 p-3 min-w-[80px] bg-white rounded-xl shadow-sm border border-green-200 active:scale-95 transition-transform">
            <Plus size={22} className="text-green-600" />
            <span className="text-xs font-medium text-gray-700">Sell</span>
          </button>
          <Link to="/marketplace" className="flex flex-col items-center gap-2 p-3 min-w-[80px] bg-white rounded-xl shadow-sm border border-green-200 active:scale-95 transition-transform">
            <Store size={22} className="text-green-600" />
            <span className="text-xs font-medium text-gray-700">Exchange</span>
          </Link>
          <Link to="/events" className="flex flex-col items-center gap-2 p-3 min-w-[80px] bg-white rounded-xl shadow-sm border border-green-200 active:scale-95 transition-transform">
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
            <h2 className="font-semibold text-gray-900 text-base">Recent Activity</h2>
          </div>
          <button onClick={() => setShowScanner(true)} className="text-xs text-green-600 font-medium">New Scan</button>
        </div>
        <div className="divide-y divide-green-50">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles size={20} className="text-green-400" />
              </div>
              <p className="text-sm text-gray-500">No scans yet</p>
              <button onClick={() => setShowScanner(true)} className="text-sm text-green-600 font-medium mt-2">Scan your first item →</button>
            </div>
          ) : (
            recentActivity.map((item, idx) => (
              <div key={idx} className="px-5 py-3 flex items-center justify-between hover:bg-green-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                    {item.selectedStatus === 'Recycled' ? <Recycle size={16} className="text-green-600" /> : <Sparkles size={16} className="text-green-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.itemName || 'Item Scanned'}</p>
                    <p className="text-xs text-gray-400">{item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-green-600">+{item.ecoPointsAwarded || 10}</span>
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
              <h2 className="font-semibold text-gray-900 text-base">Upcoming Events</h2>
            </div>
            <Link to="/events" className="text-xs text-green-600 font-medium">View all</Link>
          </div>
          <div className="divide-y divide-green-50">
            {upcomingEvents.slice(0, 3).map((event) => {
              const hasJoined = event.participants?.includes(currentUser?.uid);
              const isFull = event.maxParticipants > 0 && event.participants?.length >= event.maxParticipants;
              const isJoining = joiningEventId === event.id;
              
              return (
                <div key={event.id} className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-green-700">{event.date ? new Date(event.date).getDate() : '?'}</span>
                      <span className="text-[10px] text-green-500">{event.date ? new Date(event.date).toLocaleString('default', { month: 'short' }) : ''}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{event.location}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{event.participants?.length || 0} participants</p>
                    </div>
                    {!hasJoined && !isFull && currentUser && (
                      <button
                        onClick={() => handleJoinEvent(event.id)}
                        disabled={isJoining}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg font-medium active:scale-95 transition-transform disabled:opacity-50"
                      >
                        {isJoining ? <Loader2 size={12} className="animate-spin" /> : 'Join'}
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

      {/* Report Waste Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReportModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-green-100 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Flag size={20} className="text-red-500" />
                  Report Waste
                </h2>
                <button onClick={() => setShowReportModal(false)} className="p-1 hover:bg-green-50 rounded-lg">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              {/* Waste Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waste Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {wasteTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setReportFormData({ ...reportFormData, wasteType: type.value })}
                      className={`p-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                        reportFormData.wasteType === type.value
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className={`w-6 h-6 ${type.bg} rounded-full flex items-center justify-center`}>
                        <type.icon size={12} className={type.color} />
                      </div>
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={reportFormData.description}
                  onChange={(e) => setReportFormData({ ...reportFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 resize-none"
                  rows="3"
                  placeholder="Describe the waste, location details, approximate amount..."
                  required
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="grid grid-cols-3 gap-2">
                  {quantities.map((qty) => (
                    <button
                      key={qty.value}
                      type="button"
                      onClick={() => setReportFormData({ ...reportFormData, quantity: qty.value })}
                      className={`p-2 rounded-lg border-2 text-center transition-all ${
                        reportFormData.quantity === qty.value
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <p className="text-xs font-medium">{qty.label}</p>
                      <p className="text-[10px] text-green-600">+{qty.points} pts</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {urgencies.map((urg) => (
                    <button
                      key={urg.value}
                      type="button"
                      onClick={() => setReportFormData({ ...reportFormData, urgency: urg.value })}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        reportFormData.urgency === urg.value
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urg.color}`}>
                        {urg.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image (Optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-green-200 border-dashed rounded-xl hover:border-green-400 transition-colors bg-green-50/30">
                  {reportImage ? (
                    <div className="relative">
                      <img src={reportImage} alt="Preview" className="h-32 w-auto rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setReportImage(null);
                          setReportImageFile(null);
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="mx-auto h-10 w-10 text-green-400" />
                      <div className="mt-1 flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-700">
                          <span>Upload a photo</span>
                          <input type="file" className="sr-only" accept="image/*" onChange={handleReportImageUpload} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-green-200 rounded-xl text-green-600 hover:bg-green-50 transition-colors"
                >
                  <Navigation size={16} />
                  {locationLoading ? 'Getting location...' : locationCoords ? '✓ Location Detected' : 'Get Current Location'}
                </button>
                {locationCoords && (
                  <p className="text-xs text-green-600 mt-1">
                    Lat: {locationCoords.lat.toFixed(4)}, Lng: {locationCoords.lng.toFixed(4)}
                  </p>
                )}
              </div>

              {/* Points Info */}
              <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Points to earn:</span>
                  <span className="text-lg font-bold text-green-600">
                    +{quantities.find(q => q.value === reportFormData.quantity)?.points || 5}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={reporting || !locationCoords || !reportFormData.wasteType} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {reporting ? <Loader2 size={16} className="animate-spin" /> : <Flag size={16} />}
                  Report Waste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sell/Exchange Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSellModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-green-100 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">List an Item</h2>
                <button onClick={() => setShowSellModal(false)} className="p-1 hover:bg-green-50 rounded-lg">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateListing} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exchange Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, exchangeType: 'exchange' })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.exchangeType === 'exchange'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-green-300'
                    }`}
                  >
                    <Recycle size={18} className="mx-auto mb-1" />
                    Exchange
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, exchangeType: 'sell' })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.exchangeType === 'sell'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-green-300'
                    }`}
                  >
                    <Gift size={18} className="mx-auto mb-1" />
                    Sell
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  placeholder="e.g., Plastic Bottles Collection"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 resize-none"
                  rows="3"
                  placeholder="Describe the item, quantity, condition, etc."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    required
                  >
                    <option value="">Select</option>
                    {categories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                  >
                    {conditions.map(cond => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points Value</label>
                  <input
                    type="number"
                    value={formData.ecoValue}
                    onChange={(e) => setFormData({ ...formData, ecoValue: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    min="1"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    placeholder="e.g., Library, Cafeteria"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-green-200 border-dashed rounded-xl hover:border-green-400 transition-colors bg-green-50/30">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="h-32 w-auto rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Package className="mx-auto h-12 w-12 text-green-400" />
                      <div className="mt-1 flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-700">
                          <span>Upload a file</span>
                          <input type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowSellModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={sellingItem} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
                  {sellingItem ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'List Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {showItemDetails && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowItemDetails(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {selectedItem.imageUrl ? (
              <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-48 object-cover rounded-t-2xl" />
            ) : (
              <div className="w-full h-48 bg-green-50 flex items-center justify-center rounded-t-2xl">
                <Package size={48} className="text-green-300" />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedItem.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      conditions.find(c => c.value === selectedItem.condition)?.color || 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedItem.condition}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{selectedItem.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-600">+{selectedItem.ecoValue} pts</span>
                  {selectedItem.exchangeType === 'sell' && (
                    <p className="text-xs text-green-600">For Sale</p>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 leading-relaxed">{selectedItem.description}</p>
              
              <div className="space-y-3 mb-6 p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-3 text-gray-700">
                  <User size={16} className="text-green-600" />
                  <span>Listed by: {selectedItem.ownerName || 'Student'}</span>
                </div>
                {selectedItem.location && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={16} className="text-green-600" />
                    <span>Location: {selectedItem.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar size={16} className="text-green-600" />
                  <span>Listed: {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>
              
              {selectedItem.status === 'available' && currentUser?.uid !== selectedItem.ownerId && (
                <button
                  onClick={() => handleClaimItem(selectedItem)}
                  className="w-full py-3 mb-3 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <Send size={16} />
                  {selectedItem.exchangeType === 'sell' ? 'Purchase Item' : 'Claim Item'}
                </button>
              )}
              
              {currentUser?.uid === selectedItem.ownerId && (
                <button
                  onClick={() => handleDeleteListing(selectedItem.id)}
                  className="w-full py-3 flex items-center justify-center gap-2 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Listing
                </button>
              )}
              
              {selectedItem.status === 'claimed' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <CheckCircle size={16} className="inline mr-2 text-green-600" />
                  <span className="text-green-700 font-medium">Item has been claimed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMarketplace = () => (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Marketplace</h1>
            <p className="text-sm text-green-100 mt-1">Exchange or sell reusable items</p>
          </div>
          <button
            onClick={() => setShowSellModal(true)}
            className="px-4 py-2 bg-white text-green-700 rounded-xl text-sm font-medium flex items-center gap-2 active:scale-95 transition-transform shadow-sm"
          >
            <Plus size={16} />
            Sell/Exchange
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" />
        <input 
          type="text" 
          placeholder="Search items..." 
          value={marketplaceSearch} 
          onChange={(e) => setMarketplaceSearch(e.target.value)} 
          className="w-full pl-9 pr-3 py-3 bg-white rounded-xl border border-green-200 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400" 
        />
      </div>

      {/* Category Filters */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-gray-600 hover:bg-green-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredListings.map((item) => (
          <div 
            key={item.id} 
            onClick={() => {
              setSelectedItem(item);
              setShowItemDetails(true);
            }}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-green-100 active:scale-98 transition-transform cursor-pointer hover:shadow-md"
          >
            <div className="relative h-32 bg-green-50">
              {item.imageUrl ? 
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : 
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={32} className="text-green-300" />
                </div>
              }
              <div className="absolute top-2 right-2 bg-green-600 rounded-full px-2 py-0.5">
                <span className="text-white text-[10px] font-semibold">{item.ecoValue} pts</span>
              </div>
              {item.exchangeType === 'sell' && (
                <div className="absolute top-2 left-2 bg-green-500 rounded-full px-2 py-0.5">
                  <span className="text-white text-[10px] font-semibold">For Sale</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{item.title}</h3>
              <p className="text-gray-500 text-xs mt-0.5 truncate">{item.ownerName || 'Student'}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                  item.condition === 'excellent' ? 'bg-green-100 text-green-700' :
                  item.condition === 'good' ? 'bg-green-50 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {item.condition}
                </span>
                <span className="text-[10px] text-gray-400">{item.category}</span>
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
            className="text-green-600 font-medium text-sm mt-2 hover:text-green-700"
          >
            List your first item →
          </button>
        </div>
      )}
    </div>
  );

  const renderLeaderboard = () => {
    const getRankBadge = (rank) => {
      if (rank === 1) return 'bg-yellow-100 text-yellow-700';
      if (rank === 2) return 'bg-gray-200 text-gray-600';
      if (rank === 3) return 'bg-amber-100 text-amber-700';
      return 'bg-green-50 text-green-600';
    };
    return (
      <div className="space-y-4 pb-20">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 text-white shadow-lg">
          <h1 className="text-xl font-bold">Leaderboard</h1>
          <p className="text-sm text-green-100 mt-1">Top Eco Warriors</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" />
          <input type="text" placeholder="Search users..." value={leaderboardSearch} onChange={(e) => setLeaderboardSearch(e.target.value)} className="w-full pl-9 pr-3 py-3 bg-white rounded-xl border border-green-200 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
          <div className="divide-y divide-green-50">
            {filteredUsers.map((user, idx) => {
              const rank = idx + 1;
              return (
                <div key={user.uid} className="px-4 py-3 flex items-center gap-3 hover:bg-green-50/30 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadge(rank)}`}>
                    {rank === 1 ? <Trophy size={14} className="text-yellow-500" /> : rank === 2 ? <Award size={14} className="text-gray-500" /> : rank === 3 ? <Award size={14} className="text-amber-500" /> : rank}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{user.fullname || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{user.department || 'Student'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-sm">{user.ecoPoints || 0}</p>
                    <p className="text-[10px] text-gray-400">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderEvents = () => (
    <div className="space-y-4 pb-20">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 text-white shadow-lg">
        <h1 className="text-xl font-bold">Events</h1>
        <p className="text-sm text-green-100 mt-1">Join & earn 25 points per event</p>
      </div>
      {upcomingEvents.map((event) => {
        const hasJoined = event.participants?.includes(currentUser?.uid);
        const isFull = event.maxParticipants > 0 && event.participants?.length >= event.maxParticipants;
        const isJoining = joiningEventId === event.id;
        
        return (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-green-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-green-700">{event.date ? new Date(event.date).getDate() : '?'}</span>
                <span className="text-[10px] text-green-500">{event.date ? new Date(event.date).toLocaleString('default', { month: 'short' }) : ''}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">
                    {event.participants?.length || 0} participants
                    {event.maxParticipants ? ` / ${event.maxParticipants}` : ''}
                  </p>
                  {!hasJoined && !isFull && currentUser && (
                    <button
                      onClick={() => handleJoinEvent(event.id)}
                      disabled={isJoining}
                      className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg font-medium active:scale-95 transition-transform disabled:opacity-50 hover:bg-green-700"
                    >
                      {isJoining ? <Loader2 size={14} className="animate-spin" /> : 'Join →'}
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
                  {!currentUser && (
                    <Link to="/login" className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700">
                      Login to Join
                    </Link>
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
    switch (activeView) {
      case 'dashboard': return renderDashboard();
      case 'marketplace': return renderMarketplace();
      case 'leaderboard': return renderLeaderboard();
      case 'events': return renderEvents();
      case 'profile': return <MobileProfile />;
      default: return renderDashboard();
    }
  };

  if (loading && !activeView) return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div></div>;

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'} border-b border-green-100`}>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 active:scale-95 transition-transform">
            <Menu size={22} className="text-green-700" />
          </button>
          <div className="flex items-center gap-1">
            <Leaf size={18} className="text-green-600" />
            <span className="font-semibold text-green-800 text-base">GreenLoop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={toggleNotifications}
                className="p-2 relative active:scale-95 transition-transform z-10"
                type="button"
              >
                <Bell size={20} className="text-green-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-green-100 z-50 max-h-96 overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-green-100 px-4 py-3 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <button 
                        onClick={markAllNotificationsRead}
                        className="text-xs text-green-600 hover:text-green-700"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-green-50">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell size={32} className="mx-auto text-green-300 mb-2" />
                        <p className="text-sm text-gray-500">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`px-4 py-3 cursor-pointer hover:bg-green-50 transition-colors ${!notif.read ? 'bg-green-50' : ''}`}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {!notif.read && (
                              <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0"></div>
                            )}
                            <div className={`flex-1 ${!notif.read ? '' : 'pl-5'}`}>
                              <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Recent'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="px-2 py-1 bg-green-100 rounded-full">
              <span className="text-xs font-medium text-green-700">{userProfile?.ecoPoints || 0}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 shadow-xl">
              <div className="h-full flex flex-col">
                <div className="p-6 border-b border-green-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-green-800 text-lg">GreenLoop</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-green-50 rounded-full">
                      <X size={18} className="text-gray-500" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-700 font-semibold text-lg">{userProfile?.fullname?.charAt(0) || 'U'}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{userProfile?.fullname || 'Student'}</p>
                      <p className="text-xs text-gray-500">{userProfile?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-green-100 px-2 py-0.5 rounded-full text-green-700">{userProfile?.ecoPoints || 0} pts</span>
                        <span className="text-xs text-gray-500">{userProfile?.badge || 'Eco Rookie'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-green-50'}`}>
                        <item.icon size={20} className={isActive ? 'text-green-600' : ''} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-green-100">
                  <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 w-full text-red-600 rounded-xl hover:bg-red-50 transition-all">
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
        <div className="px-4 py-4">
          {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-green-100 shadow-lg z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
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
        transition={{ type: 'spring', delay: 0.3 }}
        onClick={() => setShowScanner(true)}
        className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-green-600 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Sparkles size={22} className="text-white" />
      </motion.button>

      <AIWasteScanner isOpen={showScanner} onClose={() => setShowScanner(false)} onSave={() => { fetchAllData(); setShowScanner(false); }} />
    </div>
  );
};

export default MobileLayout;