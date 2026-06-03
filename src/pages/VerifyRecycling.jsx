// src/pages/VerifyRecycling.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Upload, X, CheckCircle } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { geminiService } from '../services/geminiService';
import toast from 'react-hot-toast';

const VerifyRecycling = () => {
  const { currentUser } = useAuth();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    category: '',
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) {
      toast.error('Please upload an image first');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await geminiService.analyzeWasteImage(imageFile);
      setAnalysis(result);
      setSelectedStatus(result.status);
      setFormData({
        itemName: result.material || '',
        description: result.recommendation || '',
        category: result.material || '',
      });
      toast.success('AI Analysis Complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await firebaseService.createVerificationReport({
        userId: currentUser.uid,
        itemName: formData.itemName,
        description: formData.description,
        category: formData.category,
        aiClassification: analysis?.material,
        confidence: analysis?.confidence,
        selectedStatus,
        ecoPointsAwarded: analysis?.ecoPoints || 10,
      }, imageFile);

      await firebaseService.updateUserPoints(currentUser.uid, analysis?.ecoPoints || 10);
      toast.success(`Verification submitted! +${analysis?.ecoPoints || 10} Eco Points`);
      
      // Reset form
      setImagePreview(null);
      setImageFile(null);
      setAnalysis(null);
      setSelectedStatus('');
      setFormData({ itemName: '', description: '', category: '' });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit verification');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Camera size={28} className="text-primary-600" />
          Verify Recycling
        </h1>
        <p className="text-gray-500 mt-1">Upload a photo of your recycled/upcycled item</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Image Upload */}
        {!imagePreview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">Upload a photo of your item</p>
            <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
              <Upload size={16} />
              Choose Image
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <div>
            <img src={imagePreview} alt="Preview" className="w-full max-h-96 object-cover rounded-lg" />
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setImagePreview(null); setImageFile(null); setAnalysis(null); }} className="btn-secondary">Remove</button>
              <button onClick={analyzeImage} disabled={analyzing} className="btn-primary flex-1">
                {analyzing ? 'Analyzing...' : 'Analyze with AI'}
              </button>
            </div>
          </div>
        )}

        {/* AI Analysis Results */}
        {analysis && (
          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">AI Analysis Results</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Material:</strong> {analysis.material}</p>
              <p><strong>Condition:</strong> {analysis.condition}</p>
              <p><strong>Recommendation:</strong> {analysis.recommendation}</p>
              <p><strong>Confidence:</strong> {analysis.confidence}%</p>
              <p><strong>Eco Points:</strong> +{analysis.ecoPoints}</p>
            </div>
          </div>
        )}

        {/* Verification Form */}
        {analysis && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="input-label">Item Name</label>
              <input type="text" value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field resize-none" rows="3" required />
            </div>
            <div>
              <label className="input-label">Verification Status *</label>
              <div className="grid grid-cols-2 gap-2">
                {['Recycled', 'Upcycled', 'Reused', 'Exchanged'].map(status => (
                  <button key={status} type="button" onClick={() => setSelectedStatus(status)} className={`p-2 rounded-lg border-2 ${selectedStatus === status ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">Submit Verification</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyRecycling;