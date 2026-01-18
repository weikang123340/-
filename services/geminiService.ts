
import { GoogleGenAI } from "@google/genai";

export async function getVictoryMessage(score: number, level: number): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The player just won a "Connect-Two" (Lianliankan) game level ${level} with a score of ${score}. 
      Give them a brief, enthusiastic, and sophisticated victory message in Chinese (max 30 words). Mention their strategy or speed.`,
    });
    return response.text?.trim() || "太棒了！你的反应和策略简直完美！";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "恭喜通关！期待你在下一关的表现！";
  }
}
