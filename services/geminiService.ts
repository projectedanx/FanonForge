
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, TwistResult, RiskResult } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const parseJsonResponse = <T,>(text: string): T | null => {
    try {
        const cleanedText = text.replace(/^```json\s*|```\s*$/g, '').trim();
        return JSON.parse(cleanedText) as T;
    } catch (e) {
        console.error("Failed to parse JSON response:", e);
        console.error("Original text:", text);
        // Fallback for non-JSON or malformed responses
        return null;
    }
};

const geminiService = {
    analyzeIP: async (ipInput: string): Promise<AnalysisResult> => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following intellectual property description. Identify its key latent characteristics, common tropes, recurring motifs, and highlight specific elements (like named characters, unique locations, or plot points) that are highly characteristic and might be prone to direct AI memorization.
---
IP Description: "${ipInput}"
---
Return the analysis as a JSON object with keys: "characteristics", "tropes", "motifs", and "copyrightableElements".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        characteristics: { type: Type.STRING },
                        tropes: { type: Type.STRING },
                        motifs: { type: Type.STRING },
                        copyrightableElements: { type: Type.STRING },
                    },
                },
            },
        });
        const result = parseJsonResponse<AnalysisResult>(response.text);
        if (!result) throw new Error("Failed to get a valid analysis from the API.");
        return result;
    },

    exploreTropes: async (ipInput: string): Promise<string[]> => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following intellectual property, list 5-7 common fan-created tropes ("fanon") associated with it.
---
IP Description: "${ipInput}"
---
Return the result as a JSON object with a single key "tropes" which is an array of strings.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tropes: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                    },
                },
            },
        });
        const result = parseJsonResponse<{ tropes: string[] }>(response.text);
        if (!result || !result.tropes) throw new Error("Failed to get a valid trope list from the API.");
        return result.tropes;
    },

    generateTwists: async (ipInput: string): Promise<TwistResult> => {
         const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following intellectual property, generate one "transformative twist" for each of the following categories: Conceptual Blending, Dimensional Thinking, Multi-Perspective Simulation, Core Concept Inversion.
---
IP Description: "${ipInput}"
---
Return the result as a JSON object with keys: "conceptualBlending", "dimensionalThinking", "multiPerspective", and "coreInversion".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        conceptualBlending: { type: Type.STRING },
                        dimensionalThinking: { type: Type.STRING },
                        multiPerspective: { type: Type.STRING },
                        coreInversion: { type: Type.STRING },
                    },
                },
            },
        });
        const result = parseJsonResponse<TwistResult>(response.text);
        if (!result) throw new Error("Failed to get a valid twist from the API.");
        return result;
    },
    
    generateNarrative: async (ipInput: string, promptInstruction: string): Promise<string> => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Here is the source material: "${ipInput}". Now, follow this instruction: "${promptInstruction}".`,
        });
        return response.text;
    },

    assessRisk: async (originalIp: string, generatedText: string): Promise<RiskResult> => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an AI assistant providing an advisory, non-legal analysis of potential copyright risk in a derivative text. Compare the "Original IP" with the "Generated Text".

Your analysis must include:
1. A \`riskScore\` of "Low", "Medium", or "High".
2. A detailed \`explanation\` for the score. This explanation must break down the analysis, detailing which aspects of the "Generated Text" contributed to the risk. Specifically comment on similarities or differences in:
    - Plot and key story events.
    - Character voice, personality, and motivations.
    - Unique or memorable phrasing and terminology from the source IP.
3. A list of \`similarPassages\` containing specific phrases or sentences from the "Generated Text" that are very close to the "Original IP".

The score should reflect direct copying, close paraphrasing of unique expressions, and substantial similarity in plot and characterization.
---
Original IP: "${originalIp}"
---
Generated Text: "${generatedText}"
---
Return the analysis as a JSON object with keys: "riskScore", "explanation", and "similarPassages" (an array of strings).`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        riskScore: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        similarPassages: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                    },
                },
            },
        });
        const result = parseJsonResponse<RiskResult>(response.text);
        if (!result) throw new Error("Failed to get a valid risk assessment from the API.");
        return result;
    },
};

export { geminiService };
