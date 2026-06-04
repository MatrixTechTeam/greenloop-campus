// src/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const geminiService = {
  analyzeWasteImage: async (imageFile) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Convert image to base64
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const prompt = `Analyze this waste item and return a JSON response with:
      {
        "material": "type of material (plastic, glass, paper, metal, electronic, textile, organic, mixed)",
        "condition": "condition (good, fair, poor)",
        "recyclable": true/false,
        "recommendation": "brief disposal recommendation",
        "status": "Recycled/Upcycled/Reused/Exchanged",
        "ecoPoints": number,
        "confidence": number
      }`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback response
      return {
        material: "Unknown",
        condition: "fair",
        recyclable: true,
        recommendation: "Please check local recycling guidelines",
        status: "Recycled",
        ecoPoints: 10,
        confidence: 85,
      };
    } catch (error) {
      console.error("Gemini analysis error:", error);
      throw error;
    }
  },

  // Add the missing generateContent method
  generateContent: async (prompt) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini generate content error:", error);
      throw error;
    }
  },
};
