import React, { useState, useEffect } from 'react';
import { ImageFile, StudioWorkItem, SocialPlatformId, SocialConnectedAccount } from '../types';
import { smartEnhanceText } from '../services/geminiService';
import { 
  getSocialAccounts, 
  isPlatformConnected, 
  dispatchPostToPlatform,
  subscribeSocialChanges 
} from '../services/socialConnectionsService';
import PlatformConnectModal from './PlatformConnectModal';

export interface SocialEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  work?: StudioWorkItem | null;
  image?: ImageFile | null;
  initialPrompt?: string;
  onOpenSocialHub?: () => void;
}

export const SocialEngineModal: React.FC<SocialEngineModalProps> = ({
  isOpen,
  onClose,
  work,
  image,
  initialPrompt,
  onOpenSocialHub,
}) => {
  const [accounts, setAccounts] = useState<SocialConnectedAccount[]>(getSocialAccounts());
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatformId>('instagram');
  const [adCopy, setAdCopy] = useState<string>('');
  const [hashtags, setHashtags] = useState<string>('#فخامة #ابتكار #تجارة_إلكترونية #تسويق #FekraAI');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Auto-connect modal state
  const [connectModalPlatform, setConnectModalPlatform] = useState<SocialPlatformId | null>(null);
  const [pendingPublishAfterConnect, setPendingPublishAfterConnect] = useState<boolean>(false);

  const activeImage = image || work?.image;
  const activePrompt = initialPrompt || work?.prompt || 'منتج إعلاني فاخر عالي الجودة';

  useEffect(() => {
    const unsub = subscribeSocialChanges((updated) => {
      setAccounts(updated);
    });
    return unsub;
  }, []);

  const currentAccount = accounts.find(p => p.id === selectedPlatform) || accounts[0];

  // Generate initial platform-tailored copy on open
  useEffect(() => {
    if (isOpen) {
      const defaultHooks: Record<SocialPlatformId, string> = {
        instagram: 'سر الأناقة والفخامة الذي سيميز حضورك من أول نظرة ✨',
        tiktok: 'لو بتدور على التميز الحقيقي، لازم تشوف هذا المنتج قبل ما ينفذ! 🔥',
        youtube: 'شاهد التجربة الكاملة والفخامة غير المسبوقة في هذا العرض الحصري 🎬',
        twitter: 'الأصالة لا تحتاج إلى تبرير، بل إلى تجربة تتحدث عن نفسها. خيط تفصيلي 🧵👇',
        facebook: 'عرض حصري لفترة محدودة لمحبي الفخامة والجودة غير القابلة للمساومة.',
        linkedin: 'كيف تعيد الشركات الرائدة صياغة معايير الجودة والهوية التجارية الفاخرة؟',
        pinterest: 'إلهام لا ينتهي وتصميمات عصرية لمنزلك وأسلوب حياتك الفاخر 📌',
        threads: 'حوار مباشر حول مستقبل التصميم والابتكار العصري 🧵',
        whatsapp: 'مرحباً بك! يسعدنا تقديم أحدث إبداعاتنا الفاخرة لطلبك الفوري مع شحن مجاني 🛍️',
      };

      const hook = defaultHooks[selectedPlatform] || 'تصميم إعلاني راقٍ ومميز.';
      const sample = `${hook}\n\nنقدم لكم أرقى المواصفات والتصميمات المصممة خصيصاً للارتقاء بنشاطكم الإعلاني.\n\n🔗 اطلب الآن واستفد من العرض الحصري!\n\n${hashtags}`;
      setAdCopy(sample);
    }
  }, [isOpen, selectedPlatform]);

  if (!isOpen) return null;

  const handleGeneratePsychologicalCopy = async (tone: 'pain' | 'authority' | 'urgency') => {
    setIsGeneratingCopy(true);
    try {
      const toneDirective = 
        tone === 'pain' 
          ? `صِغ كابشن إعلاني لمنصة ${currentAccount.name} يركز على تضخيم ألم العميل إذا لم يقتنِ هذا المنتج وخوفه من إضاعة الفرصة والبدائل الرديئة.`
          : tone === 'authority'
          ? `صِغ كابشن إعلاني لمنصة ${currentAccount.name} بنبرة سلطة وإثبات اجتماعي ومكانة مرموقة (Prestige & Authority) تجعل المنتج الحل الأوحد الذي لا غنى عنه.`
          : `صِغ كابشن إعلاني لمنصة ${currentAccount.name} بأسلوب الندرة والإلحاح الشديد (Urgency & Scarcity) مع دعوة واضحة لاتخاذ القرار الآن.`;

      const generated = await smartEnhanceText(
        `الموضوع: ${activePrompt}. المنصة: ${currentAccount.name}. ${toneDirective}`,
        'campaign_vision'
      );

      if (generated) {
        setAdCopy(`${generated}\n\n${hashtags}`);
      }
    } catch (e) {
      console.warn('Fallback generating copy:', e);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleExecutePublish = async (isScheduledMode: boolean = false) => {
    // Check if the current target platform is connected
    if (!isPlatformConnected(selectedPlatform)) {
      // Automatic sign in required! Open connection modal automatically!
      setConnectModalPlatform(selectedPlatform);
      setPendingPublishAfterConnect(true);
      return;
    }

    setIsPublishing(true);
    try {
      const res = await dispatchPostToPlatform(selectedPlatform, {
        caption: adCopy,
        hashtags,
        image: activeImage,
        scheduledTime: isScheduledMode ? scheduledDate : undefined,
      });

      setNotification(
        isScheduledMode 
          ? `تمت جدولة المنشور بنجاح على ${currentAccount.name} في ${scheduledDate}!` 
          : `تم النشر التلقائي المباشر على ${currentAccount.name} بنجاح! الرابط: ${res.postUrl}`
      );
      setTimeout(() => setNotification(null), 4000);
    } catch (e) {
      console.error('Publish error:', e);
      setNotification('تعذر النشر، يرجى المحاولة لاحقاً.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePlatformConnectedSuccess = () => {
    setAccounts(getSocialAccounts());
    if (pendingPublishAfterConnect) {
      setPendingPublishAfterConnect(false);
      // Auto-continue publishing immediately
      handleExecutePublish();
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(adCopy);
    setNotification('تم نسخ الكابشن بنجاح!');
    setTimeout(() => setNotification(null), 2500);
  };

  const handleShareToWhatsApp = () => {
    const textEncoded = encodeURIComponent(`${adCopy}\n\n(تم إنشاؤه عبر منصة Fekra AI Business OS)`);
    window.open(`https://wa.me/?text=${textEncoded}`, '_blank');
  };

  const handleDownloadAsset = () => {
    if (!activeImage?.base64) return;
    const link = document.createElement('a');
    link.href = `data:${activeImage.mimeType || 'image/png'};base64,${activeImage.base64}`;
    link.download = `fekra-social-${currentAccount.id}-${Date.now().toString().slice(-4)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200" dir="rtl">
      
      {/* Auto-Connect Sign In Modal if platform is unauthenticated */}
      <PlatformConnectModal
        isOpen={Boolean(connectModalPlatform)}
        platformId={connectModalPlatform}
        onClose={() => {
          setConnectModalPlatform(null);
          setPendingPublishAfterConnect(false);
        }}
        onConnected={handlePlatformConnectedSuccess}
      />

      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col glass-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-gradient-to-b from-[#13121d] via-[#0b0a12] to-black">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-[var(--color-accent)] to-pink-500 flex items-center justify-center text-2xl text-white shadow-xl shadow-purple-900/30">
              🚀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  محرك النشر والتواصل الاجتماعي الموحد (Social Engine)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
                  Auto-Publish LIVE
                </span>
              </div>
              <p className="text-xs text-white/50">
                تسجيل الدخول التلقائي بحساب المنصة المستهدفة ونشر التصاميم بضغطة واحدة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onOpenSocialHub && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSocialHub();
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>🌐</span>
                <span>فتح قالب إدارة المنصات (Social Hub)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all text-sm font-bold border border-white/10"
            >
              ✕
            </button>
          </div>
        </div>

        {notification && (
          <div className="bg-emerald-600/30 border-y border-emerald-500/40 text-emerald-200 text-xs font-black px-4 py-2.5 text-center animate-in fade-in duration-150">
            {notification}
          </div>
        )}

        {/* Platform Selection Tabs */}
        <div className="px-5 py-3 border-b border-white/5 bg-black/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {accounts.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                selectedPlatform === p.id
                  ? 'bg-gradient-to-r from-purple-600 to-[var(--color-accent)] text-white shadow-lg shadow-purple-900/40'
                  : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-sm">{p.icon}</span>
              <span>{p.name}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${p.isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </button>
          ))}
        </div>

        {/* Main Workspace */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Copywriting & Scheduling Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Account connection status banner */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
              currentAccount.isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="text-base">{currentAccount.icon}</span>
                <div>
                  <span className="font-bold block">
                    {currentAccount.isConnected
                      ? `حساب ${currentAccount.name} متصل (${currentAccount.handle})`
                      : `حساب ${currentAccount.name} غير متصل حالياً`}
                  </span>
                  <span className="text-[10px] opacity-75">
                    {currentAccount.isConnected
                      ? 'النشر سيتم مباشرة بضغطة واحدة عبر الـ API الرسمي.'
                      : 'عند الضغط على نشر، سيتم تسجيل الدخول بالمنصة أوتوماتيكياً.'}
                  </span>
                </div>
              </div>

              {!currentAccount.isConnected && (
                <button
                  type="button"
                  onClick={() => setConnectModalPlatform(currentAccount.id)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 transition-all flex-shrink-0"
                >
                  تسجيل الدخول الآن ⚡
                </button>
              )}
            </div>

            {/* Psychology Triggers Toolbar */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-purple-300">
                  ⚡ محفزات علم النفس البيعي (Marketing Psychology Triggers):
                </span>
                <span className="text-[10px] text-white/40">توليد فوري ذكي</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleGeneratePsychologicalCopy('pain')}
                  disabled={isGeneratingCopy}
                  className="p-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-[11px] font-black transition-all flex flex-col items-center gap-1 text-center"
                >
                  <span className="text-base">🔥</span>
                  <span>تضخيم الألم</span>
                  <span className="text-[9px] text-rose-300/60 font-medium">Pain Amplification</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGeneratePsychologicalCopy('authority')}
                  disabled={isGeneratingCopy}
                  className="p-2.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 text-[11px] font-black transition-all flex flex-col items-center gap-1 text-center"
                >
                  <span className="text-base">👑</span>
                  <span>سلطة وإقناع</span>
                  <span className="text-[9px] text-purple-300/60 font-medium">Authority & Proof</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGeneratePsychologicalCopy('urgency')}
                  disabled={isGeneratingCopy}
                  className="p-2.5 rounded-xl bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30 text-amber-300 text-[11px] font-black transition-all flex flex-col items-center gap-1 text-center"
                >
                  <span className="text-base">⏳</span>
                  <span>ندرة وإلحاح</span>
                  <span className="text-[9px] text-amber-300/60 font-medium">Urgency & FOMO</span>
                </button>
              </div>
            </div>

            {/* Editable Copywriting Box */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-white/80">نص المنشور الإعلاني (Post Caption):</label>
                <span className="text-[10px] text-white/40">{adCopy.length} حرف</span>
              </div>
              <textarea
                value={adCopy}
                onChange={(e) => setAdCopy(e.target.value)}
                rows={6}
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-xs text-white leading-relaxed focus:outline-none focus:border-purple-500 transition-all font-sans"
                placeholder="اكتب أو ولّد الكابشن الإعلاني..."
              />
            </div>

            {/* Hashtags Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80">الوسوم الترويجية (Hashtags):</label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-purple-300 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Scheduling Controls */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <span className="text-xs font-bold text-white">جدولة وتوقيت النشر التلقائي:</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full sm:flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => handleExecutePublish(true)}
                  disabled={isPublishing}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all whitespace-nowrap shadow-lg shadow-purple-900/30 active:scale-95 disabled:opacity-50"
                >
                  حفظ الجدولة للنشر
                </button>
              </div>
            </div>

            {/* Omnichannel Dispatch Actions */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleExecutePublish(false)}
                disabled={isPublishing}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 active:scale-95 disabled:opacity-50"
              >
                <span>🚀</span>
                <span>
                  {isPublishing
                    ? 'جارٍ النشر...'
                    : `نشر تلقائي مباشر على ${currentAccount.name}`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>📋</span>
                <span>نسخ الكابشن</span>
              </button>

              <button
                type="button"
                onClick={handleShareToWhatsApp}
                className="px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#25D366]/20"
              >
                <span>💬</span>
                <span>واتساب</span>
              </button>

              {activeImage?.base64 && (
                <button
                  type="button"
                  onClick={handleDownloadAsset}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>⬇️</span>
                  <span>تحميل</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Device Mockup (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <span className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-2.5">
              Live Feed Preview ({currentAccount.name})
            </span>

            {/* Smartphone Mockup Frame */}
            <div className="w-full max-w-[320px] rounded-[2.5rem] p-3.5 bg-neutral-900 border-4 border-neutral-700 shadow-2xl relative overflow-hidden">
              <div className="w-24 h-4 bg-black rounded-b-xl mx-auto mb-3 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-neutral-800"></div>
              </div>

              {/* Feed Screen */}
              <div className="rounded-2xl bg-black overflow-hidden border border-white/5 text-white flex flex-col text-xs">
                
                {/* Platform Post Header */}
                <div className="p-2.5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-[var(--color-accent)] flex items-center justify-center text-[11px] font-black text-white">
                      F
                    </div>
                    <div>
                      <div className="font-bold text-[11px] flex items-center gap-1">
                        <span>{currentAccount.handle}</span>
                        <span className="text-blue-400 text-[10px]">✓</span>
                      </div>
                      <span className="text-[9px] text-white/40">Sponsored • مروّج</span>
                    </div>
                  </div>
                  <span className="text-white/40 text-xs">•••</span>
                </div>

                {/* Media Area */}
                <div className="aspect-square w-full bg-neutral-950 flex items-center justify-center overflow-hidden">
                  {activeImage?.base64 ? (
                    <img
                      src={`data:${activeImage.mimeType || 'image/png'};base64,${activeImage.base64}`}
                      alt="Post Media"
                      className="w-full h-full object-cover"
                    />
                  ) : work?.audio?.base64 ? (
                    <div className="p-4 text-center space-y-2">
                      <span className="text-4xl animate-pulse">🎙️</span>
                      <p className="text-[10px] text-purple-300 font-bold">تسجيل صوتي إعلاني</p>
                    </div>
                  ) : (
                    <span className="text-xs text-white/30">معاينة الصورة</span>
                  )}
                </div>

                {/* Social Interaction Buttons */}
                <div className="p-2.5 flex items-center justify-between border-b border-white/5 text-sm">
                  <div className="flex items-center gap-3">
                    <span>❤️</span>
                    <span>💬</span>
                    <span>↗️</span>
                  </div>
                  <span>🔖</span>
                </div>

                {/* Caption Snippet in Mockup */}
                <div className="p-2.5 space-y-1">
                  <p className="text-[10px] font-bold text-white">
                    1,429 likes
                  </p>
                  <p className="text-[10px] text-white/90 leading-relaxed line-clamp-3">
                    <span className="font-bold ml-1">{currentAccount.handle}</span>
                    {adCopy}
                  </p>
                  <span className="text-[9px] text-white/40 block">View all 84 comments</span>
                </div>
              </div>

              <div className="w-20 h-1 bg-white/20 rounded-full mx-auto mt-3"></div>
            </div>

            <p className="text-[10px] text-white/40 text-center mt-3">
              المعاينة تتطابق بدقة 100% مع أبعاد المنصة: {currentAccount.aspectRatioHint}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SocialEngineModal;
