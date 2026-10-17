import React from 'react';
import { AppView, GoogleUserProfile } from '../types';
import { UNIFIED_6_PHASES } from './Sidebar';
import { logoutGoogle } from '../services/googleAuthService';

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
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
}

export const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  googleUser,
  onOpenGoogleSignIn,
  onOpenQuotaModal,
  onOpenStudioWorks,
  studioWorksCount
}) => {
  if (!isOpen) return null;

  const handleSelect = (view: AppView) => {
    if (!googleUser && view !== 'home') {
      onClose();
      onOpenGoogleSignIn();
      return;
    }
    onSelectView(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-start animate-in fade-in" dir="rtl">
      <div className="w-[85%] max-w-sm bg-slate-950 border-l border-slate-800 h-full p-5 flex flex-col justify-between overflow-y-auto">
        
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-sm font-black text-white">Fekra AI OS • المراحل الست</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
            >
              ✕
            </button>
          </div>

          {/* User Profile Mini Badge */}
          {googleUser ? (
            <div className="my-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={googleUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={googleUser.name}
                  className="w-8 h-8 rounded-full border border-cyan-400/50 object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{googleUser.name}</div>
                  <div className="text-[10px] text-cyan-400 font-mono truncate">{googleUser.email}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  logoutGoogle();
                  onClose();
                }}
                className="text-[10px] text-rose-400 hover:underline mr-1 font-bold"
              >
                خروج
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onClose();
                onOpenGoogleSignIn();
              }}
              className="my-4 w-full py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🔑</span>
              <span>تسجيل الدخول / إنشاء حساب</span>
            </button>
          )}

          {/* Main Navigation List: Home + 6 Immutable Phases */}
          <div className="space-y-1.5 mt-2">
            <button
              onClick={() => handleSelect('home')}
              className={`w-full p-3 rounded-2xl transition-all flex items-center gap-3 border text-right ${
                activeView === 'home'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-400 text-white font-bold'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
              }`}
            >
              <span className="text-lg">🏠</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black">الرئيسية والباقات</div>
                <div className="text-[10px] text-slate-500">معرض الأعمال والاشتراكات</div>
              </div>
            </button>

            <div className="my-2 border-t border-slate-800/80" />

            {UNIFIED_6_PHASES.map(item => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full p-3 rounded-2xl transition-all flex items-center gap-3 border text-right ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 border-cyan-400 text-white shadow-lg'
                      : 'bg-slate-900/50 border-slate-800/70 text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black truncate">{item.titleAr}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                        {item.badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions: Works & Quota */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                onClose();
                onOpenStudioWorks();
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center gap-1.5 font-bold"
            >
              <span>🎨 أعمالي</span>
              {studioWorksCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-600 text-[9px] text-white font-mono">
                  {studioWorksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenQuotaModal();
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 flex items-center justify-center gap-1.5 font-bold"
            >
              <span>⚡ كوتة Google</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-500 text-center font-mono">
            Fekra AI Business OS v8.0 • 100% Brand-Locked
          </div>
        </div>

      </div>
    </div>
  );
};

export default MobileSidebarDrawer;
