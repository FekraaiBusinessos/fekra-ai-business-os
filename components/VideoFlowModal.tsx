import React, { useState, useEffect, useRef } from 'react';
import { 
  ImageFile, 
  VideoFlowState, 
  AudioFile, 
  DirectorialPromptLayers,
  HyperUniversalSocialDNA,
  ComedicSalesVideoDirection,
  ImpossibleHandoffBlueprint
} from '../types';
import { 
  generateFlowVideo, 
  optimizeFlowVideoPrompt, 
  analyzeAndBuildDirectorialFlowPrompt, 
  hasUserGeminiKey,
  getDefaultLipSyncScript,
  getDefaultSellingGestures,
  getDefaultViralCta,
  getDefaultImpossibleHandoffBlueprint,
  synthesizeImpossibleHandoffBlueprint
} from '../services/geminiService';
import { 
  validateQuotaUsage, 
  getVideoQuotaStatus, 
  recordFlowVideoGenerated, 
  validateFlowVideoQuota, 
  VideoQuotaStatus 
} from '../services/quotaGuard';
import { saveStudioWork } from '../services/studioStorageService';
import { getGoogleUser } from '../services/googleAuthService';
import { resizeImage } from '../utils';

export interface VideoFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSourceImage?: ImageFile | null;
  initialPrompt?: string;
  initialCameraMotion?: VideoFlowState['cameraMotion'];
  initialAspectRatio?: '9:16' | '16:9' | '1:1';
  sourceStudioTitle?: string;
  initialHyperSocialDNA?: HyperUniversalSocialDNA | null;
  onOpenSocialEngine?: (videoUrl: string, prompt: string) => void;
  onOpenQuotaModal?: () => void;
}

const CAMERA_MOTIONS: Array<{
  id: VideoFlowState['cameraMotion'];
  labelAr: string;
  labelEn: string;
  icon: string;
  desc: string;
}> = [
  { id: 'zoom_in', labelAr: 'تقريب سينمائي (Zoom In)', labelEn: 'Slow Push-in', icon: '🔍', desc: 'يركز على تفاصيل المنتج وفخامته بنعومة' },
  { id: 'orbit_360', labelAr: 'دوران مداري (360° Orbit)', labelEn: 'Cinematic Orbit', icon: '🔄', desc: 'يدور بسلاسة حول المنتج لإظهار كافة الزوايا' },
  { id: 'dynamic_dolly', labelAr: 'دفع ديناميكي (Dynamic Dolly)', labelEn: 'Dolly Push', icon: '🚀', desc: 'حركة كاميرا ثلاثية الأبعاد تنبض بالحيوية' },
  { id: 'pan_right', labelAr: 'تحريك يمين (Pan Right)', labelEn: 'Pan Right', icon: '➡️', desc: 'حركة أفقية لكشف المحيط وتفاصيل الخلفية' },
  { id: 'pan_left', labelAr: 'تحريك يسار (Pan Left)', labelEn: 'Pan Left', icon: '⬅️', desc: 'حركة أفقية كلاسيكية متناسقة' },
  { id: 'crane_shot', labelAr: 'لقطة رافعة (Crane Shot)', labelEn: 'Jib/Crane Down', icon: '🏗️', desc: 'هبوط سلس من زاوية علوية مهيبة' },
  { id: 'zoom_out', labelAr: 'كشف تدريجي (Zoom Out)', labelEn: 'Slow Pull-out', icon: '🔎', desc: 'يبدأ من تفاصيل المنتج ليكشف البيئة الإعلانية' },
  { id: 'static_lock', labelAr: 'ثبات إعلاني (Commercial Lock)', labelEn: 'Static Breathing', icon: '🔒', desc: 'ثبات فخم مع نبض الضوء وحركة ناعمة جداً' },
  { id: 'impossible_handoff', labelAr: 'الانتقال المستحيل (The Impossible Handoff)', labelEn: 'Object Motion Occlusion Transition', icon: '🌀', desc: 'حركة عنصر مستمرة وحجب العدسة للانتقال لعالم جديد دون أي قطع أو مونتاج رخيص' },
];

const HOOK_PRESETS: Array<{
  id: DirectorialPromptLayers['hookType'];
  labelAr: string;
  icon: string;
  descAr: string;
}> = [
  { id: 'sensory_shock', labelAr: 'صدمة بصرية ورذاذ', icon: '💥', descAr: 'ماكرو مكثف مع رذاذ وشظايا ضوء تكسر التمرير فوراً' },
  { id: 'mystery_reveal', labelAr: 'غموض وكشف سينمائي', icon: '🔮', descAr: 'ظلال متدرجة وتلاشي ضبابي يكشف تفاصيل المنتج تدريجياً' },
  { id: 'luxury_prestige', labelAr: 'فخامة وانعكاسات', icon: '💎', descAr: 'انعكاسات زجاجية وضوء سوفت بوكس يخاطب النخبة' },
  { id: 'speed_energy', labelAr: 'تسارع حركي (Speed Ramp)', icon: '⚡', descAr: 'حركة سريعة مباغتة ثم تباطؤ ناعم يبرز الاسم والشعار' },
  { id: 'problem_solution', labelAr: 'إثبات جودة فوري', icon: '🎯', descAr: 'تسليط الضوء المباشر على ميزة المنتج الأساسية بدون مقدمات' },
];

export const DIALECT_OPTIONS: Array<{
  id: 'سعودي معاصر' | 'مصري حماسي' | 'خليجي فخم' | 'شامي مرح' | 'عالمي فصحى';
  label: string;
  flag: string;
  desc: string;
}> = [
  { id: 'سعودي معاصر', label: 'سعودي معاصر', flag: '🇸🇦', desc: 'إيقاع شبابي ذكي مقنع: "تدري وش الفرق... لا يفوتك العرض قبل يطير"' },
  { id: 'مصري حماسي', label: 'مصري حماسي', flag: '🇪🇬', desc: 'طاقة سريعة حماسية: "بص بقى وركز معايا كويس أوي... الحق العرض"' },
  { id: 'خليجي فخم', label: 'خليجي فخم', flag: '🇦🇪', desc: 'نبرة رقي وهيبة: "شوف الزين يا غالي واحكم بنفسك... فخامة تليق فيك"' },
  { id: 'شامي مرح', label: 'شامي مرح', flag: '🇱🇧', desc: 'عفوية محبوبة وجذابة: "لك شوف الدلال والرتابة كيف عم تحكي... جودة بتعقد"' },
  { id: 'عالمي فصحى', label: 'عالمي فصحى', flag: '🌐', desc: 'بلاغة وفخامة مؤسسية: "فرصة استثنائية لا تتكرر... تميز مطلق"' },
];

export const SELLING_GESTURES_CATALOG: Array<{
  id: string;
  label: string;
  icon: string;
  desc: string;
}> = [
  { id: 'jaw_drop', label: 'سقوط الفك المذهول (Jaw Drop)', icon: '😲', desc: 'صدمة إيجابية مضحكة تؤكد استحالة منافسة السعر' },
  { id: 'point_price', label: 'إشارة حاسمة نحو العرض (Price Point)', icon: '👉', desc: 'إشارة بالسبابة مع اتساع العينين نحو السعر أو الميزة' },
  { id: 'wink_nod', label: 'غمزة ثقة كاريزمية (Wink & Nod)', icon: '😉', desc: 'إيماءة رأس مع غمزة تزرع الطمأنينة للشراء فوراً' },
  { id: 'hero_hold', label: 'رفع المنتج ككأس نصر (Hero Pose)', icon: '🏆', desc: 'مسك المنتج بكلتا اليدين ورفعه للأعلى بزاوية سينمائية' },
  { id: 'victory_dance', label: 'رقصة فوز مرحة وسريعة (Victory Dance)', icon: '🎉', desc: 'حركة احتفال خفيفة مرحة تعزز الرغبة في خوض التجربة' },
  { id: 'screen_pull', label: 'سحب المشاهد نحو الشاشة (Screen Pull)', icon: '🧲', desc: 'حركة يد عريضة كأنه يسحب المشاهد ليريه التفاصيل عن قرب' },
];

