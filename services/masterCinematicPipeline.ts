/**
 * Fekra AI Business OS - Unified Master Cinematic Pipeline
 * Transforms raw user inputs into award-winning, photorealistic commercial scenes in 1 step.
 * Integrates DNA Lock, Volumetric Lighting, Anamorphic Optics, and Negative Constraints.
 */

import { ImageFile } from '../types';
import { generateImage } from './geminiService';
import { saveStudioWork } from './studioStorageService';

export interface MasterSceneOptions {
  lightingAtmosphere?: 'rembrandt_volumetric' | 'golden_hour_rim' | 'dark_luxury_neon' | 'pure_commercial_studio';
  lensOptics?: '85mm_f1.4_anamorphic' | '35mm_cinematic_wide' | '100mm_macro_luxury';
  aspectRatio?: string;
  industryVibe?: string;
}

export interface MasterSceneRequest {
  prompt: string;
  productImages: ImageFile[];
  styleImages?: ImageFile[] | null;
  options?: MasterSceneOptions;
  dnaContext?: Record<string, any>;
}

export interface MasterSceneResult {
  image: ImageFile;
  masterPrompt: string;
  structuredPillars: {
    dnaLock: string;
    lighting: string;
    composition: string;
    negativeConstraints: string;
  };
}

/**
 * Builds high-end cinematic structuring prompt conforming to international commercial standards
 */
export function buildMasterCinematicPrompt(request: MasterSceneRequest): {
  finalPrompt: string;
  dnaLock: string;
  lighting: string;
  composition: string;
  negativeConstraints: string;
} {
  const userText = request.prompt.trim() || 'فاخر واستثنائي يبرز تفاصيل المنتج بدقة متناهية';

  // 1. Subject & DNA Lock
  const dnaLock = [
    `# [PILLAR 1: SUBJECT & PRODUCT DNA LOCK]`,
    `Strict photorealistic preservation of original product geometry, physical dimensions, label typography, materials, and distinct textures.`,
    `Zero distortion on brand markings. Flawless surface reflections and authentic manufacturing finishes.`,
  ].join('\n');

  // 2. Lighting & Atmosphere
  const lighting = [
    `# [PILLAR 2: VOLUMETRIC LIGHTING & ATMOSPHERE]`,
    `Master commercial cinematography: sculpted Rembrandt key light, volumetric rim lighting with subtle atmospheric micro-haze, 8K ray-traced ambient occlusion, soft tonal falloff and balanced specular highlights.`,
  ].join('\n');

  // 3. Composition & Depth
  const composition = [
    `# [PILLAR 3: OPTICS, COMPOSITION & DEPTH]`,
    `Captured with Hasselblad H6D-100c medium format camera on 85mm anamorphic lens at f/1.4 aperture. Ultra-shallow cinematic depth of field, natural circular bokeh background separation, microscopic tactile textures, award-winning editorial framing.`,
  ].join('\n');

  // 4. Negative Prompting Protocol
  const negativeConstraints = [
    `# [PILLAR 4: AUTOMATIC NEGATIVE REJECTION]`,
    `Strictly reject: plastic or synthetic look, oversaturated amateur filters, distorted text, mutated geometry, low resolution, blown-out highlights, muddy crushed shadows, artificial CGI render aesthetics, watermark, borders.`,
  ].join('\n');

  const finalPrompt = [
    `MASTER CINEMATIC COMMERCIAL PRODUCTION:`,
    userText,
    `\n${dnaLock}`,
    `\n${lighting}`,
    `\n${composition}`,
    `\n${negativeConstraints}`,
  ].join('\n\n');

  return {
    finalPrompt,
    dnaLock,
    lighting,
    composition,
    negativeConstraints,
  };
}

/**
 * Fetches structured prompt from backend transformer or falls back locally
 */
export async function fetchMasterPromptTransform(request: MasterSceneRequest): Promise<{
  finalPrompt: string;
  dnaLock: string;
  lighting: string;
  composition: string;
  negativeConstraints: string;
}> {
  try {
    const res = await fetch('/api/creative/master-prompt-transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: request.prompt,
        options: request.options,
        dnaContext: request.dnaContext,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.finalPrompt) {
        return {
          finalPrompt: data.finalPrompt,
          dnaLock: data.dnaLock,
          lighting: data.lighting,
          composition: data.composition,
          negativeConstraints: data.negativeConstraints,
        };
      }
    }
  } catch (err) {
    console.warn('[Master Pipeline] Fallback to local prompt builder:', err);
  }
  return buildMasterCinematicPrompt(request);
}

/**
 * Executes One-Click Master Scene Synthesis without confusing multi-button clutter
 */
export async function synthesizeMasterScene(
  request: MasterSceneRequest
): Promise<MasterSceneResult> {
  const structured = await fetchMasterPromptTransform(request);
  const ratio = request.options?.aspectRatio || '1:1';

  // Call generation with the master cinematic prompt
  const generatedImage = await generateImage(
    request.productImages,
    structured.finalPrompt,
    request.styleImages || null,
    ratio
  );

  // Auto-save to Studio Works portfolio
  saveStudioWork({
    title: request.prompt.slice(0, 45) || 'مشهد سينمائي فائق',
    prompt: structured.finalPrompt,
    studioType: 'creator_studio',
    image: generatedImage,
    aspectRatio: ratio,
    metadata: {
      atmosphere: request.options?.lightingAtmosphere || 'rembrandt_volumetric',
      styleDescription: request.options?.lensOptics || '85mm_f1.4_anamorphic',
      shotType: 'master_cinematic_production',
    },
  });

  return {
    image: generatedImage,
    masterPrompt: structured.finalPrompt,
    structuredPillars: {
      dnaLock: structured.dnaLock,
      lighting: structured.lighting,
      composition: structured.composition,
      negativeConstraints: structured.negativeConstraints,
    },
  };
}
