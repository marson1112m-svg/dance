import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getGeminiModel = (modelName = "gemini-3-flash-preview") => {
  if (!ai) return null;
  return ai.models.generateContent.bind(ai.models);
};
