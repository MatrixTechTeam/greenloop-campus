// src/pages/VerifyRecycling.jsx
import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  ArrowLeft,
  Globe,
  Recycle,
  Leaf,
  Droplets,
  Zap,
  Heart,
  Users,
  Package,
  Info,
  ThumbsUp,
  Clock,
  Award,
  Sparkles,
  Flame,
  Wind,
  Send,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { firebaseService } from "../services/firebaseService";
import { geminiService } from "../services/geminiService";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const VerifyRecycling = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [expandedSection, setExpandedSection] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    category: "",
  });

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const toggleSection = (section) =>
    setExpandedSection(expandedSection === section ? null : section);

  const processFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleGalleryChange = (e) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const handleCameraChange = (e) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const generateFallbackContent = (material) => {
    const materialLower = material.toLowerCase();
    const defaults = {
      plastic: {
        environmentalImpact:
          "♻️ Plastic takes 400+ years to decompose. Recycling saves 0.5kg CO₂, 6L water!",
        societalBenefits:
          "Plastic recycling creates 40,000+ US jobs and protects communities from pollution.",
        tipsForAction:
          "1. Rinse containers\n2. Remove caps\n3. Flatten bottles\n4. No plastic bags\n5. Check #1-7 codes",
        funFact: "One recycled bottle powers a 60W bulb for 6 hours!",
        upcycleIdeas: [
          "Self-watering planters",
          "Vertical garden",
          "Bird feeders",
          "Woven tote bags",
        ],
        carbonSavings: 0.5,
        waterSavings: 6,
        energySavings: 2.5,
        decompositionTime: "400+ years",
        communityImpact: "Your recycling helps save $50/ton in disposal costs!",
      },
      glass: {
        environmentalImpact:
          "Glass is 100% recyclable forever! Recycling saves 0.3kg CO₂, 1.5L water.",
        societalBenefits:
          "Glass recycling supports 20,000+ jobs and reduces mining by 1.2 tons per ton.",
        tipsForAction:
          "1. Rinse containers\n2. Remove metal lids\n3. Don't break glass\n4. Separate by color\n5. No mirrors/Pyrex",
        funFact:
          "Glass bottles from the 1800s found in landfills are still intact!",
        upcycleIdeas: [
          "Drinking glasses",
          "Terrariums",
          "Mason jar salads",
          "Candle holders",
        ],
        carbonSavings: 0.3,
        waterSavings: 1.5,
        energySavings: 1.2,
        decompositionTime: "1,000,000+ years",
        communityImpact: "Campus glass recycling saves $5,000 annually!",
      },
      paper: {
        environmentalImpact:
          "Recycling 1 ton of paper saves 17 trees, 7,000 gallons water!",
        societalBenefits:
          "Paper recycling employs 140,000+ Americans and saves 3.3 cubic yards of landfill space.",
        tipsForAction:
          "1. Remove plastic windows\n2. Flatten cardboard\n3. Keep dry\n4. Remove tape/staples\n5. No shredded paper",
        funFact: "Paper can be recycled 5-7 times!",
        upcycleIdeas: [
          "Handmade paper",
          "Paper bead jewelry",
          "Storage organizers",
          "Paper mache art",
        ],
        carbonSavings: 0.4,
        waterSavings: 7,
        energySavings: 2.8,
        decompositionTime: "2-5 weeks",
        communityImpact:
          "Campus paper recycling has diverted 30 tons this year!",
      },
      metal: {
        environmentalImpact:
          "Recycling aluminum saves 95% energy! One can saves enough energy to run a TV for 3 hours.",
        societalBenefits:
          "Metal recycling employs 500,000+ Americans and keeps 200B cans from landfills!",
        tipsForAction:
          "1. Rinse cans\n2. Crush to save space\n3. Leave labels on\n4. Remove plastic parts\n5. Test with magnet",
        funFact: "A recycled aluminum can returns to shelves in just 60 days!",
        upcycleIdeas: [
          "Herb planters",
          "Wind chimes",
          "Magnetic board",
          "Candle holders",
        ],
        carbonSavings: 1.2,
        waterSavings: 15,
        energySavings: 15,
        decompositionTime: "200-500 years",
        communityImpact: "Campus earns $2,000+ from can recycling!",
      },
    };

    return (
      defaults[materialLower] || {
        environmentalImpact: `Every ${material} recycled fights climate change!`,
        societalBenefits:
          "Recycling creates jobs and builds a sustainable future.",
        tipsForAction:
          "1. Clean items\n2. Check local rules\n3. Reduce & Reuse first",
        funFact: "Recycling one ton of waste saves 1,000-2,000 kg CO₂!",
        upcycleIdeas: [
          "Home decor",
          "Storage solutions",
          "Art projects",
          "Donation",
        ],
        carbonSavings: 0.5,
        waterSavings: 3,
        energySavings: 1.5,
        decompositionTime: "Varies by material",
        communityImpact:
          "Every recycled item helps campus achieve zero-waste goals!",
      }
    );
  };

  const analyzeImage = async () => {
    if (!imageFile) return toast.error("Please upload an image first");
    setAnalyzing(true);
    try {
      const result = await geminiService.analyzeWasteImage(imageFile);
      const sustainabilityContent = generateFallbackContent(
        result.material || "item",
      );
      setAnalysis({ ...result, ...sustainabilityContent });
      setSelectedStatus(result.status || "Recycled");
      setFormData({
        itemName: result.material || "",
        description: result.recommendation || "",
        category: result.material || "",
      });
      toast.success("AI Analysis Complete! Learn your environmental impact 🌍");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast.error("Please select a verification status");
      return;
    }
    if (!formData.itemName || !formData.itemName.trim()) {
      toast.error("Please enter an item name");
      return;
    }
    if (!formData.description || !formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading("Saving your verification...");

    try {
      const verificationData = {
        userId: currentUser.uid,
        userName: userProfile?.fullname || "Student",
        itemName: formData.itemName.trim(),
        description: formData.description.trim(),
        category: formData.category || analysis?.material || "Recycled Item",
        aiClassification: analysis?.material || null,
        confidence: analysis?.confidence || null,
        selectedStatus,
        ecoPointsAwarded: analysis?.ecoPoints || 10,
        recyclable: analysis?.recyclable ?? true,
        upcycleIdeas: analysis?.upcycleIdeas || [],
        environmentalImpact:
          analysis?.environmentalImpact ||
          "Recycling this item helps reduce waste and save resources.",
        carbonSavings: analysis?.carbonSavings || 0.5,
        waterSavings: analysis?.waterSavings || 3,
        energySavings: analysis?.energySavings || 1.5,
        timestamp: new Date().toISOString(),
      };

      await firebaseService.createVerificationReport(
        verificationData,
        imageFile,
      );

      const pointsEarned = analysis?.ecoPoints || 10;
      await firebaseService.updateUserPoints(currentUser.uid, pointsEarned);

      toast.dismiss(loadingToast);
      toast.success(
        (t) => (
          <div className="flex flex-col gap-1">
            <div className="font-bold">🎉 Verification Submitted!</div>
            <div>+{pointsEarned} Eco Points</div>
            <div className="text-xs">
              🌍 Saved {verificationData.carbonSavings}kg CO₂
            </div>
            <div className="text-xs">
              💧 Saved {verificationData.waterSavings}L water
            </div>
          </div>
        ),
        { duration: 5000 },
      );

      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      console.error("Submission error:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to submit verification. Please try again.");
      setSubmitting(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setAnalysis(null);
    setExpandedSection(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100/30 pb-20">
      {/* Hidden file inputs — kept outside all buttons/labels */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleGalleryChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraChange}
        className="hidden"
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-green-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Camera size={24} className="text-green-600" />
              AI Waste Verification
            </h1>
            <p className="text-xs text-gray-500">
              Powered by Gemini AI - Track your environmental impact
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
              <p className="text-gray-600 mb-2">
                Upload a photo of your recycled item
              </p>
              <p className="text-xs text-gray-400 mb-4">PNG, JPG up to 5MB</p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 cursor-pointer hover:bg-green-700"
                >
                  <Upload size={16} /> Choose Image
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Camera size={14} /> Take Photo
                </button>
              </div>
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
                  type="button"
                  onClick={removeImage}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={analyzeImage}
                  disabled={analyzing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> AI
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Analyze with Gemini AI
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* AI Analysis Results */}
          {analysis && (
            <div className="mt-6 space-y-4">
              {/* Summary */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white">
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold">🤖 Gemini AI Analysis</h3>
                  <Award size={24} className="text-yellow-300" />
                </div>
                <p className="text-sm">
                  Identified as <strong>{analysis.material}</strong> with{" "}
                  {analysis.confidence}% confidence
                </p>
                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <CheckCircle size={14} className="text-green-300" />
                    <span className="text-xs">
                      {analysis.recyclable
                        ? "Recyclable"
                        : "Check local options"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame size={14} className="text-yellow-300" />
                    <span className="text-xs font-bold">
                      +{analysis.ecoPoints} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind size={14} className="text-blue-300" />
                    <span className="text-xs">
                      Saves {analysis.carbonSavings}kg CO₂
                    </span>
                  </div>
                </div>
              </div>

              {/* Expandable Sections */}
              {[
                {
                  id: "impact",
                  icon: Globe,
                  title: "🌍 Environmental Impact",
                  content: analysis.environmentalImpact,
                },
                {
                  id: "societal",
                  icon: Users,
                  title: "👥 How This Helps Society",
                  content: analysis.societalBenefits,
                },
                {
                  id: "tips",
                  icon: ThumbsUp,
                  title: "💡 Action Tips",
                  content: analysis.tipsForAction,
                },
              ].map((section) => (
                <div
                  key={section.id}
                  className="bg-white rounded-xl border border-green-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-4 flex justify-between items-center hover:bg-green-50"
                  >
                    <div className="flex items-center gap-2">
                      <section.icon size={18} className="text-green-600" />
                      <span className="font-semibold">{section.title}</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 transition-transform ${expandedSection === section.id ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSection === section.id && (
                    <div className="px-4 pb-4 border-t border-green-100">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm whitespace-pre-line">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Impact Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Wind size={20} className="mx-auto mb-1 text-green-600" />
                  <p className="text-lg font-bold">
                    {analysis.carbonSavings}kg
                  </p>
                  <p className="text-xs text-gray-600">CO₂ Saved</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Droplets size={20} className="mx-auto mb-1 text-blue-500" />
                  <p className="text-lg font-bold">{analysis.waterSavings}L</p>
                  <p className="text-xs text-gray-600">Water Saved</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <Zap size={20} className="mx-auto mb-1 text-yellow-500" />
                  <p className="text-lg font-bold">
                    {analysis.energySavings}kWh
                  </p>
                  <p className="text-xs text-gray-600">Energy Saved</p>
                </div>
              </div>

              {/* Upcycling Ideas */}
              {analysis.upcycleIdeas && analysis.upcycleIdeas.length > 0 && (
                <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection("upcycle")}
                    className="w-full p-4 flex justify-between items-center hover:bg-green-50"
                  >
                    <div className="flex items-center gap-2">
                      <Recycle size={18} className="text-green-600" />
                      <span className="font-semibold">🎨 Upcycling Ideas</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 transition-transform ${expandedSection === "upcycle" ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSection === "upcycle" && (
                    <div className="px-4 pb-4 border-t border-green-100">
                      <ul className="space-y-2">
                        {analysis.upcycleIdeas.map((idea, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 p-2 hover:bg-green-50 rounded"
                          >
                            <ThumbsUp
                              size={14}
                              className="text-green-500 mt-0.5"
                            />
                            <span className="text-sm">{idea}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Fun Fact & Community Impact */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 border border-yellow-200">
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Sparkles size={14} className="text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 text-xs">
                      Did You Know?
                    </h4>
                    <p className="text-xs text-yellow-700">
                      {analysis.funFact}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200">
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center">
                    <Heart size={14} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800 text-xs">
                      Your Campus Impact
                    </h4>
                    <p className="text-xs text-purple-700">
                      {analysis.communityImpact}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decomposition Time */}
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <Clock size={16} className="text-red-500" />
                <p className="text-sm text-red-700">
                  Decomposes in landfill: {analysis.decompositionTime}
                </p>
              </div>

              {/* Verification Form */}
              <div className="mt-6 space-y-4 pt-4 border-t border-green-200">
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Item Name *"
                />
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 resize-none"
                  rows="3"
                  placeholder="How did you recycle/upcycle this item? *"
                />

                <div className="grid grid-cols-2 gap-2">
                  {["Recycled", "Upcycled", "Reused", "Exchanged"].map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setSelectedStatus(status)}
                        className={`p-3 rounded-lg border-2 transition-all ${selectedStatus === status ? "border-green-500 bg-green-50 text-green-700 font-medium" : "border-gray-200 hover:border-green-300"}`}
                      >
                        {status}
                      </button>
                    ),
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />{" "}
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} /> Submit & Earn Points
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="flex gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
              <Info size={14} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-800 text-xs">
                Powered by Google Gemini AI
              </h4>
              <p className="text-xs text-blue-700">
                Our AI analyzes waste items and provides environmental impact
                data. Each verified item earns points for sustainability
                progress!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyRecycling;
