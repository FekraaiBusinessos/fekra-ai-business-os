import React, { useState } from 'react';
import { MarketingStudioProject, ImageFile, AspectRatio } from '../types';
import { generateIntegratedMarketingCampaign, generateImage } from '../services/geminiService';
import { validateQuotaUsage } from '../services/quotaGuard';
import { saveStudioWork } from '../services/studioStorageService';
import { resizeImage } from '../utils';
import ImageWorkspace from './ImageWorkspace';
import SmartEnhanceButton from './SmartEnhanceButton';

const MarketingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h10a2 2 0 002-2v-2" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const SparkleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;

const TARGET_MARKETS = [
    { id: 'sa', label: 'المملكة العربية السعودية 🇸🇦' },
    { id: 'ae', label: 'الإمارات العربية المتحدة 🇦🇪' },
    { id: 'gcc', label: 'دول الخليج العربي 🌐' },
    { id: 'eg', label: 'جمهورية مصر العربية 🇪🇬' },
    { id: 'global', label: 'سوق عالمي / دولي 🌍' },
];

const PLATFORM_OPTIONS = [
    { id: 'Instagram', label: 'Instagram', icon: '📸' },
    { id: 'TikTok', label: 'TikTok', icon: '🎵' },
    { id: 'Snapchat', label: 'Snapchat', icon: '👻' },
    { id: 'Google Ads', label: 'Google Ads', icon: '🔍' },
    { id: 'X (Twitter)', label: 'X (Twitter)', icon: '✖️' },
    { id: 'WhatsApp', label: 'WhatsApp', icon: '💬' },
];

const DIALECT_OPTIONS = [
    { id: 'سعودي إعلاني', label: 'سعودي (إعلاني معاصر)' },
    { id: 'خليجي موحد', label: 'خليجي (رسمي وجذاب)' },
    { id: 'مصري حماسي', label: 'مصري (سريع ومقنع)' },
    { id: 'فصحى فخمة', label: 'عربية فصحى (وثائقية فخمة)' },
    { id: 'English Commercial', label: 'English (High-Converting)' },
];

interface MarketingStudioProps {
    project: MarketingStudioProject;
    setProject: React.Dispatch<React.SetStateAction<MarketingStudioProject>>;
    onSendToVoiceover?: (script: string) => void;
    onSendToVideoFlow?: (prompt: string, image?: ImageFile | null) => void;
}

