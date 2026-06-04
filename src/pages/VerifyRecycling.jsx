// src/pages/VerifyRecycling.jsx
import React, { useState } from "react";
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
import CameraCapture from "../components/CameraCapture";

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
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    category: "",
  });

  const toggleSection = (section) =>
    setExpandedSection(expandedSection === section ? null : section);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024)
        return toast.error("Image must be less than 5MB");
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageData) => {
    setImagePreview(imageData);
    // Convert base64 to file
    fetch(imageData)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "camera-capture.jpg", {
          type: "image/jpeg",
        });
        setImageFile(file);
      });
    setShowCamera(false);
  };

  // Generate comprehensive sustainability content using Gemini AI
  const generateGeminiContent = async (analysis) => {
    const material = analysis.material || "item";
    const recyclable = analysis.recyclable
      ? "recyclable"
      : "not easily recyclable";

    const prompt = `As a sustainability expert, generate a JSON response about ${material} waste that is ${recyclable}. Use this exact structure:
    {
      "environmentalImpact": "2-3 sentences on carbon, water, landfill impact",
      "societalBenefits": "2-3 sentences on jobs, communities, future benefits", 
      "tipsForAction": "5 specific recycling tips as bullet points",
      "funFact": "1 surprising fact to motivate recycling",
      "upcycleIdeas": "4 creative reuse ideas as array",
      "carbonSavings": "number in kg CO2 saved per item",
      "waterSavings": "number in liters saved",
      "energySavings": "number in kWh saved", 
      "decompositionTime": "time to decompose in landfill",
      "communityImpact": "2 sentences on campus/community benefits"
    }
    Use real statistics. Be inspiring and educational.`;

    try {
      const response = await geminiService.generateContent(prompt);
      const parsed = JSON.parse(response);
      return {
        environmentalImpact:
          parsed.environmentalImpact ||
          generateFallbackContent(material).environmentalImpact,
        societalBenefits:
          parsed.societalBenefits ||
          generateFallbackContent(material).societalBenefits,
        tipsForAction:
          parsed.tipsForAction ||
          generateFallbackContent(material).tipsForAction,
        funFact: parsed.funFact || generateFallbackContent(material).funFact,
        upcycleIdeas:
          parsed.upcycleIdeas || generateFallbackContent(material).upcycleIdeas,
        carbonSavings: parsed.carbonSavings || 0.5,
        waterSavings: parsed.waterSavings || 3,
        energySavings: parsed.energySavings || 1.5,
        decompositionTime: parsed.decompositionTime || "Varies by material",
        communityImpact:
          parsed.communityImpact ||
          generateFallbackContent(material).communityImpact,
      };
    } catch (error) {
      console.error("Gemini generation error:", error);
      return generateFallbackContent(material);
    }
  };

  // Fallback content (concise but comprehensive)
  const generateFallbackContent = (material) => {
    const defaults = {
      plastic: {
        environmentalImpact:
          "♻️ Plastic takes 400+ years to decompose, releasing toxins. Recycling saves 0.5kg CO₂, 6L water, and enough energy to power a laptop for 25 hours!",
        societalBenefits:
          "Plastic recycling creates 40,000+ US jobs and keeps materials in the circular economy, protecting vulnerable communities from pollution.",
        tipsForAction:
          "1. Rinse containers\n2. Remove caps\n3. Flatten bottles\n4. No plastic bags\n5. Check #1-7 codes",
        funFact: "One recycled bottle powers a 60W bulb for 6 hours!",
        upcycleIdeas: [
          "Self-watering planters",
          "Vertical garden",
          "Bird feeders",
          "Woven tote bags",
        ],
        communityImpact:
          "Your recycling helps [University] save $50/ton in disposal costs and inspires 30% more people to recycle!",
      },
      glass: {
        environmentalImpact:
          "Glass is 100% recyclable forever! Recycling saves 0.3kg CO₂, 1.5L water, and uses 40% less energy than new production.",
        societalBenefits:
          "Glass recycling supports 20,000+ jobs, reduces mining by 1.2 tons per ton recycled, and lowers factory emissions by 20%.",
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
        communityImpact:
          "Campus glass recycling saves $5,000 annually and earns 'Eco Ambassador' recognition!",
      },
      paper: {
        environmentalImpact:
          "Recycling 1 ton of paper saves 17 trees, 7,000 gallons water, and 4,100 kWh - enough to power a home for 6 months!",
        societalBenefits:
          "Paper recycling employs 140,000+ Americans, preserves forests that absorb CO₂, and saves 3.3 cubic yards of landfill space per ton.",
        tipsForAction:
          "1. Remove plastic windows\n2. Flatten cardboard\n3. Keep dry\n4. Remove tape/staples\n5. No shredded paper",
        funFact:
          "Paper can be recycled 5-7 times! The average American uses 7 trees worth of paper yearly.",
        upcycleIdeas: [
          "Handmade paper",
          "Paper bead jewelry",
          "Storage organizers",
          "Paper mache art",
        ],
        communityImpact:
          "Campus paper recycling has diverted 30 tons this year - enough to save 510 trees!",
      },
      metal: {
        environmentalImpact:
          "Recycling aluminum saves 95% energy! One can saves enough energy to run a TV for 3 hours. Mining creates 7 tons waste per ton of metal.",
        societalBenefits:
          "Metal recycling employs 500,000+ Americans, generates $100B annually, and keeps 200B cans from landfills since 1972!",
        tipsForAction:
          "1. Rinse cans\n2. Crush to save space\n3. Leave labels on\n4. Remove plastic parts\n5. Test with magnet",
        funFact: "A recycled aluminum can returns to shelves in just 60 days!",
        upcycleIdeas: [
          "Herb planters",
          "Wind chimes",
          "Magnetic board",
          "Candle holders",
        ],
        communityImpact:
          "Campus earns $2,000+ from can recycling - join the 'Can Challenge' competition!",
      },
      electronic: {
        environmentalImpact:
          "E-waste is fastest-growing waste stream. One million recycled laptops power 3,500 homes yearly! Gold in e-waste is 40-800x richer than ore.",
        societalBenefits:
          "E-waste recycling creates 3x more jobs than landfilling and refurbishes devices for schools and families in need.",
        tipsForAction:
          "1. NEVER trash electronics\n2. Factory reset\n3. Remove batteries\n4. Find certified recyclers\n5. Check manufacturer take-back",
        funFact:
          "Your old phone contains gold, silver, and copper! Only 15% get recycled properly.",
        upcycleIdeas: [
          "Music player",
          "Security camera",
          "Circuit board art",
          "External hard drive",
        ],
        communityImpact:
          "Campus collected 5,000+ lbs of e-waste last year - your device can provide computer access to a student!",
      },
      textile: {
        environmentalImpact:
          "Fashion produces 10% of global carbon emissions! Recycling saves 2,500L water per item - enough drinking water for 2.5 years.",
        societalBenefits:
          "Textile recycling creates jobs and provides affordable clothing to millions. Every pound recycled prevents 3.6 lbs of CO₂.",
        tipsForAction:
          "1. Donate wearable clothes\n2. Cut old shirts into rags\n3. Host clothing swaps\n4. Find textile bins\n5. Compost natural fibers",
        funFact:
          "Recycling 10% of US clothing would remove 250,000 cars' worth of CO₂ emissions!",
        upcycleIdeas: ["Tote bags", "Quilts", "Braided rugs", "Pillow covers"],
        communityImpact:
          "Campus 'Swap 'n' Shop' diverts 2,000+ clothing items annually from landfills!",
      },
    };
    return (
      defaults[material.toLowerCase()] || {
        environmentalImpact: `Every ${material} recycled fights climate change! Recycling saves resources, reduces landfill waste, and lowers carbon emissions.`,
        societalBenefits:
          "Recycling creates jobs, protects communities, and builds a sustainable future for everyone.",
        tipsForAction:
          "1. Clean items\n2. Check local rules\n3. Reduce & Reuse first\n4. Buy recycled products\n5. Spread awareness",
        funFact:
          "Recycling one ton of waste saves 1,000-2,000 kg CO₂ - like planting 25-50 trees!",
        upcycleIdeas: [
          "Home decor",
          "Storage solutions",
          "Art projects",
          "Donation to makerspaces",
        ],
        communityImpact:
          "Every recycled item helps campus achieve zero-waste goals and inspires others to take action!",
      }
    );
  };

  const analyzeImage = async () => {
    if (!imageFile) return toast.error("Please upload an image first");
    setAnalyzing(true);
    try {
      const result = await geminiService.analyzeWasteImage(imageFile);
      const sustainabilityContent = await generateGeminiContent(result);
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
    if (!selectedStatus)
      return toast.error("Please select a verification status");
    if (!formData.itemName || !formData.description)
      return toast.error("Please fill in all fields");

    setSubmitting(true);
    try {
      await firebaseService.createVerificationReport(
        {
          userId: currentUser.uid,
          userName: userProfile?.fullname || "Student",
          itemName: formData.itemName,
          description: formData.description,
          category: formData.category,
          aiClassification: analysis?.material,
          confidence: analysis?.confidence,
          selectedStatus,
          ecoPointsAwarded: analysis?.ecoPoints || 10,
          recyclable: analysis?.recyclable,
          upcycleIdeas: analysis?.upcycleIdeas,
          environmentalImpact: analysis?.environmentalImpact,
          carbonSavings: analysis?.carbonSavings,
          waterSavings: analysis?.waterSavings,
          energySavings: analysis?.energySavings,
        },
        imageFile,
      );
      await firebaseService.updateUserPoints(
        currentUser.uid,
        analysis?.ecoPoints || 10,
      );

      toast.success(
        (t) => (
          <div className="flex flex-col gap-1">
            <div className="font-bold">🎉 Verification Submitted!</div>
            <div>+{analysis?.ecoPoints || 10} Eco Points</div>
            <div className="text-xs">
              🌍 Saved {analysis?.carbonSavings}kg CO₂
            </div>
            <div className="text-xs">
              💧 Saved {analysis?.waterSavings}L water
            </div>
          </div>
        ),
        { duration: 5000 },
      );

      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit verification");
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
                <label className="bg-green-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 cursor-pointer hover:bg-green-700">
                  <Upload size={16} /> Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Camera size={14} />
                  Take Photo
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
                  onClick={removeImage}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Change Image
                </button>
                <button
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
              {analysis.upcycleIdeas && (
                <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
                  <button
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-green-500"
                  placeholder="Item Name *"
                  required
                />
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg resize-none"
                  rows="3"
                  placeholder="How did you recycle/upcycle this item? *"
                  required
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
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
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
                data, recycling tips, and upcycling ideas. Each verified item
                earns points for sustainability progress!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default VerifyRecycling;
