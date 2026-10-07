const fs = require('fs');
let content = fs.readFileSync('components/VoiceOverStudio.tsx', 'utf8');

let fixedContent = content.replace(
    /<button([\s\S]*?onClick=\{\(\) => \{[\s\S]*?setProject\(s => \(\{ \.\.\.s, selectedVoice: voice\.value \}\)\);[\s\S]*?\}\}[\s\S]*?className=\{[\s\S]*?\}\s*>)([\s\S]*?)(<button[\s\S]*?onClick=\{\(e\) => handlePreview\(e, voice\.value\)\}[\s\S]*?<\/button>[\s\S]*?)<\/button>/g,
    (match, p1, p2, p3) => {
        let divP1 = p1.replace(/^<button/, '<div').replace('className={`w-full', 'role="radio" tabIndex={0} className={`w-full cursor-pointer');
        return divP1 + p2 + p3 + '</div>';
    }
);

if (content !== fixedContent) {
    fs.writeFileSync('components/VoiceOverStudio.tsx', fixedContent);
    console.log("Successfully fixed nested buttons");
} else {
    console.log("Failed to match nested buttons");
}
