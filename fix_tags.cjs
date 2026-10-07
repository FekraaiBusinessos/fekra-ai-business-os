const fs = require('fs');
let content = fs.readFileSync('components/VoiceOverStudio.tsx', 'utf8');

// Replace the opening button with div
content = content.replace(
    /<button\s+key=\{voice\.value\}\s+onClick=\{\(\) => \{/g,
    `<div\n                                    key={voice.value}\n                                    onClick={() => {`
);

fs.writeFileSync('components/VoiceOverStudio.tsx', content);
