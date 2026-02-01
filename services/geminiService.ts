import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTextContent = async (topic: string): Promise<string> => {
  const modelId = "gemini-3-flash-preview";
  
  const prompt = `Write a concise, engaging, and informative paragraph suitable for a presentation slide body about: "${topic}". 
  Keep it under 60 words. Do not use markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Failed to generate text:", error);
    throw new Error("AI Generation failed");
  }
};

// Legacy export for compatibility
export const generateSlideContent = generateTextContent;

export const generateFullSlideElements = async (topic: string): Promise<any[]> => {
  const modelId = "gemini-3-flash-preview";
  
  const prompt = `Create a structured layout for a presentation slide about: "${topic}".
  Return a JSON array of slide elements. 
  Each element must have: 
  - type: "text" | "shape"
  - content: string (the text or shape name like 'rectangle')
  - x, y, width, height: numbers (standard canvas is 960x540)
  - style: object with CSS properties (fontSize, color, textAlign, fontWeight, backgroundColor for shapes)
  
  Include at least one title and one body text block. Use realistic coordinates.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "Element type: 'text' or 'shape'" },
              content: { type: Type.STRING, description: "Content string for text or shape identifier" },
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              width: { type: Type.NUMBER },
              height: { type: Type.NUMBER },
              style: { 
                type: Type.OBJECT,
                description: "CSS style properties for the element",
                properties: {
                  fontSize: { type: Type.STRING },
                  color: { type: Type.STRING },
                  textAlign: { type: Type.STRING },
                  fontWeight: { type: Type.STRING },
                  backgroundColor: { type: Type.STRING },
                  borderWidth: { type: Type.STRING },
                  borderColor: { type: Type.STRING }
                }
              }
            },
            required: ['type', 'content', 'x', 'y', 'width', 'height', 'style']
          }
        }
      }
    });

    const elements = JSON.parse(response.text || "[]");
    return elements;
  } catch (error) {
    console.error("Failed to generate slide elements:", error);
    throw new Error("AI Slide Generation failed");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ text: `A high quality presentation asset: ${prompt}` }],
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Failed to generate image:", error);
    throw new Error("AI Image Generation failed");
  }
};