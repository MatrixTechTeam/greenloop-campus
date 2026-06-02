// src/pages/Events.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  Search, 
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  CalendarDays,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Events = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, upcoming, past, joined
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    maxParticipants: '',
    category: 'cleanup',
  });

  const categories = [
    { value: 'cleanup', label: 'Cleanup Drive', color: 'bg-green-100 text-green-700' },
    { value: 'workshop', label: 'Workshop', color: 'bg-blue-100 text-blue-700' },
    { value: 'seminar', label: 'Seminar', color: 'bg-purple-100 text-purple-700' },
    { value: 'campaign', label: 'Campaign', color: 'bg-orange-100 text-orange-700' },
    { value: 'competition', label: 'Competition', color: 'bg-pink-100 text-pink-700' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700' },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await firebaseService.getAllEvents();
      setEvents(allEvents.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.location || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        date: new Date(`${formData.date}T${formData.time}`),
        maxParticipants: parseInt(formData.maxParticipants) || 0,
        category: formData.category,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
      };
      
      await firebaseService.createEvent(eventData);
      toast.success('Event created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await firebaseService.joinEvent(eventId, currentUser.uid);
      toast.success('Successfully joined the event! +25 Eco Points');
      fetchEvents();
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      date: '',
      time: '',
      maxParticipants: '',
      category: 'cleanup',
    });
  };

  const getCategoryStyle = (category) => {
    return categories.find(c => c.value === category) || categories[5];
  };

  const filterEvents = () => {
    let filtered = [...events];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Type filter
    const now = new Date();
    if (filterType === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.date) >= now);
    } else if (filterType === 'past') {
      filtered = filtered.filter(event => new Date(event.date) < now);
    } else if (filterType === 'joined') {
      filtered = filtered.filter(event => event.participants?.includes(currentUser?.uid));
    }
    
    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const filteredEvents = filterEvents();
  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= new Date());
  const pastEvents = filteredEvents.filter(e => new Date(e.date) < new Date());

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
            <CalendarDays size={28} className="text-primary-600" />
            Campus Events
          </h1>
          <p className="text-gray-500 mt-1">Join sustainability events and earn eco points</p>
        </div>
        {(isAdmin || userProfile?.role === 'volunteer') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Create Event
          </button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'upcoming', 'joined', 'past'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filterType === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && filterType !== 'past' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-green-600" />
            Upcoming Events ({upcomingEvents.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                currentUser={currentUser}
                onJoin={handleJoinEvent}
                onViewDetails={setSelectedEvent}
                getCategoryStyle={getCategoryStyle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Events Section */}
      {pastEvents.length > 0 && filterType !== 'upcoming' && filterType !== 'joined' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-gray-500" />
            Past Events ({pastEvents.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pastEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                currentUser={currentUser}
                onJoin={handleJoinEvent}
                onViewDetails={setSelectedEvent}
                getCategoryStyle={getCategoryStyle}
                isPast
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center">
          <CalendarDays size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Check back later for upcoming sustainability events</p>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="input-label">Event Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Campus Cleanup Day"
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
                  placeholder="Describe the event..."
                  required
                />
              </div>
              
              <div>
                <label className="input-label">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field"
                  placeholder="Main Campus, Building A"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Max Participants</label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    className="input-field"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          currentUser={currentUser}
          onClose={() => setSelectedEvent(null)}
          onJoin={handleJoinEvent}
          getCategoryStyle={getCategoryStyle}
        />
      )}
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, currentUser, onJoin, onViewDetails, getCategoryStyle, isPast }) => {
  const eventDate = new Date(event.date);
  const isJoined = event.participants?.includes(currentUser?.uid);
  const isFull = event.maxParticipants > 0 && event.participants?.length >= event.maxParticipants;
  const categoryStyle = getCategoryStyle(event.category);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryStyle.color}`}>
            {categoryStyle.label}
          </span>
          {!isPast && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              isJoined ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {isJoined ? '✓ Joined' : 'Available'}
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} />
            <span>{eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={14} />
            <span>{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={14} />
            <span>{event.participants?.length || 0} participants{event.maxParticipants ? ` / ${event.maxParticipants}` : ''}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(event)}
            className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            View Details
          </button>
          {!isPast && !isJoined && !isFull && currentUser && (
            <button
              onClick={() => onJoin(event.id)}
              className="flex-1 btn-primary py-2 text-sm"
            >
              Join Event
            </button>
          )}
          {isJoined && !isPast && (
            <button className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-default">
              ✓ Joined
            </button>
          )}
          {isFull && !isJoined && !isPast && (
            <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-default">
              Full
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Event Details Modal Component
const EventDetailsModal = ({ event, currentUser, onClose, onJoin, getCategoryStyle }) => {
  const eventDate = new Date(event.date);
  const isJoined = event.participants?.includes(currentUser?.uid);
  const isFull = event.maxParticipants > 0 && event.participants?.length >= event.maxParticipants;
  const isPast = eventDate < new Date();
  const categoryStyle = getCategoryStyle(event.category);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="p-1 bg-white/90 hover:bg-white rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryStyle.color}`}>
                {categoryStyle.label}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{event.title}</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{event.description}</p>
            
            <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar size={18} />
                <span>{eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Clock size={18} />
                <span>{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin size={18} />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Users size={18} />
                <span>{event.participants?.length || 0} participants{event.maxParticipants ? ` (Max: ${event.maxParticipants})` : ''}</span>
              </div>
            </div>
            
            {!isPast && currentUser && !isJoined && !isFull && (
              <button
                onClick={() => {
                  onJoin(event.id);
                  onClose();
                }}
                className="btn-primary w-full py-3 mb-3"
              >
                Join Event (+25 Eco Points)
              </button>
            )}
            
            {isJoined && !isPast && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center mb-3">
                <p className="text-green-700 font-medium">✓ You have joined this event</p>
              </div>
            )}
            
            {isFull && !isJoined && !isPast && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center mb-3">
                <p className="text-yellow-700 font-medium">Event is full</p>
              </div>
            )}
            
            {isPast && (
              <div className="bg-gray-100 rounded-xl p-3 text-center">
                <p className="text-gray-600">This event has ended</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;