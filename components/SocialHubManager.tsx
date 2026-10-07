import React, { useState, useEffect } from 'react';
import { 
  SocialConnectedAccount, 
  SocialPlatformId, 
  SocialScheduledPost, 
  ImageFile,
  StudioWorkItem
} from '../types';
import { 
  getSocialAccounts, 
  connectSocialAccount, 
  disconnectSocialAccount, 
  togglePlatformAutoSync, 
  getScheduledPosts, 
  dispatchPostToPlatform,
  subscribeSocialChanges
} from '../services/socialConnectionsService';
import { smartEnhanceText } from '../services/geminiService';
import PlatformConnectModal from './PlatformConnectModal';

interface SocialHubManagerProps {
  initialWork?: StudioWorkItem | null;
  onOpenVideoFlow?: (image?: any, prompt?: string) => void;
  onOpenStudioWorks?: () => void;
}

export const SocialHubManager: React.FC<SocialHubManagerProps> = ({
  initialWork,
  onOpenVideoFlow,
  onOpenStudioWorks,
}) => {
  const [accounts, setAccounts] = useState<SocialConnectedAccount[]>(getSocialAccounts());
  const [activeTab, setActiveTab] = useState<'matrix' | 'composer' | 'calendar' | 'analytics'>('composer');
  
  // Composer state
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatformId[]>(['instagram', 'tiktok']);
  const [postText, setPostText] = useState(
    initialWork?.prompt 
      ? `تصميم وإبداع استثنائي: ${initialWork.prompt}\n\nنقدم لكم التجربة الأكثر تفرداً وتميزاً لإشعال علامتكم التجارية! ✨\n\n#فخامة #ابتكار #تسويق #FekraAI`
      : 'إطلاق حصري للمنتج الرائد الذي يجمع بين الدقة الاستثنائية والتصميم الفاخر. احصل على نسختك الآن واستفد من العرض المحدود! 🔥\n\n#فخامة #ابتكار #تجارة_إلكترونية #FekraAI'
  );
  const [activeMedia, setActiveMedia] = useState<ImageFile | null>(initialWork?.image || null);
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(
    new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16)
  );
  const [isEnhancingCopy, setIsEnhancingCopy] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);

  // Platform connect modal
  const [connectModalPlatform, setConnectModalPlatform] = useState<SocialPlatformId | null>(null);
  const [pendingActionAfterConnect, setPendingActionAfterConnect] = useState<boolean>(false);

  // Posts history
  const [postsList, setPostsList] = useState<SocialScheduledPost[]>(getScheduledPosts());

  useEffect(() => {
    const unsub = subscribeSocialChanges((updated) => {
      setAccounts(updated);
    });
    return unsub;
  }, []);

  const refreshPosts = () => {
    setPostsList(getScheduledPosts());
  };

  const handleTogglePlatformSelection = (id: SocialPlatformId) => {
    if (selectedPlatforms.includes(id)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const handleSelectAllPlatforms = () => {
    if (selectedPlatforms.length === accounts.length) {
      setSelectedPlatforms(['instagram']);
    } else {
      setSelectedPlatforms(accounts.map(a => a.id));
    }
  };

  const handleEnhanceCopy = async (tone: 'hook' | 'authority' | 'urgency') => {
    setIsEnhancingCopy(true);
    try {
      const directive = 
        tone === 'hook'
          ? 'صغ هوك إعلاني فيروسي مشوق جداً يجذب الانتباه في أول ثانيتين ويحفز التفاعل.'
          : tone === 'authority'
          ? 'صغ نصاً تسويقياً رفيع المستوى يعكس هيبة العلامة التجارية وموثوقيتها الفائقة.'
          : 'صغ نصاً تسويقياً يحفز اتخاذ القرار الفوري بأسلوب الندرة والعرض المحدود.';

      const result = await smartEnhanceText(
        `النص الحالي: ${postText}. ${directive}`,
        'campaign_vision'
      );
      if (result) {
        setPostText(result);
      }
    } catch (e) {
      console.error('Enhance copy error:', e);
    } finally {
      setIsEnhancingCopy(false);
    }
  };

  const handleExecuteMultiPublish = async (isScheduleMode: boolean = false) => {
    // Check if any selected platform is not connected yet
    const unconn = selectedPlatforms.find(pId => {
      const acc = accounts.find(a => a.id === pId);
      return !acc?.isConnected;
    });

    if (unconn) {
      // Auto-trigger sign in for this target platform!
      setConnectModalPlatform(unconn);
      setPendingActionAfterConnect(true);
      return;
    }

    setIsPublishing(true);
    setPublishFeedback(null);

    try {
      for (const pId of selectedPlatforms) {
        await dispatchPostToPlatform(pId, {
          caption: postText,
          image: activeMedia,
          scheduledTime: isScheduleMode ? scheduledDateTime : undefined,
        });
      }

      refreshPosts();
      setPublishFeedback(
        isScheduleMode 
          ? `تمت جدولة المنشور بنجاح على (${selectedPlatforms.length}) منصات في ${scheduledDateTime}!`
          : `تم النشر التلقائي المباشر بنجاح على (${selectedPlatforms.length}) منصات في وقت واحد! 🎉`
      );
      setTimeout(() => setPublishFeedback(null), 4000);
    } catch (e) {
      console.error('Multi publish error:', e);
      setPublishFeedback('حدث خطأ أثناء النشر، يرجى المحاولة ثانية.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePlatformConnectedSuccess = (connectedAcc: SocialConnectedAccount) => {
    setAccounts(getSocialAccounts());
    if (pendingActionAfterConnect) {
      setPendingActionAfterConnect(false);
      // Automatically continue the publish process!
      handleExecuteMultiPublish();
    }
  };

  const totalFollowersCount = '612.4K';
  const connectedCount = accounts.filter(a => a.isConnected).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300" dir="rtl">
      
      {/* Platform Connect Modal when login required */}
      <PlatformConnectModal
        isOpen={Boolean(connectModalPlatform)}
        platformId={connectModalPlatform}
        onClose={() => {
          setConnectModalPlatform(null);
          setPendingActionAfterConnect(false);
        }}
        onConnected={handlePlatformConnectedSuccess}
      />

      {/* Main Hub Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#171526] via-[#100f1c] to-[#0a0914] border border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">🌐</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                قالب إدارة وتكامل منصات التواصل الاجتماعي الموحد
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
                Omnichannel Hub
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed">
              اربط حساباتك الاجتماعية، وأدر منشوراتك وحملاتك، وانشر تلقائياً لجميع المنصات بضغطة واحدة مع محاكاة دقيقة واستجابة فورية.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-white/10 backdrop-blur-md self-stretch lg:self-auto justify-around">
            <div className="text-center px-3">
              <span className="text-xs text-white/40 block">المنصات المتصلة</span>
              <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                {connectedCount} / {accounts.length}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-3">
              <span className="text-xs text-white/40 block">إجمالي الجمهور المتاح</span>
              <span className="text-base sm:text-lg font-black text-purple-300 font-mono">
                {totalFollowersCount}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-3">
              <span className="text-xs text-white/40 block">المزامنة التلقائية</span>
              <span className="text-base sm:text-lg font-black text-cyan-300">
                نشطة ⚡
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('composer')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'composer'
                ? 'bg-gradient-to-r from-purple-600 to-[var(--color-accent)] text-white shadow-lg shadow-purple-900/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>✍️</span>
            <span>الناشر الموحد متعدد المنصات</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-gradient-to-r from-purple-600 to-[var(--color-accent)] text-white shadow-lg shadow-purple-900/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🔗</span>
            <span>شبكة الربط وحسابات المنصات ({connectedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-purple-600 to-[var(--color-accent)] text-white shadow-lg shadow-purple-900/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>📅</span>
            <span>التقويم وسجل المنشورات ({postsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-purple-600 to-[var(--color-accent)] text-white shadow-lg shadow-purple-900/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>📊</span>
            <span>التحليلات ومعدل التفاعل</span>
          </button>
        </div>
      </div>

      {publishFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-bold text-center animate-in fade-in duration-200 shadow-xl">
          {publishFeedback}
        </div>
      )}

      {/* --- TAB 1: OMNICHANNEL COMPOSER & MULTI-PUBLISHER --- */}
      {activeTab === 'composer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Composer Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Target Platforms Multi-Selector */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#111019] border border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-white">
                  اختر المنصات المراد النشر عليها تلقائياً:
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllPlatforms}
                  className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {selectedPlatforms.length === accounts.length ? 'إلغاء تحديد الكل' : 'تحديد جميع المنصات ✓'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {accounts.map(acc => {
                  const isSelected = selectedPlatforms.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleTogglePlatformSelection(acc.id)}
                      className={`p-2.5 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500 text-white shadow-md shadow-purple-900/20'
                          : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="text-lg">{acc.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">{acc.name}</span>
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${acc.isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span className="text-[9px] text-white/40 truncate">
                            {acc.isConnected ? 'متصل' : 'دخول مطلوب'}
                          </span>
                        </div>
                      </div>
                      {isSelected && <span className="text-purple-400 text-xs font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Copywriting Psychology Triggers */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#111019] border border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-purple-300">
                  ⚡ تحسين الكابشن بالذكاء الاصطناعي (AI Psychological Copywriting):
                </span>
                <span className="text-[10px] text-white/40">توليد فوري</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleEnhanceCopy('hook')}
                  disabled={isEnhancingCopy}
                  className="p-2.5 rounded-xl bg-pink-950/30 hover:bg-pink-900/40 border border-pink-500/30 text-pink-300 text-xs font-bold transition-all text-center flex flex-col items-center gap-1"
                >
                  <span>🪝 هوك فيروسي</span>
                  <span className="text-[9px] text-pink-300/60">Viral Catchy Hook</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEnhanceCopy('authority')}
                  disabled={isEnhancingCopy}
                  className="p-2.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all text-center flex flex-col items-center gap-1"
                >
                  <span>👑 سلطة وفخامة</span>
                  <span className="text-[9px] text-purple-300/60">Authority & Proof</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleEnhanceCopy('urgency')}
                  disabled={isEnhancingCopy}
                  className="p-2.5 rounded-xl bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all text-center flex flex-col items-center gap-1"
                >
                  <span>⏳ ندرة وعرض محدود</span>
                  <span className="text-[9px] text-amber-300/60">Urgency & Scarcity</span>
                </button>
              </div>
            </div>

            {/* Text Editor with Character Limit Indicators */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-white/80">نص المنشور الموحد (Unified Post Caption):</label>
                <div className="flex items-center gap-2 text-[10px] text-white/40">
                  <span>{postText.length} حرف</span>
                  {selectedPlatforms.includes('twitter') && (
                    <span className={postText.length > 280 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      X: {postText.length}/280
                    </span>
                  )}
                </div>
              </div>

              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows={6}
                className="w-full bg-[#111019] border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-white leading-relaxed focus:outline-none focus:border-purple-500 transition-all font-sans"
                placeholder="اكتب المحتوى الإعلاني الموحد هنا..."
              />
            </div>

            {/* Scheduling & Instant Multi-Publish Buttons */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#111019] border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">📅</span>
                  <span className="text-xs font-bold text-white">تحديد موعد النشر التلقائي:</span>
                </div>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="w-full sm:w-auto bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleExecuteMultiPublish(false)}
                  disabled={isPublishing || selectedPlatforms.length === 0}
                  className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-teal-900/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span>🚀</span>
                  <span>
                    {isPublishing
                      ? 'جارٍ النشر التلقائي المباشر...'
                      : `نشر فوري لجميع المنصات المحددة (${selectedPlatforms.length})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteMultiPublish(true)}
                  disabled={isPublishing || selectedPlatforms.length === 0}
                  className="py-3 px-5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-purple-900/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span>⏱️</span>
                  <span>جدولة الحملة</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Live Omnichannel Device Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-[#111019] border border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-white">
                  معاينة المنشور المباشرة (Omnichannel Live Simulation):
                </span>
                <span className="text-[10px] text-purple-300 font-bold">
                  {selectedPlatforms[0] || 'instagram'}
                </span>
              </div>

              {/* Media preview card */}
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black aspect-square flex items-center justify-center relative group">
                {activeMedia?.base64 ? (
                  <img
                    src={`data:${activeMedia.mimeType || 'image/png'};base64,${activeMedia.base64}`}
                    alt="Active post media"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-6 text-center space-y-2">
                    <span className="text-4xl text-white/30">🖼️</span>
                    <p className="text-xs text-white/50">لا توجد صورة محددة بعد</p>
                    <button
                      type="button"
                      onClick={onOpenStudioWorks}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/30 hover:bg-purple-600/50 transition-colors"
                    >
                      اختيار من استوديو أعمالي
                    </button>
                  </div>
                )}

                {activeMedia?.base64 && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => onOpenVideoFlow && onOpenVideoFlow(activeMedia, postText)}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg"
                    >
                      🎬 تحويل إلى فيديو Flow
                    </button>
                  </div>
                )}
              </div>

              {/* Caption preview snippet */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-black text-white">
                    F
                  </div>
                  <span className="font-bold text-white">@fekra_creator</span>
                  <span className="text-[10px] text-blue-400">✓</span>
                </div>
                <p className="text-white/80 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                  {postText}
                </p>
              </div>

              {/* Dispatch Ready Indicator */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
                <span>⚡</span>
                <span>جاهز للإرسال التلقائي عبر الـ API فور الضغط على زر النشر.</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- TAB 2: CONNECTED PLATFORMS MATRIX --- */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-black text-white">
              منصات التواصل الاجتماعي المدعومة وإعدادات الحسابات
            </h2>
            <span className="text-xs text-white/50">
              جميع الحسابات يتم تشفير مفاتيحها ومزامنتها لحظياً
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(account => (
              <div
                key={account.id}
                className={`rounded-3xl p-5 border transition-all relative overflow-hidden flex flex-col justify-between ${
                  account.isConnected
                    ? 'bg-[#12111d] border-purple-500/30 shadow-lg'
                    : 'bg-[#0f0e17] border-white/5 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="space-y-4">
                  {/* Card top */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${account.color} flex items-center justify-center text-2xl text-white shadow-lg`}>
                        {account.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                          <span>{account.name}</span>
                          {account.isConnected && <span className="text-blue-400 text-xs">✓</span>}
                        </h3>
                        <span className="text-[11px] text-white/50 block font-mono">
                          {account.handle}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                      account.isConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {account.isConnected ? 'متصل ✓' : 'غير متصل'}
                    </span>
                  </div>

                  {/* Card Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-white/5">
                    <div>
                      <span className="text-[10px] text-white/40 block">المتابعون / الجمهور:</span>
                      <span className="font-bold text-white font-mono">{account.followers}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block">الحد الأقصى للنص:</span>
                      <span className="font-bold text-white font-mono">{account.characterLimit} حرف</span>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/50 font-bold block">الصلاحيات المفوضة:</span>
                    <div className="flex flex-wrap gap-1">
                      {account.permissions.map((p, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 text-white/70">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  {account.isConnected ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          togglePlatformAutoSync(account.id);
                          setAccounts(getSocialAccounts());
                        }}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                          account.autoSync
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : 'bg-white/5 text-white/40 border-white/5'
                        }`}
                      >
                        {account.autoSync ? 'المزامنة مفعلة ✓' : 'المزامنة معطلة'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          disconnectSocialAccount(account.id);
                          setAccounts(getSocialAccounts());
                        }}
                        className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        إلغاء الربط
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConnectModalPlatform(account.id)}
                      className={`w-full py-2.5 px-3 rounded-xl bg-gradient-to-r ${account.color} text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-md transition-all active:scale-95`}
                    >
                      <span>{account.icon}</span>
                      <span>تسجيل الدخول وربط المنصة الآن</span>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: SCHEDULED POSTS & HISTORY CALENDAR --- */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-black text-white">
              سجل المنشورات المجدولة والمنشورة عبر الـ Omnichannel API
            </h2>
            <button
              type="button"
              onClick={refreshPosts}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
            >
              تحديث القائمة 🔄
            </button>
          </div>

          {postsList.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#111019] border border-white/10 space-y-3">
              <span className="text-4xl">📭</span>
              <h3 className="text-base font-bold text-white">لا توجد منشورات مجدولة حالياً</h3>
              <p className="text-xs text-white/50">
                قم بإنشاء منشور في تبويب "الناشر الموحد" ونشره أو جدولته ليظهر هنا مباشرة.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postsList.map(post => {
                const acc = accounts.find(a => a.id === post.platformId);
                return (
                  <div
                    key={post.id}
                    className="p-5 rounded-3xl bg-[#111019] border border-white/10 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{acc?.icon || '📱'}</span>
                          <span className="text-xs font-black text-white">{acc?.name}</span>
                          <span className="text-[10px] text-white/40 font-mono">({acc?.handle})</span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          post.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {post.status === 'published' ? 'منشور بنجاح ✓' : 'مجدول ⏱️'}
                        </span>
                      </div>

                      <p className="text-xs text-white/80 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                        {post.caption}
                      </p>

                      {post.image?.base64 && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                          <img
                            src={`data:${post.image.mimeType || 'image/png'};base64,${post.image.base64}`}
                            alt="Post thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
                      <span>{new Date(post.scheduledTime).toLocaleString('ar-EG')}</span>
                      {post.engagement && (
                        <div className="flex items-center gap-2 font-mono text-purple-300">
                          <span>❤️ {post.engagement.likes}</span>
                          <span>💬 {post.engagement.comments}</span>
                          <span>👥 {post.engagement.reach.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 4: ANALYTICS & AUDIENCE STATS --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#111019] border border-white/10 space-y-1">
              <span className="text-xs text-white/50">إجمالي مرات الظهور (Impressions)</span>
              <div className="text-2xl font-black text-white font-mono">1,842,500</div>
              <span className="text-[10px] text-emerald-400 font-bold">+24.5% هذا الأسبوع</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#111019] border border-white/10 space-y-1">
              <span className="text-xs text-white/50">معدل التفاعل العام (Engagement Rate)</span>
              <div className="text-2xl font-black text-purple-300 font-mono">6.4%</div>
              <span className="text-[10px] text-emerald-400 font-bold">أعلى من متوسط المجال بـ 2.1%</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#111019] border border-white/10 space-y-1">
              <span className="text-xs text-white/50">النقرات على الروابط والطلبات</span>
              <div className="text-2xl font-black text-cyan-300 font-mono">18,940</div>
              <span className="text-[10px] text-cyan-400 font-bold">عائد مباشر على المحتوى</span>
            </div>

            <div className="p-5 rounded-3xl bg-[#111019] border border-white/10 space-y-1">
              <span className="text-xs text-white/50">المنصة الأكثر نمواً</span>
              <div className="text-2xl font-black text-pink-400 font-mono">TikTok & Reels</div>
              <span className="text-[10px] text-pink-300 font-bold">نمو فيروسي عبر فيديوهات Flow</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SocialHubManager;
