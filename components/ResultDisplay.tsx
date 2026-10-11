import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ImageFile } from '../types';
import SmartEnhanceButton from './SmartEnhanceButton';
import { 
  getVideoQuotaStatus, 
  WHATSAPP_BETA_URL, 
  PRIMARY_WHATSAPP_PHONE, 
  SECONDARY_WHATSAPP_PHONE, 
  WHATSAPP_BOOKING_MESSAGE, 
  VideoQuotaStatus 
} from '../services/quotaGuard';
import { 
  getUserGeminiKey, 
  setUserGeminiKey, 
  clearUserGeminiKey, 
  hasUserGeminiKey 
} from '../services/geminiService';
import WhatsAppButton, { WhatsAppIcon } from './WhatsAppButton';

interface ResultDisplayProps {
  imageFile: ImageFile | null;
  videoUrl?: string | null;
  isLoading: boolean;
  isVideoLoading?: boolean;
  videoProgress?: string | null;
  hadPermissionError?: boolean;
  onEdit?: (prompt: string) => void;
  isEditing?: boolean;
  onRequestVideo?: (image: ImageFile) => void;
  onGenerateVideoDirect?: () => void;
}

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const LoadingSpinner = ({ size = "h-16 w-16" }: { size?: string }) => (
  <div className="flex justify-center items-center h-full">
    <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 border-[var(--color-accent)]`}></div>
  </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  imageFile, 
  videoUrl,
  isLoading,
  isVideoLoading,
  videoProgress,
  hadPermissionError,
  onEdit,
  isEditing,
  onRequestVideo,
  onGenerateVideoDirect
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [localPrompt, setLocalPrompt] = useState('');
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'video'>('image');
  const [videoQuota, setVideoQuota] = useState<VideoQuotaStatus>(() => getVideoQuotaStatus());
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showKeyManager, setShowKeyManager] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keySaveFeedback, setKeySaveFeedback] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const refreshQuota = () => setVideoQuota(getVideoQuotaStatus());
    refreshQuota();
    window.addEventListener('fekra_quota_stats_updated', refreshQuota);
    window.addEventListener('fekra_api_key_updated', refreshQuota);
    return () => {
      window.removeEventListener('fekra_quota_stats_updated', refreshQuota);
      window.removeEventListener('fekra_api_key_updated', refreshQuota);
    };
  }, []);

  // When a videoUrl is newly generated, auto-switch to video tab
  useEffect(() => {
    if (videoUrl) {
      setActiveMediaTab('video');
    }
  }, [videoUrl]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullViewOpen(false);
      }
    };

    if (isFullViewOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isFullViewOpen]);

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `Fekra-Flow-Cinema-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = (resolution: '2k' | '4k') => {
    if (!imageFile) return;

    setIsDownloading(true);
    const img = new Image();
    img.src = `data:${imageFile.mimeType};base64,${imageFile.base64}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsDownloading(false);
        return;
      }

      const targetWidth = resolution === '4k' ? 4096 : 2048;
      const aspectRatio = img.width / img.height;
      
      canvas.width = targetWidth;
      canvas.height = targetWidth / aspectRatio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const link = document.createElement('a');
      link.download = `Fekra-AI-Result-${resolution}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsDownloading(false);
    };
    img.onerror = () => {
      setIsDownloading(false);
    };
  };

  const handleApplyEdit = () => {
    if (localPrompt.trim() && onEdit) {
      onEdit(localPrompt);
      setLocalPrompt('');
    }
  };

  const handleSaveCustomKey = () => {
    if (keyInput.trim()) {
      setUserGeminiKey(keyInput.trim());
      setKeySaveFeedback('تم حفظ المفتاح وتفعيل الكوتة غير المحدودة بنجاح! ✓');
      setTimeout(() => {
        setKeySaveFeedback(null);
        setShowKeyManager(false);
      }, 2000);
    }
  };

  const handleClearCustomKey = () => {
    clearUserGeminiKey();
    setKeyInput('');
    setKeySaveFeedback('تمت العودة لكوتة Fekra المجانية الافتراضية.');
    setTimeout(() => setKeySaveFeedback(null), 2000);
  };

  const hasBoth = Boolean(imageFile && videoUrl);
  const showVideo = (videoUrl && activeMediaTab === 'video') || (!imageFile && Boolean(videoUrl));

  return (
    <div className="w-full flex flex-col gap-4" dir="rtl">
      
      {/* Top Header: Free Trial Quota Ribbon & Media Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-1">
        
        {/* Media Selector Tabs (if both image and video exist) */}
        {hasBoth ? (
          <div className="inline-flex p-1 bg-black/40 border border-white/10 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setActiveMediaTab('image')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeMediaTab === 'image' 
                  ? 'bg-[var(--color-accent)] text-white shadow-md' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>🖼️</span>
              <span>الصورة الأصلية</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMediaTab('video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeMediaTab === 'video' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>🎬</span>
              <span>فيديو Flow السينمائي</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            </button>
          </div>
        ) : (
          <div className="text-[11px] font-bold text-white/50 flex items-center gap-1.5">
            <span>🎥</span>
            <span>مشغل الإخراج السينمائي الذكي (Fekra Video Player)</span>
          </div>
        )}

        {/* Free Trial Quota Pill & Custom Key Trigger */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-xl border text-[11px] font-black flex items-center justify-between sm:justify-start gap-2 ${
            videoQuota.hasCustomKey 
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' 
              : videoQuota.remainingToday > 1 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : videoQuota.remainingToday === 1 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${videoQuota.remainingToday > 0 || videoQuota.hasCustomKey ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>
              {videoQuota.hasCustomKey 
                ? 'كوتة الفيديو: مفتاح خاص غير محدود ✓' 
                : `كوتة الفيديو المجانية: ${videoQuota.remainingToday} من 3 محاولات`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyManager(!showKeyManager)}
            className="p-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold transition-all flex items-center gap-1"
            title="إدارة مفتاح Google AI الخاص بك"
          >
            <span>🔑</span>
            <span>{videoQuota.hasCustomKey ? 'تعديل المفتاح' : 'مفتاح خاص'}</span>
          </button>
        </div>

      </div>

      {/* Inline Custom API Key Manager Panel */}
      {showKeyManager && (
        <div className="p-3.5 rounded-2xl bg-black/60 border border-cyan-500/30 text-xs space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>🔑</span>
              <span>إدخال Google AI Studio API Key لتجاوز الحدود وتفعيل Veo:</span>
            </span>
            <button 
              type="button" 
              onClick={() => setShowKeyManager(false)} 
              className="text-white/40 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-[10px] text-white/60 leading-relaxed">
            مفتاح Google الافتراضي المجاني لا يملك صلاحية Veo (Permission Denied). إذا كان لديك مفتاح خاص من Google Cloud يدعم Veo، أدخله هنا لتفعيل التوليد المباشر.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              type="button"
              onClick={handleSaveCustomKey}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs transition-all"
            >
              حفظ وتفعيل
            </button>
            {hasUserGeminiKey() && (
              <button
                type="button"
                onClick={handleClearCustomKey}
                className="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs"
              >
                مسح المفتاح
              </button>
            )}
          </div>
          {keySaveFeedback && (
            <p className="text-[11px] font-bold text-emerald-300 animate-fadeIn">{keySaveFeedback}</p>
          )}
        </div>
      )}

      {/* Permission Denied Notice if encountered */}
      {hadPermissionError && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              مفتاح Google الافتراضي لا يمتلك صلاحية Veo (Permission Denied). قام محرك Flow Kinetic بإنتاج فيديو MP4 حقيقي كامل الحركة مجاناً.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowKeyManager(true)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[10px] font-bold whitespace-nowrap"
          >
            إدخال مفتاح مخصص
          </button>
        </div>
      )}

      {/* Main Result Area (Where "Result will appear here" was) */}
      <div className="w-full aspect-square bg-black/30 backdrop-blur-sm rounded-3xl flex items-center justify-center overflow-hidden relative border border-white/10 shadow-2xl group">
        
        {/* Loading Spinner for Image Generation or Editing */}
        {(isLoading || isEditing) && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
            <LoadingSpinner />
            <p className="mt-4 text-[11px] font-bold text-[var(--color-accent)] uppercase tracking-[0.2em] animate-pulse">
              {isEditing ? 'جاري تحسين وتعديل التصميم...' : 'جاري توليد الصورة بالذكاء الاصطناعي...'}
            </p>
          </div>
        )}

        {/* Loading Spinner for Video Generation (Fekra Flow Ultra Motion Engine) */}
        {isVideoLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/75 backdrop-blur-md p-6 text-center">
            <div className="relative w-20 h-20 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-blue-500/20 border-b-blue-400 animate-spin" style={{ animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                🎬
              </div>
            </div>
            <p className="text-sm font-black text-cyan-300 animate-pulse">
              {videoProgress || 'محرك Flow يقوم بإخراج المشهد وتوليد فيديو سينمائي حقيقي...'}
            </p>
            <p className="text-[11px] text-white/50 mt-1 max-w-xs">
              توليد حركة الكاميرا ثلاثية الأبعاد وضوء الاستوديو (Fekra Ultra Motion 4K)
            </p>
          </div>
        )}
        
        {/* Empty State: Result will appear here */}
        {!isLoading && !isEditing && !isVideoLoading && !imageFile && !videoUrl && (
          <div className="flex flex-col items-center gap-3 opacity-30 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-widest">Result will appear here</span>
          </div>
        )}

        {/* Video Player Display: Live Playable High-Definition Video */}
        {!isLoading && !isEditing && !isVideoLoading && showVideo && (
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={videoUrl!}
              autoPlay
              loop
              playsInline
              className="object-contain w-full h-full cursor-pointer"
              onClick={toggleVideoPlayback}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            />

            {/* Video Badges Overlay */}
            <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-black text-cyan-300 flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>FLOW 4K ULTRA MOTION</span>
            </div>

            {/* In-Player Video Controls Bar */}
            <div className="absolute bottom-3 left-3 right-3 p-2 rounded-2xl bg-black/85 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs transition-opacity group-hover:opacity-100 opacity-90">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleVideoPlayback}
                  className="p-1.5 px-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold transition-all flex items-center gap-1"
                >
                  {isVideoPlaying ? '⏸️' : '▶️'}
                  <span className="hidden sm:inline">{isVideoPlaying ? 'إيقاف' : 'تشغيل'}</span>
                </button>

                <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 text-[10px]">
                  {[0.5, 1, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => {
                        setPlaybackSpeed(spd);
                        if (videoRef.current) videoRef.current.playbackRate = spd;
                      }}
                      className={`px-1.5 py-0.5 rounded-lg transition-all ${
                        playbackSpeed === spd ? 'bg-cyan-500 text-black font-black' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadVideo}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <span>⬇️</span>
                  <span>تحميل MP4</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Static Image Display */}
        {!isLoading && !isEditing && !isVideoLoading && !showVideo && imageFile && (
          <div className="w-full h-full relative">
            <img 
              src={`data:${imageFile.mimeType};base64,${imageFile.base64}`} 
              alt="Generated Design" 
              className="object-contain w-full h-full cursor-pointer transition-transform duration-700 group-hover:scale-[1.02]"
              onClick={() => setIsFullViewOpen(true)}
            />
            {/* Overlay Hint */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
              <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white">
                اضغط للتكبير (Click to Enlarge)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quota Exhausted WhatsApp Beta Reservation CTA */}
      {!videoQuota.hasCustomKey && videoQuota.remainingToday <= 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-emerald-900/60 to-black border border-emerald-500/40 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 text-xl font-bold flex-shrink-0">
              <WhatsAppIcon />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">
                لقد استنفدت رصيد الـ 3 محاولات التجريبية المجانية لتوليد الفيديو!
              </h4>
              <p className="text-[11px] text-emerald-200/80">
                احجز مقعدك الآن في النسخة البيتا الخاصة لمنصة Fekra AI وتواصل مباشرة عبر واتساب لفتح الحساب الكامل وكوتة مفتوحة.
              </p>
            </div>
          </div>

          <WhatsAppButton
            label="احجز مقعدك في البيتا الخاصة وتواصل عبر واتساب"
            subLabel={`الرقم المباشر: ${PRIMARY_WHATSAPP_PHONE} | رسالة تلقائية`}
            className="w-full"
          />

          <div className="text-center pt-1">
            <span className="text-[10px] text-white/40">
              أو للتواصل التجاري البديل: {SECONDARY_WHATSAPP_PHONE}
            </span>
          </div>
        </div>
      )}

      {/* Action Controls for Image/Video */}
      {imageFile && !isLoading && !isEditing && (
        <div className="animate-in slide-in-from-bottom-2 duration-500 space-y-3">
          
          {/* Edit Section */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-[11px] font-bold text-white/50">تعديل التصميم بالذكاء الاصطناعي:</span>
              <SmartEnhanceButton
                currentText={localPrompt}
                onApplyText={(t) => setLocalPrompt(t)}
                context="image_edit_prompt"
                label="تحسين أمر التعديل"
              />
            </div>
            <div className="relative">
              <input 
                type="text"
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                placeholder="صف التعديل المطلوب على التصميم..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:border-[var(--color-accent)]/50 transition-all placeholder:text-white/20 text-right"
                onKeyDown={(e) => e.key === 'Enter' && handleApplyEdit()}
              />
              <button 
                onClick={handleApplyEdit}
                disabled={!localPrompt.trim()}
                className="absolute left-2 top-2 bottom-2 px-6 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white text-[10px] font-black rounded-xl transition-all disabled:opacity-0 shadow-lg shadow-[var(--color-accent)]/20"
              >
                تعديل
              </button>
            </div>
          </div>

          {/* Download 2K & 4K Buttons for Image */}
          <div className="flex gap-4">
            <button 
              onClick={() => handleDownload('2k')}
              disabled={isDownloading}
              className="flex-1 inline-flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold py-3.5 px-4 rounded-2xl transition-all disabled:opacity-50 text-xs tracking-tighter"
            >
              <DownloadIcon />
              تحميل صورة 2K
            </button>
            <button 
              onClick={() => handleDownload('4k')}
              disabled={isDownloading}
              className="flex-1 inline-flex items-center justify-center bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-bold py-3.5 px-4 rounded-2xl transition-all disabled:opacity-50 text-xs tracking-tighter shadow-lg shadow-[var(--color-accent)]/20"
            >
              <DownloadIcon />
              تحميل صورة 4K
            </button>
          </div>

          {/* Direct Video Generation Button & Modal Launchers */}
          <div className="flex flex-col sm:flex-row gap-2">
            {onGenerateVideoDirect && (
              <button 
                type="button"
                onClick={onGenerateVideoDirect}
                disabled={isVideoLoading || (!videoQuota.hasCustomKey && videoQuota.remainingToday <= 0)}
                className="flex-1 inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black py-3 px-4 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 text-xs tracking-wide gap-2 active:scale-98 disabled:opacity-50"
              >
                <span>🎬</span>
                <span>توليد فيديو سينمائي فوري (Flow MP4)</span>
              </button>
            )}

            {onRequestVideo && (
              <button 
                type="button"
                onClick={() => onRequestVideo(imageFile)}
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white/15 text-cyan-200 border border-cyan-500/30 font-black py-3 px-4 rounded-2xl transition-all text-xs tracking-wide gap-1.5 active:scale-98"
                title="فتح مخرج المشاهد لتحديد حركة الكاميرا والـ Hook والليبسينج"
              >
                <span>⚙️</span>
                <span>تخصيص الإخراج والـ Hook</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview */}
      {isFullViewOpen && imageFile && createPortal(
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-300 cursor-zoom-out"
          onClick={() => setIsFullViewOpen(false)}
        >
          <img
            src={`data:${imageFile.mimeType};base64,${imageFile.base64}`}
            alt="Full view result"
            className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl"
          />
          <button 
            onClick={() => setIsFullViewOpen(false)} 
            className="absolute top-6 left-6 text-white/50 hover:text-white transition-all p-3 bg-white/5 rounded-full hover:bg-white/10 backdrop-blur-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ResultDisplay;
