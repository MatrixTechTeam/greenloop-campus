// src/pages/Marketplace.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Filter, 
  X,
  MapPin,
  User,
  Calendar,
  Tag,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Heart,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Marketplace = () => {
  const { currentUser, userProfile } = useAuth();
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('browse'); // browse, myListings
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'good',
    ecoValue: 5,
    location: '',
  });

  const categories = [
    { value: 'all', label: 'All Items', icon: Package },
    { value: 'plastic', label: 'Plastic', icon: Package },
    { value: 'glass', label: 'Glass', icon: Package },
    { value: 'paper', label: 'Paper', icon: Package },
    { value: 'metal', label: 'Metal', icon: Package },
    { value: 'electronics', label: 'Electronics', icon: Package },
    { value: 'textiles', label: 'Textiles', icon: Package },
    { value: 'books', label: 'Books', icon: Package },
    { value: 'furniture', label: 'Furniture', icon: Package },
    { value: 'other', label: 'Other', icon: Package },
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-700' },
    { value: 'good', label: 'Good', color: 'bg-blue-100 text-blue-700' },
    { value: 'fair', label: 'Fair', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'poor', label: 'Poor (for upcycling)', color: 'bg-orange-100 text-orange-700' },
  ];

  useEffect(() => {
    fetchListings();
    if (currentUser) {
      fetchMyListings();
    }
  }, [currentUser]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const allListings = await firebaseService.getMarketplaceListings();
      setListings(allListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    try {
      const myItems = await firebaseService.getMyListings(currentUser.uid);
      setMyListings(myItems);
    } catch (error) {
      console.error('Error fetching my listings:', error);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        ecoValue: parseInt(formData.ecoValue),
        location: formData.location || userProfile?.location || 'Campus',
        ownerId: currentUser.uid,
        status: 'available',
      };
      
      let imageFile = null;
      if (imagePreview) {
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      }
      
      await firebaseService.createMarketplaceListing(listingData, imageFile);
      toast.success('Listing created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchListings();
      fetchMyListings();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to create listing');
    }
  };

  const handleClaimItem = async (listingId, ownerId) => {
    if (!currentUser) {
      toast.error('Please login to claim items');
      return;
    }
    
    if (currentUser.uid === ownerId) {
      toast.error("You can't claim your own item");
      return;
    }

    try {
      await firebaseService.claimListing(listingId, currentUser.uid);
      toast.success('Item claimed successfully! +5 Eco Points for you, +10 for the donor!');
      fetchListings();
      fetchMyListings();
      setShowDetailsModal(null);
    } catch (error) {
      console.error('Error claiming item:', error);
      toast.error(error.message || 'Failed to claim item');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      condition: 'good',
      ecoValue: 5,
      location: '',
    });
    setImagePreview(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getConditionStyle = (condition) => {
    return conditions.find(c => c.value === condition) || conditions[1];
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || Package;
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
            <ShoppingBag size={28} className="text-primary-600" />
            Resource Exchange
          </h1>
          <p className="text-gray-500 mt-1">Exchange reusable materials with fellow students</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          List an Item
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex gap-1">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'browse'
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Browse Items
        </button>
        <button
          onClick={() => setActiveTab('myListings')}
          className={`flex-1 py-2.5 rounded-lg transition-all ${
            activeTab === 'myListings'
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          My Listings ({myListings.length})
        </button>
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">Be the first to list an item for exchange!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary mt-4 inline-flex items-center gap-2"
              >
                <Plus size={18} />
                List an Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  currentUser={currentUser}
                  onViewDetails={setShowDetailsModal}
                  getConditionStyle={getConditionStyle}
                  getCategoryIcon={getCategoryIcon}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* My Listings Tab */}
      {activeTab === 'myListings' && (
        <div className="space-y-4">
          {myListings.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500">Share your reusable items with the community</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary mt-4 inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create First Listing
              </button>
            </div>
          ) : (
            myListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start gap-4">
                  {listing.imageUrl ? (
                    <img src={listing.imageUrl} alt={listing.title} className="w-20 h-20 rounded-lg object-cover" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package size={32} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{listing.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {listing.status === 'available' ? 'Available' : 'Claimed'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Tag size={14} />
                        {listing.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                      <span className="text-green-600 font-semibold">{listing.ecoValue} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">List an Item</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateListing} className="p-6 space-y-4">
              <div>
                <label className="input-label">Item Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Plastic Bottles Collection"
                  required
                />
              </div>
              
              <div>
                <label className="input-label">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none"
                  rows="3"
                  placeholder="Describe the item, quantity, condition, etc."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select</option>
                    {categories.filter(c => c.value !== 'all').map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="input-field"
                  >
                    {conditions.map(cond => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Eco Points Value</label>
                  <input
                    type="number"
                    value={formData.ecoValue}
                    onChange={(e) => setFormData({ ...formData, ecoValue: parseInt(e.target.value) })}
                    className="input-field"
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <label className="input-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Library, Cafeteria"
                  />
                </div>
              </div>
              
              <div>
                <label className="input-label">Upload Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary-500 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="h-32 w-auto rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-1 flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
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
                <button type="button" onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  List Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <ListingDetailsModal
          listing={showDetailsModal}
          currentUser={currentUser}
          onClose={() => setShowDetailsModal(null)}
          onClaim={handleClaimItem}
          getConditionStyle={getConditionStyle}
          getCategoryIcon={getCategoryIcon}
        />
      )}
    </div>
  );
};

// Listing Card Component
const ListingCard = ({ listing, currentUser, onViewDetails, getConditionStyle, getCategoryIcon: GetCategoryIcon }) => {
  const conditionStyle = getConditionStyle(listing.condition);
  const CategoryIcon = GetCategoryIcon(listing.category);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
      {listing.imageUrl ? (
        <img src={listing.imageUrl} alt={listing.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-primary-50 to-emerald-50 flex items-center justify-center">
          <CategoryIcon size={48} className="text-primary-400" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${conditionStyle.color}`}>
            {conditionStyle.label}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{listing.description}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <User size={14} />
            <span className="text-xs">{listing.ownerName || 'Student'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-semibold">{listing.ecoValue || 5} pts</span>
            <button
              onClick={() => onViewDetails(listing)}
              className="px-3 py-1 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Listing Details Modal
const ListingDetailsModal = ({ listing, currentUser, onClose, onClaim, getConditionStyle, getCategoryIcon: GetCategoryIcon }) => {
  const conditionStyle = getConditionStyle(listing.condition);
  const CategoryIcon = GetCategoryIcon(listing.category);
  const isOwner = currentUser?.uid === listing.ownerId;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {listing.imageUrl ? (
          <img src={listing.imageUrl} alt={listing.title} className="w-full h-48 object-cover rounded-t-2xl" />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary-50 to-emerald-50 flex items-center justify-center rounded-t-2xl">
            <CategoryIcon size={64} className="text-primary-400" />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{listing.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${conditionStyle.color}`}>
                  {conditionStyle.label}
                </span>
                <span className="text-xs text-gray-500">{listing.category}</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">+{listing.ecoValue || 5} pts</span>
          </div>
          
          <p className="text-gray-600 mb-4 leading-relaxed">{listing.description}</p>
          
          <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 text-gray-700">
              <User size={16} />
              <span>Listed by: {listing.ownerName || 'Student'}</span>
            </div>
            {listing.location && (
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin size={16} />
                <span>Location: {listing.location}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar size={16} />
              <span>Listed: {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'Recently'}</span>
            </div>
          </div>
          
          {listing.status === 'available' && !isOwner && currentUser && (
            <button
              onClick={() => onClaim(listing.id, listing.ownerId)}
              className="btn-primary w-full py-3 mb-3 flex items-center justify-center gap-2"
            >
              <Send size={16} />
              Claim Item
            </button>
          )}
          
          {isOwner && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center mb-3">
              <p className="text-blue-700 font-medium">This is your listing</p>
            </div>
          )}
          
          {listing.status === 'claimed' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center mb-3">
              <CheckCircle size={16} className="inline mr-2" />
              <span className="text-green-700 font-medium">Item has been claimed</span>
            </div>
          )}
          
          {!currentUser && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
              <AlertCircle size={16} className="inline mr-2 text-yellow-600" />
              <Link to="/login" className="text-primary-600 font-medium">Login</Link>
              <span className="text-gray-600"> to claim this item</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;