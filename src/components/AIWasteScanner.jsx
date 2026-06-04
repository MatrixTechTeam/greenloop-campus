// src/components/AIWasteScanner.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { firebaseService } from "../services/firebaseService";
import { geminiService } from "../services/geminiService";
import {
  Upload,
  X,
  Sparkles,
  Loader2,
  Save,
  RefreshCw,
  Camera,
  CheckCircle,
  Recycle,
  Trash2,
  Leaf,
  Globe,
  Zap,
  Package,
  Info,
  ThumbsUp,
  Award,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

const AIWasteScanner = ({ isOpen, onClose, onSave }) => {
  const { currentUser, userProfile } = useAuth();
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState("upload");
  const [isClosing, setIsClosing] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  //escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isClosing) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isClosing]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
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
    setSelectedStatus("");
    setMode("upload");
    setExpandedSection(null);
    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const processImage = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return false;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setMode("preview");
    };
    reader.readAsDataURL(file);
    return true;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  const handleTakePhoto = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      toast.error("Please upload or capture an image first");
      return;
    }
    setAnalyzing(true);
    try {
      const blob = await fetch(image).then((res) => res.blob());
      const file = new File([blob], "waste-image.jpg", { type: "image/jpeg" });
      const result = await geminiService.analyzeWasteImage(file);

      // Enhance the analysis
      const enhancedResult = {
        ...result,
        detailedAnalysis: {
          environmentalImpact: `This ${result.material} item has an estimated carbon footprint of ${result.carbonFootprint || "medium"} impact. ${result.recyclable ? "It can be recycled to save resources and reduce landfill waste." : "This item is not easily recyclable and should be disposed of properly."}`,
          disposalInstructions: `To properly dispose of this ${result.material}: ${result.disposalGuide || "Please check your local recycling guidelines for specific instructions."}`,
          recyclingProcess: result.recyclable
            ? `${result.material} recycling typically involves collection, sorting, cleaning, shredding, melting, and reforming into new products. This process saves up to 70% energy compared to producing new materials.`
            : null,
          funFact: result.recyclable
            ? `Did you know? Recycling just one ${result.material.toLowerCase()} item can save enough energy to power a light bulb for several hours!`
            : `Did you know? ${result.material} waste takes ${result.material === "Plastic" ? "400+ years" : result.material === "Glass" ? "1 million years" : "decades"} to decompose in landfills.`,
          alternativeUses:
            result.upcycleIdeas?.length > 0
              ? result.upcycleIdeas
              : [
                  `Use as a storage container`,
                  `Create a DIY project`,
                  `Donate to local recycling center`,
                  `Repurpose for gardening`,
                ],
          carbonSavings: result.recyclable
            ? `Recycling this item saves approximately ${(result.ecoPoints || 10) * 0.5}kg of CO2 emissions.`
            : null,
        },
      };

      setAnalysis(enhancedResult);
      setSelectedStatus(result.status || "Recycled");
      toast.success("AI Analysis Complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedStatus) {
      toast.error("Please select a verification status");
      return;
    }
    setSaving(true);
    try {
      const blob = await fetch(image).then((res) => res.blob());
      const file = new File([blob], "waste-verification.jpg", {
        type: "image/jpeg",
      });

      const verificationData = {
        userId: currentUser.uid,
        userName: userProfile?.fullname || "Anonymous",
        itemName: analysis?.material || "Recycled Item",
        description:
          analysis?.recommendation || "Item verified through AI scan",
        category: analysis?.material || "Mixed",
        aiClassification: analysis?.material || null,
        confidence: analysis?.confidence ?? null,
        selectedStatus,
        ecoPointsAwarded: analysis?.ecoPoints || 10,
        recyclable: analysis?.recyclable ?? null,
        upcycleIdeas: analysis?.upcycleIdeas || [],
        environmentalImpact:
          analysis?.detailedAnalysis?.environmentalImpact || null,
      };

      await firebaseService.createVerificationReport(verificationData, file);
      await firebaseService.updateUserPoints(
        currentUser.uid,
        analysis?.ecoPoints || 10,
      );
      toast.success(
        `Verification saved! +${analysis?.ecoPoints || 10} Eco Points`,
      );
      handleClose();
      if (onSave) onSave();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save verification");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-2xl mx-auto mt-10 transition-all duration-200 ${isClosing ? "opacity-0 -translate-y-10" : "opacity-100 translate-y-0"}`}
      >
        <div className="bg-white rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto shadow-2xl">
          {/* Header - Green Theme */}
          <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-white" />
              <h2 className="text-lg font-bold text-white">AI Waste Scanner</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 bg-green-50/30">
            {!analysis ? (
              <>
                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Mode Selection Buttons */}
                {!image && (
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all bg-white text-gray-600 border border-green-200 hover:bg-green-50`}
                    >
                      <Upload size={16} className="inline mr-2" />
                      Upload
                    </button>
                    <button
                      onClick={handleTakePhoto}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all bg-white text-gray-600 border border-green-200 hover:bg-green-50`}
                    >
                      <Camera size={16} className="inline mr-2" />
                      Take Photo
                    </button>
                  </div>
                )}

                {/* Upload Box */}
                {!image && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-green-300 rounded-2xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all bg-white"
                  >
                    <Upload size={48} className="mx-auto text-green-400 mb-3" />
                    <p className="text-gray-600 font-medium">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}

                {/* Image Preview */}
                {image && (
                  <div className="space-y-4">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full rounded-xl max-h-80 object-contain bg-white border border-green-200"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={resetScanner}
                        className="flex-1 px-4 py-3 bg-white border border-green-200 text-green-700 rounded-xl font-medium hover:bg-green-50 transition-colors"
                      >
                        Choose Different
                      </button>
                      <button
                        onClick={analyzeImage}
                        disabled={analyzing}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {analyzing ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Sparkles size={18} />
                        )}
                        Analyze with AI
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Results View (same as before)
              <div className="space-y-4">
                <img
                  src={image}
                  alt="Scanned"
                  className="w-full rounded-xl max-h-48 object-contain bg-white border border-green-200"
                />

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">AI Analysis Summary</h3>
                    <Award size={24} className="text-yellow-300" />
                  </div>
                  <p className="text-sm text-green-100">
                    This item has been identified as{" "}
                    <strong className="text-white">{analysis.material}</strong>{" "}
                    with {analysis.confidence}% confidence.
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <CheckCircle size={14} className="text-green-300" />
                      <span className="text-xs">
                        {analysis.recyclable ? "Recyclable" : "Not Recyclable"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap size={14} className="text-yellow-300" />
                      <span className="text-xs font-bold">
                        +{analysis.ecoPoints} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis Sections */}
                <div className="space-y-3">
                  {/* Material Details */}
                  <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection("material")}
                      className="w-full p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Package size={18} className="text-green-600" />
                        <span className="font-semibold text-gray-900">
                          Material Details
                        </span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform ${expandedSection === "material" ? "rotate-180" : ""}`}
                      />
                    </button>
                    {expandedSection === "material" && (
                      <div className="px-4 pb-4 space-y-2 border-t border-green-100">
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Material Type:</span>
                          <span className="font-medium text-gray-900">
                            {analysis.material}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Condition:</span>
                          <span className="font-medium text-gray-900 capitalize">
                            {analysis.condition}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Recyclable:</span>
                          <span
                            className={
                              analysis.recyclable
                                ? "text-green-600 font-medium"
                                : "text-red-600 font-medium"
                            }
                          >
                            {analysis.recyclable
                              ? "Yes - Can be recycled"
                              : "No - Not recyclable"}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium text-gray-900 capitalize">
                            {analysis.category}
                          </span>
                        </div>
                        <div className="mt-2 p-2 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            {analysis.detailedAnalysis?.environmentalImpact}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Disposal Guide */}
                  <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection("disposal")}
                      className="w-full p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Trash2 size={18} className="text-green-600" />
                        <span className="font-semibold text-gray-900">
                          Disposal Guide
                        </span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform ${expandedSection === "disposal" ? "rotate-180" : ""}`}
                      />
                    </button>
                    {expandedSection === "disposal" && (
                      <div className="px-4 pb-4 space-y-3 border-t border-green-100">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            {analysis.recommendation}
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            {analysis.detailedAnalysis?.disposalInstructions}
                          </p>
                        </div>
                        {analysis.detailedAnalysis?.recyclingProcess && (
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-800">
                              {analysis.detailedAnalysis.recyclingProcess}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Environmental Impact */}
                  <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
                    <button
                      onClick={() => toggleSection("impact")}
                      className="w-full p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Globe size={18} className="text-green-600" />
                        <span className="font-semibold text-gray-900">
                          Environmental Impact
                        </span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform ${expandedSection === "impact" ? "rotate-180" : ""}`}
                      />
                    </button>
                    {expandedSection === "impact" && (
                      <div className="px-4 pb-4 space-y-3 border-t border-green-100">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-green-600" />
                            <span className="text-sm text-gray-600">
                              Carbon Footprint:
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {analysis.carbonFootprint || "Medium"}
                          </span>
                        </div>
                        {analysis.detailedAnalysis?.carbonSavings && (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Leaf size={16} className="text-green-600" />
                              <span className="text-sm text-green-700">
                                Carbon Savings:
                              </span>
                            </div>
                            <span className="font-medium text-green-700">
                              {analysis.detailedAnalysis.carbonSavings}
                            </span>
                          </div>
                        )}
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            {analysis.detailedAnalysis?.funFact}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upcycling Ideas */}
                  {analysis.detailedAnalysis?.alternativeUses?.length > 0 && (
                    <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
                      <button
                        onClick={() => toggleSection("upcycle")}
                        className="w-full p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Recycle size={18} className="text-green-600" />
                          <span className="font-semibold text-gray-900">
                            Creative Upcycling Ideas
                          </span>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-gray-400 transition-transform ${expandedSection === "upcycle" ? "rotate-180" : ""}`}
                        />
                      </button>
                      {expandedSection === "upcycle" && (
                        <div className="px-4 pb-4 border-t border-green-100">
                          <ul className="space-y-2">
                            {analysis.detailedAnalysis.alternativeUses.map(
                              (idea, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                  <ThumbsUp
                                    size={14}
                                    className="text-green-500 mt-0.5 flex-shrink-0"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {idea}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Verification Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Status *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Recycled", "Upcycled", "Reused", "Exchanged"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => setSelectedStatus(status)}
                          className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            selectedStatus === status
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50"
                          }`}
                        >
                          {status}
                        </button>
                      ),
                    )}
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
                    {saving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save & Earn Points
                  </button>
                </div>

                {/* Info Note */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <Info
                      size={14}
                      className="text-green-600 mt-0.5 flex-shrink-0"
                    />
                    <p className="text-xs text-green-700">
                      By verifying this item, you'll earn{" "}
                      <strong>{analysis.ecoPoints} Eco Points</strong> and help
                      track campus sustainability efforts. Your contribution
                      helps us measure our collective environmental impact.
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
