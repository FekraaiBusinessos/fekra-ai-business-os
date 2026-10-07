import React, { useState, useEffect } from 'react';
import { CommunityThoughtItem, ImageFile } from '../types';
import { 
  getCommunityBrainItems, 
  publishWorkToCommunityBrain, 
  toggleLikeCommunityItem, 
  isItemLikedByUser, 
  incrementRemixCount,
  extractThinkingRationaleWithAI 
} from '../services/communityBrainService';

export interface CommunityBrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemixToCreatorStudio?: (prompt: string, image?: ImageFile | null) => void;
  onRemixToVideoFlow?: (prompt: string, image?: ImageFile | null) => void;
  prefillWorkToShare?: {
    title: string;
    prompt: string;
    image?: ImageFile;
    videoUrl?: string;
  } | null;
}

const INDUSTRIES = [
  { id: 'all', label: 'الكل', icon: '🌐' },
  { id: 'عطور', label: 'عطور فاخرة', icon: '👑' },
  { id: 'مطاعم', label: 'مطاعم وأغذية', icon: '🍔' },
  { id: 'SaaS', label: 'SaaS و ERP', icon: '💼' },
  { id: 'عقارات', label: 'عقارات وفلل', icon: '🏙️' },
  { id: 'عيادات', label: 'عيادات وتجميل', icon: '✨' },
  { id: 'أزياء', label: 'أزياء وموضة', icon: '👗' },
  { id: 'سيارات', label: 'سيارات فاخرة', icon: '🏎️' },
];

