// src/pages/VerifyRecycling.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext"; // Fixed import path
import { Camera, Upload, X, CheckCircle } from "lucide-react";
import { firebaseService } from "../services/firebaseService";
import { geminiService } from "../services/geminiService";
import toast from "react-hot-toast";

const VerifyRecycling = () => {
  const { currentUser } = useAuth();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    category: "",
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) {
      toast.error("Please upload an image first");
      return;
    }

    setAnalyzing(true);
    try {
      const result = await geminiService.analyzeWasteImage(imageFile);
      setAnalysis(result);
      setSelectedStatus(result.status);
      setFormData({
        itemName: result.material || "",
        description: result.recommendation || "",
        category: result.material || "",
      });
      toast.success("AI Analysis Complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    if (!formData.itemName || !formData.description) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const result = await firebaseService.createVerificationReport(
        {
          userId: currentUser.uid,
          itemName: formData.itemName,
          description: formData.description,
          category: formData.category,
          aiClassification: analysis?.material,
          confidence: analysis?.confidence,
          selectedStatus,
          ecoPointsAwarded: analysis?.ecoPoints || 10,
        },
        imageFile,
      );

      await firebaseService.updateUserPoints(
        currentUser.uid,
        analysis?.ecoPoints || 10,
      );
      toast.success(
        `Verification submitted! +${analysis?.ecoPoints || 10} Eco Points`,
      );

      // Reset form
      setImagePreview(null);
      setImageFile(null);
      setAnalysis(null);
      setSelectedStatus("");
      setFormData({ itemName: "", description: "", category: "" });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit verification");
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100/30 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-green-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
          >
            <X size={20} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Camera size={24} className="text-green-600" />
              Verify Recycling
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload a photo of your recycled/upcycled item
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
          {/* Image Upload */}
          {!imagePreview ? (
            <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors bg-green-50/30">
              <Camera className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Upload a photo of your item</p>
              <p className="text-xs text-gray-400 mb-4">PNG, JPG up to 5MB</p>
              <label className="bg-green-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 cursor-pointer hover:bg-green-700 transition-colors">
                <Upload size={16} />
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-96 object-cover rounded-lg"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={removeImage}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
                <button
                  onClick={analyzeImage}
                  disabled={analyzing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {analyzing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </div>
                  ) : (
                    "Analyze with AI"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* AI Analysis Results */}
          {analysis && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                AI Analysis Results
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-green-100">
                  <span className="text-gray-600">Material:</span>
                  <span className="font-semibold text-green-800">
                    {analysis.material}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-green-100">
                  <span className="text-gray-600">Condition:</span>
                  <span className="font-semibold text-green-800">
                    {analysis.condition}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-green-100">
                  <span className="text-gray-600">Recommendation:</span>
                  <span className="font-semibold text-green-600">
                    {analysis.recommendation}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-green-100">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-semibold text-green-800">
                    {analysis.confidence}%
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Eco Points:</span>
                  <span className="font-bold text-green-600 text-lg">
                    +{analysis.ecoPoints}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Verification Form */}
          {analysis && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Recycled", "Upcycled", "Reused", "Exchanged"].map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setSelectedStatus(status)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedStatus === status
                            ? "border-green-500 bg-green-50 text-green-700 font-medium"
                            : "border-gray-200 text-gray-600 hover:border-green-300"
                        }`}
                      >
                        {status}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Submit Verification
              </button>
            </form>
          )}
        </div>

        {/* Info Note */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 text-xs">Why Verify?</h4>
              <p className="text-xs text-blue-700 mt-0.5">
                Each verified item earns you eco points. Make sure to upload
                clear photos for accurate AI analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyRecycling;
