// src/pages/WasteReport.jsx - Without react-hot-toast dependency
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { firebaseService } from "../services/firebaseService";
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
  Image as ImageIcon,
  ArrowLeft,
  Award,
  FileText,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

// Simple notification function (replace toast)
const showMessage = (message, type = "success") => {
  // Create a temporary div for notification
  const toastDiv = document.createElement("div");
  toastDiv.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-white text-sm font-medium shadow-lg transition-all duration-300 ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : "bg-blue-500"
  }`;
  toastDiv.innerText = message;
  document.body.appendChild(toastDiv);
  setTimeout(() => {
    toastDiv.style.opacity = "0";
    setTimeout(() => toastDiv.remove(), 300);
  }, 3000);
};

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
    wasteType: "",
    description: "",
    quantity: "small",
    urgency: "normal",
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const wasteTypes = [
    {
      value: "plastic",
      label: "Plastic",
      icon: Package,
      color: "bg-blue-100 text-blue-700",
    },
    {
      value: "glass",
      label: "Glass",
      icon: Package,
      color: "bg-green-100 text-green-700",
    },
    {
      value: "metal",
      label: "Metal",
      icon: Package,
      color: "bg-gray-100 text-gray-700",
    },
    {
      value: "paper",
      label: "Paper",
      icon: Package,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      value: "organic",
      label: "Organic",
      icon: Leaf,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      value: "electronic",
      label: "E-Waste",
      icon: Package,
      color: "bg-purple-100 text-purple-700",
    },
    {
      value: "textile",
      label: "Textile",
      icon: Package,
      color: "bg-pink-100 text-pink-700",
    },
    {
      value: "cardboard",
      label: "Cardboard",
      icon: Package,
      color: "bg-orange-100 text-orange-700",
    },
    {
      value: "mixed",
      label: "Mixed",
      icon: Package,
      color: "bg-gray-100 text-gray-700",
    },
  ];

  const quantities = [
    { value: "small", label: "Small", points: 5, desc: "single item" },
    { value: "medium", label: "Medium", points: 10, desc: "bag full" },
    { value: "large", label: "Large", points: 20, desc: "bin full" },
  ];

  const urgencies = [
    {
      value: "low",
      label: "Low",
      desc: "Can wait",
      color: "bg-green-100 text-green-700",
      border: "border-green-200",
    },
    {
      value: "normal",
      label: "Normal",
      desc: "Regular pickup",
      color: "bg-yellow-100 text-yellow-700",
      border: "border-yellow-200",
    },
    {
      value: "high",
      label: "High",
      desc: "Needs attention",
      color: "bg-orange-100 text-orange-700",
      border: "border-orange-200",
    },
    {
      value: "urgent",
      label: "Urgent",
      desc: "Immediate action",
      color: "bg-red-100 text-red-700",
      border: "border-red-200",
    },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      showMessage("Geolocation not supported", "error");
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
        showMessage("Location detected", "success");
      },
      (error) => {
        console.error("Location error:", error);
        showMessage("Could not get location. Please enable GPS.", "error");
        setLocationLoading(false);
      },
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showMessage("Image must be less than 5MB", "error");
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
      console.error("Camera error:", error);
      showMessage("Could not access camera", "error");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );

      canvasRef.current.toBlob(
        (blob) => {
          const file = new File([blob], "camera-capture.jpg", {
            type: "image/jpeg",
          });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(blob));
          stopCamera();
        },
        "image/jpeg",
        0.8,
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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
      showMessage("Please select waste type", "error");
      return;
    }

    if (!formData.description) {
      showMessage("Please provide a description", "error");
      return;
    }

    if (!location) {
      showMessage("Please enable location services", "error");
      return;
    }

    setLoading(true);

    try {
      const selectedQuantity = quantities.find(
        (q) => q.value === formData.quantity,
      );
      const pointsEarned = selectedQuantity?.points || 5;

      const reportData = {
        userId: currentUser.uid,
        userName: userProfile?.fullname || "Anonymous",
        wasteType: formData.wasteType,
        description: formData.description,
        quantity: formData.quantity,
        urgency: formData.urgency,
        latitude: location.lat,
        longitude: location.lng,
        pointsEarned,
        status: "pending",
      };

      await firebaseService.createWasteReport(reportData, imageFile);
      await firebaseService.updateUserPoints(currentUser.uid, pointsEarned);

      showMessage(`Report submitted! +${pointsEarned} Eco Points`, "success");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting report:", error);
      showMessage("Failed to submit report", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedWasteType = wasteTypes.find(
    (w) => w.value === formData.wasteType,
  );
  const selectedUrgency = urgencies.find((u) => u.value === formData.urgency);
  const selectedQuantity = quantities.find(
    (q) => q.value === formData.quantity,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100/30 pb-20">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-green-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
          >
            <ArrowLeft size={22} className="text-gray-700" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Trash2 size={24} className="text-red-500" />
              Report Waste
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Help keep our campus clean
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5 max-w-2xl mx-auto">
        {/* Points Banner */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 flex items-center justify-between border border-yellow-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Award size={16} className="text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              Earn up to
            </span>
          </div>
          <span className="text-xl font-bold text-green-600">
            20 Eco Points
          </span>
        </div>

        {/* Camera View */}
        {showCamera && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <div className="relative w-full max-w-md mx-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-xl"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                <button
                  onClick={capturePhoto}
                  className="px-6 py-3 bg-white rounded-full text-gray-900 font-semibold shadow-lg active:scale-95 transition-transform"
                >
                  Capture
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-red-500 rounded-full text-white font-semibold shadow-lg active:scale-95 transition-transform"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Waste Image
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 active:scale-95 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 transition-colors bg-gray-50/30">
                <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Upload a photo of the waste
                </p>
                <p className="text-xs text-gray-400 mb-3">PNG, JPG up to 5MB</p>
                <div className="flex gap-2 justify-center">
                  <label className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Upload size={14} />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <Camera size={14} />
                    Take Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Waste Type Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Waste Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {wasteTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, wasteType: type.value })
                  }
                  className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                    formData.wasteType === type.value
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full ${type.color} flex items-center justify-center`}
                  >
                    <type.icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 resize-none text-sm"
              rows="3"
              placeholder="Describe the waste, its location, approximate amount..."
              required
            />
          </div>

          {/* Quantity & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity
              </label>
              <div className="space-y-2">
                {quantities.map((qty) => (
                  <button
                    key={qty.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, quantity: qty.value })
                    }
                    className={`w-full p-2 rounded-lg border-2 text-left transition-all ${
                      formData.quantity === qty.value
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {qty.label}
                        </span>
                        <p className="text-xs text-gray-500">{qty.desc}</p>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        +{qty.points} pts
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Urgency Level
              </label>
              <div className="space-y-2">
                {urgencies.map((urg) => (
                  <button
                    key={urg.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, urgency: urg.value })
                    }
                    className={`w-full p-2 rounded-lg border-2 transition-all ${
                      formData.urgency === urg.value
                        ? `border-red-500 bg-red-50`
                        : `border-gray-200 hover:border-red-300`
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${urg.color}`}
                        >
                          {urg.label}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{urg.desc}</p>
                      </div>
                      {formData.urgency === urg.value && (
                        <CheckCircle size={16} className="text-red-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Location *
              </label>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
              >
                <MapPin size={12} />
                Refresh
              </button>
            </div>

            {locationLoading ? (
              <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                <Loader2 className="animate-spin text-red-500" size={20} />
                <span className="ml-2 text-sm text-gray-600">
                  Detecting location...
                </span>
              </div>
            ) : location ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle
                  size={18}
                  className="text-green-600 flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Location detected
                  </p>
                  <p className="text-xs text-green-600">
                    Lat: {location.lat.toFixed(6)}, Lng:{" "}
                    {location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle
                  size={18}
                  className="text-yellow-600 flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Location not available
                  </p>
                  <p className="text-xs text-yellow-600">
                    Please enable location services
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
              <FileText size={14} className="text-red-500" />
              Report Summary
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Waste Type:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {selectedWasteType?.label || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium text-gray-900">
                  {selectedQuantity?.label || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Urgency:</span>
                <span className="font-medium text-gray-900">
                  {selectedUrgency?.label || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-red-200 mt-1">
                <span className="text-gray-600">Points to Earn:</span>
                <span className="font-bold text-green-600 text-lg">
                  +{selectedQuantity?.points || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              loading ||
              !location ||
              !formData.wasteType ||
              !formData.description
            }
            className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md active:scale-98"
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
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Leaf size={14} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-800 text-xs">
                Why Report Waste?
              </h4>
              <p className="text-xs text-blue-700 mt-0.5">
                Your reports help campus maintenance teams identify waste
                hotspots and improve recycling efforts. Each verified report
                earns you eco points!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteReport;
