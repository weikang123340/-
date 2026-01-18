
import { GoogleGenAI } from "@google/genai";
import { Package } from "../types";

export async function analyzeStationData(packages: Package[]): Promise<string> {
  // Use recommended initialization with named parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const pendingCount = packages.filter(p => p.status === 'ARRIVED').length;
  const companies = packages.reduce((acc, p) => {
    acc[p.courierCompany] = (acc[p.courierCompany] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
    作为快递站智能分析助手，请根据以下数据生成简短的经营分析（中文，100字以内）：
    - 当前待取件总数：${pendingCount}
    - 快递公司占比：${JSON.stringify(companies)}
    - 请分析取件压力，并给出一条提升效率的建议。
  `;

  try {
    // Using gemini-3-flash-preview for basic text analysis as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Directly accessing .text property as per guidelines (it is a getter, not a method)
    return response.text || "数据分析生成中...";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "无法获取AI经营分析，请检查网络连接。";
  }
}
