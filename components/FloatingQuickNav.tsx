import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { VIEW_METADATA } from './UniversalNavBar';

interface FloatingQuickNavProps {
  currentView: AppView;
  previousView: AppView | null;
  canGoBack: boolean;
  onBack: () => void;
  onNavigate: (view: AppView) => void;
  onOpenMobileSidebar: () => void;
}

export const FloatingQuickNav: React.FC<FloatingQuickNavProps> = ({
  currentView,
  previousView,
  canGoBack,
  onBack,
  onNavigate,
  onOpenMobileSidebar,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const prevMeta = previousView ? VIEW_METADATA[previousView] : null;
  const currentMeta = VIEW_METADATA[currentView] || VIEW_METADATA.creator_studio;

  // Show floating bar whenever user has navigated away from root or scrolled down
  const shouldShow = canGoBack || isScrolled || currentView !== 'creator_studio';

  if (!shouldShow) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const QUICK_LINKS: AppView[] = [
    'creator_studio',
    'execution_erp_studio',
    'business_brain_studio',
    'integrations_vault_studio',
    'social_hub_studio',
    'marketing_studio',
    'storyboard_studio',
    'photoshoot_director',
  ];

  return (
    <>
      {/* Quick Jump Modal / Popover */}
      {isQuickMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          dir="rtl"
          onClick={() => setIsQuickMenuOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-[#0d1322] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <div>
                  <h3 className="text-sm font-black text-white">التبديل السريع بين شاشات Fekra AI</h3>
                  <span className="text-[10px] text-cyan-400 font-mono">انتقال انسيابي فوري بدون فقدان البيانات</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickMenuOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto suggestions-scrollbar">
              {QUICK_LINKS.map((viewId) => {
                const meta = VIEW_METADATA[viewId];
                const isActive = currentView === viewId;
                return (
                  <button
                    key={viewId}
                    type="button"
                    onClick={() => {
                      onNavigate(viewId);
                      setIsQuickMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-2xl text-right transition-all flex items-start gap-2 active:scale-95 border ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border-cyan-400 text-white font-black shadow-lg shadow-cyan-900/30'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-white/80 hover:text-white'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">{meta.icon}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">{meta.ar}</span>
                      <span className="text-[10px] text-white/40 block truncate">{meta.en}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsQuickMenuOpen(false);
                  onOpenMobileSidebar();
                }}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
              >
                <span>☰</span>
                <span>فتح القائمة الشاملة لجميع الاستوديوهات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Strip for All Devices */}
      <div 
        className="fixed bottom-16 lg:bottom-6 right-3 sm:right-6 z-40 flex items-center gap-2 select-none"
        dir="rtl"
      >
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0b101d]/90 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-black/80 transition-all duration-300 hover:border-cyan-400/60">
          
          {/* Universal Fluid Back Button */}
          {canGoBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-cyan-900/40 transition-all flex items-center gap-1.5 active:scale-95 group cursor-pointer"
              title={`الرجوع إلى: ${prevMeta?.ar || 'الشاشة السابقة'}`}
            >
              <span className="text-sm transition-transform group-hover:translate-x-0.5">↩</span>
              <span>رجوع</span>
              {prevMeta && (
                <span className="hidden md:inline text-[10px] font-bold text-white/90 max-w-[100px] truncate border-r border-white/20 pr-1.5 mr-0.5">
                  {prevMeta.ar}
                </span>
              )}
            </button>
          )}

          {/* Quick Home Button if not at root */}
          {currentView !== 'creator_studio' && (
            <button
              type="button"
              onClick={() => onNavigate('creator_studio')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 text-xs transition-all active:scale-95 cursor-pointer"
              title="العودة للاستوديو الرئيسي (Creator Studio)"
            >
              🏠
            </button>
          )}

          {/* Quick Switcher Button */}
          <button
            type="button"
            onClick={() => setIsQuickMenuOpen(true)}
            className="px-2.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            title="تبديل الشاشات السريع"
          >
            <span>⚡</span>
            <span className="hidden sm:inline">تبديل</span>
          </button>

          {/* Scroll to Top Button */}
          {isScrolled && (
            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-cyan-300 hover:text-cyan-200 border border-white/10 text-xs transition-all active:scale-95 cursor-pointer"
              title="الصعود للأعلى"
            >
              ↑
            </button>
          )}

        </div>
      </div>
    </>
  );
};

export default FloatingQuickNav;