export const MarketingStudio: React.FC<MarketingStudioProps> = ({ 
    project, 
    setProject,
    onSendToVoiceover,
    onSendToVideoFlow
}) => {
    const [activeTab, setActiveTab] = useState<'strategy' | 'persona' | 'creatives' | 'scripts' | 'budget' | 'report'>('strategy');
    const [copied, setCopied] = useState(false);
    const [copiedVoiceover, setCopiedVoiceover] = useState(false);
    const [generatingCreativeId, setGeneratingCreativeId] = useState<string | null>(null);

    // Upload handlers for Logo
    const handleLogoUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;
        setProject(s => ({ ...s, isUploadingLogo: true }));
        try {
            const resized = await resizeImage(files[0], 1024, 1024);
            const reader = new FileReader();
            reader.onloadend = () => {
                const img: ImageFile = {
                    base64: (reader.result as string).split(',')[1],
                    mimeType: resized.type,
                    name: resized.name
                };
                setProject(s => ({
                    ...s,
                    logoImages: [img],
                    isUploadingLogo: false
                }));
            };
            reader.readAsDataURL(resized);
        } catch (err) {
            setProject(s => ({ ...s, isUploadingLogo: false, error: 'Failed to upload logo' }));
        }
    };

    const handleLogoRemove = () => {
        setProject(s => ({ ...s, logoImages: [] }));
    };

    // Upload handlers for Products / Services
    const handleProductUpload = async (files: File[]) => {
        if (!files || files.length === 0) return;
        setProject(s => ({ ...s, isUploadingProduct: true }));
        try {
            const uploaded = await Promise.all(files.map(async file => {
                const resized = await resizeImage(file, 1280, 1280);
                const reader = new FileReader();
                return new Promise<ImageFile>(res => {
                    reader.onloadend = () => res({
                        base64: (reader.result as string).split(',')[1],
                        mimeType: resized.type,
                        name: resized.name
                    });
                    reader.readAsDataURL(resized);
                });
            }));
            setProject(s => ({
                ...s,
                productImages: [...s.productImages, ...uploaded],
                isUploadingProduct: false
            }));
        } catch (err) {
            setProject(s => ({ ...s, isUploadingProduct: false, error: 'Failed to upload product image' }));
        }
    };

    const handleProductRemove = (index: number) => {
        setProject(s => ({
            ...s,
            productImages: s.productImages.filter((_, i) => i !== index)
        }));
    };

    const togglePlatform = (platformId: string) => {
        setProject(s => {
            const current = s.selectedPlatforms || [];
            const exists = current.includes(platformId);
            const next = exists 
                ? current.filter(p => p !== platformId)
                : [...current, platformId];
            return { ...s, selectedPlatforms: next.length > 0 ? next : [platformId] };
        });
    };

    // Generate Complete Campaign
    const handleGenerateCampaign = async () => {
        if (!project.brandName && !project.specialty && (!project.productImages || project.productImages.length === 0)) {
            setProject(s => ({ ...s, error: 'يرجى إدخال اسم البراند أو التخصص، أو إرفاق صور المنتج/الخدمة للبدء' }));
            return;
        }

        const val = validateQuotaUsage({
            studio: 'marketing',
            prompt: `${project.brandName || ''} ${project.specialty || ''} ${project.brief || ''}`,
            fingerprint: `mkt_${project.brandName}_${project.specialty}_${project.campaignGoal}`
        });
        if (!val.allowed) {
            setProject(s => ({ ...s, error: val.reason || 'حماية الكوتة نشطة.' }));
            return;
        }

        setProject(s => ({ ...s, isGenerating: true, error: null }));

        try {
            const res = await generateIntegratedMarketingCampaign({
                brandType: project.brandType,
                entityType: project.entityType || 'product',
                campaignGoal: project.campaignGoal || 'sales',
                name: project.brandName,
                specialty: project.specialty,
                brief: project.brief,
                websiteLink: project.websiteLink,
                targetMarket: project.targetMarket || 'المملكة العربية السعودية 🇸🇦',
                selectedPlatforms: project.selectedPlatforms || ['Instagram', 'TikTok', 'Snapchat'],
                dialect: project.dialect || 'سعودي إعلاني',
                language: project.language || 'ar',
                logoImages: project.logoImages,
                productImages: project.productImages
            });

            setProject(s => ({
                ...s,
                campaignData: res.campaignData,
                result: res.report,
                isGenerating: false,
                error: null
            }));
            setActiveTab('strategy');
        } catch (err: any) {
            console.error('Campaign generation failed:', err);
            setProject(s => ({
                ...s,
                isGenerating: false,
                error: err?.message || 'حدث خطأ أثناء بناء الحملة التسويقية. يرجى المحاولة مرة أخرى.'
            }));
        }
    };

    // Generate AI Image for a Specific Creative Concept
    const handleGenerateCreativeImage = async (creativeId: string, prompt: string, aspectRatio: string) => {
        setGeneratingCreativeId(creativeId);
        try {
            const image = await generateImage(
                project.productImages && project.productImages.length > 0 ? [project.productImages[0]] : [],
                prompt,
                project.logoImages && project.logoImages.length > 0 ? [project.logoImages[0]] : null,
                aspectRatio as AspectRatio
            );

            setProject(s => {
                if (!s.campaignData) return s;
                const nextCreatives = s.campaignData.creatives.map(c => {
                    if (c.id === creativeId) {
                        return { ...c, generatedImage: image, isGeneratingImage: false, imageError: null };
                    }
                    return c;
                });
                return {
                    ...s,
                    campaignData: { ...s.campaignData, creatives: nextCreatives }
                };
            });

            saveStudioWork({
                title: `إعلان تسويقي: ${creativeId}`,
                prompt: prompt,
                studioType: 'marketing',
                image: image,
                aspectRatio: aspectRatio,
                metadata: {
                    campaignTitle: project.campaignData?.campaignName || project.brandName,
                }
            });
        } catch (err: any) {
            console.error('Failed to generate ad creative image:', err);
            setProject(s => {
                if (!s.campaignData) return s;
                const nextCreatives = s.campaignData.creatives.map(c => {
                    if (c.id === creativeId) {
                        return { ...c, imageError: err?.message || 'تعذر توليد الصورة', isGeneratingImage: false };
                    }
                    return c;
                });
                return {
                    ...s,
                    campaignData: { ...s.campaignData, creatives: nextCreatives }
                };
            });
        } finally {
            setGeneratingCreativeId(null);
        }
    };

    const handleCopy = () => {
        if (!project.result) return;
        navigator.clipboard.writeText(project.result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (format: 'txt' | 'md' | 'pdf') => {
        if (!project.result) return;

        if (format === 'pdf') {
            const htmlContent = `
                <!DOCTYPE html>
                <html dir="${project.language === 'ar' ? 'rtl' : 'ltr'}" lang="${project.language === 'ar' ? 'ar' : 'en'}">
                <head>
                    <meta charset="utf-8">
                    <title>Fekra AI 360 Campaign - ${project.brandName || 'Strategy'}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Tajawal', sans-serif; direction: ${project.language === 'ar' ? 'rtl' : 'ltr'}; padding: 40px; line-height: 1.6; color: #222; }
                        h1 { color: #d90429; border-bottom: 3px solid #ffccd5; padding-bottom: 12px; margin-top: 0; }
                        h2 { color: #111; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
                        h3 { color: #d90429; margin-top: 20px; }
                        p, li { font-size: 14px; color: #444; }
                        .badge { display: inline-block; background: #fff0f3; color: #d90429; padding: 4px 12px; border-radius: 8px; font-weight: bold; }
                        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
                        @media print { body { padding: 0; } }
                    </style>
                </head>
                <body>
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="margin: 0;">تقرير الحملة التسويقية الشاملة 360°</h1>
                        <p style="color: #666; margin-top: 5px;">تم إنشاؤه بواسطة Fekra AI Business OS</p>
                        ${project.brandName ? `<span class="badge">البراند: ${project.brandName}</span>` : ''}
                    </div>
                    <div style="white-space: pre-wrap;">${project.result}</div>
                    <div class="footer">تقرير استراتيجي سري ومحمي &copy; ${new Date().getFullYear()} Fekra AI Solutions</div>
                </body>
                </html>
            `;

            const printIframe = document.createElement('iframe');
            printIframe.style.position = 'fixed';
            printIframe.style.right = '0';
            printIframe.style.bottom = '0';
            printIframe.style.width = '0';
            printIframe.style.height = '0';
            printIframe.style.border = '0';
            document.body.appendChild(printIframe);

            const doc = printIframe.contentWindow?.document || printIframe.contentDocument;
            if (doc) {
                doc.open();
                doc.write(htmlContent);
                doc.close();
                setTimeout(() => {
                    try {
                        printIframe.contentWindow?.focus();
                        printIframe.contentWindow?.print();
                    } catch (e) {
                        console.error('Print iframe error:', e);
                    }
                    setTimeout(() => {
                        if (document.body.contains(printIframe)) {
                            document.body.removeChild(printIframe);
                        }
                    }, 1500);
                }, 300);
            } else {
                const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Campaign-Strategy-${project.brandName || 'Report'}.html`;
                a.click();
                URL.revokeObjectURL(url);
            }
            return;
        }

        const element = document.createElement("a");
        const file = new Blob([project.result], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = `Fekra-AI-Campaign-Strategy.${format}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <main className="w-full flex flex-col gap-8 pt-4 pb-16 animate-in fade-in duration-500">
            {/* Top Control Center */}
            <div className="glass-card rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/5 space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter flex items-center gap-2">
                            <MarketingIcon />
                            <span>استوديو الحملات التسويقية المتكاملة 360°</span>
                        </h2>
                        <p className="text-xs text-white/50 font-medium mt-1">
                            أرفق شعار وهوية البراند وصور المنتجات أو الخدمات لتوليد استراتيجية إعلانية شاملة بمحفزات علم النفس البيعي
                        </p>
                    </div>

                    <div className="flex bg-black/40 rounded-full p-1 border border-white/10 self-start md:self-auto">
                        <button 
                            onClick={() => setProject(s => ({ ...s, language: 'ar' }))}
                            className={`px-5 py-1.5 rounded-full text-xs font-black transition-all ${project.language === 'ar' ? 'bg-[var(--color-accent)] text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
                        >
                            العربية 🇸🇦
                        </button>
                        <button 
                            onClick={() => setProject(s => ({ ...s, language: 'en' }))}
                            className={`px-5 py-1.5 rounded-full text-xs font-black transition-all ${project.language === 'en' ? 'bg-[var(--color-accent)] text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
                        >
                            English 🇬🇧
                        </button>
                    </div>
                </div>

                {/* Section 1: Asset Attachment (Logo & Product/Service) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/25 p-5 rounded-3xl border border-white/5">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-white flex items-center gap-1.5">
                                <span>🏷️</span>
                                <span>شعار البراند (Logo)</span>
                            </span>
                            <span className="text-[10px] text-white/40">اختياري - يثبت الهوية البصرية</span>
                        </div>
                        <ImageWorkspace
                            id="mkt-logo-uploader"
                            title="اسحب أو ارفع اللوجو"
                            images={project.logoImages || []}
                            onImagesUpload={handleLogoUpload}
                            onImageRemove={handleLogoRemove}
                            isUploading={!!project.isUploadingLogo}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-white flex items-center gap-1.5">
                                <span>📦</span>
                                <span>صور المنتج أو الخدمة (Product / Service Media)</span>
                            </span>
                            <span className="text-[10px] text-[var(--color-accent)] font-bold">تُستخدم لتوليد الصور والمشاهد</span>
                        </div>
                        <ImageWorkspace
                            id="mkt-product-uploader"
                            title="اسحب أو ارفع صور المنتج أو الخدمة"
                            images={project.productImages || []}
                            onImagesUpload={handleProductUpload}
                            onImageRemove={handleProductRemove}
                            isUploading={!!project.isUploadingProduct}
                        />
                    </div>
                </div>

                {/* Section 2: Entity Type & Campaign Goal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Entity Type */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-white/70 uppercase tracking-widest block">
                            نوع النشاط المعروض:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'product', label: 'منتج ملموس', icon: '📦' },
                                { id: 'service', label: 'خدمة احترافية', icon: '💼' },
                                { id: 'store_app', label: 'متجر / تطبيق', icon: '📱' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setProject(s => ({ ...s, entityType: item.id as any }))}
                                    className={`py-3 px-2 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                                        (project.entityType || 'product') === item.id
                                            ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-lg'
                                            : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Campaign Goal */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-white/70 uppercase tracking-widest block">
                            الهدف التسويقي الرئيسي:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                                { id: 'sales', label: 'مبيعات مباشرة', icon: '💰' },
                                { id: 'awareness', label: 'انتشار ووعي', icon: '📢' },
                                { id: 'leads', label: 'توليد عملاء', icon: '🤝' },
                                { id: 'launch', label: 'إطلاق جديد', icon: '🚀' },
                                { id: 'promo', label: 'عروض وتخفيضات', icon: '🏷️' },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setProject(s => ({ ...s, campaignGoal: item.id as any }))}
                                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                                        (project.campaignGoal || 'sales') === item.id
                                            ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                                            : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 3: Brand Details, Target Market & Platforms */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-white/60">اسم البراند / النشاط:</label>
                        <input 
                            value={project.brandName}
                            onChange={e => setProject(s => ({ ...s, brandName: e.target.value }))}
                            placeholder="مثال: لافندر للعطور، نيوترك سنتر..."
                            className="w-full glass-input rounded-xl p-3 text-xs text-white"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-white/60">المجال والتخصص:</label>
                        <input 
                            value={project.specialty}
                            onChange={e => setProject(s => ({ ...s, specialty: e.target.value }))}
                            placeholder="مثال: عبايات خليجية فاخرة، قهوة مختصة..."
                            className="w-full glass-input rounded-xl p-3 text-xs text-white"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-white/60">رابط المتجر أو الموقع (اختياري):</label>
                        <input 
                            value={project.websiteLink}
                            onChange={e => setProject(s => ({ ...s, websiteLink: e.target.value }))}
                            placeholder="https://yourbrand.com"
                            className="w-full glass-input rounded-xl p-3 text-xs text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-white/60">السوق والجمهور المستهدف:</label>
                        <select 
                            value={project.targetMarket || 'المملكة العربية السعودية 🇸🇦'}
                            onChange={e => setProject(s => ({ ...s, targetMarket: e.target.value }))}
                            className="w-full glass-input rounded-xl p-3 text-xs text-white bg-gray-900"
                        >
                            {TARGET_MARKETS.map(m => (
                                <option key={m.id} value={m.label}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-white/60">اللهجة والنبرة الإعلانية المعتمدة:</label>
                        <select 
                            value={project.dialect || 'سعودي إعلاني'}
                            onChange={e => setProject(s => ({ ...s, dialect: e.target.value }))}
                            className="w-full glass-input rounded-xl p-3 text-xs text-white bg-gray-900"
                        >
                            {DIALECT_OPTIONS.map(d => (
                                <option key={d.id} value={d.id}>{d.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Platforms Multi-select */}
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/60 block">قنوات ومنصات الإطلاق الإعلاني المستهدفة:</label>
                    <div className="flex flex-wrap gap-2">
                        {PLATFORM_OPTIONS.map(p => {
                            const isSelected = (project.selectedPlatforms || ['Instagram', 'TikTok', 'Snapchat']).includes(p.id);
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => togglePlatform(p.id)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                                            : 'bg-white/5 text-white/40 border-white/5 hover:text-white'
                                    }`}
                                >
                                    <span>{p.icon}</span>
                                    <span>{p.label}</span>
                                    {isSelected && <span>✓</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Brief & Vision */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-white/60">
                            موجز العرض الترويجي والرؤية الخاصة (Brief):
                        </label>
                        <SmartEnhanceButton
                            currentText={project.brief}
                            onApplyText={(t) => setProject(s => ({ ...s, brief: t }))}
                            context="campaign_vision"
                            label="تحسين الرؤية إعلانياً"
                        />
                    </div>
                    <textarea 
                        value={project.brief}
                        onChange={e => setProject(s => ({ ...s, brief: e.target.value }))}
                        rows={3}
                        placeholder="صف العرض، الخصم، ميزة المنتج، التحدي الذي يعالجه، أو أي تفاصيل ترغب بالتركيز عليها..."
                        className="w-full glass-input rounded-2xl p-4 text-xs font-medium text-white resize-none suggestions-scrollbar"
                    />
                </div>

                {/* Submit Button */}
                <button 
                    onClick={handleGenerateCampaign}
                    disabled={project.isGenerating}
                    className="w-full bg-gradient-to-r from-[var(--color-accent)] to-purple-600 hover:from-[var(--color-accent-dark)] hover:to-purple-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-[var(--color-accent)]/20 transition-all active:scale-[0.99] disabled:opacity-40 text-base md:text-lg flex items-center justify-center gap-2"
                >
                    {project.isGenerating ? (
                        <>
                            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                            <span>جاري هندسة الحملة التسويقية 360° وتحليل علم النفس البيعي...</span>
                        </>
                    ) : (
                        <>
                            <SparkleIcon />
                            <span>توليد الحملة التسويقية المتكاملة 360°</span>
                        </>
                    )}
                </button>
            </div>

            {/* Error Message */}
            {project.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs text-center font-bold animate-shake">
                    {project.error}
                </div>
            )}

            {/* Campaign Output Workspace */}
            {project.campaignData && (
                <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
                    {/* Top Action Bar */}
                    <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-white/5 shadow-xl">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                            <div>
                                <h3 className="text-sm font-black text-white">
                                    الحملة جاهزة: {project.campaignData.bigIdea}
                                </h3>
                                <p className="text-[11px] text-[var(--color-accent)] font-bold">
                                    "{project.campaignData.slogan}"
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            <button 
                                onClick={handleCopy} 
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold flex items-center transition-all border border-white/5"
                            >
                                {copied ? <CheckIcon /> : <CopyIcon />} {copied ? 'تم النسخ!' : 'نسخ التقرير'}
                            </button>
                            <button 
                                onClick={() => handleDownload('pdf')} 
                                className="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white rounded-xl text-xs font-bold flex items-center transition-all shadow-md shadow-[var(--color-accent)]/20"
                            >
                                <DownloadIcon /> طباعة / PDF
                            </button>
                            <button 
                                onClick={() => handleDownload('md')} 
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/5"
                            >
                                .MD
                            </button>
                            <button 
                                onClick={() => handleDownload('txt')} 
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/5"
                            >
                                .TXT
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-white/10 pb-2 gap-2 overflow-x-auto suggestions-scrollbar">
                        {[
                            { id: 'strategy', label: '🚀 فكرة الحملة والشعار', icon: '🚀' },
                            { id: 'persona', label: '👥 العميل المستهدف وعلم النفس', icon: '👥' },
                            { id: 'creatives', label: `🎨 المشاهد والأفكار الإعلانية (${project.campaignData.creatives?.length || 4})`, icon: '🎨' },
                            { id: 'scripts', label: '🎬 سكربتات الفيديو والفويس أوفر', icon: '🎬' },
                            { id: 'budget', label: '📈 الميزانية وخطة الإطلاق', icon: '📈' },
                            { id: 'report', label: '📑 التقرير الاستراتيجي الكامل', icon: '📑' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id as any)}
                                className={`text-xs font-black px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                                    activeTab === t.id
                                        ? 'bg-[var(--color-accent)] text-white shadow-lg'
                                        : 'bg-white/5 text-white/60 hover:text-white'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab 1: Strategy & Big Idea */}
                    {activeTab === 'strategy' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                            <div className="glass-card rounded-3xl p-6 border border-purple-500/20 bg-purple-950/20 space-y-3">
                                <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest block">
                                    THE BIG IDEA
                                </span>
                                <h4 className="text-xl font-black text-white leading-snug">
                                    {project.campaignData.bigIdea}
                                </h4>
                                <p className="text-xs text-white/70 leading-relaxed">
                                    الفكرة الكبرى التي تدور حولها جميع محاور الحملة وتصنع أثراً لا يُمحى في ذهن العميل.
                                </p>
                            </div>

                            <div className="glass-card rounded-3xl p-6 border border-emerald-500/20 bg-emerald-950/20 space-y-3">
                                <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest block">
                                    CAMPAIGN SLOGAN
                                </span>
                                <h4 className="text-xl font-black text-emerald-400 leading-snug">
                                    "{project.campaignData.slogan}"
                                </h4>
                                <p className="text-xs text-white/70 leading-relaxed">
                                    الشعار الإعلاني القصير والموجز المصمم ليظل عالقاً في الذاكرة ويثير الفضول الفوري.
                                </p>
                            </div>

                            <div className="glass-card rounded-3xl p-6 border border-amber-500/20 bg-amber-950/20 space-y-3">
                                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">
                                    UNIQUE VALUE PROPOSITION (USP)
                                </span>
                                <h4 className="text-lg font-bold text-white leading-snug">
                                    {project.campaignData.usp}
                                </h4>
                                <p className="text-xs text-white/70 leading-relaxed">
                                    نقطة التمايز الفريدة التي تجعل خيار العميل حتمياً لصالحك دون مقارنة بالمنافسين.
                                </p>
                            </div>

                            <div className="md:col-span-3 glass-card rounded-3xl p-6 border border-white/5 space-y-3">
                                <h4 className="text-sm font-black text-white flex items-center gap-2">
                                    <span>📋</span>
                                    <span>الملخص التنفيذي للحملة (Executive Strategy Summary)</span>
                                </h4>
                                <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line">
                                    {project.campaignData.executiveSummary}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Persona & Sales Psychology */}
                    {activeTab === 'persona' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                            <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--color-accent)] to-purple-600 flex items-center justify-center text-xl text-white">
                                        👤
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-white">
                                            {project.campaignData.persona.name}
                                        </h4>
                                        <p className="text-xs text-white/50">
                                            {project.campaignData.persona.demographics}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <span className="text-[10px] font-black text-[var(--color-accent-light)] uppercase tracking-wider block mb-1">
                                        المحفز النفسي البيعي الحاسم (Psychological Sales Trigger):
                                    </span>
                                    <p className="text-xs font-bold text-white leading-relaxed">
                                        ⚡ {project.campaignData.persona.psychologicalTrigger}
                                    </p>
                                </div>
                            </div>

                            <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
                                <div>
                                    <h5 className="text-xs font-black text-red-400 mb-2 flex items-center gap-1.5">
                                        <span>🚨</span>
                                        <span>نقاط الألم والمخاوف (Pain Points):</span>
                                    </h5>
                                    <ul className="space-y-1.5">
                                        {project.campaignData.persona.painPoints.map((p, i) => (
                                            <li key={i} className="text-xs text-white/70 flex items-start gap-2">
                                                <span className="text-red-400 mt-0.5">•</span>
                                                <span>{p}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-2 border-t border-white/10">
                                    <h5 className="text-xs font-black text-emerald-400 mb-2 flex items-center gap-1.5">
                                        <span>✨</span>
                                        <span>الرغبات والطموحات الكبرى (Aspirations & Desires):</span>
                                    </h5>
                                    <ul className="space-y-1.5">
                                        {project.campaignData.persona.desires.map((d, i) => (
                                            <li key={i} className="text-xs text-white/70 flex items-start gap-2">
                                                <span className="text-emerald-400 mt-0.5">•</span>
                                                <span>{d}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Visual Creatives & AI Generation */}
                    {activeTab === 'creatives' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                            {project.campaignData.creatives.map((c, i) => (
                                <div key={c.id || i} className="glass-card rounded-3xl p-6 border border-white/5 space-y-4 flex flex-col justify-between hover:border-[var(--color-accent)]/30 transition-all">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/70">
                                                فكرة 0{i + 1} • {c.platform} ({c.aspectRatio})
                                            </span>
                                            <span className="text-[10px] font-bold text-[var(--color-accent)]">
                                                CTA: {c.cta}
                                            </span>
                                        </div>

                                        <h4 className="text-base font-black text-white">
                                            {c.headline}
                                        </h4>

                                        <p className="text-xs text-white/70 leading-relaxed bg-black/30 p-3 rounded-2xl border border-white/5">
                                            {c.visualScenario}
                                        </p>

                                        <div>
                                            <span className="text-[10px] font-bold text-white/40 block mb-1">
                                                كابشن المنشور (Caption):
                                            </span>
                                            <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line bg-white/5 p-3 rounded-xl border border-white/5">
                                                {c.caption}
                                            </p>
                                        </div>

                                        {/* Generated Visual Result Display */}
                                        {c.generatedImage && (
                                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-emerald-500/30 shadow-xl group">
                                                <img 
                                                    src={`data:${c.generatedImage.mimeType};base64,${c.generatedImage.base64}`} 
                                                    alt={c.headline} 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                                                    ✓ تم التوليد بنجاح
                                                </div>
                                            </div>
                                        )}

                                        {c.imageError && (
                                            <p className="text-[11px] text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                                                {c.imageError}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action to Generate Ad Creative Image */}
                                    <button
                                        onClick={() => handleGenerateCreativeImage(c.id, c.imagePrompt, c.aspectRatio)}
                                        disabled={generatingCreativeId === c.id}
                                        className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white text-xs font-black py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {generatingCreativeId === c.id ? (
                                            <>
                                                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                                <span>جاري توليد التصميم الإعلاني...</span>
                                            </>
                                        ) : c.generatedImage ? (
                                            <>
                                                <span>🔄</span>
                                                <span>إعادة توليد التصميم</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>🎨</span>
                                                <span>توليد صورة الإعلان الآن بالذكاء الاصطناعي</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tab 4: Video Script & Voiceover */}
                    {activeTab === 'scripts' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                            {/* Short-form Video Script */}
                            <div className="glass-card rounded-3xl p-6 border border-purple-500/20 bg-purple-950/10 space-y-4">
                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                    <h4 className="text-sm font-black text-purple-300 flex items-center gap-2">
                                        <span>📱</span>
                                        <span>سكربت فيديو ريلز / تيك توك (15-30 ثانية)</span>
                                    </h4>
                                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-200 font-bold">
                                        Viral Video
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-3 bg-black/40 rounded-2xl border border-purple-500/30">
                                        <span className="text-[10px] font-black text-amber-300 block mb-1">
                                            الخطاف الافتتاحي (0 - 3 ثوانٍ):
                                        </span>
                                        <p className="text-xs font-bold text-white">
                                            "{project.campaignData.shortFormVideoScript.hook}"
                                        </p>
                                    </div>

                                    <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                                        <span className="text-[10px] font-black text-purple-300 block mb-1">
                                            صلب الفيديو والقيمة (3 - 20 ثانية):
                                        </span>
                                        <p className="text-xs text-white/90 leading-relaxed">
                                            {project.campaignData.shortFormVideoScript.body}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-black/40 rounded-2xl border border-emerald-500/30">
                                        <span className="text-[10px] font-black text-emerald-400 block mb-1">
                                            الدعوة للإجراء الحاسم (CTA):
                                        </span>
                                        <p className="text-xs font-bold text-white">
                                            {project.campaignData.shortFormVideoScript.cta}
                                        </p>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-white/5 text-[11px] text-white/60">
                                        <strong>توجيهات الإخراج:</strong> {project.campaignData.shortFormVideoScript.visualNotes}
                                    </div>

                                    {onSendToVideoFlow && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const videoPrompt = `${project.campaignData?.shortFormVideoScript.hook}. ${project.campaignData?.shortFormVideoScript.body}. ${project.campaignData?.shortFormVideoScript.visualNotes || ''}`;
                                                onSendToVideoFlow(videoPrompt, project.productImages?.[0] || null);
                                            }}
                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-98"
                                        >
                                            <span>🎬</span>
                                            <span>توليد الفيديو بنموذج Flow (Google Veo)</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Commercial Voiceover Script */}
                            <div className="glass-card rounded-3xl p-6 border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 space-y-4 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <h4 className="text-sm font-black text-[var(--color-accent-light)] flex items-center gap-2">
                                            <span>🎙️</span>
                                            <span>سكربت الفويس أوفر الإعلاني (Voiceover)</span>
                                        </h4>
                                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--color-accent)]/20 text-white font-bold">
                                            {project.campaignData.voiceoverScript.suggestedDuration}
                                        </span>
                                    </div>

                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                                        <div className="flex justify-between text-[10px] text-white/40 font-bold">
                                            <span>النبرة: {project.campaignData.voiceoverScript.tone}</span>
                                            <span>اللهجة: {project.dialect || 'سعودي إعلاني'}</span>
                                        </div>
                                        <p className="text-sm font-bold text-white leading-relaxed whitespace-pre-line">
                                            "{project.campaignData.voiceoverScript.text}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(project.campaignData?.voiceoverScript.text || '');
                                            setCopiedVoiceover(true);
                                            setTimeout(() => setCopiedVoiceover(false), 2500);
                                        }}
                                        className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/5"
                                    >
                                        {copiedVoiceover ? 'تم نسخ السكربت بنجاح! ✓' : 'نسخ السكربت 📋'}
                                    </button>

                                    {onSendToVoiceover && (
                                        <button
                                            onClick={() => onSendToVoiceover(project.campaignData?.voiceoverScript.text || '')}
                                            className="flex-1 py-3 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white text-xs font-black transition-all shadow-lg shadow-[var(--color-accent)]/20 flex items-center justify-center gap-1.5"
                                        >
                                            <span>🎙️</span>
                                            <span>إرسال لاستوديو الفويس أوفر</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 5: Budget & Launch Roadmap */}
                    {activeTab === 'budget' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                            {/* Budget Split */}
                            <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
                                <h4 className="text-sm font-black text-white flex items-center gap-2">
                                    <span>💰</span>
                                    <span>التوزيع الاستراتيجي للميزانية الإعلانية (Budget Split)</span>
                                </h4>

                                <div className="space-y-3">
                                    {project.campaignData.budgetAndChannels.budgetAllocation.map((b, i) => (
                                        <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-black text-white">{b.channel}</span>
                                                <span className="text-xs font-black text-[var(--color-accent)]">{b.percentage}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-[var(--color-accent)] rounded-full"
                                                    style={{ width: `${b.percentage}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[10px] text-white/50">{b.rationale}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Launch Roadmap & KPIs */}
                            <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
                                <h4 className="text-sm font-black text-white flex items-center gap-2">
                                    <span>🗓️</span>
                                    <span>مراحل الإطلاق الزمني (Launch Roadmap)</span>
                                </h4>

                                <div className="space-y-3">
                                    {project.campaignData.budgetAndChannels.launchRoadmap.map((r, i) => (
                                        <div key={i} className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-emerald-400">{r.phase}</span>
                                                <span className="text-white/40">{r.duration}</span>
                                            </div>
                                            <p className="text-xs text-white/80">{r.action}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-3 border-t border-white/10">
                                    <h5 className="text-[11px] font-black text-white/60 mb-2">مؤشرات الأداء المستهدفة (Target KPIs):</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {project.campaignData.budgetAndChannels.targetKpis.map((k, i) => (
                                            <span key={i} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 6: Full Strategic Report (SWOT & Markdown) */}
                    {activeTab === 'report' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* SWOT Matrix */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                                    <h5 className="text-xs font-black text-emerald-300">💪 نقاط القوة (Strengths)</h5>
                                    <ul className="text-xs text-white/80 space-y-1">
                                        {project.campaignData.swot.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                                    </ul>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                                    <h5 className="text-xs font-black text-amber-300">⚠️ نقاط الضعف (Weaknesses)</h5>
                                    <ul className="text-xs text-white/80 space-y-1">
                                        {project.campaignData.swot.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                                    </ul>
                                </div>
                                <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2">
                                    <h5 className="text-xs font-black text-blue-300">🌟 الفرص (Opportunities)</h5>
                                    <ul className="text-xs text-white/80 space-y-1">
                                        {project.campaignData.swot.opportunities.map((o, i) => <li key={i}>• {o}</li>)}
                                    </ul>
                                </div>
                                <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-2">
                                    <h5 className="text-xs font-black text-red-300">🛡️ التحديات (Threats)</h5>
                                    <ul className="text-xs text-white/80 space-y-1">
                                        {project.campaignData.swot.threats.map((t, i) => <li key={i}>• {t}</li>)}
                                    </ul>
                                </div>
                            </div>

                            {/* Markdown Render */}
                            {project.result && (
                                <div className="glass-card rounded-[2.5rem] p-8 shadow-inner border border-white/5">
                                    <div 
                                        className={`prose prose-invert max-w-none text-white/80 font-medium leading-relaxed suggestions-scrollbar overflow-y-auto max-h-[800px] ${project.language === 'ar' ? 'text-right' : 'text-left'}`} 
                                        style={{ direction: project.language === 'ar' ? 'rtl' : 'ltr' }}
                                    >
                                        {project.result.split('\n').map((line, i) => {
                                            if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-white mt-8 mb-4 border-b border-white/10 pb-3">{line.replace('# ', '')}</h1>;
                                            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-[var(--color-accent)] mt-8 mb-3">{line.replace('## ', '')}</h2>;
                                            if (line.startsWith('### ')) return <h3 key={i} className="text-base font-black text-white/90 mt-6 mb-2 flex items-center gap-2"><div className="w-1.5 h-3.5 bg-[var(--color-accent)] rounded-full"></div> {line.replace('### ', '')}</h3>;
                                            if (line.trim() === '') return <div key={i} className="h-3"></div>;
                                            return <p key={i} className="mb-3 text-white/70 text-xs leading-relaxed">{line}</p>;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
};

export default MarketingStudio;
