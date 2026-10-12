import React from 'react';
import { AppView, GoogleUserProfile } from '../types';
import { logoutGoogle } from '../services/googleAuthService';

export const VIEW_METADATA: Record<AppView, { ar: string; en: string; icon: string; phase?: string; desc: string }> = {
  creator_studio: {
    ar: 'استوديو التوليد السينمائي',
    en: 'Creator Studio',
    icon: '👑',
    phase: 'المرحلة 4',
    desc: 'محرك التوليد الموحد فائق الدقة بضغطة واحدة',
  },
  execution_erp_studio: {
    ar: 'المحاسبة والمخزون والـ ERP',
    en: 'Execution & ERP',
    icon: '⚡',
    phase: 'المرحلة 3',
    desc: 'إدارة المخزون اللحظي، الفواتير، وحساب الأرباح والعمولات',
  },
  business_brain_studio: {
    ar: 'العقل الاستراتيجي (Business Brain)',
    en: 'Business Brain Cockpit',
    icon: '🧠',
    phase: 'المرحلة 6',
    desc: 'غرفة القيادة المركزية وصناعة القرارات والتحليلات الشاملة',
  },
  integrations_vault_studio: {
    ar: 'خزينة المفاتيح والربط (API Vault)',
    en: 'Integrations & Keys Vault',
    icon: '🔒',
    phase: 'P0 أمني',
    desc: 'تشفير مفاتيح Gemini و Meta والربط الحي مع Google Drive',
  },
  social_hub_studio: {
    ar: 'منصات التواصل الموحدة (Social Hub)',
    en: 'Unified Social Hub',
    icon: '🌐',
    phase: 'المرحلة 5',
    desc: 'ربط وإدارة حسابات فيسبوك، تيك توك، وإنستغرام',
  },
  photoshoot_director: {
    ar: 'مخرج زوايا التصوير (Photoshoot)',
    en: 'Photoshoot Director',
    icon: '📷',
    phase: 'المرحلة 4',
    desc: 'إخراج زوايا وإضاءات التصوير السينمائي المتعددة',
  },
  marketing_studio: {
    ar: 'استوديو التسويق والحملات',
    en: 'Marketing Studio',
    icon: '🚀',
    phase: 'المرحلة 4',
    desc: 'صناعة الإعلانات الإبداعية وحملات السوشيال ميديا',
  },
  campaign_studio: {
    ar: 'صانع الحملات البصرية',
    en: 'Campaign Studio',
    icon: '🎯',
    phase: 'المرحلة 4',
    desc: 'صناعة الحملات الإعلانية المتكاملة وهندسة العروض',
  },
  storyboard_studio: {
    ar: 'ستوري بورد المشاهد الإعلانية',
    en: 'Storyboard Studio',
    icon: '🎞️',
    phase: 'المرحلة 2',
    desc: 'تسلسل المشاهد والقصص الإعلانية السينمائية',
  },
  edit_studio: {
    ar: 'تعديل وتوسيع الصور (Edit)',
    en: 'Edit Studio',
    icon: '✂️',
    phase: 'المرحلة 4',
    desc: 'تعديل التفاصيل، التوسيع الذكي، وإزالة العناصر',
  },
  plan_studio: {
    ar: 'مخطط المحتوى والجدولة (Plan)',
    en: 'Plan Studio',
    icon: '📅',
    phase: 'المرحلة 4',
    desc: 'جدولة خطط النشر والمحتوى الشهري',
  },
  prompt_studio: {
    ar: 'مختبر صياغة الأوامر (Prompt Lab)',
    en: 'Prompt Studio',
    icon: '💡',
    phase: 'المرحلة 1',
    desc: 'مختبر صياغة وتطوير الأوامر الإبداعية المعقدة',
  },
  voice_over_studio: {
    ar: 'استوديو التعليق الصوتي (Voice)',
    en: 'Voice Over Studio',
    icon: '🎙️',
    phase: 'المرحلة 2',
    desc: 'التعليق الصوتي بمختلف اللهجات العربية بنماذج Google',
  },
  controller_studio: {
    ar: 'قمرة التحكم (Controller)',
    en: 'Controller Studio',
    icon: '🎛️',
    phase: 'Phase 6',
    desc: 'قمرة التحكم في معايير النظام والمحركات',
  },
  video_flow_studio: {
    ar: 'نموذج Flow لتوليد الفيديو',
    en: 'Video Flow Studio',
    icon: '🎬',
    phase: 'Phase 4',
    desc: 'توليد لقطات فيديو سينمائية بمحرك Google Flow',
  },
  community_brain_studio: {
    ar: 'العقل التشاركي (Community Brain)',
    en: 'Community Brain',
    icon: '🌍',
    phase: 'Phase 6',
    desc: 'العقل التشاركي وتبادل المعرفة بين مستأجري المنصة',
  },
};

