import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export const analyzeWasteImage = async (imageBase64, mimeType = 'image/jpeg') => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const imagePart = { inlineData: { data: imageBase64, mimeType } }
  const prompt = `
    You are a waste classification AI for a campus sustainability app.
    Analyze this image and return ONLY a JSON object with:
    - wasteType: string (plastic/paper/organic/electronic/glass/metal/hazardous/unknown)
    - recyclable: boolean
    - ecoPoints: number (1-50)
    - confidence: number (0-1)
    - tips: string (short recycling tip)
    - category: "recyclable" | "compostable" | "landfill" | "hazardous"
    No markdown, no extra text.
  `
  const result = await model.generateContent([prompt, imagePart])
  const text = result.response.text().replace(/```json|```/g, '').trim()
  return JSON.parse(text)
}

export const getCampusEcoTip = async () => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContent(
    'Give one short practical eco-tip for university students. Max 2 sentences. Be friendly and specific.'
  )
  return result.response.text()
}