export const VideoFlowModal: React.FC<VideoFlowModalProps> = ({
  isOpen,
  onClose,
  initialSourceImage = null,
  initialPrompt = '',
  initialCameraMotion = 'orbit_360',
  initialAspectRatio = '9:16',
  sourceStudioTitle = 'Fekra Studio',
  initialHyperSocialDNA = null,
  onOpenSocialEngine,
  onOpenQuotaModal,
}) => {
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(initialSourceImage);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [cameraMotion, setCameraMotion] = useState<VideoFlowState['cameraMotion']>(initialCameraMotion);
  const [motionDynamics, setMotionDynamics] = useState<VideoFlowState['motionDynamics']>('smooth_commercial');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>(initialAspectRatio);
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [durationSeconds, setDurationSeconds] = useState<number>(5);
  const [modelChoice, setModelChoice] = useState<'veo-3.1-generate-preview' | 'veo-3.1-lite-generate-preview' | 'flow-kinetic'>('veo-3.1-lite-generate-preview');

  // Directorial Layers & Hook Up State
  const [directorialLayers, setDirectorialLayers] = useState<DirectorialPromptLayers | null>(null);
  const [selectedHookType, setSelectedHookType] = useState<DirectorialPromptLayers['hookType']>('sensory_shock');
  const [activePromptTab, setActivePromptTab] = useState<'layers' | 'comedy' | 'handoff' | 'full'>('layers');
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Impossible Handoff Cinema Blueprint (الهوك السينمائي الفائق والانتقال المستحيل)
  const [handoffBlueprint, setHandoffBlueprint] = useState<ImpossibleHandoffBlueprint>(() => getDefaultImpossibleHandoffBlueprint());
  const [isSynthesizingHandoff, setIsSynthesizingHandoff] = useState(false);
  const [activeHandoffView, setActiveHandoffView] = useState<'timeline' | 'locks' | 'json'>('timeline');

  // Comedic Sales Direction State (Dialect, Lip-Sync, Selling Gestures, CTA)
  const [hyperSocialDNA, setHyperSocialDNA] = useState<HyperUniversalSocialDNA | null>(initialHyperSocialDNA);
  const [selectedDialect, setSelectedDialect] = useState<'سعودي معاصر' | 'مصري حماسي' | 'خليجي فخم' | 'شامي مرح' | 'عالمي فصحى'>(
    initialHyperSocialDNA?.comedicSalesVideo?.dialect || 'سعودي معاصر'
  );
  const [lipSyncScript, setLipSyncScript] = useState<string>(
    initialHyperSocialDNA?.comedicSalesVideo?.lipSyncScriptAr || getDefaultLipSyncScript('سعودي معاصر')
  );
  const [selectedGestures, setSelectedGestures] = useState<string[]>(
    initialHyperSocialDNA?.comedicSalesVideo?.sellingGesturesAr || getDefaultSellingGestures('سعودي معاصر')
  );
  const [comedyVibe, setComedyVibe] = useState<string>(
    initialHyperSocialDNA?.comedicSalesVideo?.comedyVibe || 'كوميديا بيعية ذكية وسريعة الإيقاع مع تعبيرات وجه مرحة وإيماءات مقنعة جداً'
  );
  const [viralCta, setViralCta] = useState<string>(
    initialHyperSocialDNA?.comedicSalesVideo?.viralCallToActionAr || getDefaultViralCta('سعودي معاصر')
  );

  // Mobile Fluid Tabs: 'scene' (المشهد والـ Hook) | 'handoff' (الانتقال المستحيل) | 'comedy' (الكوميديا والليبسينج) | 'camera' (الكاميرا) | 'preview' (المعاينة)
  const [mobileTab, setMobileTab] = useState<'scene' | 'handoff' | 'comedy' | 'camera' | 'preview'>('scene');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStage, setProgressStage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [videoQuota, setVideoQuota] = useState<VideoQuotaStatus>(() => getVideoQuotaStatus());

  // Playback state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const refreshQuota = () => {
    setVideoQuota(getVideoQuotaStatus());
  };

  useEffect(() => {
    if (isOpen) {
      if (initialSourceImage) setSourceImage(initialSourceImage);
      if (initialPrompt) setPrompt(initialPrompt);
      if (initialCameraMotion) setCameraMotion(initialCameraMotion);
      if (initialAspectRatio) setAspectRatio(initialAspectRatio);
      if (initialHyperSocialDNA) {
        setHyperSocialDNA(initialHyperSocialDNA);
        if (initialHyperSocialDNA.comedicSalesVideo) {
          setSelectedDialect(initialHyperSocialDNA.comedicSalesVideo.dialect);
          setLipSyncScript(initialHyperSocialDNA.comedicSalesVideo.lipSyncScriptAr);
          setSelectedGestures(initialHyperSocialDNA.comedicSalesVideo.sellingGesturesAr);
          setComedyVibe(initialHyperSocialDNA.comedicSalesVideo.comedyVibe);
          setViralCta(initialHyperSocialDNA.comedicSalesVideo.viralCallToActionAr);
        }
      }
      refreshQuota();
      setError(null);
      setCopyFeedback(null);
    }
  }, [isOpen, initialSourceImage, initialPrompt, initialCameraMotion, initialAspectRatio, initialHyperSocialDNA]);

  useEffect(() => {
    const handleKeyChange = () => refreshQuota();
    window.addEventListener('fekra_api_key_updated', handleKeyChange);
    window.addEventListener('fekra_quota_stats_updated', handleKeyChange);
    return () => {
      window.removeEventListener('fekra_api_key_updated', handleKeyChange);
      window.removeEventListener('fekra_quota_stats_updated', handleKeyChange);
    };
  }, []);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file, 1280, 1280, 0.9);
      const reader = new FileReader();
      reader.onloadend = () => {
        const loadedImg: ImageFile = {
          base64: (reader.result as string).split(',')[1],
          mimeType: resized.type,
          name: resized.name,
        };
        setSourceImage(loadedImg);
        // Auto-analyze and build directorial scene when user uploads product
        triggerAutoDirectorialAnalysis(loadedImg);
      };
      reader.readAsDataURL(resized);
    } catch (err) {
      setError('فشل رفع الصورة لمصدر نموذج فلو');
    }
  };

  const triggerAutoDirectorialAnalysis = async (img: ImageFile) => {
    setIsOptimizingPrompt(true);
    setError(null);
    try {
      const result = await analyzeAndBuildDirectorialFlowPrompt({
        concept: prompt || 'Commercial product showcase',
        sourceImage: img,
        cameraMotion,
        motionDynamics,
        aspectRatio,
        hookType: selectedHookType,
        dialect: selectedDialect
      });
      setDirectorialLayers(result);
      setPrompt(result.fullPromptEn);
      if (result.lipSyncScriptAr) setLipSyncScript(result.lipSyncScriptAr);
      if (result.sellingGesturesAr && result.sellingGesturesAr.length > 0) setSelectedGestures(result.sellingGesturesAr);
      if (result.comedyVibe) setComedyVibe(result.comedyVibe);
      if (result.viralCallToActionAr) setViralCta(result.viralCallToActionAr);
    } catch (e) {
      // fallback handled gracefully inside function
    } finally {
      setIsOptimizingPrompt(false);
    }
  };

  const handleAnalyzeAndBuildScene = async (hookOverride?: DirectorialPromptLayers['hookType']) => {
    if (isOptimizingPrompt) return;
    setIsOptimizingPrompt(true);
    setError(null);
    const hook = hookOverride || selectedHookType;
    setSelectedHookType(hook);

    try {
      const result = await analyzeAndBuildDirectorialFlowPrompt({
        concept: prompt || (sourceImage ? 'Commercial product visual showcase' : 'Luxury high-end product presentation'),
        sourceImage,
        cameraMotion,
        motionDynamics,
        aspectRatio,
        hookType: hook,
        dialect: selectedDialect
      });
      setDirectorialLayers(result);
      setPrompt(result.fullPromptEn);
      if (result.lipSyncScriptAr) setLipSyncScript(result.lipSyncScriptAr);
      if (result.sellingGesturesAr && result.sellingGesturesAr.length > 0) setSelectedGestures(result.sellingGesturesAr);
      if (result.comedyVibe) setComedyVibe(result.comedyVibe);
      if (result.viralCallToActionAr) setViralCta(result.viralCallToActionAr);
      setActivePromptTab('layers');
    } catch (err: any) {
      setError('تعذر استكمال التحليل الإخراجي، يرجى المحاولة ثانية.');
    } finally {
      setIsOptimizingPrompt(false);
    }
  };

  const handleSelectDialect = (d: typeof selectedDialect) => {
    setSelectedDialect(d);
    setLipSyncScript(getDefaultLipSyncScript(d));
    setSelectedGestures(getDefaultSellingGestures(d));
    setViralCta(getDefaultViralCta(d));
  };

  const handleToggleGesture = (gestureText: string) => {
    setSelectedGestures(prev => {
      if (prev.includes(gestureText)) {
        return prev.filter(g => g !== gestureText);
      }
      return [...prev, gestureText];
    });
  };

  const handleWeaveComedyIntoPrompt = () => {
    const gesturesText = selectedGestures.join(' and ');
    const comedyAddition = `Comedic Character Acting: Energetic comedy style with expressive facial expressions, synced lip movements (${selectedDialect} dialect: "${lipSyncScript.slice(0, 45)}..."), high-converting sales body language (${gesturesText}). Closing with urgent viral call-to-action pose.`;
    
    let updatedPrompt = prompt;
    if (updatedPrompt.includes('Comedic Character Acting:')) {
      updatedPrompt = updatedPrompt.replace(/Comedic Character Acting:[\s\S]*?(?=\n\n|$)/, comedyAddition);
    } else {
      updatedPrompt = `${updatedPrompt.trim()}\n\n${comedyAddition}`;
    }
    
    setPrompt(updatedPrompt);
    if (directorialLayers) {
      setDirectorialLayers({ ...directorialLayers, fullPromptEn: updatedPrompt });
    }
    setCopyFeedback('تم دمج الإخراج الكوميدي والليبسينج في البرومبت بنجاح! ✓');
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handleCopyLipSyncScript = async () => {
    const fullText = `🎭 سكربت الإخراج الكوميدي والليبسينج (اللهجة: ${selectedDialect})
🗣️ نص المزامنة الصوتية والشفاهية (0-5s):
"${lipSyncScript}"

🎯 حركات تبيع (Selling Gestures):
${selectedGestures.map((g, i) => `${i + 1}. ${g}`).join('\n')}

⚡ نداء الشراء الفيروسي (Viral CTA):
"${viralCta}"

✨ طاقة وطابع الكوميديا:
${comedyVibe}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopyFeedback('تم نسخ سكربت الليبسينج وحركات البيع! ✓');
      setTimeout(() => setCopyFeedback(null), 2500);
    } catch {
      setCopyFeedback('تم النسخ');
      setTimeout(() => setCopyFeedback(null), 1500);
    }
  };

  const handleExportProductionPackage = () => {
    const pkg = `═══════════════════════════════════════════════════════════════════
FEKRA AI BUSINESS OS — DIRECTORIAL VIDEO PRODUCTION PACKAGE
═══════════════════════════════════════════════════════════════════
الاستوديو: ${sourceStudioTitle}
اللهجة المختارة: ${selectedDialect}
نسبة الأبعاد: ${aspectRatio} | حركة الكاميرا: ${cameraMotion} (${motionDynamics})

[1] سيناريو المشهد العبقري:
${directorialLayers?.geniusSceneStoryAr || 'مشهد إعلاني سينمائي متكامل'}

[2] الخطاف البصري (First 3s Hook):
${directorialLayers?.hookUpAr || 'خطاف حسي يمنع التمرير'}

[3] سكربت المزامنة الشفاهية (Lip-Sync Script):
"${lipSyncScript}"

[4] حركات تبيع (Selling Gestures):
${selectedGestures.map(g => `• ${g}`).join('\n')}

[5] نداء الشراء (Call To Action):
"${viralCta}"

[6] هندسة الكاميرا والإضاءة:
• الكاميرا: ${directorialLayers?.cameraLayerAr || cameraMotion}
• الإضاءة: ${directorialLayers?.lightingLayerAr || 'إضاءة استوديو ناعمة'}

[7] Master Prompt (Google Veo / Flow):
${prompt}
═══════════════════════════════════════════════════════════════════`;

    const blob = new Blob([pkg], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fekra-directorial-video-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setCopyFeedback('تم تحميل حزمة الإنتاج الإعلاني (.TXT)! ✓');
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handleLayerTextChange = (field: keyof DirectorialPromptLayers, text: string) => {
    if (!directorialLayers) {
      setPrompt(text);
      return;
    }
    const updated = { ...directorialLayers, [field]: text };
    setDirectorialLayers(updated);

    if (field === 'fullPromptEn') {
      setPrompt(text);
    } else {
      const rebuilt = `${updated.hookUpEn} ${updated.cameraLayerEn} ${updated.lightingLayerEn} ${updated.productMotionLayerEn} ${updated.climaxLayerEn}`;
      updated.fullPromptEn = rebuilt;
      setPrompt(rebuilt);
    }
  };

  const handleCopyHandoffJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(handoffBlueprint, null, 2));
      setCopyFeedback('تم نسخ المخطط السينمائي بصيغة JSON كاملة! ✓');
      setTimeout(() => setCopyFeedback(null), 2500);
    } catch {
      setCopyFeedback('تم النسخ');
      setTimeout(() => setCopyFeedback(null), 1500);
    }
  };

  const handleSynthesizeHandoffBlueprint = async () => {
    setIsSynthesizingHandoff(true);
    setError(null);
    try {
      const blueprint = await synthesizeImpossibleHandoffBlueprint({
        brandName: sourceStudioTitle || 'Fekra AI',
        productConcept: prompt || 'High-Tech Commercial Production',
        sourceImage,
        heroDialect: selectedDialect
      });
      setHandoffBlueprint(blueprint);
      setCameraMotion('impossible_handoff');
      setDurationSeconds(10);
      setAspectRatio('9:16');
      setResolution('1080p');
      setCopyFeedback('تم توليد مخطط "الانتقال المستحيل" الذكي وربطه بالكاميرا! 🌀');
      setTimeout(() => setCopyFeedback(null), 3000);
    } catch (e: any) {
      setError('حدث خطأ أثناء صياغة المخطط، تم تفعيل المخطط القياسي.');
    } finally {
      setIsSynthesizingHandoff(false);
    }
  };

  const handleApplyHandoffToPrompt = () => {
    const handoffPrompt = `[THE IMPOSSIBLE HANDOFF — CINEMATIC COMMERCIAL CONTINUITY]
Series ${handoffBlueprint.series}, Scene ${handoffBlueprint.scene}: "${handoffBlueprint.title}". Duration: ${handoffBlueprint.duration}. Format: ${handoffBlueprint.format}.
Core Hook Formula: ${handoffBlueprint.coreHookMechanic.formula}.
Brand Lock: ${handoffBlueprint.brandLock.brand}. Logo: ${handoffBlueprint.brandLock.logoInstruction}. Physical object integrated into scene, exact geometry and colors, no redesign, no morphing.
Character Lock: ${handoffBlueprint.characterLock.identity}, wardrobe: ${handoffBlueprint.characterLock.wardrobe}, identical facial structure, no morphing.
Timeline Progression:
- 0.0-1.5s: Hero removes small physical ${handoffBlueprint.brandLock.brand} emblem from architectural frame. Quick controlled push.
- 1.5-3.0s: Hero throws emblem directly past camera lens. Whip-pan follows object in physical motion.
- 3.0-4.5s: Flying emblem occludes camera lens completely. Camera physically passes through industrial passage into new world without cut or digital morph.
- 4.5-6.0s: Emblem moves away revealing futuristic command room. Same hero catches emblem smoothly.
- 6.0-7.6s: Hero places emblem into matching socket on central console. Control room activates from socket outward.
- 7.6-8.8s: Mechanical panels and synchronized holographic displays illuminate around hero. Rapid backward dolly.
- 8.8-10.0s: Hero turns toward camera holding emblem at chest level. Giant physical ${handoffBlueprint.brandLock.brand} logo glowing on main control wall behind him.
Visual: Ultra-realistic commercial cinema, 24fps, 4K depth, no cuts, no teleport, realistic physics, perfect continuity.`;

    setPrompt(handoffPrompt);
    setCameraMotion('impossible_handoff');
    setDurationSeconds(10);
    setAspectRatio('9:16');
    setResolution('1080p');
    setCopyFeedback('تم دمج مخطط "الانتقال المستحيل" في محرك التوليد وضبط الكاميرا والمدة! 🌀✓');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyFeedback('تم نسخ البرومبت الإخراجي بالكامل! ✓');
      setTimeout(() => setCopyFeedback(null), 2500);
    } catch (e) {
      setCopyFeedback('تم النسخ');
      setTimeout(() => setCopyFeedback(null), 1500);
    }
  };

  const handleCopySceneScript = async () => {
    if (!directorialLayers) return;
    const scriptText = `🎬 سيناريو المشهد الإخراجي العبقري (Fekra AI Flow):
${directorialLayers.geniusSceneStoryAr}

⚡ الخطاف البصري في أول 3 ثوانٍ (Hook Up):
${directorialLayers.hookUpAr}

🎵 المؤثرات الصوتية المقترحة:
${directorialLayers.soundEffectsAr || 'موسيقى سينمائية هادئة مع ووش هوائي'}

🎥 حركة الكاميرا: ${directorialLayers.cameraLayerAr}`;
    try {
      await navigator.clipboard.writeText(scriptText);
      setCopyFeedback('تم نسخ سيناريو المشهد والـ Hook بنجاح! ✓');
      setTimeout(() => setCopyFeedback(null), 2500);
    } catch (e) {
      setCopyFeedback('تم النسخ');
      setTimeout(() => setCopyFeedback(null), 1500);
    }
  };

  const handleGenerate = async () => {
    if (isGenerating) return;

    validateQuotaUsage();
    recordFlowVideoGenerated();

    const effectivePrompt = prompt.trim() || 'Cinematic commercial product video with luxury studio illumination and high-impact hook';

    setIsGenerating(true);
    setProgressStage('جاري تجهيز وبدء توليد لقطة Flow السينمائية...');
    setError(null);
    setGeneratedVideoUrl(null);
    setMobileTab('preview'); // Automatically show preview on mobile

    try {
      const result = await generateFlowVideo({
        prompt: effectivePrompt,
        sourceImage,
        cameraMotion,
        motionDynamics,
        aspectRatio,
        resolution,
        durationSeconds,
        modelChoice,
        onProgress: (stage) => setProgressStage(stage),
      });

      setGeneratedVideoUrl(result.videoUrl);
      refreshQuota();
    } catch (err: any) {
      setError(err?.message || 'فشل توليد الفيديو، يرجى إعادة المحاولة.');
    } finally {
      setIsGenerating(false);
      setProgressStage(null);
    }
  };

  const handleDownload = () => {
    if (!generatedVideoUrl) return;
    const a = document.createElement('a');
    a.href = generatedVideoUrl;
    a.download = `Fekra-Flow-Scene-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setCopyFeedback('بدأ تحميل الفيديو بجودة عالية! ⬇️');
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handleSaveToPortfolio = () => {
    if (!generatedVideoUrl) return;
    saveStudioWork({
      title: `فيديو إعلاني عبقري: ${cameraMotion}`,
      prompt: prompt || 'Commercial Flow Video',
      studioType: 'video_flow',
      videoUrl: generatedVideoUrl,
      image: sourceImage || undefined,
      aspectRatio,
      metadata: { 
        cameraMotion, 
        atmosphere: motionDynamics,
        sceneAnalysis: directorialLayers ? {
          heroSubject: 'المنتج الإعلاني',
          referenceAnalysis: directorialLayers.geniusSceneStoryAr,
          estimatedAtmosphere: directorialLayers.lightingLayerAr,
          arabicSummary: directorialLayers.hookUpAr,
          optimizedPromptEn: directorialLayers.fullPromptEn,
          layers: []
        } : undefined
      }
    });
    setSavedSuccess(true);
    setCopyFeedback('تم الحفظ في استوديو أعمالي! 💾');
    setTimeout(() => {
      setSavedSuccess(false);
      setCopyFeedback(null);
    }, 2500);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto" dir="rtl">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[94vh] sm:max-w-6xl bg-[#080d16] border-0 sm:border border-cyan-500/25 rounded-none sm:rounded-[2rem] shadow-2xl p-3 sm:p-6 text-white overflow-hidden flex flex-col">
        
        {/* Ambient neon backdrop glows */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-cyan-500/15 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-br from-purple-600/15 via-pink-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-lg sm:text-xl font-bold flex-shrink-0">
              🎬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black bg-gradient-to-r from-cyan-300 via-white to-blue-200 bg-clip-text text-transparent">
                  مخرج المشاهد الإعلانية ونموذج Flow
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Google Veo Engine 3.1
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/50 line-clamp-1">
                صياغة مشاهد عبقرية بطبقات إخراجية متكاملة، خطاف بصري أول 3 ثوانٍ (Hook Up)، وتصدير فوري
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <div className="hidden sm:flex px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>كوتة Flow نشطة وجاهزة ✓</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-all text-base font-bold"
              title="إغلاق"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Toast / Notification Banner */}
        {copyFeedback && (
          <div className="mb-2 p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs text-center font-bold animate-fadeIn">
            {copyFeedback}
          </div>
        )}

        {/* Mobile Fluid Navigation Bar (Only on mobile) */}
        <div className="flex sm:hidden items-center justify-around bg-black/60 border border-white/10 p-1 mb-3 rounded-2xl flex-shrink-0 gap-1">
          <button
            type="button"
            onClick={() => setMobileTab('scene')}
            className={`flex-1 py-1.5 px-1 text-[11px] font-black rounded-xl transition-all truncate text-center ${
              mobileTab === 'scene' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30' : 'text-white/60 hover:text-white'
            }`}
          >
            🎬 المشهد والـ Hook
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileTab('handoff');
              setActivePromptTab('handoff');
            }}
            className={`flex-1 py-1.5 px-1 text-[11px] font-black rounded-xl transition-all truncate text-center ${
              mobileTab === 'handoff' ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30' : 'text-white/60 hover:text-white'
            }`}
          >
            🌀 الانتقال المستحيل
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('comedy')}
            className={`flex-1 py-1.5 px-1 text-[11px] font-black rounded-xl transition-all truncate text-center ${
              mobileTab === 'comedy' ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30' : 'text-white/60 hover:text-white'
            }`}
          >
            🎭 الكوميديا
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('camera')}
            className={`flex-1 py-1.5 px-1 text-[11px] font-black rounded-xl transition-all truncate text-center ${
              mobileTab === 'camera' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30' : 'text-white/60 hover:text-white'
            }`}
          >
            ⚙️ الكاميرا
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-1.5 px-1 text-[11px] font-black rounded-xl transition-all relative truncate text-center ${
              mobileTab === 'preview' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30' : 'text-white/60 hover:text-white'
            }`}
          >
            🎥 المعاينة
            {generatedVideoUrl && <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 overflow-y-auto flex-1 pb-24 sm:pb-2 pr-1 custom-scroll">
          
          {/* Left Column: Live Video Canvas & Export Suite (5 Cols Desktop / Shown in preview tab on Mobile) */}
          <div className={`lg:col-span-5 flex flex-col gap-3 sm:gap-4 ${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* Video Player Display Container */}
            <div className="glass-card rounded-2xl p-3 sm:p-4 border border-cyan-500/20 bg-black/50 flex flex-col items-center justify-center relative overflow-hidden min-h-[320px] sm:min-h-[380px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-4 border-blue-500/20 border-b-blue-400 animate-spin" style={{ animationDirection: 'reverse' }} />
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                      🎬
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-cyan-300 animate-pulse">
                      محرك Flow يقوم بإخراج المشهد وتطبيق الـ Hook...
                    </h3>
                    <p className="text-xs text-white/60 max-w-xs leading-relaxed">
                      {progressStage || 'جاري محاكاة مسار الكاميرا وتوليد الإطارات الحركية...'}
                    </p>
                  </div>
                  <div className="text-[10px] text-white/40 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    ⚡ جودة سينمائية فائقة • بدون عوائق
                  </div>
                </div>
              ) : generatedVideoUrl ? (
                <div className="w-full flex flex-col items-center">
                  <div className={`relative w-full rounded-2xl overflow-hidden border border-cyan-500/30 bg-black shadow-2xl ${
                    aspectRatio === '9:16' ? 'max-w-[270px] aspect-[9/16]' : (aspectRatio === '1:1' ? 'max-w-[320px] aspect-square' : 'aspect-video')
                  }`}>
                    <video
                      ref={videoRef}
                      src={generatedVideoUrl}
                      loop
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[10px] font-black text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <span>⚡</span>
                      <span>FLOW 4K KINETIC</span>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-bold text-white/70">
                      {durationSeconds}s • {resolution}
                    </div>
                  </div>

                  {/* Playback Controls Bar */}
                  <div className="w-full flex items-center justify-between gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold transition-all flex items-center gap-1"
                    >
                      {isPlaying ? '⏸️ إيقاف' : '▶️ تشغيل'}
                    </button>
                    
                    <div className="flex items-center gap-1 bg-black/50 rounded-xl p-1 border border-white/10 text-[10px]">
                      {[0.5, 1, 1.5, 2].map(speed => (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => changeSpeed(speed)}
                          className={`px-2 py-0.5 rounded-lg transition-all ${playbackSpeed === speed ? 'bg-cyan-500 text-black font-black' : 'text-white/60 hover:text-white'}`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1 text-[11px] shadow-md shadow-emerald-900/30"
                    >
                      <span>⬇️ تحميل</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-3">
                  {sourceImage ? (
                    <div className="relative group rounded-2xl overflow-hidden border border-white/10 max-h-52 shadow-lg">
                      <img
                        src={`data:${sourceImage.mimeType};base64,${sourceImage.base64}`}
                        alt="Source"
                        className="max-h-52 object-contain"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs text-cyan-300 font-bold">صورة مصدر المشهد</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/10">
                      🎥
                    </div>
                  )}
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white/90">
                      {sourceImage ? 'تم تحليل هوية المنتج' : 'شاشة معاينة المشهد الإعلاني'}
                    </h4>
                    <p className="text-[11px] text-white/50 max-w-xs leading-relaxed">
                      {sourceImage 
                        ? 'اضغط على زر (تحليل المنتج وصياغة المشهد العبقري) لتوليد البرومبت الإخراجي والـ Hook Up فوراً.'
                        : 'يمكنك رفع صورة المنتج لتحليله بدقة أو كتابة فكرة المشهد لتوليد البرومبت المتكامل.'}
                    </p>
                  </div>
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-1.5 active:scale-95">
                    <span>📁</span>
                    <span>{sourceImage ? 'تغيير صورة المنتج' : 'رفع صورة المنتج للتحليل الإخراجي'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            {/* Export & Actions Suite */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-white/80">
                <span className="flex items-center gap-1.5">
                  <span>🚀</span>
                  <span>حزمة التصدير والمشاركة السريعة:</span>
                </span>
                <span className="text-[10px] text-cyan-300">جاهز للنشر</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="py-2.5 px-3 rounded-xl bg-black/40 hover:bg-white/10 text-white font-bold border border-white/10 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>📋</span>
                  <span>نسخ البرومبت</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLipSyncScript}
                  className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>👄</span>
                  <span>نسخ سكربت الليبسينج</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleCopySceneScript}
                  disabled={!directorialLayers}
                  className="py-2.5 px-3 rounded-xl bg-black/40 hover:bg-white/10 text-white font-bold border border-white/10 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40"
                >
                  <span>📜</span>
                  <span>سيناريو الـ Hook</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportProductionPackage}
                  className="py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>💾</span>
                  <span>تصدير حزمة (.TXT)</span>
                </button>
              </div>

              {generatedVideoUrl && (
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 active:scale-95"
                  >
                    <span>⬇️</span>
                    <span>تحميل الفيديو (4K)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToPortfolio}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/10 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>💾</span>
                    <span>{savedSuccess ? 'تم الحفظ! ✓' : 'حفظ في أعمالي'}</span>
                  </button>
                </div>
              )}

              {generatedVideoUrl && onOpenSocialEngine && (
                <button
                  type="button"
                  onClick={() => onOpenSocialEngine(generatedVideoUrl, prompt)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-950/40 active:scale-98"
                >
                  <span>📱</span>
                  <span>نشر مباشر لمنصات التواصل (TikTok • Reels • Meta)</span>
                </button>
              )}
            </div>

          </div>

          {/* Right Column: Directorial Prompt Architect & Settings (7 Cols Desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* 1. Directorial AI Hook & Scene Architect Banner (Shown in 'scene' tab or desktop) */}
            <div className={`flex-col gap-3 p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-blue-950/30 to-purple-950/30 border border-cyan-500/30 ${
              mobileTab === 'scene' ? 'flex' : 'hidden lg:flex'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧠</span>
                    <h3 className="text-xs sm:text-sm font-black text-cyan-300">
                      صياغة المشهد العبقري وتحليل الـ Hook Up (أول 3 ثوانٍ)
                    </h3>
                  </div>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    يحلل هوية وخامة المنتج ويبني خطاف جذب نفسي بصري يمنع التمرير (Stop The Scroll)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAnalyzeAndBuildScene()}
                  disabled={isOptimizingPrompt}
                  className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs transition-all shadow-md shadow-cyan-500/25 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <span>{isOptimizingPrompt ? '⏳ جاري التحليل...' : '⚡ صياغة المشهد والـ Hook'}</span>
                </button>
              </div>

              {/* Hook Type Selector Pills */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold text-white/70 block">
                  اختر نمط الخطاف البصري (Hook Style):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {HOOK_PRESETS.map((hook) => (
                    <button
                      key={hook.id}
                      type="button"
                      onClick={() => handleAnalyzeAndBuildScene(hook.id)}
                      className={`p-2 rounded-xl text-right transition-all border flex items-center gap-2 ${
                        selectedHookType === hook.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-sm'
                          : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{hook.icon}</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold leading-tight truncate">{hook.labelAr}</div>
                        <div className="text-[9px] text-white/40 truncate">{hook.descAr.slice(0, 24)}...</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Directorial Layers Editor vs Full Prompt vs Comedic Sales (Shown in 'scene' or 'comedy' tab or desktop) */}
            <div className={`space-y-3 ${mobileTab === 'scene' || mobileTab === 'comedy' ? 'block' : 'hidden lg:block'}`}>
              
              {/* Tab Header: 5 Layers vs Comedic Sales vs Master Prompt */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePromptTab('layers');
                      setMobileTab('scene');
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                      activePromptTab === 'layers' && mobileTab !== 'comedy'
                        ? 'bg-cyan-500 text-black shadow-sm' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span>🎬</span>
                    <span>الطبقات الإخراجية الخمس</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePromptTab('comedy');
                      setMobileTab('comedy');
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                      activePromptTab === 'comedy' || mobileTab === 'comedy'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-sm' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span>🎭</span>
                    <span>الإخراج الكوميدي والليبسينج وحركات البيع</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-black/20 text-black font-black">
                      بيع سريع
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePromptTab('handoff');
                      setMobileTab('handoff');
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                      activePromptTab === 'handoff' || mobileTab === 'handoff'
                        ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-600 text-white shadow-sm shadow-purple-500/30' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span>🌀</span>
                    <span>الانتقال المستحيل (The Impossible Handoff)</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-white/20 text-white font-black">
                      سينما 4K
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePromptTab('full');
                      setMobileTab('scene');
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                      activePromptTab === 'full' && mobileTab !== 'comedy'
                        ? 'bg-cyan-500 text-black shadow-sm' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span>📝</span>
                    <span>البرومبت المجمع لـ Veo</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="text-[11px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-bold"
                  >
                    <span>📋 نسخ البرومبت</span>
                  </button>
                </div>
              </div>

              {/* View 1: 5-Layer Directorial Breakdown */}
              {activePromptTab === 'layers' && mobileTab !== 'comedy' && (
                <div className="space-y-3 animate-fadeIn">
                  
                  {/* Layer 1: The Hook Up (Crucial First 3s) */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <span>⚡</span>
                        <span>الطبقة 1: الخطاف البصري والسيكولوجي (The Hook Up • أول 3 ثوانٍ)</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-200 border border-amber-500/40">
                        Stop The Scroll
                      </span>
                    </div>
                    {directorialLayers?.hookUpAr && (
                      <p className="text-[11px] text-white/80 bg-black/40 p-2 rounded-xl border border-white/5 leading-relaxed">
                        {directorialLayers.hookUpAr}
                      </p>
                    )}
                    <textarea
                      value={directorialLayers?.hookUpEn || ''}
                      onChange={(e) => handleLayerTextChange('hookUpEn', e.target.value)}
                      placeholder="صياغة الـ Hook بالإنجليزية لنموذج الفيديو (مثلاً: High-speed macro push-in with sparkling cinematic droplets)..."
                      rows={2}
                      className="w-full p-2.5 bg-black/60 border border-amber-500/20 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 resize-none font-mono"
                    />
                  </div>

                  {/* Layer 2: Camera Kinematics */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-cyan-500/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <span>🎥</span>
                        <span>الطبقة 2: حركة وزوايا الكاميرا (Camera Motion Dynamics)</span>
                      </span>
                      <span className="text-[10px] text-white/40">{cameraMotion}</span>
                    </div>
                    {directorialLayers?.cameraLayerAr && (
                      <p className="text-[11px] text-white/70 bg-black/30 p-1.5 rounded-lg">
                        {directorialLayers.cameraLayerAr}
                      </p>
                    )}
                    <textarea
                      value={directorialLayers?.cameraLayerEn || ''}
                      onChange={(e) => handleLayerTextChange('cameraLayerEn', e.target.value)}
                      placeholder="توجيه حركة الكاميرا والعدسة..."
                      rows={2}
                      className="w-full p-2.5 bg-black/60 border border-cyan-500/20 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 resize-none font-mono"
                    />
                  </div>

                  {/* Layer 3: Lighting & Atmosphere */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-blue-500/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                        <span>💡</span>
                        <span>الطبقة 3: الإضاءة والفيزياء البيئية (Lighting & Atmosphere)</span>
                      </span>
                    </div>
                    {directorialLayers?.lightingLayerAr && (
                      <p className="text-[11px] text-white/70 bg-black/30 p-1.5 rounded-lg">
                        {directorialLayers.lightingLayerAr}
                      </p>
                    )}
                    <textarea
                      value={directorialLayers?.lightingLayerEn || ''}
                      onChange={(e) => handleLayerTextChange('lightingLayerEn', e.target.value)}
                      placeholder="توزيع الإضاءة، السوفت بوكس، والجسيمات..."
                      rows={2}
                      className="w-full p-2.5 bg-black/60 border border-blue-500/20 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400 resize-none font-mono"
                    />
                  </div>

                  {/* Layer 4: Product Dynamics */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <span>✨</span>
                        <span>الطبقة 4: تفاعل المنتج وحركته المادية (Product Physics)</span>
                      </span>
                    </div>
                    {directorialLayers?.productMotionLayerAr && (
                      <p className="text-[11px] text-white/70 bg-black/30 p-1.5 rounded-lg">
                        {directorialLayers.productMotionLayerAr}
                      </p>
                    )}
                    <textarea
                      value={directorialLayers?.productMotionLayerEn || ''}
                      onChange={(e) => handleLayerTextChange('productMotionLayerEn', e.target.value)}
                      placeholder="حركة أسطح المنتج وحفظ الهوية..."
                      rows={2}
                      className="w-full p-2.5 bg-black/60 border border-purple-500/20 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-400 resize-none font-mono"
                    />
                  </div>

                  {/* Layer 5: Commercial Climax */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <span>🏆</span>
                        <span>الطبقة 5: الخاتمة وتثبيت العلامة (Hero Climax & Lockup)</span>
                      </span>
                    </div>
                    {directorialLayers?.climaxLayerAr && (
                      <p className="text-[11px] text-white/70 bg-black/30 p-1.5 rounded-lg">
                        {directorialLayers.climaxLayerAr}
                      </p>
                    )}
                    <textarea
                      value={directorialLayers?.climaxLayerEn || ''}
                      onChange={(e) => handleLayerTextChange('climaxLayerEn', e.target.value)}
                      placeholder="الخاتمة وتثبيت الشعار..."
                      rows={2}
                      className="w-full p-2.5 bg-black/60 border border-emerald-500/20 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 resize-none font-mono"
                    />
                  </div>

                  {/* Genius Scene Narrative Card */}
                  {directorialLayers?.geniusSceneStoryAr && (
                    <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                        <span className="flex items-center gap-1.5">
                          <span>🎬</span>
                          <span>سيناريو المشهد الإخراجي العبقري بالكامل:</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleCopySceneScript}
                          className="text-[10px] underline text-cyan-400 hover:text-cyan-200"
                        >
                          نسخ السيناريو
                        </button>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        {directorialLayers.geniusSceneStoryAr}
                      </p>
                      {directorialLayers.soundEffectsAr && (
                        <div className="pt-1.5 border-t border-white/10 text-[11px] text-cyan-200/80">
                          <strong>🎵 اقتراح المؤثرات الصوتية: </strong>
                          <span>{directorialLayers.soundEffectsAr}</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* View 2: Full Master Prompt Editor */}
              {activePromptTab === 'full' && mobileTab !== 'comedy' && (
                <div className="space-y-2 animate-fadeIn">
                  <textarea
                    value={prompt}
                    onChange={(e) => handleLayerTextChange('fullPromptEn', e.target.value)}
                    placeholder="اكتب التوجيه الإعلاني المتكامل هنا..."
                    rows={6}
                    className="w-full p-3.5 bg-black/60 border border-white/15 rounded-2xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-white/50 px-1">
                    <span>عدد الكلمات: {prompt.trim().split(/\s+/).filter(Boolean).length}</span>
                    <button
                      type="button"
                      onClick={() => handleAnalyzeAndBuildScene()}
                      className="text-cyan-300 hover:underline"
                    >
                      إعادة صياغة الطبقات بالذكاء الاصطناعي ↺
                    </button>
                  </div>
                </div>
              )}

              {/* View 3: Comedic Sales Direction, Dialect, Lip-Sync, and Selling Gestures */}
              {(activePromptTab === 'comedy' || mobileTab === 'comedy') && (
                <div className="space-y-4 animate-fadeIn p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-orange-950/20 to-black/60 border border-amber-500/30 shadow-xl">
                  {/* Dialect Selector Banner */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <span>🗣️</span>
                        <span>اختر اللهجة الإعلانية (Dialect Voice & Rhythm):</span>
                      </label>
                      <span className="text-[10px] text-white/50">تحدد نبرة الخطاب وإيقاع حركة الشفاه</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {DIALECT_OPTIONS.map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleSelectDialect(d.id)}
                          className={`p-2 rounded-xl text-right transition-all border flex flex-col justify-between ${
                            selectedDialect === d.id
                              ? 'bg-amber-500/25 border-amber-400 text-white shadow-md shadow-amber-500/15'
                              : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <span>{d.flag}</span>
                            <span>{d.label}</span>
                          </div>
                          <div className="text-[9px] text-white/40 mt-1 line-clamp-1">{d.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lip-Sync Script Box */}
                  <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">👄</span>
                        <span className="text-xs font-black text-amber-200">
                          نص المزامنة الشفاهية والصوتية (Lip-Sync Script • 0-5s):
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ✓ جاهز للـ Lip-Sync
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyLipSyncScript}
                        className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-bold"
                      >
                        <span>📋</span>
                        <span>نسخ السكربت</span>
                      </button>
                    </div>

                    <textarea
                      value={lipSyncScript}
                      onChange={(e) => setLipSyncScript(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 bg-black/70 border border-amber-500/20 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                      placeholder="اكتب العبارة الإعلانية الخاطفة التي ينطق بها المؤدي أثناء المشهد..."
                    />

                    <div className="flex items-center justify-between text-[10px] text-white/50 px-1">
                      <span>كلمات: {lipSyncScript.trim().split(/\s+/).filter(Boolean).length} | مدة الإلقاء المقدرة: ~3-5 ثوانٍ</span>
                      <span>طبيعة الإلقاء: سريع، فكاهي، يزرع رغبة الشراء الفورية</span>
                    </div>
                  </div>

                  {/* Selling Gestures Catalog ("حركات تبيع") */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <span>🎯</span>
                        <span>حركات تبيع (High-Converting Selling Gestures):</span>
                      </label>
                      <span className="text-[10px] text-white/50">انقر لتفعيل أو إلغاء الحركات للمؤدي</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {SELLING_GESTURES_CATALOG.map(g => {
                        const isSelected = selectedGestures.some(sel => sel.includes(g.label) || sel.includes(g.id) || g.desc.includes(sel));
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => handleToggleGesture(g.label)}
                            className={`p-2.5 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm'
                                : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span className="text-xl flex-shrink-0">{g.icon}</span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold flex items-center justify-between">
                                <span>{g.label}</span>
                                {isSelected && <span className="text-emerald-400 text-[10px]">✓ نشط</span>}
                              </div>
                              <div className="text-[10px] text-white/50 mt-0.5 leading-snug">{g.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comedy Vibe & Viral CTA Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold text-white/60 block">طاقة وطابع الكوميديا (Comedy Vibe):</span>
                      <input
                        type="text"
                        value={comedyVibe}
                        onChange={(e) => setComedyVibe(e.target.value)}
                        className="w-full p-2 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-[10px] font-bold text-white/60 block">نداء الشراء الفيروسي (Viral CTA):</span>
                      <input
                        type="text"
                        value={viralCta}
                        onChange={(e) => setViralCta(e.target.value)}
                        className="w-full p-2 bg-black/60 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Action Buttons inside Comedy Studio */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleWeaveComedyIntoPrompt}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:opacity-90 text-black font-black text-xs transition-all shadow-md shadow-orange-900/30 flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span>⚡</span>
                      <span>دمج الإخراج الكوميدي والليبسينج وحركات البيع في البرومبت فوراً</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAnalyzeAndBuildScene()}
                      disabled={isOptimizingPrompt}
                      className="w-full sm:w-auto py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 flex items-center justify-center gap-1.5"
                    >
                      <span>↺</span>
                      <span>إعادة صياغة المشهد الكوميدي باللهجة</span>
                    </button>
                  </div>
                </div>
              )}

              {/* View 3: The Impossible Handoff Cinema Engine (الهوك السينمائي الفائق والانتقال المستحيل) */}
              {(activePromptTab === 'handoff' || mobileTab === 'handoff') && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Hero Header & Formula Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/60 to-black border border-purple-500/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🌀</span>
                          <span className="text-xs sm:text-sm font-black bg-gradient-to-r from-purple-300 via-pink-200 to-cyan-300 bg-clip-text text-transparent">
                            {handoffBlueprint.title} • {handoffBlueprint.format} • {handoffBlueprint.resolution}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Series {handoffBlueprint.series} • Scene {handoffBlueprint.scene}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                            {handoffBlueprint.coreHookMechanic.formula}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                          💡 {handoffBlueprint.coreHookMechanic.lesson}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleSynthesizeHandoffBlueprint}
                          disabled={isSynthesizingHandoff}
                          className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-purple-950/40 active:scale-95 disabled:opacity-50"
                        >
                          {isSynthesizingHandoff ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>صياغة المخطط الذكي...</span>
                            </>
                          ) : (
                            <>
                              <span>✨</span>
                              <span>توليد بالذكاء الاصطناعي</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleApplyHandoffToPrompt}
                          className="py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95"
                        >
                          <span>🚀</span>
                          <span>تطبيق فوري وتوليد</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCopyHandoffJSON}
                          className="py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-1 active:scale-95"
                          title="نسخ المخطط كـ JSON"
                        >
                          <span>{'{ }'}</span>
                          <span className="hidden sm:inline">JSON</span>
                        </button>
                      </div>
                    </div>

                    {/* Sub-tabs inside handoff: Timeline / Locks / JSON */}
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveHandoffView('timeline')}
                        className={`py-1 px-3 rounded-lg font-black transition-all ${
                          activeHandoffView === 'timeline' ? 'bg-purple-500 text-white shadow-sm' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        ⏱️ الخط الزمني والانتقال (0.0s - 10.0s)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHandoffView('locks')}
                        className={`py-1 px-3 rounded-lg font-black transition-all ${
                          activeHandoffView === 'locks' ? 'bg-purple-500 text-white shadow-sm' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        🔒 ثبات العلامة والبطل (Brand & Character Lock)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHandoffView('json')}
                        className={`py-1 px-3 rounded-lg font-black transition-all ${
                          activeHandoffView === 'json' ? 'bg-purple-500 text-white shadow-sm' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        📜 الكود الإخراجي الكامل (JSON Master)
                      </button>
                    </div>
                  </div>

                  {/* Sub-View A: Timeline Segments */}
                  {activeHandoffView === 'timeline' && (
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20 flex items-center justify-between text-xs">
                        <span className="text-purple-300 font-bold flex items-center gap-1.5">
                          <span>🚪</span>
                          <span>البداية المتصلة (Opening Frame):</span>
                        </span>
                        <span className="text-[11px] text-white/70 italic">"{handoffBlueprint.openingFrame.dialogue}"</span>
                      </div>

                      <div className="space-y-2">
                        {handoffBlueprint.timeline.map((seg, i) => (
                          <div 
                            key={i}
                            className={`p-3 rounded-xl border transition-all text-xs ${
                              seg.transition 
                                ? 'bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-black border-purple-400 shadow-md shadow-purple-950/30' 
                                : 'bg-black/40 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono font-bold text-[10px] border border-purple-500/30">
                                  {seg.time}
                                </span>
                                {seg.transition && (
                                  <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 font-bold text-[9px] border border-pink-500/40 animate-pulse">
                                    🌀 نقطة الانتقال المستحيل (Occlusion Transition)
                                  </span>
                                )}
                              </div>
                              {seg.dialogue && (
                                <span className="text-amber-300 font-bold text-[11px] bg-black/50 px-2 py-0.5 rounded border border-amber-500/20">
                                  🗣️ "{seg.dialogue}"
                                </span>
                              )}
                            </div>

                            <p className="text-white/90 text-xs leading-relaxed font-sans">
                              {seg.action}
                            </p>

                            <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center gap-3 text-[10px] text-white/50">
                              <span>🎥 الكاميرا: <strong className="text-cyan-300">{seg.camera}</strong></span>
                              {seg.physicalResponse && (
                                <span>⚡ الاستجابة: <strong className="text-emerald-300">{seg.physicalResponse}</strong></span>
                              )}
                              {seg.transition && (
                                <span className="text-pink-300 font-semibold">{seg.transition}</span>
                              )}
                              {seg.important && (
                                <span className="text-amber-300/80 font-bold">⚠️ {seg.important}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Transition Engine Rules Card */}
                      <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/50 to-black border border-indigo-500/30 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-indigo-300 flex items-center gap-1.5">
                            <span>⚙️</span>
                            <span>محرك الانتقال (Transition Engine):</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">No-Cut • No-Morph • Realistic Physics ✓</span>
                        </div>
                        <p className="text-[11px] text-white/70 leading-relaxed">
                          القاعدة الصارمة: <strong className="text-white">{handoffBlueprint.transitionEngine.rule}</strong>. لا يوجد أي مونتاج رقمي أو قفزة مفاجئة، الكاميرا تتبع العنصر نفسه حتى يملأ الإطار بالكامل، ثم يدخل المشاهد البيئة الثانية من خلف العنصر تلقائياً.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sub-View B: Continuity & Brand / Character Lock */}
                  {activeHandoffView === 'locks' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Brand Lock */}
                        <div className="p-3.5 rounded-xl bg-black/50 border border-cyan-500/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-cyan-300 flex items-center gap-1.5">
                              <span>🔒</span>
                              <span>قفل العلامة (Brand Lock):</span>
                            </span>
                            <span className="text-[10px] text-cyan-400 font-bold">{handoffBlueprint.brandLock.brand}</span>
                          </div>
                          <p className="text-[11px] text-white/80 leading-relaxed">
                            {handoffBlueprint.brandLock.logoInstruction}
                          </p>
                          <div className="pt-2 border-t border-white/10 space-y-1 text-[10px] text-white/60">
                            <div>• الاستخدام: <strong>{handoffBlueprint.brandLock.usage}</strong></div>
                            <div>• الهندسة والأبعاد: <strong>{handoffBlueprint.brandLock.geometry}</strong></div>
                            <div>• قيود صارمة: لا إعادة تصميم، لا تشويه، لا طبقات مسطحة.</div>
                          </div>
                        </div>

                        {/* Character Lock */}
                        <div className="p-3.5 rounded-xl bg-black/50 border border-amber-500/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-amber-300 flex items-center gap-1.5">
                              <span>👤</span>
                              <span>قفل البطل (Character Lock):</span>
                            </span>
                            <span className="text-[10px] text-amber-400 font-bold">بطل موحد ومستمر</span>
                          </div>
                          <p className="text-[11px] text-white/80 leading-relaxed">
                            {handoffBlueprint.characterLock.identity}
                          </p>
                          <div className="pt-2 border-t border-white/10 space-y-1 text-[10px] text-white/60">
                            <div>• الملابس: <strong>{handoffBlueprint.characterLock.wardrobe}</strong></div>
                            <div>• الوجه: <strong>{handoffBlueprint.characterLock.face}</strong></div>
                            <div>• قيود صارمة: لا تغيير في الملامح، لا تغيير في الملابس.</div>
                          </div>
                        </div>
                      </div>

                      {/* Hard Constraints Checklist */}
                      <div className="p-3.5 rounded-xl bg-black/60 border border-white/15 space-y-2 text-xs">
                        <span className="font-black text-white/90 flex items-center gap-1.5">
                          <span>🛡️</span>
                          <span>القيود الصارمة المطبقة في نموذج Google Veo (Hard Constraints):</span>
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-white/70">
                          <span className="flex items-center gap-1 text-emerald-400">✓ Single Hero Character</span>
                          <span className="flex items-center gap-1 text-emerald-400">✓ Single Physical Emblem</span>
                          <span className="flex items-center gap-1 text-emerald-400">✓ No Extra People / Hands</span>
                          <span className="flex items-center gap-1 text-emerald-400">✓ No Morphing / Teleport</span>
                          <span className="flex items-center gap-1 text-emerald-400">✓ Realistic Physical Dynamics</span>
                          <span className="flex items-center gap-1 text-emerald-400">✓ Perfect Lip-Sync Continuity</span>
                        </div>
                      </div>

                      {/* Sound & Atmosphere */}
                      <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20 text-xs space-y-1">
                        <span className="font-bold text-purple-300">🎵 هندسة الصوت السينمائية (Sound Design):</span>
                        <p className="text-[11px] text-white/70 leading-relaxed">
                          صوت احتكاك معدني دقيق عند الإمساك بالعنصر ← ووش هوائي واقعي عند الرمي ← انخفاض وخفوت الصوت عند حجب العدسة بالكامل ← انفتاح الصوت في الغرفة الجديدة الفاخرة ← موسيقى نبض سينمائي تصاعدي.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sub-View C: Raw JSON Code Editor */}
                  {activeHandoffView === 'json' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60 text-[11px]">مخطط الإنتاج الإخراجي بصيغة JSON المعيارية:</span>
                        <button
                          type="button"
                          onClick={handleCopyHandoffJSON}
                          className="text-cyan-300 hover:text-cyan-200 font-bold text-[11px] flex items-center gap-1"
                        >
                          <span>📋 نسخ JSON</span>
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={JSON.stringify(handoffBlueprint, null, 2)}
                        rows={12}
                        className="w-full p-3 bg-black/80 border border-purple-500/30 rounded-xl text-[11px] text-purple-200 font-mono resize-none focus:outline-none custom-scroll leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* 3. Camera Kinematics & Technical Controls (Shown in 'camera' tab or desktop) */}
            <div className={`space-y-4 ${mobileTab === 'camera' ? 'block' : 'hidden lg:block'}`}>
              
              {/* Camera Motion Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <span>🎥</span>
                    <span>مسار وحركة الكاميرا (8 Camera Motives):</span>
                  </label>
                  <span className="text-[10px] text-white/40">مسارات ثلاثية الأبعاد 360°</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CAMERA_MOTIONS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCameraMotion(m.id)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        cameraMotion === m.id
                          ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-md shadow-cyan-500/15'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{m.icon}</span>
                        <span className={`w-2 h-2 rounded-full ${cameraMotion === m.id ? 'bg-cyan-400' : 'bg-transparent'}`} />
                      </div>
                      <div className="text-[11px] font-bold leading-tight">{m.labelAr.split(' (')[0]}</div>
                      <div className="text-[9px] text-white/40 mt-0.5">{m.labelEn}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format, Dynamics, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Aspect Ratio */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/70">أبعاد الفيديو (Ratio):</label>
                  <div className="grid grid-cols-3 gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
                    {(['9:16', '16:9', '1:1'] as const).map(ratio => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          aspectRatio === ratio ? 'bg-cyan-500 text-black font-black' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {ratio} {ratio === '9:16' ? '📱' : (ratio === '16:9' ? '🖥️' : '⏹️')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Motion Dynamics */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/70">طاقة الحركة (Dynamics):</label>
                  <select
                    value={motionDynamics}
                    onChange={(e) => setMotionDynamics(e.target.value as any)}
                    className="w-full py-2 px-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="smooth_commercial">نعومة إعلانية راقية</option>
                    <option value="viral_energetic">ديناميكية سريعة (Viral)</option>
                    <option value="slow_motion">حركة بطيئة سينمائية (Slow-Mo)</option>
                  </select>
                </div>

                {/* Duration & Quality & Engine Choice */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-white/70">المدة ومحرك الفيديو:</label>
                    <span className="text-[9px] text-cyan-300 font-bold">Google Veo 3.1 Architecture</span>
                  </div>
                  <div className="flex gap-1.5">
                    <select
                      value={durationSeconds}
                      onChange={(e) => setDurationSeconds(Number(e.target.value))}
                      className="w-24 py-2 px-1.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value={5}>5s (Hero)</option>
                      <option value={10}>10s (Cinema)</option>
                    </select>
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value as any)}
                      className="w-20 py-2 px-1 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="720p">720p</option>
                      <option value="1080p">1080p 4K</option>
                    </select>
                    <select
                      value={modelChoice}
                      onChange={(e) => setModelChoice(e.target.value as any)}
                      className="flex-1 py-2 px-1.5 bg-black/60 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="veo-3.1-lite-generate-preview">Veo 3.1 Lite (توليد سريع)</option>
                      <option value="veo-3.1-generate-preview">Veo 3.1 Pro (سينمائي فائق)</option>
                      <option value="flow-kinetic">Flow Kinetic (فوري بدون كوتة)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Error Message if any */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Desktop Generate Button */}
            <div className="hidden sm:block pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-cyan-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري التوليد عبر نموذج Flow...</span>
                  </>
                ) : (
                  <>
                    <span>🎬</span>
                    <span>إطلاق التوليد بالمشهد العبقري والـ Hook Up</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* Mobile Sticky Floating Bottom Action Bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-[#080d16]/95 backdrop-blur-xl border-t border-cyan-500/30 z-40 flex items-center gap-2 shadow-2xl">
          {generatedVideoUrl ? (
            <>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-3 rounded-xl bg-emerald-600 active:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-1.5"
              >
                <span>⬇️</span>
                <span>تحميل الفيديو</span>
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="py-3 px-4 rounded-xl bg-cyan-500 text-black font-black text-xs shadow-md shadow-cyan-500/30 flex items-center justify-center gap-1"
              >
                <span>🔄</span>
                <span>إعادة إخراج</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 active:opacity-90 text-white font-black text-xs shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري التوليد...</span>
                </>
              ) : (
                <>
                  <span>🎬</span>
                  <span>توليد المشهد والـ Hook Up</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default VideoFlowModal;
