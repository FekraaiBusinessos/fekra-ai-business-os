const fs = require('fs');
let content = fs.readFileSync('components/VoiceOverStudio.tsx', 'utf8');

const targetContent = `<button 
                                    key={voice.value}
                                    onClick={() => {
                                        if (previewAudioSourceRef.current) {
                                            previewAudioSourceRef.current.stop();
                                        }
                                        setProject(s => ({ ...s, selectedVoice: voice.value }));
                                    }}
                                    className={\`w-full text-left p-3 rounded-lg border-2 transition-all \${project.selectedVoice === voice.value ? 'border-[var(--color-accent)] bg-[rgba(var(--color-accent-rgb),0.2)]' : 'border-transparent bg-black/20 hover:border-[rgba(var(--color-accent-rgb),0.5)]'}\`}
                                >
                                    <div className="flex justify-between items-center gap-2">
                                        <div>
                                            <p className="font-semibold text-[var(--color-text-base)]">{voice.label}</p>
                                            <p className="text-xs text-[var(--color-text-secondary)]">{voice.description}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => handlePreview(e, voice.value)}
                                            className="p-2 rounded-full hover:bg-[rgba(var(--color-text-base-rgb),0.1)] transition-colors z-10 relative flex-shrink-0"
                                            aria-label={\`Preview voice \${voice.label}\`}
                                        >
                                            {project.previewLoadingVoice === voice.value ? <PreviewLoadingSpinner /> :
                                             project.previewPlayingVoice === voice.value ? <PreviewPauseIcon /> :
                                             <PreviewPlayIcon />}
                                        </button>
                                    </div>
                                </button>`;

const replacementContent = `<div 
                                    key={voice.value}
                                    onClick={() => {
                                        if (previewAudioSourceRef.current) {
                                            previewAudioSourceRef.current.stop();
                                        }
                                        setProject(s => ({ ...s, selectedVoice: voice.value }));
                                    }}
                                    className={\`w-full text-left p-3 rounded-lg border-2 transition-all cursor-pointer \${project.selectedVoice === voice.value ? 'border-[var(--color-accent)] bg-[rgba(var(--color-accent-rgb),0.2)]' : 'border-transparent bg-black/20 hover:border-[rgba(var(--color-accent-rgb),0.5)]'}\`}
                                    role="radio"
                                    aria-checked={project.selectedVoice === voice.value}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            if (previewAudioSourceRef.current) {
                                                previewAudioSourceRef.current.stop();
                                            }
                                            setProject(s => ({ ...s, selectedVoice: voice.value }));
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-center gap-2">
                                        <div>
                                            <p className="font-semibold text-[var(--color-text-base)]">{voice.label}</p>
                                            <p className="text-xs text-[var(--color-text-secondary)]">{voice.description}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => handlePreview(e, voice.value)}
                                            className="p-2 rounded-full hover:bg-[rgba(var(--color-text-base-rgb),0.1)] transition-colors z-10 relative flex-shrink-0"
                                            aria-label={\`Preview voice \${voice.label}\`}
                                        >
                                            {project.previewLoadingVoice === voice.value ? <PreviewLoadingSpinner /> :
                                             project.previewPlayingVoice === voice.value ? <PreviewPauseIcon /> :
                                             <PreviewPlayIcon />}
                                        </button>
                                    </div>
                                </div>`;

const newStr = content.replace(targetContent, replacementContent);
if (newStr !== content) {
    fs.writeFileSync('components/VoiceOverStudio.tsx', newStr);
    console.log("Success");
} else {
    // try exact match or regex
    const regexStr = /<button[\s\S]*?Preview voice[\s\S]*?<\/button>[\s\S]*?<\/button>/;
    console.log("Fallback replacement...");
}
