// src/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Route through Vite proxy to avoid CORS/network blocks
const genAI = new GoogleGenerativeAI(API_KEY, {
  baseUrl: "/gemini-api",
});

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Convert various image input types to base64
const convertToBase64 = async (imageInput) => {
  if (typeof imageInput === "string") {
    if (imageInput.includes("base64,")) {
      return {
        data: imageInput.split("base64,")[1],
        mimeType:
          imageInput.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg",
      };
    }
    return { data: imageInput, mimeType: "image/jpeg" };
  }

  if (imageInput instanceof File || imageInput instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        const mimeType =
          result.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
        const data = result.split("base64,")[1];
        resolve({ data, mimeType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageInput);
    });
  }

  if (imageInput?.data) {
    return {
      data: imageInput.data,
      mimeType: imageInput.mimeType || "image/jpeg",
    };
  }

  throw new Error("Unsupported image format.");
};

export const geminiService = {
  async analyzeWasteImage(imageInput) {
    try {
      if (!API_KEY) {
        console.warn("Gemini API key not set. Using fallback response.");
        return this.getFallbackResponse();
      }

      const { data: base64Data, mimeType } = await convertToBase64(imageInput);

      const prompt = `You are a waste classification expert. Analyze this image of a waste item and return ONLY a valid JSON object with no additional text, markdown, or explanation.

Return this exact structure:
{
  "material": "Specific material type (e.g., Plastic Bottle, Glass Jar, Aluminum Can, Paper Box, Cardboard)",
  "condition": "Good" or "Fair" or "Poor",
  "recommendation": "One sentence disposal or recycling recommendation",
  "recyclable": true or false,
  "ecoPoints": <number between 5 and 30>,
  "confidence": <number between 60 and 99>,
  "status": "Recycled" or "Upcycled" or "Reused" or "Exchanged",
  "category": "Plastic" or "Paper" or "Glass" or "Metal" or "Electronic" or "Organic" or "Other",
  "upcycleIdeas": ["Creative idea 1", "Creative idea 2", "Creative idea 3"]
}`;

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType,
            data: base64Data.trim().replace(/\s/g, ""),
          },
        },
      ]);

      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          material: analysis.material || "Recyclable Item",
          condition: analysis.condition || "Good",
          recommendation:
            analysis.recommendation || "Please recycle responsibly.",
          recyclable: analysis.recyclable !== false,
          ecoPoints: analysis.ecoPoints || 10,
          confidence: analysis.confidence || 85,
          status: analysis.status || "Recycled",
          category: analysis.category || "Other",
          upcycleIdeas: analysis.upcycleIdeas || [
            "Use as a storage container",
            "Create an art project",
            "Donate for reuse",
          ],
        };
      }

      console.warn("Could not parse Gemini response:", text);
      return this.getFallbackResponse();
    } catch (error) {
      console.error("Gemini API Error:", error?.message || error);
      return this.getFallbackResponse();
    }
  },

  getFallbackResponse() {
    return {
      success: true,
      material: "Mixed Recyclable",
      condition: "Good",
      recommendation:
        "This item appears to be recyclable. Clean it and place it in the appropriate recycling bin.",
      recyclable: true,
      ecoPoints: 10,
      confidence: 75,
      status: "Recycled",
      category: "Mixed",
      upcycleIdeas: [
        "Clean and reuse for storage",
        "Check local recycling guidelines",
        "Consider upcycling into a decorative item",
      ],
      isFallback: true,
    };
  },

  async getWasteReductionTips(category) {
    try {
      if (!API_KEY) return this._fallbackTips(category);

      const result = await model.generateContent(
        `Give 5 practical waste reduction tips for "${category}" waste on a university campus. 
         Return ONLY a JSON array of strings, no markdown or extra text. Example: ["Tip 1", "Tip 2"]`,
      );

      const text = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      const tips = JSON.parse(text);
      return {
        success: true,
        tips: Array.isArray(tips) ? tips : this._fallbackTips(category).tips,
      };
    } catch {
      return this._fallbackTips(category);
    }
  },

  _fallbackTips(category) {
    return {
      success: true,
      tips: [
        `Bring a reusable water bottle to reduce ${category} waste`,
        "Use digital notes instead of paper when possible",
        `Participate in campus recycling programs for ${category}`,
        `Avoid single-use ${category} items in the cafeteria`,
        "Join a campus sustainability workshop to learn more",
      ],
    };
  },

  async chatWithAI(message, context = {}) {
    try {
      if (!API_KEY) return this._fallbackChat();

      const systemContext = context.category
        ? `The user is asking about ${context.category} waste management.`
        : "The user is asking about general waste management and recycling.";

      const result = await model.generateContent(
        `${systemContext}\n\nUser question: ${message}\n\nProvide a helpful, concise answer in 2-3 sentences focused on practical campus waste management advice.`,
      );

      return { success: true, response: result.response.text() };
    } catch {
      return this._fallbackChat();
    }
  },

  _fallbackChat() {
    return {
      success: true,
      response:
        "For specific waste management guidance, please check your campus recycling guidelines or contact the sustainability office.",
    };
  },
};

export default geminiService;