export const CommunityBrainModal: React.FC<CommunityBrainModalProps> = ({
  isOpen,
  onClose,
  onRemixToCreatorStudio,
  onRemixToVideoFlow,
  prefillWorkToShare = null,
}) => {
  const [items, setItems] = useState<CommunityThoughtItem[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Sharing / Feed Platform Dialog State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [sharePrompt, setSharePrompt] = useState('');
  const [shareIndustry, setShareIndustry] = useState('عطور شرقية وفاخرة');
  const [shareDialect, setShareDialect] = useState('سعودي معاصر');
  const [shareAuthor, setShareAuthor] = useState('');
  const [isAnalyzingThinking, setIsAnalyzingThinking] = useState(false);

  const refreshFeed = () => {
    const list = getCommunityBrainItems(selectedIndustry, searchQuery);
    setItems(list);
  };

  useEffect(() => {
    if (isOpen) {
      refreshFeed();
      if (prefillWorkToShare) {
        setShareTitle(prefillWorkToShare.title || '');
        setSharePrompt(prefillWorkToShare.prompt || '');
        setIsShareModalOpen(true);
      }
    }
  }, [isOpen, selectedIndustry, searchQuery, prefillWorkToShare]);

  useEffect(() => {
    const handleUpdate = () => refreshFeed();
    window.addEventListener('fekra_community_brain_updated', handleUpdate);
    return () => window.removeEventListener('fekra_community_brain_updated', handleUpdate);
  }, [selectedIndustry, searchQuery]);

  if (!isOpen) return null;

  const handleLike = (id: string) => {
    toggleLikeCommunityItem(id);
    refreshFeed();
  };

  const handleRemix = (item: CommunityThoughtItem, target: 'creator' | 'video') => {
    incrementRemixCount(item.id);
    refreshFeed();

    if (target === 'creator' && onRemixToCreatorStudio) {
      onRemixToCreatorStudio(item.prompt, item.image || null);
      setActionFeedback(`تم استيراد البرومبت والتفكير إلى Creator Studio! ✓`);
      setTimeout(() => {
        setActionFeedback(null);
        onClose();
      }, 1200);
    } else if (target === 'video' && onRemixToVideoFlow) {
      onRemixToVideoFlow(item.prompt, item.image || null);
      setActionFeedback(`تم استيراد البرومبت وسلسلة التفكير إلى Video Flow! ✓`);
      setTimeout(() => {
        setActionFeedback(null);
        onClose();
      }, 1200);
    }
  };

  const handleCopyPromptAndThinking = async (item: CommunityThoughtItem) => {
    const text = `🧠 البرومبت وسلسلة التفكير الإعلاني من مجتمع Fekra AI OS:
العنوان: ${item.title} (${item.industry})
الكاتب: ${item.authorName}

📝 البرومبت المعماري:
${item.prompt}

🎯 سيكولوجية الجمهور والـ Pain Point:
${item.thinking.audiencePainPointAr}

⚡ استراتيجية كسر التمرير (Scroll Stop):
${item.thinking.scrollStopStrategyAr}

🗣️ حركات البيع واللهجة:
${item.thinking.lipSyncAndGesturesAr || 'إيماءة ثقة وإشارة للسعر'}

📈 التوقع البيعي: ${item.thinking.estimatedConversionRate || '4.5% CTR'}`;

    try {
      await navigator.clipboard.writeText(text);
      setActionFeedback('تم نسخ البرومبت وسلسلة التفكير بالكامل! ✓');
      setTimeout(() => setActionFeedback(null), 2500);
    } catch {
      setActionFeedback('تم النسخ');
      setTimeout(() => setActionFeedback(null), 1500);
    }
  };

  const handlePublishWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharePrompt.trim()) return;

    setIsAnalyzingThinking(true);
    setActionFeedback('جاري تفكيك سلسلة التفكير الإعلاني عبر Gemini 3.1 Pro...');

    try {
      const thinking = await extractThinkingRationaleWithAI(
        sharePrompt,
        shareIndustry,
        prefillWorkToShare?.image
      );

      publishWorkToCommunityBrain({
        authorName: shareAuthor.trim() || 'صانع محتوى فكرة • Creator',
        authorAvatar: '💡',
        industry: shareIndustry,
        title: shareTitle.trim() || 'حملة إعلانية مبتكرة',
        prompt: sharePrompt.trim(),
        thinking,
        image: prefillWorkToShare?.image,
        videoUrl: prefillWorkToShare?.videoUrl,
        promptPowerScore: Math.floor(Math.random() * 5) + 95,
        scrollStopRating: Math.floor(Math.random() * 5) + 95,
        dialect: shareDialect,
        tags: [shareIndustry, shareDialect, 'مجتمع_فكرة'],
        isFeatured: false
      });

      setIsShareModalOpen(false);
      setShareTitle('');
      setSharePrompt('');
      refreshFeed();
      setActionFeedback('تمت تغذية المنصة بعملكم وسلسلة تفكيركم بنجاح! 🚀');
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      console.error(err);
      setActionFeedback('تعذر نشر العمل، يرجى المحاولة ثانية.');
      setTimeout(() => setActionFeedback(null), 3000);
    } finally {
      setIsAnalyzingThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto" dir="rtl">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-6xl bg-[#090d16] border-0 sm:border border-amber-500/25 rounded-none sm:rounded-[2rem] shadow-2xl p-3 sm:p-6 text-white overflow-hidden flex flex-col">
        
        {/* Glow ambient */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-amber-500/15 via-orange-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-br from-cyan-600/15 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 flex items-center justify-center text-xl sm:text-2xl shadow-lg shadow-orange-500/30 flex-shrink-0 animate-pulse">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black bg-gradient-to-r from-amber-300 via-white to-orange-200 bg-clip-text text-transparent">
                  العقل التشاركي وتغذية المنصة (Community Brain & Prompts)
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Collective Intelligence
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/50">
                استلهام الأعمال، تفكيك سلسلة التفكير الإعلاني (Chain of Thought)، وإعادة الإنتاج بنقرة واحدة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="py-2 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-black font-black text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/25 active:scale-95 transition-all whitespace-nowrap"
            >
              <span>✨</span>
              <span>شارك عملك وغذِّ المنصة</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 text-base font-bold transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Toast / Notification Banner */}
        {actionFeedback && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs text-center font-bold animate-fadeIn">
            {actionFeedback}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 flex-shrink-0">
          {/* Industry Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scroll">
            {INDUSTRIES.map(ind => (
              <button
                key={ind.id}
                type="button"
                onClick={() => setSelectedIndustry(ind.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                  selectedIndustry === ind.id
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-sm'
                    : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{ind.icon}</span>
                <span>{ind.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-64 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في البرومبتات وسلاسل التفكير..."
              className="w-full py-1.5 px-3 pl-8 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
            />
            <span className="absolute left-2.5 top-2 text-white/40 text-xs">🔍</span>
          </div>
        </div>

        {/* Content Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1 pr-1 custom-scroll pb-4">
          {items.map(item => {
            const isExpanded = expandedItemId === item.id;
            const isLiked = isItemLikedByUser(item.id);

            return (
              <div 
                key={item.id}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-3 shadow-lg hover:shadow-amber-950/20"
              >
                {/* Author & Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm">
                      {item.authorAvatar || '👤'}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">{item.authorName}</div>
                      <div className="text-[10px] text-white/50">{item.industry} {item.dialect ? `• ${item.dialect}` : ''}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <span>⚡ قوة البرومبت:</span>
                      <span>{item.promptPowerScore}/100</span>
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      كسر التمرير {item.scrollStopRating}%
                    </span>
                  </div>
                </div>

                {/* Title & Prompt Preview */}
                <div>
                  <h3 className="text-xs font-black text-amber-200 mb-1">{item.title}</h3>
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-[11px] text-white/80 font-mono leading-relaxed line-clamp-3">
                    {item.prompt}
                  </div>
                </div>

                {/* Chain of Thought Breakdown Accordion */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className="w-full py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-bold transition-all flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>🧠</span>
                      <span>سلسلة التفكير ومنطق العقل الإعلاني (Chain of Thought)</span>
                    </span>
                    <span>{isExpanded ? '▲ إخفاء' : '▼ استكشاف'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-3 rounded-xl bg-[#060a12] border border-amber-500/20 space-y-2.5 text-xs animate-fadeIn">
                      <div>
                        <span className="text-[10px] font-black text-amber-300 block">🎯 نقطة الألم النفسية للعميل المستهدف:</span>
                        <p className="text-[11px] text-white/80 leading-relaxed mt-0.5">{item.thinking.audiencePainPointAr}</p>
                      </div>

                      <div className="pt-1 border-t border-white/5">
                        <span className="text-[10px] font-black text-emerald-300 block">⚡ خطة كسر التمرير (Scroll Stop):</span>
                        <p className="text-[11px] text-white/80 leading-relaxed mt-0.5">{item.thinking.scrollStopStrategyAr}</p>
                      </div>

                      <div className="pt-1 border-t border-white/5">
                        <span className="text-[10px] font-black text-cyan-300 block">🎨 دستور الألوان والـ DNA:</span>
                        <p className="text-[11px] text-white/80 leading-relaxed mt-0.5">{item.thinking.dnaRulesSummaryAr}</p>
                      </div>

                      {item.thinking.lipSyncAndGesturesAr && (
                        <div className="pt-1 border-t border-white/5">
                          <span className="text-[10px] font-black text-pink-300 block">👄 سر الليبسينج وحركات البيع:</span>
                          <p className="text-[11px] text-white/80 leading-relaxed mt-0.5">{item.thinking.lipSyncAndGesturesAr}</p>
                        </div>
                      )}

                      <div className="pt-1 border-t border-white/5">
                        <span className="text-[10px] font-black text-purple-300 block">📈 التوقع البيعي:</span>
                        <span className="text-[11px] text-white/80 font-bold">{item.thinking.estimatedConversionRate || '4.2% CTR'}</span>
                      </div>

                      {item.thinking.reasoningStepsAr && item.thinking.reasoningStepsAr.length > 0 && (
                        <div className="pt-1 border-t border-white/5">
                          <span className="text-[10px] font-black text-white/50 block mb-1">خطوات تفكير المخرج:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-[10px] text-white/70">
                            {item.thinking.reasoningStepsAr.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleLike(item.id)}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                        isLiked 
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' 
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <span>❤️</span>
                      <span>{item.likesCount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyPromptAndThinking(item)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs transition-all flex items-center gap-1"
                      title="نسخ البرومبت وسلسلة التفكير"
                    >
                      <span>📋</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onRemixToCreatorStudio && (
                      <button
                        type="button"
                        onClick={() => handleRemix(item, 'creator')}
                        className="py-1.5 px-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                      >
                        <span>🎨</span>
                        <span>إلى استوديو الصور</span>
                      </button>
                    )}

                    {onRemixToVideoFlow && (
                      <button
                        type="button"
                        onClick={() => handleRemix(item, 'video')}
                        className="py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-black text-xs font-black transition-all flex items-center gap-1 active:scale-95"
                      >
                        <span>🎬</span>
                        <span>إلى فيديو Flow</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Share / Feed Dialog Modal */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" dir="rtl">
            <div className="relative w-full max-w-lg bg-[#0c121d] border border-amber-500/30 rounded-3xl p-5 shadow-2xl text-white space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌟</span>
                  <h3 className="text-sm font-black text-amber-300">
                    مشاركة العمل وتغذية المنصة وسلسلة التفكير
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1.5 text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePublishWork} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-1">عنوان الحملة أو المنتج:</label>
                  <input
                    type="text"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    placeholder="مثال: إعلان عطر العود الملكي مع خطاف الدخان"
                    required
                    className="w-full p-2.5 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-white/70 block mb-1">النشاط التجاري:</label>
                    <select
                      value={shareIndustry}
                      onChange={(e) => setShareIndustry(e.target.value)}
                      className="w-full p-2.5 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="عطور شرقية وفاخرة">عطور شرقية وفاخرة</option>
                      <option value="مطاعم وأغذية">مطاعم وأغذية</option>
                      <option value="SaaS و ERP">SaaS و ERP</option>
                      <option value="عقارات وفلل فاخرة">عقارات وفلل فاخرة</option>
                      <option value="عيادات ومراكز تجميل">عيادات ومراكز تجميل</option>
                      <option value="أزياء وإكسسوارات">أزياء وإكسسوارات</option>
                      <option value="سيارات وخدمات متميزة">سيارات وخدمات متميزة</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-white/70 block mb-1">اللهجة الإعلانية:</label>
                    <select
                      value={shareDialect}
                      onChange={(e) => setShareDialect(e.target.value)}
                      className="w-full p-2.5 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="سعودي معاصر">سعودي معاصر</option>
                      <option value="مصري حماسي">مصري حماسي</option>
                      <option value="خليجي فخم">خليجي فخم</option>
                      <option value="شامي مرح">شامي مرح</option>
                      <option value="عالمي فصحى">عالمي فصحى</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-1">اسمك أو اسم الوكالة (اختياري):</label>
                  <input
                    type="text"
                    value={shareAuthor}
                    onChange={(e) => setShareAuthor(e.target.value)}
                    placeholder="مثال: م. سلطان • Creative Lead"
                    className="w-full p-2.5 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-1">البرومبت المعماري التوليدي:</label>
                  <textarea
                    value={sharePrompt}
                    onChange={(e) => setSharePrompt(e.target.value)}
                    rows={4}
                    required
                    placeholder="أدخل البرومبت بالإنجليزية أو العربية..."
                    className="w-full p-2.5 bg-black/60 border border-white/15 rounded-xl text-white font-mono leading-relaxed focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                  ℹ️ سيقوم نموذج Gemini 3.1 Pro تلقائياً بتفكيك "سلسلة التفكير الإعلاني" واستخلاص استراتيجية كسر التمرير وسيكولوجية العميل لتغذية المنصة.
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzingThinking}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-black font-black text-xs shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isAnalyzingThinking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>جاري تفكيك سلسلة التفكير والنشر للمجتمع...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>نشر العمل وتغذية العقل التشاركي للمنصة</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CommunityBrainModal;
