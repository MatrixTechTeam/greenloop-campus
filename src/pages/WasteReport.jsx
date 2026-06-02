// src/pages/WasteReport.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { 
  Camera, 
  Upload, 
  X, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Trash2,
  Package,
  Recycle,
  Leaf,
  Send,
  Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const WasteReport = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState({
    wasteType: '',
    description: '',
    quantity: 'small',
    urgency: 'normal',
  });
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const wasteTypes = [
    { value: 'plastic', label: 'Plastic', icon: Package, color: 'bg-blue-100 text-blue-700' },
    { value: 'glass', label: 'Glass', icon: Package, color: 'bg-green-100 text-green-700' },
    { value: 'metal', label: 'Metal', icon: Package, color: 'bg-gray-100 text-gray-700' },
    { value: 'paper', label: 'Paper', icon: Package, color: 'bg-yellow-100 text-yellow-700' },
    { value: 'organic', label: 'Organic', icon: Leaf, color: 'bg-emerald-100 text-emerald-700' },
    { value: 'electronic', label: 'E-Waste', icon: Package, color: 'bg-purple-100 text-purple-700' },
    { value: 'textile', label: 'Textile', icon: Package, color: 'bg-pink-100 text-pink-700' },
    { value: 'cardboard', label: 'Cardboard', icon: Package, color: 'bg-orange-100 text-orange-700' },
    { value: 'mixed', label: 'Mixed', icon: Package, color: 'bg-gray-100 text-gray-700' },
  ];

  const quantities = [
    { value: 'small', label: 'Small (e.g., single item)', points: 5 },
    { value: 'medium', label: 'Medium (e.g., bag full)', points: 10 },
    { value: 'large', label: 'Large (e.g., bin full)', points: 20 },
  ];

  const urgencies = [
    { value: 'low', label: 'Low - Can wait', color: 'bg-green-100 text-green-700' },
    { value: 'normal', label: 'Normal - Regular pickup', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: 'High - Needs attention', color: 'bg-orange-100 text-orange-700' },
    { value: 'urgent', label: 'Urgent - Immediate action', color: 'bg-red-100 text-red-700' },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Could not access camera');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setImageFile(file);
        setImagePreview(URL.createObjectURL(blob));
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.wasteType) {
      toast.error('Please select waste type');
      return;
    }
    
    if (!formData.description) {
      toast.error('Please provide a description');
      return;
    }
    
    if (!location) {
      toast.error('Please enable location services');
      return;
    }
    
    setLoading(true);
    
    try {
      const selectedQuantity = quantities.find(q => q.value === formData.quantity);
      const pointsEarned = selectedQuantity?.points || 5;
      
      const reportData = {
        userId: currentUser.uid,
        userName: userProfile?.fullname || 'Anonymous',
        wasteType: formData.wasteType,
        description: formData.description,
        quantity: formData.quantity,
        urgency: formData.urgency,
        latitude: location.lat,
        longitude: location.lng,
        pointsEarned,
        status: 'pending',
      };
      
      await firebaseService.createWasteReport(reportData, imageFile);
      
      // Award points for reporting
      await firebaseService.updateUserPoints(currentUser.uid, pointsEarned);
      
      toast.success(`Report submitted! +${pointsEarned} Eco Points`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const selectedWasteType = wasteTypes.find(w => w.value === formData.wasteType);
  const selectedUrgency = urgencies.find(u => u.value === formData.urgency);
  const selectedQuantity = quantities.find(q => q.value === formData.quantity);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trash2 size={28} className="text-primary-600" />
            Report Waste
          </h1>
          <p className="text-gray-500 mt-1">Help keep our campus clean by reporting waste</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Earn Points</div>
          <div className="text-lg font-semibold text-green-600">+5 to +20 pts</div>
        </div>
      </div>

      {/* Camera View */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative w-full max-w-lg">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={capturePhoto}
                className="px-6 py-3 bg-white rounded-full text-gray-900 font-semibold"
              >
                Capture
              </button>
              <button
                onClick={stopCamera}
                className="px-6 py-3 bg-red-500 rounded-full text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="input-label mb-3 block">Waste Image</label>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Upload a photo of the waste</p>
              <p className="text-sm text-gray-400 mb-4">PNG, JPG up to 5MB</p>
              <div className="flex gap-3 justify-center">
                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                  <Upload size={16} />
                  Upload
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={startCamera}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Camera size={16} />
                  Take Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Waste Type Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="input-label block mb-3">Waste Type *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {wasteTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, wasteType: type.value })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.wasteType === type.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 mx-auto rounded-full ${type.color} flex items-center justify-center mb-2`}>
                  <type.icon size={18} />
                </div>
                <p className="text-sm font-medium text-gray-700">{type.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="input-label">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field resize-none"
            rows="4"
            placeholder="Describe the waste, its location, approximate amount, etc..."
            required
          />
        </div>

        {/* Quantity & Urgency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="input-label block mb-3">Quantity / Amount</label>
            <div className="space-y-2">
              {quantities.map((qty) => (
                <button
                  key={qty.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, quantity: qty.value })}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    formData.quantity === qty.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{qty.label}</span>
                    <span className="text-sm text-green-600 font-semibold">+{qty.points} pts</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <label className="input-label block mb-3">Urgency Level</label>
            <div className="space-y-2">
              {urgencies.map((urg) => (
                <button
                  key={urg.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: urg.value })}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    formData.urgency === urg.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${urg.color} mb-1`}>
                    {urg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="input-label">Location</label>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <MapPin size={14} />
              Refresh Location
            </button>
          </div>
          
          {locationLoading ? (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <Loader2 className="animate-spin text-primary-600" size={24} />
              <span className="ml-2 text-gray-600">Detecting location...</span>
            </div>
          ) : location ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Location detected</p>
                <p className="text-xs text-green-600">
                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle size={20} className="text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Location not available</p>
                <p className="text-xs text-yellow-600">Please enable location services</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-primary-50 to-emerald-50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Report Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Waste Type:</span>
              <span className="font-medium text-gray-900">{selectedWasteType?.label || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium text-gray-900">{selectedQuantity?.label || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Urgency:</span>
              <span className="font-medium text-gray-900">{selectedUrgency?.label || 'Not selected'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-primary-200">
              <span className="text-gray-600">Points to Earn:</span>
              <span className="font-bold text-green-600">+{selectedQuantity?.points || 0} pts</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !location || !formData.wasteType || !formData.description}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Send size={18} />
          )}
          Submit Waste Report
        </button>
      </form>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Leaf size={16} className="text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-800 text-sm">Why Report Waste?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your reports help campus maintenance teams identify waste hotspots and improve recycling efforts.
              Each verified report earns you eco points!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteReport;