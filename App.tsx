
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AppView, 
  CreatorStudioProject, 
  PhotoshootDirectorProject, 
  PromptStudioProject,
  VoiceOverStudioProject,
  BrandingStudioProject,
  CampaignStudioProject,
  PlanStudioProject,
  EditStudioProject,
  StoryboardStudioProject,
  MarketingStudioProject
} from './types';
import CreatorStudio from './components/CreatorStudio';
import PhotoshootDirector from './components/PhotoshootDirector';
import PromptStudio from './components/PromptStudio';
import VoiceOverStudio from './components/VoiceOverStudio';
import BrandingStudio from './components/BrandingStudio';
import CampaignStudio from './components/CampaignStudio';
import PlanStudio from './components/PlanStudio';
import EditStudio from './components/EditStudio';
import StoryboardStudio from './components/StoryboardStudio';
import MarketingStudio from './components/MarketingStudio';
import TabBar from './components/TabBar';
import UserStudioWorksModal from './components/UserStudioWorksModal';
import SocialEngineModal from './components/SocialEngineModal';
import GoogleQuotaModal from './components/GoogleQuotaModal';
import VideoFlowModal from './components/VideoFlowModal';
import SocialHubManager from './components/SocialHubManager';
import GoogleSignInModal from './components/GoogleSignInModal';
import MobileSidebarDrawer from './components/MobileSidebarDrawer';
import { getStudioWorks } from './services/studioStorageService';
import { hasUserGeminiKey } from './services/geminiService';
import { getGoogleUser, logoutGoogle, subscribeGoogleAuth } from './services/googleAuthService';
import { StudioWorkItem, GoogleUserProfile } from './types';
import { LIGHTING_STYLES, CAMERA_PERSPECTIVES, VOICES } from './constants';

const LOGO_IMAGE_URL = "https://i.ibb.co/MDrpHPzS/Artboard-1.png";

const GoogleGLogo = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.88 0 12c0 2.12.45 3.86 1.24 5.42l4.04-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414 0z" clipRule="evenodd" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
);

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.058-4.51 10.06-10.059 0-2.689-1.046-5.217-2.946-7.117s-4.429-2.945-7.118-2.945c-5.548 0-10.059 4.51-10.061 10.059-.001 2.013.569 3.425 1.539 5.074l-.991 3.621 3.717-.975zm11.367-7.374c-.19-.094-1.129-.558-1.303-.622-.174-.064-.301-.094-.427.095-.127.189-.491.622-.601.75-.11.127-.221.143-.411.048-.19-.094-.803-.296-1.53-0.941-.566-.505-.948-1.129-1.06-1.318-.11-.189-.012-.292.083-.386.085-.085.19-.221.285-.331.095-.11.127-.189.19-.315.064-.127.032-.238-.016-.331-.048-.094-.427-1.029-.586-1.408-.154-.37-.311-.318-.427-.324-.11-.005-.238-.006-.364-.006s-.333.048-.507.238c-.174.189-.665.65-.665 1.585 0 .935.681 1.838.777 1.964.095.126 1.34 2.046 3.245 2.87.453.196.806.313 1.082.401.455.144.869.124 1.196.075.365-.054 1.129-.462 1.287-.908.158-.445.158-.826.111-.908-.048-.082-.174-.126-.364-.221z"/>
    </svg>
);

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
    </svg>
);

const Typewriter = () => {
    const words = ["DESIGN", "STORYBOARD", "PHOTOSHOOT", "VOICE OVER"];
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const handleType = () => {
            const fullWord = words[currentWordIndex % words.length];

            setCurrentText(prev => {
                if (isDeleting) {
                    return fullWord.substring(0, prev.length - 1);
                } else {
                    return fullWord.substring(0, prev.length + 1);
                }
            });

            if (isDeleting) {
                setTypingSpeed(75);
            } else {
                setTypingSpeed(150);
            }

            if (!isDeleting && currentText === fullWord) {
                setTypingSpeed(2000);
                setIsDeleting(true);
            } else if (isDeleting && currentText === "") {
                setIsDeleting(false);
                setCurrentWordIndex(prev => prev + 1);
                setTypingSpeed(500);
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentWordIndex, words, typingSpeed]);

    return (
        <span className="text-[var(--color-accent)] inline-flex items-center">
            {currentText}
            <span className="animate-pulse ml-1 text-[var(--color-accent)] font-light">|</span>
        </span>
    );
};

const InteractiveLogo = () => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const ref = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
  
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 400;
  
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          const moveX = -(dx / dist) * 120 * force;
          const moveY = -(dy / dist) * 120 * force;
          setOffset({ x: moveX, y: moveY });
        } else {
          setOffset({ x: 0, y: 0 });
        }
      };
  
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
  
    return (
      <div
        ref={ref}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: 'transform 0.1s ease-out',
        }}
        className="relative z-0"
      >
          <div className="animate-float">
              <div className="flex flex-col items-center justify-center p-8 bg-[rgba(var(--color-background-base-rgb),0.5)] backdrop-blur-md rounded-[3rem] border border-[rgba(var(--color-accent-rgb),0.3)] shadow-[0_0_50px_rgba(var(--color-accent-rgb),0.2)]">
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" stroke="currentColor" className="text-[var(--color-accent)]" strokeWidth="4" fill="rgba(0, 229, 255, 0.1)"/>
                      <path d="M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z" stroke="currentColor" className="text-[var(--color-accent-light)]" strokeWidth="2" fill="none"/>
                      <text x="50" y="55" fontFamily="Tajawal, sans-serif" fontSize="24" fontWeight="bold" fill="currentColor" className="text-[var(--color-text-base)]" textAnchor="middle" dominantBaseline="middle">FAI</text>
                  </svg>
                  <h2 className="mt-4 text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-light)] to-[var(--color-accent-dark)] tracking-wider">Fekra Ai</h2>
                  <p className="text-sm font-medium tracking-widest uppercase text-[var(--color-text-secondary)] mt-1">Business OS</p>
              </div>
          </div>
      </div>
    );
  };

const createNewCreatorProject = (projectCount: number): CreatorStudioProject => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: `Project ${projectCount + 1}`,
  productImages: [],
  styleImages: [], 
  generatedImage: null,
  history: [],
  options: {
    lightingStyle: LIGHTING_STYLES[0].value,
    cameraPerspective: CAMERA_PERSPECTIVES[0].value,
  },
  prompt: '',
  isPromptAutoGenerated: false,
  styleDescription: null,
  isAnalyzingStyle: false,
  isLoading: false,
  error: null,
  uploadingTarget: null,
  translatedPrompt: null,
  isTranslating: false,
  editPrompt: '',
  isEditing: false,
});

const createNewPhotoshootProject = (projectCount: number): PhotoshootDirectorProject => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: `Project ${projectCount + 1}`,
  productImages: [],
  selectedShotTypes: [],
  results: [],
  isGenerating: false,
  error: null,
  isUploading: false,
  customStylePrompt: '',
});

const createNewPromptStudioProject = (projectCount: number): PromptStudioProject => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: `Project ${projectCount + 1}`,
  images: [],
  instructions: '',
  generatedPrompt: null,
  history: [],
  isLoading: false,
  isUploading: false,
  error: null,
});

const createNewVoiceOverStudioProject = (projectCount: number): VoiceOverStudioProject => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: `Project ${projectCount + 1}`,
  text: '',
  styleInstructions: '',
  selectedVoice: VOICES[0].value,
  generatedAudio: null,
  isLoading: false,
  error: null,
  history: [],
  isPlaying: false,
  voiceGenderFilter: 'All',
  previewLoadingVoice: null,
  previewPlayingVoice: null,
});

const createNewBrandingStudioProject = (projectCount: number): BrandingStudioProject => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: `Project ${projectCount + 1}`,
  logos: [], 
  isUploading: false,
  error: null,
  results: [],
  colors: [],
  isAnalyzing: false,
  isGenerating: false,
  aspectRatio: '1:1',
});

const createNewCampaignProject = (projectCount: number): CampaignStudioProject => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: `Project ${projectCount + 1}`,
    productImages: [],
    isUploading: false,
    isAnalyzing: false,
    isGenerating: false,
    error: null,
    results: [],
    productAnalysis: null,
    selectedMood: 'Original',
    customPrompt: '',
    mode: 'auto',
    // Updated to initialize 6 custom ideas
    customIdeas: ['', '', '', '', '', ''],
});

const createNewPlanProject = (projectCount: number): PlanStudioProject => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: `Plan ${projectCount + 1}`,
    productImages: [],
    logos: [],
    prompt: '',
    targetMarket: 'Egypt',
    dialect: 'Egyptian Arabic',
    categoryAnalysis: null,
    isAnalyzingCategory: false,
    ideas: [],
    isGeneratingPlan: false,
    isUploading: false,
    error: null,
});

const createNewStoryboardProject = (projectCount: number): StoryboardStudioProject => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: `Board ${projectCount + 1}`,
    subjectImages: [],
    customInstructions: '',
    aspectRatio: '16:9',
    scenes: [],
    gridImage: null,
    isGeneratingPlan: false,
    isGeneratingGrid: false,
    isUploading: false,
    error: null,
});

const createNewMarketingProject = (projectCount: number): MarketingStudioProject => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: `Strategy ${projectCount + 1}`,
    brandType: 'new',
    entityType: 'product',
    campaignGoal: 'sales',
    brandName: '',
    specialty: '',
    brief: '',
    websiteLink: '',
    targetMarket: 'المملكة العربية السعودية 🇸🇦',
    selectedPlatforms: ['Instagram', 'TikTok', 'Snapchat'],
    dialect: 'سعودي إعلاني',
    language: 'ar',
    logoImages: [],
    productImages: [],
    isUploadingLogo: false,
    isUploadingProduct: false,
    result: null,
    campaignData: null,
    isGenerating: false,
    error: null,
});

const createNewEditProject = (projectCount: number): EditStudioProject => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: `Edit ${projectCount + 1}`,
    baseImages: [], 
    localTexts: {},
    committedTexts: {},
    globalLayers: [],
    adjustments: {
        sharpness: 100,
        lut: 'Original'
    },
    isUploading: false,
    error: null,
});

function App() {
  const [view, setView] = useState<AppView>('creator_studio');
  const [theme, setTheme] = useState('dark');
  const contentRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const [creatorProjects, setCreatorProjects] = useState<CreatorStudioProject[]>([createNewCreatorProject(0)]);
  const [activeCreatorIndex, setActiveCreatorIndex] = useState(0);

  const [photoshootProjects, setPhotoshootProjects] = useState<PhotoshootDirectorProject[]>([createNewPhotoshootProject(0)]);
  const [activePhotoshootIndex, setActivePhotoshootIndex] = useState(0);

  const [promptStudioProjects, setPromptStudioProjects] = useState<PromptStudioProject[]>([createNewPromptStudioProject(0)]);
  const [activePromptStudioIndex, setActivePromptStudioIndex] = useState(0);

  const [voiceOverProjects, setVoiceOverProjects] = useState<VoiceOverStudioProject[]>([createNewVoiceOverStudioProject(0)]);
  const [activeVoiceOverIndex, setActiveVoiceOverIndex] = useState(0);

  const [brandingProjects, setBrandingProjects] = useState<BrandingStudioProject[]>([createNewBrandingStudioProject(0)]);
  const [activeBrandingIndex, setActiveBrandingIndex] = useState(0);

  const [campaignProjects, setCampaignProjects] = useState<CampaignStudioProject[]>([createNewCampaignProject(0)]);
  const [activeCampaignIndex, setActiveCampaignIndex] = useState(0);

  const [planProjects, setPlanProjects] = useState<PlanStudioProject[]>([createNewPlanProject(0)]);
  const [activePlanIndex, setActivePlanIndex] = useState(0);

  const [storyboardProjects, setStoryboardProjects] = useState<StoryboardStudioProject[]>([createNewStoryboardProject(0)]);
  const [activeStoryboardIndex, setActiveStoryboardIndex] = useState(0);

  const [marketingProjects, setMarketingProjects] = useState<MarketingStudioProject[]>([createNewMarketingProject(0)]);
  const [activeMarketingIndex, setActiveMarketingIndex] = useState(0);

  const [editProjects, setEditProjects] = useState<EditStudioProject[]>([createNewEditProject(0)]);
  const [activeEditIndex, setActiveEditIndex] = useState(0);

  const [isStudioWorksOpen, setIsStudioWorksOpen] = useState(false);
  const [studioWorksCount, setStudioWorksCount] = useState(0);

  const [isSocialEngineOpen, setIsSocialEngineOpen] = useState(false);
  const [socialEngineWork, setSocialEngineWork] = useState<StudioWorkItem | null>(null);

  const [googleUser, setGoogleUser] = useState<GoogleUserProfile | null>(() => getGoogleUser());
  const [isGoogleSignInOpen, setIsGoogleSignInOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(hasUserGeminiKey());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isVideoFlowOpen, setIsVideoFlowOpen] = useState(false);
  const [videoFlowInitialData, setVideoFlowInitialData] = useState<{
    image: any;
    prompt: string;
    cameraMotion: any;
    aspectRatio: any;
    sourceStudioTitle?: string;
    hyperSocialDNA?: any;
  }>({
    image: null,
    prompt: '',
    cameraMotion: 'orbit_360',
    aspectRatio: '9:16',
    sourceStudioTitle: 'Fekra AI',
    hyperSocialDNA: null,
  });

  const handleOpenVideoFlow = useCallback((image?: any, prompt?: string, cameraMotion?: any, aspectRatio?: any, sourceStudioTitle?: string, hyperSocialDNA?: any) => {
    setVideoFlowInitialData({
      image: image || null,
      prompt: prompt || '',
      cameraMotion: cameraMotion || 'orbit_360',
      aspectRatio: aspectRatio || '9:16',
      sourceStudioTitle: sourceStudioTitle || 'Fekra AI',
      hyperSocialDNA: hyperSocialDNA || null,
    });
    setIsVideoFlowOpen(true);
  }, []);

  useEffect(() => {
    const unsub = subscribeGoogleAuth((usr) => {
      setGoogleUser(usr);
    });

    const handleKeyUpdate = () => {
      setHasCustomKey(hasUserGeminiKey());
    };
    const handleOpenQuotaModal = () => {
      setIsQuotaModalOpen(true);
    };

    window.addEventListener('fekra_api_key_updated', handleKeyUpdate);
    window.addEventListener('fekra_open_quota_modal', handleOpenQuotaModal);

    return () => {
      unsub();
      window.removeEventListener('fekra_api_key_updated', handleKeyUpdate);
      window.removeEventListener('fekra_open_quota_modal', handleOpenQuotaModal);
    };
  }, []);

  const handleOpenSocialEngine = useCallback((work?: StudioWorkItem | null, image?: any, prompt?: string) => {
    if (work) {
      setSocialEngineWork(work);
    } else if (image) {
      setSocialEngineWork({
        id: `temp_${Date.now()}`,
        createdAt: Date.now(),
        title: 'حملة إعلانية حية',
        prompt: prompt || 'حملة إعلانية فاخرة',
        studioType: 'creator_studio',
        image: image,
      });
    } else {
      setSocialEngineWork(null);
    }
    setIsSocialEngineOpen(true);
  }, []);

  const refreshWorksCount = useCallback(() => {
    const list = getStudioWorks();
    setStudioWorksCount(list.length);
  }, []);

  useEffect(() => {
    refreshWorksCount();
    window.addEventListener('fekra_studio_works_updated', refreshWorksCount);
    return () => window.removeEventListener('fekra_studio_works_updated', refreshWorksCount);
  }, [refreshWorksCount]);

  const handleSelectImageForEdit = useCallback((image: any) => {
    setEditProjects(prev => {
      const next = [...prev];
      next[activeEditIndex] = {
        ...next[activeEditIndex],
        baseImages: [image],
      };
      return next;
    });
    setView('edit_studio');
    scrollToContent();
  }, [activeEditIndex]);

  const handleSelectPromptForCreator = useCallback((prompt: string, image?: any) => {
    setCreatorProjects(prev => {
      const next = [...prev];
      next[activeCreatorIndex] = {
        ...next[activeCreatorIndex],
        prompt: prompt,
        productImages: image ? [image] : next[activeCreatorIndex].productImages,
        isPromptAutoGenerated: false,
      };
      return next;
    });
    setView('creator_studio');
    scrollToContent();
  }, [activeCreatorIndex]);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);
  
  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollMobileNav = (direction: 'left' | 'right') => {
    if (mobileNavRef.current) {
        const scrollAmount = direction === 'left' ? -100 : 100;
        mobileNavRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const addTab = <T,>(
    projects: T[],
    setProjects: React.Dispatch<React.SetStateAction<T[]>>,
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>,
    createFn: (count: number) => T
  ) => {
    setProjects(prev => {
        const newProjects = [...prev, createFn(prev.length)];
        setActiveIndex(newProjects.length - 1);
        return newProjects;
    });
  };

  const closeTab = <T,>(
    index: number,
    projects: T[],
    setProjects: React.Dispatch<React.SetStateAction<T[]>>,
    activeIndex: number,
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>,
    createFn: (count: number) => T
  ) => {
     setProjects(prev => {
         const newProjects = prev.filter((_, i) => i !== index);
         if (newProjects.length === 0) {
             setActiveIndex(0);
             return [createFn(0)];
         }
         
         if (index === activeIndex) {
             setActiveIndex(curr => Math.max(0, curr - 1));
         } else if (index < activeIndex) {
             setActiveIndex(curr => Math.max(0, curr - 1));
         }
         return newProjects;
     });
  };

  const updateCreatorProject = useCallback((action: React.SetStateAction<CreatorStudioProject>) => {
    setCreatorProjects(prev => {
        const newProjects = [...prev];
        const current = newProjects[activeCreatorIndex];
        const updated = action instanceof Function ? action(current) : action;
        newProjects[activeCreatorIndex] = updated;
        return newProjects;
    });
  }, [activeCreatorIndex]);

  const updatePhotoshootProject = useCallback((action: React.SetStateAction<PhotoshootDirectorProject>) => {
    setPhotoshootProjects(prev => {
        const newProjects = [...prev];
        const current = newProjects[activePhotoshootIndex];
        const updated = action instanceof Function ? action(current) : action;
        newProjects[activePhotoshootIndex] = updated;
        return newProjects;
    });
  }, [activePhotoshootIndex]);

  const updatePromptStudioProject = useCallback((action: React.SetStateAction<PromptStudioProject>) => {
    setPromptStudioProjects(prev => {
        const newProjects = [...prev];
        const current = newProjects[activePromptStudioIndex];
        const updated = action instanceof Function ? action(current) : action;
        newProjects[activePromptStudioIndex] = updated;
        return newProjects;
    });
  }, [activePromptStudioIndex]);

  const updateVoiceOverProject = useCallback((action: React.SetStateAction<VoiceOverStudioProject>) => {
    setVoiceOverProjects(prev => {
        const newProjects = [...prev];
        const current = newProjects[activeVoiceOverIndex];
        const updated = action instanceof Function ? action(current) : action;
        newProjects[activeVoiceOverIndex] = updated;
        return newProjects;
    });
  }, [activeVoiceOverIndex]);

  const updateBrandingProject = useCallback((action: React.SetStateAction<BrandingStudioProject>) => {
    setBrandingProjects(prev => {
        const newProjects = [...prev];
        const current = newProjects[activeBrandingIndex];
        const updated = action instanceof Function ? action(current) : action;
        newProjects[activeBrandingIndex] = updated;
        return newProjects;
    });
  }, [activeBrandingIndex]);

  const updateCampaignProject = useCallback((action: React.SetStateAction<CampaignStudioProject>) => {
    setCampaignProjects(prev => {
        const newProjects = [...prev];
        const current = newProjects[activeCampaignIndex];
        const updated = action instanceof Function ? action(current) : action;
        newProjects[activeCampaignIndex] = updated;
        return newProjects;
    });
  }, [activeCampaignIndex]);

  const updatePlanProject = useCallback((action: React.SetStateAction<PlanStudioProject>) => {
    setPlanProjects(prev => {
        const newProjects = [...prev];
        const current = newProjects[activePlanIndex];
        const updated = action instanceof Function ? action(current) : action;
        newProjects[activePlanIndex] = updated;
        return newProjects;
    });
  }, [activePlanIndex]);

  const updateStoryboardProject = useCallback((action: React.SetStateAction<StoryboardStudioProject>) => {
    setStoryboardProjects(prev => {
        const newProjects = [...prev];
        const current = newProjects[activeStoryboardIndex];
        const updated = action instanceof Function ? action(current) : action;
        newProjects[activeStoryboardIndex] = updated;
        return newProjects;
    });
  }, [activeStoryboardIndex]);

  const updateMarketingProject = useCallback((action: React.SetStateAction<MarketingStudioProject>) => {
    setMarketingProjects(prev => {
        const newProjects = [...prev];
        const current = newProjects[activeMarketingIndex];
        const updated = action instanceof Function ? action(current) : action;
        newProjects[activeMarketingIndex] = updated;
        return newProjects;
    });
  }, [activeMarketingIndex]);

  const updateEditProject = useCallback((action: React.SetStateAction<EditStudioProject>) => {
    setEditProjects(prev => {
        const newProjects = [...prev];
        const current = newProjects[activeEditIndex];
        const updated = action instanceof Function ? action(current) : action;
        newProjects[activeEditIndex] = updated;
        return newProjects;
    });
  }, [activeEditIndex]);


  const renderContent = () => {
    switch (view) {
        case 'creator_studio':
            return (
                <div className="flex flex-col w-full gap-4 animate-in fade-in duration-500">
                    <TabBar
                        projects={creatorProjects}
                        activeProjectIndex={activeCreatorIndex}
                        onSelectTab={setActiveCreatorIndex}
                        onAddTab={() => addTab(creatorProjects, setCreatorProjects, setActiveCreatorIndex, createNewCreatorProject)}
                        onCloseTab={(idx) => closeTab(idx, creatorProjects, setCreatorProjects, activeCreatorIndex, setActiveCreatorIndex, createNewCreatorProject)}
                    />
                    <CreatorStudio 
                        project={creatorProjects[activeCreatorIndex]}
                        setProject={updateCreatorProject}
                        onOpenSocialEngine={handleOpenSocialEngine}
                        onRequestVideo={(img, pr, dna) => handleOpenVideoFlow(img, pr, 'orbit_360', '1:1', 'Creator Studio', dna || creatorProjects[activeCreatorIndex]?.hyperSocialDNA)}
                    />
                </div>
            );
        case 'photoshoot_director':
            return (
                <div className="flex flex-col w-full gap-4 animate-in fade-in duration-500">
                     <TabBar
                        projects={photoshootProjects}
                        activeProjectIndex={activePhotoshootIndex}
                        onSelectTab={setActivePhotoshootIndex}
                        onAddTab={() => addTab(photoshootProjects, setPhotoshootProjects, setActivePhotoshootIndex, createNewPhotoshootProject)}
                        onCloseTab={(idx) => closeTab(idx, photoshootProjects, setPhotoshootProjects, activePhotoshootIndex, setActivePhotoshootIndex, createNewPhotoshootProject)}
                    />
                    <PhotoshootDirector 
                        project={photoshootProjects[activePhotoshootIndex]}
                        setProject={updatePhotoshootProject}
                        onRequestVideo={(img, shot) => handleOpenVideoFlow(img, `Commercial photoshoot of ${shot}`, 'dynamic_dolly', '1:1', 'Photoshoot Director')}
                    />
                </div>
            );
        case 'prompt_studio':
            return (
                <div className="flex flex-col w-full gap-4 animate-in fade-in duration-500">
                    <TabBar
                        projects={promptStudioProjects}
                        activeProjectIndex={activePromptStudioIndex}
                        onSelectTab={setActivePromptStudioIndex}
                        onAddTab={() => addTab(promptStudioProjects, setPromptStudioProjects, setActivePromptStudioIndex, createNewPromptStudioProject)}
                        onCloseTab={(idx) => closeTab(idx, promptStudioProjects, setPromptStudioProjects, activePromptStudioIndex, setActivePromptStudioIndex, createNewPromptStudioProject)}
                    />
                    <PromptStudio
                        project={promptStudioProjects[activePromptStudioIndex]}
                        setProject={updatePromptStudioProject}
                    />
                </div>
            );
        case 'voice_over_studio':
             return (
                <div className="flex flex-col w-full gap-4 animate-in fade-in duration-500">
                    <TabBar
                        projects={voiceOverProjects}
                        activeProjectIndex={activeVoiceOverIndex}
                        onSelectTab={setActiveVoiceOverIndex}
                        onAddTab={() => addTab(voiceOverProjects, setVoiceOverProjects, setActiveVoiceOverIndex, createNewVoiceOverStudioProject)}
                        onCloseTab={(idx) => closeTab(idx, voiceOverProjects, setVoiceOverProjects, activeVoiceOverIndex, setActiveVoiceOverIndex, createNewVoiceOverStudioProject)}
                    />
                    <VoiceOverStudio
                        project={voiceOverProjects[activeVoiceOverIndex]}
                        setProject={updateVoiceOverProject}
                    />
                </div>
            );
        case 'campaign_studio':
            return (
                <div className="flex flex-col w-full gap-4 animate-in fade-in duration-500">
                    <TabBar
                        projects={campaignProjects}
                        activeProjectIndex={activeCampaignIndex}
                        onSelectTab={setActiveCampaignIndex}
                        onAddTab={() => addTab(campaignProjects, setCampaignProjects, setActiveCampaignIndex, createNewCampaignProject)}
                        onCloseTab={(idx) => closeTab(idx, campaignProjects, setCampaignProjects, activeCampaignIndex, setActiveCampaignIndex, createNewCampaignProject)}
                    />
                    <CampaignStudio
                        project={campaignProjects[activeCampaignIndex]}
                        setProject={updateCampaignProject}
                    />
                </div>
            );
        case 'plan_studio':
            return (
                <div className="flex flex-col w-full gap-4 animate-in fade-in duration-500">
                    <TabBar
                        projects={planProjects}
                        activeProjectIndex={activePlanIndex}
                        onSelectTab={setActivePlanIndex}
                        onAddTab={() => addTab(planProjects, setPlanProjects, setActivePlanIndex, createNewPlanProject)}
                        onCloseTab={(idx) => closeTab(idx, planProjects, setPlanProjects, activePlanIndex, setActivePlanIndex, createNewPlanProject)}
                    />
                    <PlanStudio
                        project={planProjects[activePlanIndex]}
                        setProject={updatePlanProject}
                    />
                </div>
            );
        case 'storyboard_studio':
            return (
                <div className="flex flex-col w-full gap-4 animate-in fade-in duration-500">
                    <TabBar
                        projects={storyboardProjects}
                        activeProjectIndex={activeStoryboardIndex}
                        onSelectTab={setActiveStoryboardIndex}
                        onAddTab={() => addTab(storyboardProjects, setStoryboardProjects, setActiveStoryboardIndex, createNewStoryboardProject)}
                        onCloseTab={(idx) => closeTab(idx, storyboardProjects, setStoryboardProjects, activeStoryboardIndex, setActiveStoryboardIndex, createNewStoryboardProject)}
                    />
                    <StoryboardStudio
                        project={storyboardProjects[activeStoryboardIndex]}
                        setProject={updateStoryboardProject}
                        onRequestVideo={(scene, img, pr) => handleOpenVideoFlow(img, pr || scene?.visualPrompt, undefined, storyboardProjects[activeStoryboardIndex]?.aspectRatio, 'Storyboard Studio')}
                    />
                </div>
            );
        case 'marketing_studio':
            return (
                <div className="flex flex-col w-full gap-4 animate-in fade-in duration-500">
                    <TabBar
                        projects={marketingProjects}
                        activeProjectIndex={activeMarketingIndex}
                        onSelectTab={setActiveMarketingIndex}
                        onAddTab={() => addTab(marketingProjects, setMarketingProjects, setActiveMarketingIndex, createNewMarketingProject)}
                        onCloseTab={(idx) => closeTab(idx, marketingProjects, setMarketingProjects, activeMarketingIndex, setActiveMarketingIndex, createNewMarketingProject)}
                    />
                    <MarketingStudio
                        project={marketingProjects[activeMarketingIndex]}
                        setProject={updateMarketingProject}
                        onSendToVoiceover={(scriptText: string) => {
                            setVoiceOverProjects(prev => {
                                const current = [...prev];
                                current[activeVoiceOverIndex] = {
                                    ...current[activeVoiceOverIndex],
                                    text: scriptText
                                };
                                return current;
                            });
                            setView('voice_over_studio');
                        }}
                        onSendToVideoFlow={(videoPrompt: string, image?: any) => {
                            handleOpenVideoFlow(image, videoPrompt, 'zoom_in', '9:16', 'Marketing Studio');
                        }}
                    />
                </div>
            );
        case 'edit_studio':
            return (
                <div className="flex flex-col w-full gap-4 animate-in fade-in duration-500">
                    <TabBar
                        projects={editProjects}
                        activeProjectIndex={activeEditIndex}
                        onSelectTab={setActiveEditIndex}
                        onAddTab={() => addTab(editProjects, setEditProjects, setActiveEditIndex, createNewEditProject)}
                        onCloseTab={(idx) => closeTab(idx, editProjects, setEditProjects, activeEditIndex, setActiveEditIndex, createNewEditProject)}
                    />
                    <EditStudio
                        project={editProjects[activeEditIndex]}
                        setProject={updateEditProject}
                    />
                </div>
            );

        case 'social_hub_studio':
            return (
                <div className="flex flex-col w-full gap-4 animate-in fade-in duration-500">
                    <SocialHubManager
                        initialWork={socialEngineWork}
                        onOpenVideoFlow={(img, pr) => handleOpenVideoFlow(img, pr, 'orbit_360', '9:16', 'Social Hub')}
                        onOpenStudioWorks={() => setIsStudioWorksOpen(true)}
                    />
                </div>
            );

        default:
            return null;
    }
  }

  const NavItem = ({ label, targetView, isMobile }: { label: string, targetView: AppView, isMobile?: boolean }) => (
      <button 
        onClick={() => { setView(targetView); scrollToContent(); }}
        className={`${isMobile ? 'flex-shrink-0 px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} font-medium transition-colors border-b-2 ${view === targetView ? 'text-[var(--color-accent)] border-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-base)]'}`}
      >
          {label}
      </button>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center relative font-tajawal bg-[var(--color-background-base)]">
      <GoogleSignInModal
        isOpen={isGoogleSignInOpen}
        onClose={() => setIsGoogleSignInOpen(false)}
        onSuccess={(usr) => setGoogleUser(usr)}
      />

      <UserStudioWorksModal
        isOpen={isStudioWorksOpen}
        onClose={() => setIsStudioWorksOpen(false)}
        onSelectImageForEdit={handleSelectImageForEdit}
        onSelectPromptForCreator={handleSelectPromptForCreator}
        onOpenSocialEngine={handleOpenSocialEngine}
        onRequestVideoFlow={(img, pr) => handleOpenVideoFlow(img, pr, 'orbit_360', '9:16', 'Studio Works')}
      />

      <SocialEngineModal
        isOpen={isSocialEngineOpen}
        onClose={() => setIsSocialEngineOpen(false)}
        work={socialEngineWork}
        image={socialEngineWork?.image}
        initialPrompt={socialEngineWork?.prompt}
        onOpenSocialHub={() => {
          setView('social_hub_studio');
          scrollToContent();
        }}
      />

      <GoogleQuotaModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
      />

      <VideoFlowModal
        isOpen={isVideoFlowOpen}
        onClose={() => setIsVideoFlowOpen(false)}
        initialSourceImage={videoFlowInitialData.image}
        initialPrompt={videoFlowInitialData.prompt}
        initialCameraMotion={videoFlowInitialData.cameraMotion}
        initialAspectRatio={videoFlowInitialData.aspectRatio}
        sourceStudioTitle={videoFlowInitialData.sourceStudioTitle}
        initialHyperSocialDNA={videoFlowInitialData.hyperSocialDNA}
        onOpenSocialEngine={(url, pr) => handleOpenSocialEngine(null, null, pr)}
        onOpenQuotaModal={() => setIsQuotaModalOpen(true)}
      />

      {/* Full Capabilities Mobile Sidebar Drawer */}
      <MobileSidebarDrawer
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        activeView={view}
        onSelectView={(v) => {
          setView(v);
          scrollToContent();
        }}
        googleUser={googleUser}
        onOpenGoogleSignIn={() => setIsGoogleSignInOpen(true)}
        onOpenQuotaModal={() => setIsQuotaModalOpen(true)}
        onOpenVideoFlow={() => handleOpenVideoFlow(null, '', 'orbit_360', '9:16', 'Mobile Drawer')}
        onOpenStudioWorks={() => setIsStudioWorksOpen(true)}
        studioWorksCount={studioWorksCount}
        currentTheme={theme}
        onThemeChange={(th) => setTheme(th)}
      />

      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-[rgba(var(--color-background-base-rgb),0.85)] border-b border-[rgba(var(--color-text-base-rgb),0.1)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer overflow-hidden flex-shrink-0" onClick={() => window.scrollTo(0,0)}>
                <img src={LOGO_IMAGE_URL} alt="Fekra ai Logo" className="h-8 sm:h-10 w-auto transition-all flex-shrink-0"/>
                <div className="flex flex-col">
                  <span className="text-base sm:text-xl font-black text-[var(--color-accent)] tracking-tight whitespace-nowrap">
                    Fekra ai
                  </span>
                  <span className="text-[9px] text-[var(--color-text-secondary)] font-medium -mt-1 hidden sm:inline">
                    Business OS
                  </span>
                </div>
            </div>
            
            {/* Mobile Header Controls (Visible only on mobile: lg:hidden) */}
            <div className="flex lg:hidden items-center gap-1.5">
                {/* Mobile Quick Flow Video Button */}
                <button
                  onClick={() => handleOpenVideoFlow(null, '', 'orbit_360', '9:16', 'Mobile Header')}
                  className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-bold flex items-center gap-1 active:scale-95 shadow-sm"
                  title="توليد فيديو Flow (3 مجاناً)"
                >
                  <span>🎬</span>
                  <span>Flow</span>
                </button>

                {/* Mobile Quick Quota Button */}
                <button
                  onClick={() => setIsQuotaModalOpen(true)}
                  className="px-2 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 active:scale-95"
                  title="كوتة Google المتجددة"
                >
                  <span className="text-xs">⚡</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </button>

                {/* Mobile Hamburger Menu Button (Opens Full Capabilities Sidebar) */}
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="p-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 transition-all flex items-center justify-center active:scale-95 ml-0.5"
                  aria-label="فتح القائمة والقدرات الشاملة (السادبار)"
                >
                  <svg className="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
            </div>

            {/* Desktop Controls (Visible only on lg screens) */}
            <div className="hidden lg:flex items-center gap-2">
                <div className="flex items-center gap-1 overflow-x-auto">
                    <NavItem label="Creator Studio" targetView="creator_studio" />
                    <NavItem label="Storyboard" targetView="storyboard_studio" />
                    <NavItem label="Marketing" targetView="marketing_studio" />
                    <NavItem label="Photoshoot" targetView="photoshoot_director" />
                    <NavItem label="Edit" targetView="edit_studio" />
                    <NavItem label="Plan" targetView="plan_studio" />
                    <NavItem label="Campaign" targetView="campaign_studio" />
                    <NavItem label="Prompt" targetView="prompt_studio" />
                    <NavItem label="Voice Over" targetView="voice_over_studio" />
                    <NavItem label="Social Hub" targetView="social_hub_studio" />
                </div>

                {/* Flow Video Model Trigger Button */}
                <button
                  onClick={() => handleOpenVideoFlow(null, '', 'orbit_360', '9:16', 'Direct Navigation')}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-cyan-900/30 transition-all flex items-center gap-1.5 border border-cyan-400/40 active:scale-95 whitespace-nowrap"
                  title="فتح واجهة نموذج Flow لتوليد الفيديو (Google Veo)"
                >
                  <span className="text-sm">🎬</span>
                  <span>نموذج Flow</span>
                </button>

                {/* Social Hub Quick Switcher Button */}
                <button
                  onClick={() => { setView('social_hub_studio'); scrollToContent(); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-black shadow-md transition-all flex items-center gap-1.5 border border-white/20 active:scale-95 whitespace-nowrap ${
                    view === 'social_hub_studio'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-900/40'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="قالب إدارة وتكامل منصات التواصل الاجتماعي الموحد"
                >
                  <span>🌐</span>
                  <span>Social Hub</span>
                </button>

                {/* Google Quota & Engine Refresh Button */}
                <button
                  onClick={() => setIsQuotaModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
                  title="كوتة Google اليومية المتجددة وتنشيط النظام"
                >
                  <span className="text-amber-400">⚡</span>
                  <span>كوتة Google المتجددة</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </button>

                {/* Google User Profile Sign-In Badge */}
                {googleUser ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="px-2.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-emerald-500/40 text-white text-xs font-bold transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
                      title={`حساب Google: ${googleUser.email}`}
                    >
                      <img src={googleUser.avatar} alt="Google Avatar" className="w-5 h-5 rounded-full object-cover" />
                      <span className="hidden sm:inline text-xs text-white max-w-[90px] truncate">{googleUser.name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#14131f] border border-white/15 p-4 shadow-2xl z-50 animate-in fade-in duration-150 text-right" dir="rtl">
                        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                          <img src={googleUser.avatar} alt="Google Avatar" className="w-10 h-10 rounded-full object-cover border border-emerald-500/50" />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-black text-white block truncate">{googleUser.name}</span>
                            <span className="text-[10px] text-white/50 block font-mono truncate">{googleUser.email}</span>
                            <span className="text-[9px] text-emerald-400 font-bold">حساب Google نشط وموثق ✓</span>
                          </div>
                        </div>

                        <div className="py-2.5 space-y-1.5 text-xs text-white/70">
                          <div className="flex items-center justify-between text-[11px]">
                            <span>كوتة Google AI Studio:</span>
                            <span className="text-emerald-300 font-bold">متصلة تلقائياً ⚡</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span>رصيد فيديو Flow:</span>
                            <span className="text-cyan-300 font-bold">3 مجاناً يومياً 🎬</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/10 space-y-1.5">
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              setView('social_hub_studio');
                              scrollToContent();
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-bold transition-colors text-right flex items-center justify-between"
                          >
                            <span>🌐 إدارة منصات التواصل (Social Hub)</span>
                            <span>←</span>
                          </button>

                          <button
                            onClick={() => {
                              logoutGoogle();
                              setIsProfileDropdownOpen(false);
                              setIsGoogleSignInOpen(true);
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-rose-300 text-xs font-bold transition-colors text-right flex items-center justify-between"
                          >
                            <span>تبديل الحساب / تسجيل خروج</span>
                            <span>🚪</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsGoogleSignInOpen(true)}
                    className="px-3 py-1.5 rounded-full bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-black shadow-md transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
                  >
                    <GoogleGLogo />
                    <span>دخول بجوجل</span>
                  </button>
                )}

                {/* Persistent User Studio Portfolio Button */}
                <button
                  onClick={() => setIsStudioWorksOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-[var(--color-accent)] to-pink-500 hover:opacity-90 text-white text-xs font-black shadow-lg shadow-purple-900/30 transition-all flex items-center gap-1.5 border border-white/20 active:scale-95 whitespace-nowrap"
                  title="استوديو أعمالي المحفوظة"
                >
                  <span>🎨</span>
                  <span>استوديو أعمالي</span>
                  {studioWorksCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] text-white font-mono font-bold">
                      {studioWorksCount}
                    </span>
                  )}
                </button>
            </div>
        </div>
      </nav>

      {/* Hero Section with Responsive Mobile Sizing */}
      <section className="w-full max-w-7xl mx-auto px-4 pt-6 sm:pt-12 pb-8 sm:pb-12 flex flex-col justify-center min-h-[40vh] sm:min-h-[55vh] relative overflow-hidden">
           <div className="max-w-4xl relative z-10">
              <h1 className="text-3xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[1.05] sm:leading-[0.9] text-[var(--color-text-base)] break-words">
                 EASY & FAST<br/>
                 WAY TO<br/>
                 <Typewriter />
              </h1>
              <div className="mt-4 sm:mt-8 pl-3 sm:pl-4 border-l-4 border-[var(--color-accent)]">
                  <p className="text-sm sm:text-xl text-[var(--color-text-secondary)] max-w-xl leading-relaxed">
                    Transform your imagination into the perfect design photo with the power of Ai.
                  </p>
              </div>
              <div className="mt-6 sm:mt-10 flex flex-wrap gap-3 sm:gap-4">
                 <button 
                    onClick={scrollToContent}
                    className="w-full sm:w-auto bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg transition-transform transform hover:scale-105 flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20"
                 >
                    START CREATING <ArrowRightIcon />
                 </button>
                 <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="w-full sm:hidden py-2.5 px-5 rounded-full bg-white/10 hover:bg-white/15 border border-cyan-500/30 text-cyan-200 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                 >
                    <span>☰</span>
                    <span>استعراض كافة قدرات واستوديوهات Fekra</span>
                 </button>
              </div>
           </div>
           <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 pr-12 pointer-events-none">
                <div className="pointer-events-auto">
                    <InteractiveLogo />
                </div>
           </div>
      </section>
      
      {/* Swipeable Mobile Studio Strips */}
      <div className="lg:hidden sticky top-14 z-30 w-full bg-[rgba(var(--color-background-base-rgb),0.96)] backdrop-blur-md border-b border-[rgba(var(--color-text-base-rgb),0.1)] flex items-center justify-center gap-1 px-2 py-1.5">
           <button 
                onClick={() => scrollMobileNav('left')}
                className="p-1.5 rounded-full bg-[rgba(var(--color-text-base-rgb),0.05)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-base)] transition-colors shadow-sm"
             >
                <ChevronLeftIcon />
            </button>
            <div 
                ref={mobileNavRef}
                className="flex items-center gap-1.5 overflow-x-auto suggestions-scrollbar scroll-smooth mask-linear-fade flex-1 py-0.5"
            >
                <NavItem label="Creator" targetView="creator_studio" isMobile />
                <button
                    onClick={() => handleOpenVideoFlow(null, '', 'orbit_360', '9:16', 'Mobile Strip')}
                    className="flex-shrink-0 px-2.5 py-1 text-xs font-black rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 whitespace-nowrap flex items-center gap-1 shadow-sm"
                >
                    <span>🎬</span>
                    <span>فيديو Flow (3 مجاناً)</span>
                </button>
                <NavItem label="Storyboard" targetView="storyboard_studio" isMobile />
                <NavItem label="Marketing" targetView="marketing_studio" isMobile />
                <NavItem label="Photoshoot" targetView="photoshoot_director" isMobile />
                <NavItem label="Edit" targetView="edit_studio" isMobile />
                <NavItem label="Plan" targetView="plan_studio" isMobile />
                <NavItem label="Campaign" targetView="campaign_studio" isMobile />
                <NavItem label="Prompt" targetView="prompt_studio" isMobile />
                <NavItem label="Voice" targetView="voice_over_studio" isMobile />
                <NavItem label="Social Hub" targetView="social_hub_studio" isMobile />
            </div>
            <button 
                onClick={() => scrollMobileNav('right')}
                className="p-1.5 rounded-full bg-[rgba(var(--color-text-base-rgb),0.05)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-base)] transition-colors shadow-sm"
             >
                <ChevronRightIcon />
            </button>
      </div>

      <div ref={contentRef} className="w-full max-w-7xl flex-grow pt-4 sm:pt-8 pb-28 lg:pb-16 px-2 sm:px-4 z-10 overflow-hidden">
        {renderContent()}
        
        

        <footer className="w-full border-t border-[rgba(var(--color-text-base-rgb),0.1)] flex-shrink-0 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center gap-10 text-[var(--color-text-secondary)]">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  {/* WhatsApp Group Section */}
                  <div className="flex flex-col items-center gap-4 text-center">
                      <p className="text-sm font-bold text-[var(--color-text-medium)] uppercase tracking-widest">Keep Updated</p>
                      <a 
                        href="https://chat.whatsapp.com/ITpOHY73yToFJLxGz7ZyZq" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-[#25D366]/20 hover:scale-105 active:scale-95"
                      >
                        <WhatsAppIcon />
                        <span className="text-sm font-bold">جروب الواتس ودخول مجتمع Fekra ai</span>
                      </a>
                  </div>

                  {/* Collaboration Section */}
                  <div className="flex flex-col items-center gap-4 text-center">
                      <p className="text-sm font-bold text-[var(--color-text-medium)] uppercase tracking-widest">Business & Collaboration</p>
                      <div className="flex flex-col items-center gap-2">
                          <p className="text-xs font-medium">للتواصل والتعاون للشركات وشرح الأداة لفريقك</p>
                          <a 
                            href="https://wa.me/+201065414900" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 bg-white hover:bg-gray-100 text-emerald-600 px-8 py-4 rounded-2xl transition-all shadow-xl shadow-white/10 hover:scale-105 active:scale-95"
                          >
                            <WhatsAppIcon />
                            <span className="text-base font-black">اضغط هنا للتواصل</span>
                          </a>
                      </div>
                  </div>
              </div>

              <div className="flex justify-center items-center flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-white/5 w-full">
                  <div className="flex flex-col items-center gap-2">
                      <span className="font-bold text-[var(--color-accent)] text-xl tracking-wider">Fekra Ai Business OS</span>
                      <p className="text-xs font-medium opacity-60">
                         © {new Date().getFullYear()} Fekra Ai Solutions. All rights reserved.
                      </p>
                  </div>
              </div>

              <div className="text-center flex flex-col items-center gap-3">
                  <div className="space-y-1.5 opacity-60">
                      <p className="text-[11px] sm:text-sm font-medium leading-relaxed max-w-3xl">
                        تواصل معنا بشكل مباشر إذا واجهت أي مشكلة، عندك فكرة لتطويرها، أو شاركنا اهتمامك للاستمرار ❤️
                      </p>
                  </div>
              </div>

              {/* Recruitment Footer Bar */}
              <div className="w-full mt-8 pt-10 border-t border-white/5 bg-black/10 rounded-[3rem] p-8 flex flex-col items-center gap-6 shadow-inner animate-in fade-in duration-1000">
                  <div className="space-y-3 text-center">
                      <p className="text-sm sm:text-base font-bold text-white/90 leading-relaxed max-w-3xl mx-auto">
                        مرحب بالتعاون مع أي شركة أو مشروع يحتاج لتطوير الفريق لديه في أدوات الذكاء الاصطناعي والتدريب. يجب حجز موعد للقاء.
                      </p>
                      <p className="text-sm sm:text-base font-medium italic text-white/50 leading-relaxed max-w-3xl mx-auto">
                        Open for collaboration with any company or project looking to empower their team with AI tools and training. Please book an appointment for a meeting.
                      </p>
                  </div>
                  <a 
                    href="https://wa.me/+201065414900" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 bg-white text-black hover:bg-[var(--color-accent)] hover:text-white px-10 py-4 rounded-full transition-all shadow-2xl hover:scale-105 active:scale-95 font-black uppercase tracking-widest text-sm"
                  >
                    <WhatsAppIcon />
                    <span>Contact Us</span>
                  </a>
              </div>
          </div>
        </footer>
      </div>

      {/* Ergonomic Mobile Bottom Navigation Bar (Thumb-friendly) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090e17]/95 backdrop-blur-xl border-t border-cyan-500/20 px-2 py-1.5 flex items-center justify-around shadow-2xl" dir="rtl">
        <button
          onClick={() => { setView('creator_studio'); scrollToContent(); }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${view === 'creator_studio' ? 'text-cyan-400 font-bold scale-105' : 'text-white/60'}`}
        >
          <span className="text-lg">👑</span>
          <span className="text-[10px]">استوديو</span>
        </button>

        <button
          onClick={() => handleOpenVideoFlow(null, '', 'orbit_360', '9:16', 'Bottom Nav')}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all text-white/80 relative active:scale-95"
        >
          <span className="text-lg">🎬</span>
          <span className="text-[10px]">فلو فيديو</span>
          <span className="absolute -top-1 -right-1 px-1 rounded-full bg-emerald-500 text-[8px] text-white font-bold">
            3
          </span>
        </button>

        <button
          onClick={() => setIsQuotaModalOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all text-white/80 active:scale-95"
        >
          <span className="text-lg">⚡</span>
          <span className="text-[10px]">الكوتة</span>
        </button>

        <button
          onClick={() => setIsStudioWorksOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all text-white/80 relative active:scale-95"
        >
          <span className="text-lg">🎨</span>
          <span className="text-[10px]">أعمالي</span>
          {studioWorksCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1 rounded-full bg-purple-600 text-[8px] text-white font-mono font-bold">
              {studioWorksCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-cyan-300 bg-cyan-500/15 border border-cyan-400/40 active:scale-95 font-bold"
        >
          <span className="text-lg">☰</span>
          <span className="text-[10px]">السادبار</span>
        </button>
      </div>
    </div>
  );
}

export default App;
