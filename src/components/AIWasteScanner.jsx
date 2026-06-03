// src/components/AIWasteScanner.jsx - White & Green Theme
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { geminiService } from '../services/geminiService';
import { Upload, X, Sparkles, Loader2, Save, RefreshCw, Camera, CheckCircle, Recycle } from 'lucide-react';
import toast from 'react-hot-toast';

const AIWasteScanner = ({ isOpen, onClose, onSave }) => {
  const { currentUser, userProfile } = useAuth();
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('upload');
  const [showCamera, setShowCamera] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isClosing]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      resetScanner();
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const resetScanner = () => {
    setImage(null);
    setAnalysis(null);
    setSelectedStatus('');
    setMode('upload');
    setShowCamera(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setMode('preview');
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
      setMode('camera');
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
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result);
          setMode('preview');
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          setShowCamera(false);
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setMode('upload');
  };

  const analyzeImage = async () => {
    if (!image) {
      toast.error('Please upload or capture an image first');
      return;
    }
    setAnalyzing(true);
    try {
      const blob = await fetch(image).then(res => res.blob());
      const file = new File([blob], 'waste-image.jpg', { type: 'image/jpeg' });
      const result = await geminiService.analyzeWasteImage(file);
      setAnalysis(result);
      setSelectedStatus(result.status);
      toast.success('AI Analysis Complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedStatus) {
      toast.error('Please select a verification status');
      return;
    }
    setSaving(true);
    try {
      const blob = await fetch(image).then(res => res.blob());
      const file = new File([blob], 'waste-verification.jpg', { type: 'image/jpeg' });

      const verificationData = {
        userId: currentUser.uid,
        userName: userProfile?.fullname || 'Anonymous',
        itemName: analysis?.material || 'Recycled Item',
        description: analysis?.recommendation || 'Item verified through AI scan',
        category: analysis?.material || 'Mixed',
        aiClassification: analysis?.material || null,
        confidence: analysis?.confidence ?? null,
        selectedStatus,
        ecoPointsAwarded: analysis?.ecoPoints || 10,
        recyclable: analysis?.recyclable ?? null,
        upcycleIdeas: analysis?.upcycleIdeas || [],
        environmentalImpact: analysis?.environmentalImpact || null,
      };

      await firebaseService.createVerificationReport(verificationData, file);
      await firebaseService.updateUserPoints(currentUser.uid, analysis?.ecoPoints || 10);
      toast.success(`Verification saved! +${analysis?.ecoPoints || 10} Eco Points`);
      handleClose();
      if (onSave) onSave();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save verification');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative z-10 w-full max-w-2xl mx-auto mt-10 transition-all duration-200 ${isClosing ? 'opacity-0 -translate-y-10' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto shadow-2xl">
          {/* Header - Green Theme */}
          <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-white" />
              <h2 className="text-lg font-bold text-white">AI Waste Scanner</h2>
            </div>
            <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 bg-green-50/30">
            {!analysis ? (
              <>
                {/* Mode Selection Buttons - Green Theme */}
                {!image && (
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => { setMode('upload'); setShowCamera(false); }}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        mode === 'upload' 
                          ? 'bg-green-600 text-white shadow-md' 
                          : 'bg-white text-gray-600 border border-green-200 hover:bg-green-50'
                      }`}
                    >
                      <Upload size={16} className="inline mr-2" />
                      Upload
                    </button>
                    <button
                      onClick={startCamera}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        mode === 'camera' 
                          ? 'bg-green-600 text-white shadow-md' 
                          : 'bg-white text-gray-600 border border-green-200 hover:bg-green-50'
                      }`}
                    >
                      <Camera size={16} className="inline mr-2" />
                      Camera
                    </button>
                  </div>
                )}

                {/* Camera View */}
                {mode === 'camera' && showCamera && (
                  <div className="relative w-full rounded-xl overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-96 object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
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
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Box - Green Theme */}
                {mode === 'upload' && !image && !showCamera && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-green-300 rounded-2xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all bg-white"
                  >
                    <Upload size={48} className="mx-auto text-green-400 mb-3" />
                    <p className="text-gray-600 font-medium">Click to upload an image</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Image Preview */}
                {image && mode === 'preview' && (
                  <div className="space-y-4">
                    <img src={image} alt="Preview" className="w-full rounded-xl max-h-80 object-contain bg-white border border-green-200" />
                    <div className="flex gap-3">
                      <button onClick={resetScanner} className="flex-1 px-4 py-3 bg-white border border-green-200 text-green-700 rounded-xl font-medium hover:bg-green-50 transition-colors">
                        Choose Different
                      </button>
                      <button
                        onClick={analyzeImage}
                        disabled={analyzing}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {analyzing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        Analyze with AI
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Results View - Green Theme
              <div className="space-y-4">
                <img src={image} alt="Scanned" className="w-full rounded-xl max-h-60 object-contain bg-white border border-green-200" />
                
                {/* Analysis Results Card */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle size={18} className="text-green-600" />
                    Analysis Results
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-green-100">
                      <span className="text-gray-600">Material:</span>
                      <span className="font-semibold text-green-800">{analysis.material}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-green-100">
                      <span className="text-gray-600">Condition:</span>
                      <span className="font-semibold text-green-800">{analysis.condition}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-green-100">
                      <span className="text-gray-600">Recommendation:</span>
                      <span className="font-semibold text-green-600">{analysis.recommendation}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-green-100">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-semibold text-green-800">{analysis.confidence}%</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-green-100">
                      <span className="text-gray-600">Recyclable:</span>
                      <span className={analysis.recyclable ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {analysis.recyclable ? 'Yes ♻️' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Eco Points:</span>
                      <span className="font-bold text-green-600 text-lg">+{analysis.ecoPoints}</span>
                    </div>
                  </div>
                </div>

                {/* Upcycling Ideas */}
                {analysis.upcycleIdeas?.length > 0 && (
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <Recycle size={16} className="text-green-600" />
                      💡 Upcycling Ideas
                    </h3>
                    <ul className="space-y-1">
                      {analysis.upcycleIdeas.map((idea, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500">•</span>
                          {idea}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Verification Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Recycled', 'Upcycled', 'Reused', 'Exchanged'].map(status => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          selectedStatus === status
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={resetScanner} 
                    className="flex-1 px-4 py-3 bg-white border border-green-200 text-green-700 rounded-xl font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Scan Again
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={saving || !selectedStatus} 
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={16} />}
                    Save & Earn Points
                  </button>
                </div>

                {/* Info Note */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <Sparkles size={14} className="text-green-600 mt-0.5" />
                    <p className="text-xs text-green-700">
                      By verifying this item, you'll earn eco points and help track campus sustainability efforts.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWasteScanner;