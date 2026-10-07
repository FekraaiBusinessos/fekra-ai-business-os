const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf8');

const oldInstruction = `    const instruction = \`Act as a professional Creative Director and Marketing Strategist. 
    Target Market: \${targetMarket}. Requested Content Dialect/Language: \${dialect}.
    Goal: "\${userPrompt}". 
    
    Task: Generate 9 unique campaign post ideas tailored for the specified market and written in the requested dialect.
    Return a JSON array where each object has:
    - id: string
    - scenario: highly descriptive visual prompt for AI image generation (English). If no product image was provided, describe the subject/product from the user's goal.
    - caption: engaging social media caption written STRICTLY in the specified dialect (\${dialect})
    - tov: a short, catchy text suggestion or hook (max 5-7 words) derived from the caption, intended to be written directly on the design/visual itself.
    - schedule: recommended posting day/time for the \${targetMarket} market.
    Return ONLY the raw JSON array.\`;`;

const newInstruction = `    const instruction = \`
# HYPER UNIVERSAL SOCIAL ENGINE V1.0
## VISUAL DNA • FACE LOCK • BRAND INTELLIGENCE • TYPOGRAPHY AI • SCROLL STOP SYSTEM

MISSION
Create premium advertising campaigns that look like they were produced by a global creative agency.
Never generate ordinary social media designs.
Every image must stop scrolling instantly while maintaining one unified visual identity across the entire campaign.

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 01 — UNIVERSAL BRAND AI
Analyze automatically: Business Activity, Logo, Brand Colors, Product Type, Audience, Brand Personality.
Build a complete Brand DNA. Everything generated belongs only to this DNA.

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 02 — COLOR CONSTITUTION
Maximum colors allowed: 1 Primary, 1 Secondary, 1 Neutral.
Create one unified cinematic color grading. Every design must feel photographed in the same campaign.

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 03 — FACE LOCK AI
If analyzing faces, lock them permanently (Hair, Eyes, Skin Tone, Age, Expressions).

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 04 — CHARACTER ENGINE
Transform advertiser into an advertising character. Funny, Friendly, Confident, Expressive, Crazy poses.

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 05 — SCROLL STOP ENGINE
Before rendering ask: Would this stop scrolling in under one second?

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 06 — VISUAL STORY AI
Every design tells one visual story: Beginning. Curiosity. Emotion. Solution. Brand.

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 07 — SMART CAMERA
Generate a new camera every time: Ultra Wide, Macro, POV, Hero, Dutch, Top View, Drone, Low Angle. Never repeat.

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 08 — DEPTH ENGINE
Build layers: Foreground FX, Foreground Objects, Hero Character, Product, Interactive Objects, Environment, Background, Atmosphere.

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 09 — SMART ENVIRONMENT
Generate environments inspired by the business and products. Never random.

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 10 — VISUAL HOOK AI
Every design contains ONE unforgettable hook (e.g. Oversized Object, Portal, Floating Product, Breaking Reality). Choose automatically, never repeat.

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 11 — TYPOGRAPHY AI
Typography is part of the illustration. Generate one custom display typography (Avoid spelling mistakes). Very Bold, Heavy Shadow, 3D Feeling. It interacts with the hero. Never look pasted.

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 12 — SMART HEADLINE AI
Generate one viral Arabic hook (max 2-5 words). Huge curiosity, Simple, easy to read, maximum visual impact. This will be the "tov" (Tone of Voice / Text on Visual).

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 13 — COMPOSITION ENGINE
Use: 3x3 Grid, Golden Ratio, Eye Tracking, Negative Space, Perfect Readability.

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYER 14 — NO REPETITION AI
Never repeat: Camera, Pose, Hook, Environment, Composition.

━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL LAW
The campaign must look like one premium brand universe. Hyper realistic. Luxury finish. Commercial photography quality. Award-winning art direction.

---
Target Market: \${targetMarket}. Requested Content Dialect/Language: \${dialect}.
Goal/User Prompt: "\${userPrompt}".

Task: Generate 9 unique campaign post ideas tailored for the specified market and written in the requested dialect, strictly following the HYPER UNIVERSAL SOCIAL ENGINE V1.0 rules.

Return a JSON array where each object has:
- id: string
- scenario: Highly descriptive visual prompt for AI image generation (English). It MUST incorporate the exact camera angle, depth layers, color grading, visual hook, composition, and environment described in the rules above. Ensure NO gibberish Arabic text is generated in the visual description itself. Describe the text placeholder simply.
- caption: engaging social media caption written STRICTLY in the specified dialect (\${dialect})
- tov: The "Smart Headline / Hook" from Layer 12. Short, catchy text suggestion (max 2-5 words) derived from the caption, intended to be written directly on the design/visual itself.
- schedule: recommended posting day/time for the \${targetMarket} market.
Return ONLY the raw JSON array.\`;`;

content = content.replace(oldInstruction, newInstruction);
fs.writeFileSync('services/geminiService.ts', content);
