
import { GoogleGenAI, Modality } from "@google/genai";
import type { GeneratePortraitsParams, GeneratedImage } from "../types";

export const generatePortraits = async (params: GeneratePortraitsParams): Promise<GeneratedImage[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const identityInstruction = `
    ABSOLUTE REQUIREMENT: 100% identical facial features. This is a RAW PHOTOGRAPH.
    - FACE: Lock the exact facial structure, eyes, nose, and lips of the person in the source face image.
    - POSE: Natural, attractive pose. The subject is the protagonist.
  `;

  const houseInstruction = params.houseRefBase64 ? 
    `SCENERY: Based strictly on the architectural style and garden vibes of the provided house reference image. Recreate a similar luxurious environment.` :
    `SCENERY: 100% REAL FLOWERS AND NATURAL LANDSCAPES. Realistic textures, organic growth.`;

  const framingInstruction = `
    COMPOSITION: Hip-up portrait. The subject is the heart of the image. Shot on Sony A7R IV, 85mm lens for natural creamy background blur.
  `;

  const qualityInstruction = `
    REALISM SPECS: Photorealistic RAW photo. Visible skin texture, natural pores, realistic hair. 100% authenticity.
  `;

  const instructionPrompt = `
    ${identityInstruction}
    ${houseInstruction}
    ${framingInstruction}
    Scenario: "${params.prompt}".
    ${qualityInstruction}
    Negative: fake flowers, plastic plants, cartoon, anime, 3d render, airbrushed, smooth skin, changed identity, headshot only, full body, stiff pose, distorted face.
  `;

  const contentsParts: any[] = [
    { inlineData: { data: params.imageBase64, mimeType: params.mimeType } }
  ];

  if (params.houseRefBase64) {
    contentsParts.push({ inlineData: { data: params.houseRefBase64, mimeType: 'image/jpeg' } });
  }

  contentsParts.push({ text: instructionPrompt });

  const generationPromises = Array.from({ length: params.numberOfImages }, () =>
    ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: contentsParts },
      config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    })
  );

  const results = await Promise.allSettled(generationPromises);
  const generatedImages: GeneratedImage[] = [];
  let firstError: Error | null = null;

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      const response = result.value;
      const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
      if (imagePart?.inlineData) {
        generatedImages.push({
          id: `gen-${i}-${Date.now()}`,
          url: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
          seed: Math.floor(Math.random() * 1000000).toString(),
        });
      }
    } else {
      firstError = firstError || (result.reason as Error);
    }
  });
  
  if (generatedImages.length === 0) throw firstError || new Error("AI không phản hồi.");
  return generatedImages;
};
