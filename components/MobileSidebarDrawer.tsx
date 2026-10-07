import React from 'react';
import { AppView, GoogleUserProfile } from '../types';
import { getVideoQuotaStatus, getDailyQuotaStatus, refreshSystemEngine } from '../services/quotaGuard';

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  googleUser: GoogleUserProfile | null;
  onOpenGoogleSignIn: () => void;
  onOpenQuotaModal: () => void;
  onOpenVideoFlow: () => void;
  onOpenStudioWorks: () => void;
  studioWorksCount: number;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const STUDIOS_LIST: Array<{
  id: AppView;
  titleAr: string;
  titleEn: string;
  icon: string;
  desc: string;
  badge?: string;
}> = [
  { id: 'creator_studio', titleAr: 'Creator Studio', titleEn: 'Product Photo Studio', icon: '👑', desc: 'تحويل صور المنتجات إلى لقطات احترافية 8K', badge: 'أساسي' },
  { id: 'photoshoot_director', titleAr: 'Photoshoot Director', titleEn: 'Camera & Angle Director', icon: '📷', desc: 'إخراج زوايا وإضاءات التصوير السينمائي' },
  { id: 'storyboard_studio', titleAr: 'Storyboard Studio', titleEn: 'Cinematic Storyboard', icon: '🎞️', desc: 'تسلسل المشاهد والقصص الإعلانية' },
  { id: 'marketing_studio', titleAr: 'Marketing Studio', titleEn: 'Ad Creative Studio', icon: '🚀', desc: 'صناعة الإعلانات وحملات منصات التواصل' },
  { id: 'campaign_studio', titleAr: 'Campaign Studio', titleEn: 'Campaign Visuals', icon: '🎯', desc: 'صناعة الحملات الإعلانية المتكاملة وهندسة العروض' },
  { id: 'social_hub_studio', titleAr: 'Social Hub Studio', titleEn: 'Unified Social Manager', icon: '🌐', desc: 'ربط وإدارة حسابات فيسبوك وتيك توك وإنستغرام', badge: 'جديد' },
  { id: 'edit_studio', titleAr: 'Edit Studio', titleEn: 'Image Manipulation', icon: '✂️', desc: 'تعديل التفاصيل، التوسيع، وإزالة العناصر' },
  { id: 'plan_studio', titleAr: 'Plan Studio', titleEn: 'Content Strategy Planner', icon: '📅', desc: 'جدولة خطط النشر والمحتوى الشهري' },
  { id: 'prompt_studio', titleAr: 'Prompt Studio', titleEn: 'Creative Prompt Lab', icon: '💡', desc: 'مختبر صياغة وتطوير الأوامر الإبداعية' },
  { id: 'voice_over_studio', titleAr: 'Voice Over Studio', titleEn: 'AI Voice Actor', icon: '🎙️', desc: 'التعليق الصوتي باللهجات العربية بنماذج Google' },
];

