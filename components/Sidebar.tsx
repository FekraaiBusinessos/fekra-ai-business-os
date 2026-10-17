import React from 'react';
import { AppView, GoogleUserProfile } from '../types';

interface SidebarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  googleUser: GoogleUserProfile | null;
  onOpenGoogleSignIn?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export interface UnifiedPhaseItem {
  phase: number;
  id: AppView;
  titleAr: string;
  titleEn: string;
  icon: string;
  badge: string;
  desc: string;
}

export const UNIFIED_6_PHASES: UnifiedPhaseItem[] = [
  {
    phase: 1,
    id: 'creator_studio',
    titleAr: '1. الأساس الإدراكي',
    titleEn: 'AI Foundation & 8K',
    icon: '🏛️',
    badge: 'Phase 1',
    desc: 'تأسيس المنشأة، هوية Brand DNA الثلاثية، والـ Face-Lock'
  },
  {
    phase: 2,
    id: 'omni_crm_studio',
    titleAr: '2. محرك المحادثة',
    titleEn: 'Conversation & Leads',
    icon: '💬',
    badge: 'Phase 2',
    desc: 'التفاوض البيعي، لهجات الإقناع، وإدارة خطوط العملاء'
  },
  {
    phase: 3,
    id: 'execution_erp_studio',
    titleAr: '3. ذراع التنفيذ والـ ERP',
    titleEn: 'Execution ERP & POS',
    icon: '⚡',
    badge: 'Phase 3',
    desc: 'المخزون اللحظي، كاشير POS، وفواتير ZATCA Phase 2'
  },
  {
    phase: 4,
    id: 'marketing_studio',
    titleAr: '4. محرك التسويق',
    titleEn: 'Marketing & Flow Veo',
    icon: '🎯',
    badge: 'Phase 4',
    desc: 'إنتاج إعلانات Product-Lock وفيديو Veo 3.1 مع هوك فيروسي'
  },
  {
    phase: 5,
    id: 'social_hub_studio',
    titleAr: '5. المحرك الاجتماعي',
    titleEn: 'Social & Webhooks',
    icon: '🌐',
    badge: 'Phase 5',
    desc: 'الربط الموحد لـ 9 منصات وأتمتة الردود والجدولة الذكية'
  },
  {
    phase: 6,
    id: 'business_brain_studio',
    titleAr: '6. العقل الاستراتيجي',
    titleEn: 'Business Brain & Admin',
    icon: '🧠',
    badge: 'Phase 6',
    desc: 'التحليل الجنائي، إدارة الصلاحيات العليا، وصناعة القرار'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  googleUser,
  onOpenGoogleSignIn,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const handleItemClick = (viewId: AppView) => {
    if (!googleUser && viewId !== 'home') {
      onOpenGoogleSignIn?.();
      return;
    }
    onSelectView(viewId);
  };

  return (
    <aside
      className={`hidden lg:flex fixed top-16 right-0 bottom-0 z-30 transition-all duration-300 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800/80 flex-col justify-between select-none shadow-2xl ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      dir="rtl"
    >
      {/* Top Header / Brand Title */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
            <span className="text-xs font-black text-white truncate tracking-tight">
              Fekra OS • المراحل الست
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition-colors mx-auto"
          title={isCollapsed ? 'توسيع السادبار' : 'تصغير السادبار'}
        >
          {isCollapsed ? '◀' : '▶'}
        </button>
      </div>

      {/* Main 6-Phase Navigation Items */}
      <div className="flex-1 py-3 px-2 overflow-y-auto space-y-1.5 scrollbar-none">
        {/* Home Item */}
        <button
          onClick={() => handleItemClick('home')}
          className={`w-full p-2.5 rounded-2xl transition-all flex items-center gap-3 border text-right cursor-pointer ${
            activeView === 'home'
              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-400/60 text-white shadow-lg'
              : 'bg-slate-900/60 border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          title="الرئيسية والباقات"
        >
          <span className="text-xl flex-shrink-0">🏠</span>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black tracking-tight truncate">الرئيسية والباقات</div>
              <div className="text-[10px] text-slate-500 truncate">نظرة عامة والاشتراكات</div>
            </div>
          )}
        </button>

        <div className="my-2 border-t border-slate-800/60" />

        {/* The 6 Immutable Phases */}
        {UNIFIED_6_PHASES.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full p-2.5 rounded-2xl transition-all flex items-center gap-3 border text-right cursor-pointer group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 border-cyan-400 text-white shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-900/40 border-transparent text-slate-400 hover:text-white hover:bg-slate-900/80 hover:border-slate-800'
              }`}
              title={item.titleAr}
            >
              <span className="text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black tracking-tight truncate">{item.titleAr}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      P{item.phase}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.desc}</div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom User / Security Status */}
      <div className="p-3 border-t border-slate-800/80">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-[11px] font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Multi-Tenant AES-256</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5 font-mono">Brand-Lock Score: 100%</div>
          </div>
        ) : (
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mx-auto" title="System Security Active" />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
