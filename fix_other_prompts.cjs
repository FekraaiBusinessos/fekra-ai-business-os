const fs = require('fs');
let content = fs.readFileSync('services/geminiService.ts', 'utf8');

const oldPromptFromText = `const prompt = \`Expand this idea into a detailed text-to-image prompt: "\${instructions}"\`;`;
const newPromptFromText = `const prompt = \`
# HYPER UNIVERSAL SOCIAL ENGINE V1.0
You are a world-class AI Image Prompt Engineer following strict visual rules:
- SCROLL STOP SYSTEM: Ensure the visual is captivating.
- BRAND INTELLIGENCE: Hyper-realistic, award-winning commercial art direction.
- DEPTH ENGINE: Build rich layers (Foreground, Subject, Background, Atmosphere).
- SMART CAMERA: Specify a unique dynamic camera angle.
- SMART ENVIRONMENT: Describe a fitting, detailed environment.
- TYPOGRAPHY & TEXT AWARENESS: If text is required, describe it clearly, but DO NOT generate long gibberish Arabic text in the visual prompt. Keep text elements bold and simple (e.g. "bold 3D text").
- NO REPETITION: Unique composition and lighting.

Expand this idea into a highly detailed text-to-image prompt (in English) following the rules above: "\${instructions}"
\`;`;

content = content.replace(oldPromptFromText, newPromptFromText);

const oldStoryboardInstruction = `const instruction = \`Act as a cinematic Storyboard Director and Scriptwriter. 
    Context/Prompt: "\${customInstructions}".
    
    Task: Create a professional 9-scene storyboard sequence. 
    Maintain strict visual consistency for the subject/character from provided images.
    Each scene must have a unique camera angle to build a cinematic narrative.
    
    Return a JSON array of 9 objects:
    - sequence: number (1 to 9)
    - description: what is happening in the scene (Arabic)
    - cameraAngle: specific technical camera angle (e.g. Extreme Close-up, Low Angle, Wide Shot)
    - visualPrompt: extremely detailed English prompt for an AI image generator to create THIS scene. Include lighting, mood, and reference to the subject.
    Return ONLY JSON.\`;`;

const newStoryboardInstruction = `const instruction = \`
# HYPER UNIVERSAL SOCIAL ENGINE V1.0 - STORYBOARD EDITION
Act as a cinematic Storyboard Director and Scriptwriter. 
Context/Prompt: "\${customInstructions}".

MISSION: Create a professional 9-scene storyboard sequence that tells a compelling visual story.
- CAMERA: Each scene must have a unique, non-repeating technical camera angle (e.g., Extreme Close-up, Wide Shot, Drone View, Dutch Angle).
- SCROLL STOP: Scenes must be highly engaging with a cinematic color grading.
- CONSISTENCY: Maintain strict visual consistency for the subject/character across all scenes.
- TEXT SAFETY: Avoid generating gibberish Arabic text. Keep scene elements visual and atmospheric.

Task: Generate a JSON array of exactly 9 objects:
- sequence: number (1 to 9)
- description: what is happening in the scene (in Arabic)
- cameraAngle: specific technical camera angle
- visualPrompt: extremely detailed English prompt for an AI image generator to create THIS scene (incorporating lighting, mood, depth, and character details).
Return ONLY the raw JSON array.\`;`;

content = content.replace(oldStoryboardInstruction, newStoryboardInstruction);

fs.writeFileSync('services/geminiService.ts', content);
