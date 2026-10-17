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
  advertiserImages?: ImageFile[] | null;
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
 * Builds high-end cinematic structuring prompt conforming to HYPER UNIVERSAL SOCIAL ENGINE V1.0 (15 Layers)
 */
export function buildMasterCinematicPrompt(request: MasterSceneRequest): {
  finalPrompt: string;
  dnaLock: string;
  lighting: string;
  composition: string;
  negativeConstraints: string;
} {
  const userText = request.prompt.trim() || 'فاخر واستثنائي يبرز تفاصيل المنتج بدقة متناهية';
  const opt = request.options || {};
  const dna = request.dnaContext || {};

  // LAYER 01 — UNIVERSAL BRAND AI
  const layer01BrandAI = [
    `[LAYER 01 — UNIVERSAL BRAND AI]`,
    `Business Activity: ${dna.businessActivity || 'Luxury E-Commerce & Retail Commercials'}`,
    `Brand Personality: ${dna.brandPersonality || 'Elite, High-Impact, Dynamic Authority'}`,
    `Target Audience: Discerning modern consumers seeking uncompromising excellence.`,
    `Marketing Objective: Instant conversion and viral scroll-stopping brand prestige.`
  ].join('\n');

  // LAYER 02 — COLOR CONSTITUTION (Strictly max 3 colors)
  const layer02Color = [
    `[LAYER 02 — COLOR CONSTITUTION (MAX 3 COLORS)]`,
    `Primary Color: ${dna.primaryColor || '#06B6D4'} | Secondary Color: ${dna.secondaryColor || '#8B5CF6'} | Neutral Color: ${dna.neutralColor || '#0F172A'}`,
    `Unified cinematic color grading across entire campaign: identical white balance, rich contrast, controlled specular highlights, balanced deep shadows, color harmony.`
  ].join('\n');

  // LAYER 03 — FACE LOCK AI
  const layer03FaceLock = [
    `[LAYER 03 — FACE LOCK AI]`,
    `Permanent biometric fidelity lock: face structure, hair texture, eye color, smile signature, natural skin tone, authentic age bracket, magnetic presence, micro-expressions. Zero identity alteration.`
  ].join('\n');

  // LAYER 04 — CHARACTER ENGINE
  const layer04Character = [
    `[LAYER 04 — CHARACTER ENGINE]`,
    `Transform advertiser into dynamic commercial protagonist: confident, friendly, charismatic, expressive facial acting, impossible product interaction, magnetic curiosity.`
  ].join('\n');

  // LAYER 05 — SCROLL STOP ENGINE
  const layer05ScrollStop = [
    `[LAYER 05 — SCROLL STOP ENGINE]`,
    `Verdict: Must arrest viewer attention in under 0.8 seconds. Visual intrigue, irresistible curiosity gap, bold contrast break.`
  ].join('\n');

  // LAYER 06 — VISUAL STORY AI
  const layer06VisualStory = [
    `[LAYER 06 — VISUAL STORY AI]`,
    `Narrative Arc: High-curiosity opening, emotional hook, transformative solution via the hero product, indelible brand imprint.`
  ].join('\n');

  // LAYER 07 — SMART CAMERA
  const cameraChoice = opt.lensOptics || '85mm_f1.4_anamorphic';
  const layer07Camera = [
    `[LAYER 07 — SMART CAMERA]`,
    `Hasselblad H6D-100c medium format on ${cameraChoice}. Ultra-shallow cinematic depth of field, circular anamorphic bokeh, microscopic tactile surface textures, non-repeating dynamic perspective.`
  ].join('\n');

  // LAYER 08 — DEPTH ENGINE (8 discrete visual depth layers)
  const layer08Depth = [
    `[LAYER 08 — DEPTH ENGINE (8 SCENE LAYERS)]`,
    `Layer 01 Foreground FX: Floating micro-particles, lens flare caustics.`,
    `Layer 02 Foreground Objects: Subtle architectural framing elements.`,
    `Layer 03 Hero Character: Expressive advertiser with locked facial identity.`,
    `Layer 04 Product: Physical hero product with 100% geometry & label preservation (Product-Lock).`,
    `Layer 05 Interactive Objects: Floating luxury pedestal, dynamic product aura.`,
    `Layer 06 Environment: Clean marble pedestal, architectural modern luxury space.`,
    `Layer 07 Background: Soft gradient volumetric background with golden ratio separation.`,
    `Layer 08 Atmosphere: Volumetric dust motes, cinematic god rays, ray-traced ambient occlusion.`
  ].join('\n');

  // LAYER 09 — SMART ENVIRONMENT
  const layer09Environment = [
    `[LAYER 09 — SMART ENVIRONMENT]`,
    `Inspired authentically by product industry, architectural luxury studio setting, tailored textures, never random.`
  ].join('\n');

  // LAYER 10 — VISUAL HOOK AI
  const layer10VisualHook = [
    `[LAYER 10 — VISUAL HOOK AI]`,
    `Unforgettable Hook: Breaking reality, impossible interaction, floating product levitation, surreal luxury pedestal, high-stakes curiosity trigger.`
  ].join('\n');

  // LAYER 11 — TYPOGRAPHY AI
  const layer11Typography = [
    `[LAYER 11 — TYPOGRAPHY AI]`,
    `Typography Integration: Reserved clean negative space with 3D Arabic display typography styling, very bold, soft extrusion, white border sticker outline, dynamic perspective integration with hero.`
  ].join('\n');

  // LAYER 12 — SMART HEADLINE AI
  const layer12Headline = [
    `[LAYER 12 — SMART HEADLINE AI]`,
    `Viral Hook Headline: 2-5 Arabic words maximum, intense curiosity, bold, clean, magnetic visual punch.`
  ].join('\n');

  // LAYER 13 — COMPOSITION ENGINE
  const layer13Composition = [
    `[LAYER 13 — COMPOSITION ENGINE]`,
    `3x3 Golden Ratio rule, leading visual lines directing gaze to the product label, balanced negative space, razor-sharp hero focus.`
  ].join('\n');

  // LAYER 14 — INDUSTRY ENGINE
  const layer14Industry = [
    `[LAYER 14 — INDUSTRY ENGINE]`,
    `Industry Adaptation: Tailored to industry category without breaking unified visual language.`
  ].join('\n');

  // LAYER 15 — NO REPETITION AI
  const layer15NoRepetition = [
    `[LAYER 15 — NO REPETITION AI]`,
    `Unique visual DNA signature key. Never repeat camera angle, pose, props, or background geometry.`
  ].join('\n');

  // FINAL CONSTITUTIONAL LAW
  const finalLaw = [
    `[FINAL CONSTITUTIONAL LAW]`,
    `The entire production belongs to ONE unified brand universe: identical advertiser identity, identical color constitution grading, award-winning art direction, hyper-realistic commercial photography, luxury finish, NOT AI-looking, scroll-stopping!`
  ].join('\n');

  const negativeConstraints = [
    `# [NEGATIVE REJECTION CONSTRAINTS]`,
    `Strictly reject: plastic or synthetic look, oversaturated amateur filters, distorted text, mutated geometry, low resolution, blown-out highlights, muddy crushed shadows, artificial CGI render aesthetics, watermark, borders.`
  ].join('\n');

  const finalPrompt = [
    `# HYPER UNIVERSAL SOCIAL ENGINE V1.0 — MASTER ADVERTISING PRODUCTION`,
    `USER SCENE INTENT: ${userText}`,
    layer01BrandAI,
    layer02Color,
    layer03FaceLock,
    layer04Character,
    layer05ScrollStop,
    layer06VisualStory,
    layer07Camera,
    layer08Depth,
    layer09Environment,
    layer10VisualHook,
    layer11Typography,
    layer12Headline,
    layer13Composition,
    layer14Industry,
    layer15NoRepetition,
    finalLaw,
    negativeConstraints
  ].join('\n\n');

  return {
    finalPrompt,
    dnaLock: `${layer01BrandAI}\n${layer02Color}\n${layer03FaceLock}`,
    lighting: `${layer07Camera}\n${layer08Depth}`,
    composition: `${layer13Composition}\n${layer10VisualHook}\n${layer11Typography}`,
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

  // Combine product and advertiser images for coherent dual-subject synthesis
  const mediaToUse = [
    ...request.productImages,
    ...(request.advertiserImages || [])
  ];

  // Call generation with the master cinematic prompt
  const generatedImage = await generateImage(
    mediaToUse,
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
