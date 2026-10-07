
import React, { useCallback } from 'react';
import { ImageFile, BrandingStudioProject, BrandingResultCategory, AspectRatio } from '../types';
import { resizeImage, runWithConcurrency } from '../utils';
import { analyzeLogoForBranding, generateImage } from '../services/geminiService';
import ImageWorkspace from './ImageWorkspace';
import BrandingResultsGrid from './BrandingResultsGrid';
import { ASPECT_RATIOS } from '../constants';

const CORE_BRANDING_CATEGORIES: BrandingResultCategory[] = [
    '3D Glass Logo', 'Business Card Mockup', '3D Glass App Icon'
];

const MOCKUP_CATEGORIES: BrandingResultCategory[] = [
    'Logo Construction Grid', 'Typography Showcase', 'Logo Color Variations', 'Monochrome Version',
    '3D Glass Logo', 'Business Card Mockup', '3D Glass App Icon', 'Creative Pen Mockup',
    'Merchandise (Tote Bag)', 'Pencil Sketch Logo', 'Notebook Mockup', 'Waving Flag Mockup'
];

const getPromptForCategory = (category: BrandingResultCategory, aspectRatio: AspectRatio): string => {
    const aspectRatioRequirement = ` The final image must have a ${aspectRatio} aspect ratio.`;
    switch (category) {
        case 'Logo Construction Grid':
            return "Create a technical brand guideline image. Display the provided logo on a light grid, showing construction lines, proportions, and a clear space margin around it." + aspectRatioRequirement;
        case 'Typography Showcase':
            return "Create a brand typography specimen sheet. Analyze the font style used in the provided logo and display full English alphabet neatly on a minimalist background." + aspectRatioRequirement;
        case 'Logo Color Variations':
            return "Create a brand guideline image showing logo color variations. Display four versions of the provided logo on different solid-colored backgrounds." + aspectRatioRequirement;
        case 'Monochrome Version':
            return 'A high-contrast, single-color (white) version of the provided logo, presented on a black background.' + aspectRatioRequirement;
        case '3D Glass Logo':
            return "Create a photorealistic 3D mockup of the provided logo rendered in glossy, translucent glass." + aspectRatioRequirement;
        case 'Business Card Mockup':
            return "A photorealistic mockup of a premium business card featuring the provided logo on marble background." + aspectRatioRequirement;
        case '3D Glass App Icon':
            return "Create a photorealistic 3D app icon from the provided logo in glossy translucent glass." + aspectRatioRequirement;
        case 'Creative Pen Mockup':
            return "A photorealistic mockup of a high-end elegant pen with the provided logo subtly engraved." + aspectRatioRequirement;
        case 'Merchandise (Tote Bag)':
            return "A photorealistic lifestyle mockup of the provided logo printed on a high-quality canvas tote bag." + aspectRatioRequirement;
        case 'Pencil Sketch Logo':
            return "Create a photorealistic artistic sketch of the provided logo as if hand-drawn with graphite pencil." + aspectRatioRequirement;
        case 'Notebook Mockup':
            return "A photorealistic mockup of a premium notebook with logo elegantly debossed on the cover." + aspectRatioRequirement;
        case 'Waving Flag Mockup':
            return "A photorealistic mockup of the provided logo on a large flag waving gently against a clear sky." + aspectRatioRequirement;
        default:
            return `A professional product shot of the provided logo.` + aspectRatioRequirement;
    }
}