const PRIMARY_NAV_STUDIOS: AppView[] = [
  'creator_studio',
  'execution_erp_studio',
  'business_brain_studio',
  'integrations_vault_studio',
  'social_hub_studio',
  'photoshoot_director',
  'marketing_studio',
  'storyboard_studio',
  'edit_studio',
  'campaign_studio',
  'prompt_studio',
  'voice_over_studio',
];

interface UniversalNavBarProps {
  currentView: AppView;
  previousView: AppView | null;
  onNavigate: (view: AppView) => void;
  onBack: () => void;
  canGoBack: boolean;
  googleUser: GoogleUserProfile | null;
  onOpenGoogleSignIn: () => void;
}

export const UniversalNavBar: React.FC<UniversalNavBarProps> = ({
  currentView,
  previousView,
  onNavigate,
  onBack,
  canGoBack,
  googleUser,
  onOpenGoogleSignIn,
}) => {
  const currentMeta = VIEW_METADATA[currentView] || VIEW_METADATA.creator_studio;
  const prevMeta = previousView ? VIEW_METADATA[previousView] : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 mb-4 select-none" dir="rtl">
      {/* Top Floating Glass Control Strip */}
      <div className="p-3 sm:p-4 rounded-3xl bg-[#0e1326]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-3 transition-all duration-300">
        
        {/* ROW 1: Back Navigation, Breadcrumb, and Account Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          
          {/* Back Button & Breadcrumbs */}
          <div className="flex items-center gap-2 min-w-0">
            {canGoBack ? (
              <button
                type="button"
                onClick={onBack}
                className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-cyan-900/30 transition-all active:scale-95 flex items-center gap-2 group whitespace-nowrap cursor-pointer"
                title={`الرجوع إلى: ${prevMeta?.ar || 'الشاشة السابقة'}`}
              >
                <span className="text-base transition-transform group-hover:translate-x-0.5">→</span>
                <span>رجوع</span>
                {prevMeta && (
                  <span className="hidden md:inline text-[11px] font-bold text-white/80 max-w-[140px] truncate border-r border-white/20 pr-2 mr-1">
                    {prevMeta.icon} {prevMeta.en}
                  </span>
                )}
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-2xl bg-white/5 border border-white/5 text-white/40 text-xs font-bold flex items-center gap-1.5">
                <span>🏠</span>
                <span>الرئيسية</span>
              </div>
            )}

            {/* Quick Home Reset if not at root */}
            {currentView !== 'creator_studio' && (
              <button
                type="button"
                onClick={() => onNavigate('creator_studio')}
                className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs transition-all active:scale-95"
                title="العودة للاستوديو الرئيسي (Creator Studio)"
              >
                🏠
              </button>
            )}

            {/* Current View Indicator / Breadcrumb */}
            <div className="flex items-center gap-2 mr-1 min-w-0">
              <span className="text-lg flex-shrink-0">{currentMeta.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs sm:text-sm font-black text-white truncate">
                    {currentMeta.ar}
                  </h2>
                  {currentMeta.phase && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-black border border-cyan-500/30 font-mono hidden sm:inline">
                      {currentMeta.phase}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/50 block truncate hidden sm:block">
                  {currentMeta.desc}
                </span>
              </div>
            </div>
          </div>

          {/* User Auth & Profile Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 mr-auto">
            {googleUser ? (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
                <img
                  src={googleUser.avatar}
                  alt={googleUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-400/60"
                />
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-[11px] font-black text-white leading-tight max-w-[100px] truncate">
                    {googleUser.name}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono leading-tight">
                    موثق ✓
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => logoutGoogle()}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-[11px] font-black transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                  title="تسجيل الخروج الفوري"
                >
                  <span>🚪</span>
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenGoogleSignIn}
                className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-neutral-100 text-black text-xs font-black shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.88 0 12c0 2.12.45 3.86 1.24 5.42l4.04-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>دخول بجوجل</span>
              </button>
            )}
          </div>
        </div>

        {/* ROW 2: Responsive Fluid Studio Switcher Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 suggestions-scrollbar">
          {PRIMARY_NAV_STUDIOS.map((studioId) => {
            const meta = VIEW_METADATA[studioId];
            const isActive = currentView === studioId;
            return (
              <button
                key={studioId}
                type="button"
                onClick={() => onNavigate(studioId)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 via-[var(--color-accent)] to-cyan-500 text-white shadow-lg shadow-purple-900/40 border border-purple-400/40 font-black'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5'
                }`}
              >
                <span className="text-sm">{meta.icon}</span>
                <span>{meta.en}</span>
                {meta.phase && !isActive && (
                  <span className="text-[9px] text-white/40 hidden xl:inline">({meta.phase})</span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default UniversalNavBar;
