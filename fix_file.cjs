const fs = require('fs');
let content = fs.readFileSync('components/VoiceOverStudio.tsx', 'utf8');

// Fix the corrupted button
content = content.replace(
    /\{styleSuggestions\.map\(\(suggestion, index\) => \([\s\S]*?key=\{index\}/,
    `{styleSuggestions.map((suggestion, index) => (\n                                    <button\n                                    key={index}`
);

// We still have the old button nested structure in there since regex failed.
// Oh wait, did regex replace it AND the other one?
// Let's check what it looks like around line 260
fs.writeFileSync('components/VoiceOverStudio.tsx', content);