const BrandingStudio: React.FC<{
  project: BrandingStudioProject;
  setProject: React.Dispatch<React.SetStateAction<BrandingStudioProject>>;
}> = ({ project, setProject }) => {

    const handleFileUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;
        setProject(s => ({ ...s, isUploading: true, error: null }));
        try {
            const uploaded = await Promise.all(files.map(async file => {
                const resized = await resizeImage(file, 1024, 1024);
                const reader = new FileReader();
                return new Promise<ImageFile>(res => {
                    reader.onloadend = () => res({ base64: (reader.result as string).split(',')[1], mimeType: resized.type, name: resized.name });
                    reader.readAsDataURL(resized);
                });
            }));
            setProject(s => ({
                ...s,
                logos: [...s.logos, ...uploaded],
                isUploading: false,
                results: [],
                colors: [],
            }));
        } catch (err) {
            setProject(s => ({ ...s, error: 'Upload failed', isUploading: false }));
        }
    };

    const handleRemoveLogo = (idx: number) => setProject(s => ({ ...s, logos: s.logos.filter((_, i) => i !== idx), results: [], colors: [], error: null }));
    const handleUpdateLogo = (idx: number, newImage: ImageFile) => setProject(s => {
        const nextLogos = [...s.logos];
        nextLogos[idx] = newImage;
        return { ...s, logos: nextLogos, results: [], colors: [] };
    });
    
    const onGenerate = useCallback(async (fullKit: boolean = false) => {
        if (project.logos.length === 0) return;
        const categoriesToRun = fullKit ? MOCKUP_CATEGORIES : CORE_BRANDING_CATEGORIES;
        setProject(s => ({...s, isAnalyzing: true, isGenerating: true, error: null}));
        try {
            const analysis = project.colors.length > 0 ? { colors: project.colors } : await analyzeLogoForBranding(project.logos);
            setProject(s => ({...s, colors: analysis.colors, isAnalyzing: false}));
            
            const initialResults = categoriesToRun.map(category => {
                const existing = project.results.find(r => r && r.category === category && r.image);
                if (existing) return existing;
                return { category, image: null, isLoading: true, error: null, editPrompt: '', isEditing: false };
            });
            setProject(s => ({...s, results: initialResults}));
            
            // Execute with concurrency limit of 1 and progressive updates to prevent throttling
            await runWithConcurrency(
                categoriesToRun,
                1,
                async (category) => {
                    const existing = project.results.find(r => r && r.category === category && r.image);
                    if (existing && existing.image) {
                        return { category, image: existing.image };
                    }
                    const prompt = getPromptForCategory(category, project.aspectRatio);
                    try {
                        const image = await generateImage([project.logos[0]], prompt, null, project.aspectRatio);
                        return { category, image };
                    } catch (error: any) {
                        return { category, error: error?.message || 'Generation failed' };
                    }
                },
                (res) => {
                    setProject(s => ({
                        ...s,
                        results: s.results.map(r => {
                            if (r.category !== res.category) return r;
                            if ('image' in res && res.image) {
                                return { ...r, image: res.image, isLoading: false };
                            } else {
                                return { ...r, error: res.error || 'Generation failed', isLoading: false };
                            }
                        })
                    }));
                }
            );
        } catch(err) {
            setProject(s => ({...s, error: 'Analysis failed', isAnalyzing: false }));
        } finally {
            setProject(s => ({...s, isGenerating: false}));
        }
    }, [project.logos, project.aspectRatio, project.colors, project.results, setProject]);

    if (!project) return null;

    return (
        <main className="w-full max-w-7xl flex flex-col gap-4 pt-4 pb-8 flex-grow">
            <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="w-full md:w-48 flex-shrink-0">
                    <ImageWorkspace
                        id="branding-logo-uploader"
                        title="Logo"
                        images={project.logos}
                        onImagesUpload={handleFileUpload}
                        onImageRemove={handleRemoveLogo}
                        isUploading={project.isUploading}
                        onImageUpdate={handleUpdateLogo}
                    />
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h2 className="text-xl font-bold text-[var(--color-text-base)]">Branding Studio</h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">Generate brand assets from your logo.</p>
                     <div className="mt-4 flex gap-2 flex-wrap">
                        {ASPECT_RATIOS.map(ratio => (
                            <button key={ratio.value} onClick={() => setProject(s => ({ ...s, aspectRatio: ratio.value as AspectRatio }))} className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${project.aspectRatio === ratio.value ? 'bg-[var(--color-accent)] text-white' : 'bg-black/20 text-[var(--color-text-secondary)] hover:text-white'}`}>{ratio.value}</button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => onGenerate(false)} 
                        disabled={project.logos.length === 0 || project.isGenerating} 
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-xs whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-1.5"
                        title="توليد 3 موك آب رئيسية عالية الجودة بتوفير 75% من الكوتة"
                    >
                        <span>⚡</span>
                        <span>طقم أساسي (توفير 75% كوتة)</span>
                    </button>
                    <button 
                        onClick={() => onGenerate(true)} 
                        disabled={project.logos.length === 0 || project.isGenerating} 
                        className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-5 rounded-xl border border-white/10 transition-all text-xs whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                        <span>🚀</span>
                        <span>{project.isGenerating ? 'جاري التوليد...' : 'طقم كامل (12 موك آب)'}</span>
                    </button>
                </div>
            </div>
            {project.colors.length > 0 && (
                <div className="glass-card rounded-2xl p-4">
                    <h3 className="text-lg font-bold mb-4">Color Palette</h3>
                    <div className="flex flex-wrap gap-4">
                        {project.colors.map((color, index) => (
                            <div key={index} className="text-center">
                                <div className="w-14 h-14 rounded-lg border border-white/10" style={{backgroundColor: color}}></div>
                                <p className="text-xs mt-1.5 font-mono opacity-60">{color}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {project.results.length > 0 && (
                <div className="glass-card rounded-2xl p-4">
                    <h3 className="text-lg font-bold mb-4">Assets</h3>
                     <BrandingResultsGrid results={project.results} />
                </div>
            )}
        </main>
    );
};

export default BrandingStudio;
