import { GoogleGenAI } from "@google/genai";

export function useGemini() {
  const getAiInstance = () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
    }
    return new GoogleGenAI({ apiKey });
  };

  const generateText = async (prompt: string, systemInstruction?: string) => {
    try {
      const ai = getAiInstance();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
      return response.text || "";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  };

  const generateStream = async (prompt: string, systemInstruction?: string) => {
    try {
      const ai = getAiInstance();
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
      return responseStream;
    } catch (error) {
      console.error("Gemini API Stream Error:", error);
      throw error;
    }
  };

  return { generateText, generateStream };
}