export const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  googleUser,
  onOpenGoogleSignIn,
  onOpenQuotaModal,
  onOpenVideoFlow,
  onOpenStudioWorks,
  studioWorksCount,
  currentTheme,
  onThemeChange,
}) => {
  if (!isOpen) return null;

  const videoQuota = getVideoQuotaStatus();
  const dailyQuota = getDailyQuotaStatus();

  const handleSelect = (view: AppView) => {
    onSelectView(view);
    onClose();
  };

  const handleRefreshClick = () => {
    refreshSystemEngine();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" dir="rtl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-[#0a0f1d] border-l border-cyan-500/20 text-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
                FAI
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-tight">Fekra AI OS</h3>
                <span className="text-[10px] text-cyan-400 font-mono">لوحة القدرات الشاملة</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm"
              aria-label="إغلاق القائمة"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll">
            
            {/* 1. Google Account Badge */}
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
              {googleUser ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={googleUser.avatar} alt="User" className="w-9 h-9 rounded-full object-cover border border-emerald-400/50" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{googleUser.name}</span>
                    <span className="text-[10px] text-emerald-400 block">حساب Google موثق ✓</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    👤
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">زائر (حساب مجاني)</span>
                    <span className="text-[10px] text-white/50 block">جميع الأدوات مفكوكة ومتاحة</span>
                  </div>
                </div>
              )}

              {!googleUser && (
                <button
                  onClick={() => { onClose(); onOpenGoogleSignIn(); }}
                  className="px-3 py-1.5 rounded-xl bg-white text-black text-[11px] font-bold hover:bg-neutral-200 transition-colors whitespace-nowrap"
                >
                  دخول
                </button>
              )}
            </div>

            {/* 2. Google Flow 3 Free Videos Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-blue-950/40 border border-cyan-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🎬</span>
                  <span className="text-xs font-black text-cyan-200">نموذج Flow (Google Veo)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {videoQuota.remainingToday} من 3 مجاناً
                </span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                3 فيديوهات إعلانية سينمائية مجانية يومياً تتجدد تلقائياً كل 24 ساعة.
              </p>
              <button
                onClick={() => { onClose(); onOpenVideoFlow(); }}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-900/30"
              >
                <span>🎬</span>
                <span>فتح واجهة توليد فيديو Flow</span>
              </button>
            </div>

            {/* 3. Google Quota & Daily Engine Card */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white/90">
                  <span className="text-amber-400">⚡</span>
                  <span>كوتة Google اليومية المتجددة</span>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono font-bold">
                  {dailyQuota.remainingToday} متاح
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${Math.max(5, 100 - dailyQuota.percentUsed)}%` }}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => { onClose(); onOpenQuotaModal(); }}
                  className="text-[11px] text-cyan-400 hover:underline font-bold"
                >
                  إدارة الكوتة والتفاصيل ↗
                </button>
                <button
                  onClick={handleRefreshClick}
                  className="text-[11px] text-white/60 hover:text-white flex items-center gap-1"
                  title="تنشيط المحرك ومسح الذاكرة"
                >
                  <span>🔄</span>
                  <span>إنعاش النظام</span>
                </button>
              </div>
            </div>

            {/* 4. Quick Actions: Studio Works Portfolio */}
            <button
              onClick={() => { onClose(); onOpenStudioWorks(); }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-purple-950/40 border border-purple-500/30 flex items-center justify-between text-right hover:border-purple-400/50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🎨</span>
                <div>
                  <span className="text-xs font-bold text-white block">استوديو أعمالي المحفوظة</span>
                  <span className="text-[10px] text-white/50 block">جميع التصاميم والفيديوهات التي ولدتها</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-mono font-bold text-purple-300">
                {studioWorksCount}
              </span>
            </button>

            {/* 5. Navigation: All 10 Studios */}
            <div className="space-y-1.5 pt-1">
              <div className="px-1 text-[11px] font-bold text-white/40 uppercase tracking-wider">
                استوديوهات ومحركات النظام (10)
              </div>

              <div className="space-y-1">
                {STUDIOS_LIST.map((studio) => {
                  const isActive = activeView === studio.id;
                  return (
                    <button
                      key={studio.id}
                      onClick={() => handleSelect(studio.id)}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-right transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-bold'
                          : 'bg-white/[0.02] hover:bg-white/[0.06] border border-transparent text-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base flex-shrink-0">{studio.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold block truncate">{studio.titleAr}</span>
                            {studio.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/30 text-purple-300 border border-purple-500/40 font-mono">
                                {studio.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-white/45 block truncate">{studio.desc}</span>
                        </div>
                      </div>
                      <span className="text-xs text-white/30 mr-1">←</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Settings & Support */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] text-white/60">المظهر (Theme):</span>
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => onThemeChange('dark')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${currentTheme === 'dark' ? 'bg-cyan-500 text-black' : 'text-white/60'}`}
                  >
                    🌙 داكن
                  </button>
                  <button
                    onClick={() => onThemeChange('light')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${currentTheme === 'light' ? 'bg-cyan-500 text-black' : 'text-white/60'}`}
                  >
                    ☀️ فاتح
                  </button>
                </div>
              </div>

              <a
                href="https://chat.whatsapp.com/ITpOHY73yToFJLxGz7ZyZq"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <span>💬</span>
                  <span>جروب مجتمع Fekra AI (واتساب)</span>
                </span>
                <span>↗</span>
              </a>
            </div>

          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10 bg-black/50 text-center text-[10px] text-white/40">
            Fekra AI Business OS v5.0 • تجربة هاتف فائقة السلاسة
          </div>

        </div>
      </div>
    </div>
  );
};

export default MobileSidebarDrawer;
