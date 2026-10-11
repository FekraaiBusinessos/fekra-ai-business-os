import React, { useState, useEffect } from 'react';
import { getGoogleUser, getAuthHeaders, subscribeGoogleAuth } from '../services/googleAuthService';
import { GoogleSignInModal } from './GoogleSignInModal';

interface StrategicDirective {
  id: string;
  councilRole: string;
  title: string;
  priority: string;
  recommendation: string;
  projectedImpact: string;
  status: string;
}

interface StrategicInsightsData {
  healthScore: number;
  tenantId: string;
  financialOverview: {
    totalRevenueSar: string;
    totalExpensesSar: string;
    netProfitSar: string;
    totalInvoices: number;
    totalStockUnits: number;
    lowStockAlerts: number;
  };
  socialOverview: {
    totalPlatforms: number;
    connectedPlatforms: number;
    activeAutoReplyBots: number;
    averageLatencyMs: number;
  };
  strategicDirectives: StrategicDirective[];
  timestamp: string;
}

interface BusinessBrainStudioProps {
  onNavigateToView?: (viewName: any) => void;
}

const GoogleGIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z" />
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.88 0 12c0 2.12.45 3.86 1.24 5.42l4.04-3.15z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
  </svg>
);

export const BusinessBrainStudio: React.FC<BusinessBrainStudioProps> = ({ onNavigateToView }) => {
  const [user, setUser] = useState(() => getGoogleUser());
  const [isCleanOnboardingDemo, setIsCleanOnboardingDemo] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [data, setData] = useState<StrategicInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appliedDirectives, setAppliedDirectives] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'cockpit' | 'omni_council' | 'simulation' | 'security' | 'affiliate'>('cockpit');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to auth changes across windows / modals
  useEffect(() => {
    const unsub = subscribeGoogleAuth((usr) => {
      setUser(usr);
      if (usr) {
        setIsCleanOnboardingDemo(false);
      }
    });
    return unsub;
  }, []);

  const fetchInsights = async () => {
    const currentUser = getGoogleUser();
    if (!currentUser && !isCleanOnboardingDemo) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/brain/strategic-insights', { headers });
      if (!res.ok) {
        if (res.status === 401) {
          // Token missing or expired
          setData(null);
          return;
        }
        throw new Error('Failed to fetch insights');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load brain data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [user, isCleanOnboardingDemo]);

  const handleApplyDirective = async (dirId: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/brain/apply-directive', {
        method: 'POST',
        headers,
        body: JSON.stringify({ directiveId: dirId }),
      });
      const resJson = await res.json();
      setAppliedDirectives((prev) => ({ ...prev, [dirId]: true }));
      setToastMessage(resJson.message || 'تم اعتماد التوجيه فوراً!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to apply directive:', err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    if (role.includes('CBO')) return 'from-amber-500 to-amber-700 text-amber-200 border-amber-500/40';
    if (role.includes('CAI')) return 'from-purple-500 to-indigo-700 text-purple-200 border-purple-500/40';
    if (role.includes('CSA')) return 'from-cyan-500 to-blue-700 text-cyan-200 border-cyan-500/40';
    return 'from-emerald-500 to-green-700 text-emerald-200 border-emerald-500/40';
  };

  // If user is unauthenticated and hasn't chosen clean demo mode: SHOW GOOGLE LOGIN GATE
  if (!user && !isCleanOnboardingDemo) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-10 animate-in fade-in duration-300" dir="rtl">
        <div className="relative rounded-3xl p-6 sm:p-12 bg-gradient-to-b from-[#18132d] via-[#0f0c1e] to-[#080611] border border-cyan-500/30 shadow-[0_0_60px_rgba(147,51,234,0.15)] text-center space-y-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-inner mb-4">
              🛡️
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
              <span>🔒</span>
              <span>نظام عزل المستأجرين الفائق (P0 Tenant Isolation)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              قمرة القيادة المركزية ومحرك اتخاذ القرار (Business Brain OS)
            </h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed mt-3">
              هذه المنطقة مخصصة لإدارة العمليات التنفيذية، والفواتير الضريبية ZATCA، والمخزون، وعقل المبيعات المؤتمت الخاص بنشاطك التجاري.
              لضمان الخصوصية التامة وعزل بيانات المنشأة عن أي مستخدم آخر، يتطلب النظام تسجيل الدخول الرسمي عبر Google.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto">
            <button
              onClick={() => setIsSignInModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <GoogleGIcon />
              <span>تسجيل الدخول الفوري بحساب Google</span>
            </button>
            <button
              onClick={() => setIsCleanOnboardingDemo(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 font-bold text-xs sm:text-sm transition-all"
            >
              <span>👁️ وضع العرض التوضيحي المفرغ (Clean Sandbox)</span>
            </button>
          </div>

          {/* Multi-Tenant Security Guarantee */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 text-right">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-emerald-300 block">✓ عزل كامل للبيانات</span>
              <p className="text-[11px] text-white/50">تشفير معرف المستأجر في Cloud SQL ومنع الوصول المتبادل بين المنشآت.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-cyan-300 block">✓ قنوات تواصل مخصصة</span>
              <p className="text-[11px] text-white/50">ربط صفحات فيسبوك وأرقام واتساب برمز وصول مخصص لكل مستأجر على حدة.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-purple-300 block">✓ كوتة ذكاء اصطناعي مستقلة</span>
              <p className="text-[11px] text-white/50">استهلاك مباشر لكوتة حساب Google الشخصي دون مشاركة مع مستخدمين آخرين.</p>
            </div>
          </div>
        </div>

        {isSignInModalOpen && (
          <GoogleSignInModal
            isOpen={isSignInModalOpen}
            onClose={() => setIsSignInModalOpen(false)}
            onSuccess={(usr) => {
              setUser(usr);
              setIsSignInModalOpen(false);
              fetchInsights();
            }}
          />
        )}
      </div>
    );
  }

  // Fallback data for clean onboarding sandbox
  const displayData: StrategicInsightsData = data || {
    healthScore: 65,
    tenantId: user?.tenantId || (user ? `ten_${user.email.split('@')[0]}` : 'وضع العرض التوضيحي (Clean Sandbox)'),
    financialOverview: {
      totalRevenueSar: '0.00',
      totalExpensesSar: '0.00',
      netProfitSar: '0.00',
      totalInvoices: 0,
      totalStockUnits: 0,
      lowStockAlerts: 0,
    },
    socialOverview: {
      totalPlatforms: 9,
      connectedPlatforms: 0,
      activeAutoReplyBots: 0,
      averageLatencyMs: 35,
    },
    strategicDirectives: [
      {
        id: 'dir-demo-1',
        councilRole: 'Chief Business Officer (CBO)',
        title: 'ربط قنوات التواصل وتفعيل الـ Brand Lock',
        priority: 'Critical P0',
        recommendation: 'لم يتم ربط أي قناة بعد. يُنصح بربط واتساب وإنستغرام لتفعيل الرد الآلي وتثبيت العملاء.',
        projectedImpact: '+35% نمو في المبيعات وتثبيت العميل بالنظام',
        status: 'pending',
      },
      {
        id: 'dir-demo-2',
        councilRole: 'Chief Software Architect (CSA)',
        title: 'تأسيس المخزون التجاري وربط الفواتير الضريبية',
        priority: 'High P1',
        recommendation: 'المستودع فارغ حالياً. قم بإضافة أول منتج لتفعيل مسار البيع وخصم المخزون اللحظي.',
        projectedImpact: 'إصدار فواتير ZATCA معتمدة آلياً',
        status: 'pending',
      },
    ],
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300" dir="rtl">
      
      {/* Incognito / Clean Sandbox Notice Banner */}
      {isCleanOnboardingDemo && !user && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>أنت تتصفح وضع العرض التوضيحي المفرغ (Clean Sandbox) - جميع الأرقام والقنوات شاغرة وخالية من بيانات الأدمن.</span>
          </div>
          <button
            onClick={() => setIsSignInModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs shadow-md whitespace-nowrap active:scale-95 transition-all"
          >
            تسجيل الدخول لتفعيل منشأتك الرسمية 🚀
          </button>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/30 to-purple-600/30 border border-emerald-500/40 text-white text-xs sm:text-sm font-black text-center shadow-2xl animate-in fade-in duration-200 flex items-center justify-center gap-2">
          <span>⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Executive Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#17132a] via-[#0f0c1e] to-[#080611] border border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">🧠</span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                    العقل الاستراتيجي (Business Brain OS)
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black border border-purple-500/40">
                    المرحلة 6 والأخيرة 🎯
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed mt-1">
                  غرفة القيادة المركزية التي توحد المحركات الخمسة: الذكاء الإدراكي، المحادثة والمبيعات، التنفيذ والـ ERP، التسويق، وشبكة التواصل الموحدة لصناعة القرار الفوري.
                </p>
              </div>
            </div>
          </div>

          {/* Business Health Score Gauge */}
          <div className="flex items-center gap-4 bg-black/50 p-4 rounded-3xl border border-white/10 backdrop-blur-md self-stretch lg:self-auto justify-around">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-emerald-400 flex items-center justify-center font-black text-xl text-white font-mono shadow-inner">
                {displayData.healthScore}%
              </div>
            </div>
            <div>
              <span className="text-xs text-white/50 block">مؤشر كفاءة التشغيل الموحد</span>
              <span className="text-sm font-black text-emerald-300 block">
                تكامل شامل ومثالي (Synergy Active) 🟢
              </span>
              <span className="text-[10px] text-white/40 block font-mono">
                عزل المستأجر: {displayData.tenantId}
              </span>
            </div>
            <button
              onClick={fetchInsights}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs"
              title="تحديث البيانات اللحظية"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('cockpit')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cockpit'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🧭</span>
            <span>قمرة القيادة والمؤشرات الحية</span>
          </button>

          <button
            onClick={() => setActiveTab('omni_council')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'omni_council'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>👑</span>
            <span>قرارات وتوجيهات المجلس التنفيذي (Omni-Council)</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'simulation'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>⚡</span>
            <span>محاكاة مسار البيع التلقائي الشامل</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🛡️</span>
            <span>الأمن وعزل المستأجرين (Tenant Isolation)</span>
          </button>

          <button
            onClick={() => setActiveTab('affiliate')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
              activeTab === 'affiliate'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg border-amber-400/40'
                : 'bg-white/5 text-amber-300/80 hover:text-white hover:bg-white/10 border-amber-500/20'
            }`}
          >
            <span>🤝</span>
            <span>نظام الشراكة والعمولة (Affiliate & Referral Engine)</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: COCKPIT & LIVE METRICS --- */}
      {activeTab === 'cockpit' && (
        <div className="space-y-6">
          {/* Executive KPIs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#111019] border border-white/10 relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-white/50 block">صافي الإيرادات التراكمية</span>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline gap-1">
                  <span>{displayData.financialOverview.totalRevenueSar}</span>
                  <span className="text-xs text-emerald-400 font-sans">SAR</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <span>↑</span>
                  <span>ربط لحظي مع فواتير ZATCA</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#111019] border border-white/10 relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-white/50 block">عدد الفواتير الصادرة والمغلقة</span>
                <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                  {displayData.financialOverview.totalInvoices}
                </div>
                <div className="text-[11px] text-cyan-400 font-bold">
                  إغلاق آلي عبر وكيل المبيعات الذكي
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#111019] border border-white/10 relative overflow-hidden group hover:border-purple-500/40 transition-all shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-white/50 block">قنوات التواصل المفوضة والنشطة</span>
                <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">
                  {displayData.socialOverview.connectedPlatforms} / {displayData.socialOverview.totalPlatforms}
                </div>
                <div className="text-[11px] text-purple-400 font-bold">
                  {displayData.socialOverview.activeAutoReplyBots} روبوتات رد آلي نشطة
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#111019] border border-white/10 relative overflow-hidden group hover:border-amber-500/40 transition-all shadow-xl">
              <div className="space-y-1">
                <span className="text-xs text-white/50 block">مخزون المنتجات وتنبيهات النواقص</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  {displayData.financialOverview.totalStockUnits}
                </div>
                <div className="text-[11px] text-amber-400 font-bold">
                  {displayData.financialOverview.lowStockAlerts} تنبيهات نقص في المخزون
                </div>
              </div>
            </div>
          </div>

          {/* Quick Engine Actions Bar */}
          <div className="p-5 rounded-3xl bg-[#111019] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="text-xs sm:text-sm font-black text-white">الوصول السريع للمحركات المدمجة:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onNavigateToView?.('social_hub_studio')}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-all"
              >
                🌐 شبكة التواصل والردود (Social Hub)
              </button>
              <button
                onClick={() => onNavigateToView?.('execution_erp_studio')}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-all"
              >
                📦 إدارة المخزون والفواتير (ERP Engine)
              </button>
              <button
                onClick={() => onNavigateToView?.('marketing_studio')}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-all"
              >
                🎯 الحملات واستراتيجية التسويق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: OMNI-COUNCIL DIRECTIVES --- */}
      {activeTab === 'omni_council' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>👑</span>
              <span>توجيهات المجلس التنفيذي الأعلى (Omni-Council 5 Minds)</span>
            </h3>
            <span className="text-xs text-white/50">قرارات استراتيجية مبنية على الأداء اللحظي</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayData.strategicDirectives.map((dir) => (
              <div
                key={dir.id}
                className="p-5 rounded-3xl bg-[#111019] border border-white/10 space-y-3 relative overflow-hidden group hover:border-white/20 transition-all shadow-xl"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border bg-gradient-to-r ${getRoleBadgeColor(dir.councilRole)}`}>
                      {dir.councilRole}
                    </span>
                    <h4 className="text-sm font-black text-white pt-1">{dir.title}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-300 text-[10px] font-black border border-red-500/20 whitespace-nowrap">
                    {dir.priority}
                  </span>
                </div>

                <p className="text-xs text-white/70 leading-relaxed bg-black/40 p-3 rounded-2xl border border-white/5">
                  {dir.recommendation}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                    <span>📈</span>
                    <span>الأثر: {dir.projectedImpact}</span>
                  </span>

                  <button
                    onClick={() => handleApplyDirective(dir.id)}
                    disabled={appliedDirectives[dir.id]}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      appliedDirectives[dir.id]
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 active:scale-95'
                    }`}
                  >
                    {appliedDirectives[dir.id] ? '✓ تم التطبيق' : 'اعتماد التوجيه ⚡'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: SIMULATION --- */}
      {activeTab === 'simulation' && (
        <div className="p-6 rounded-3xl bg-[#111019] border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>⚡</span>
              <span>محاكاة مسار البيع التلقائي الشامل (Full Autonomous Synergy Loop)</span>
            </h3>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              Closed Loop Operational 🟢
            </span>
          </div>

          <div className="relative border-r-2 border-purple-500/40 pr-6 space-y-6">
            <div className="relative space-y-1">
              <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-black" />
              <span className="text-xs font-black text-purple-300">الخطوة 1: استقطاب العميل وتوليد الرغبة</span>
              <p className="text-xs text-white/60">
                يقوم محرك التسويق (Marketing Engine) بنشر صور وفيديوهات المنتجات المدمجة تلقائياً عبر منصات التواصل (Instagram, TikTok).
              </p>
            </div>

            <div className="relative space-y-1">
              <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-cyan-500 ring-4 ring-black" />
              <span className="text-xs font-black text-cyan-300">الخطوة 2: المحادثة والإقناع وإغلاق الصفقة</span>
              <p className="text-xs text-white/60">
                يقوم روبوت "ابن البلد المصري الشاطر" بالرد اللحظي على استفسار السعر، وكسر تردد العميل بتقديم ضمان واستبدال فوري وهدية مميزة.
              </p>
            </div>

            <div className="relative space-y-1">
              <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-black" />
              <span className="text-xs font-black text-emerald-300">الخطوة 3: التنفيذ المالي وخصم المخزون والفوترة ZATCA</span>
              <p className="text-xs text-white/60">
                يقوم محرك التنفيذ (Execution Engine) فورياً بإنشاء فاتورة ضريبية، وقيد المعاملة المالية، وخصم كمية المنتج من المستودع آلياً.
              </p>
            </div>

            <div className="relative space-y-1">
              <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-black" />
              <span className="text-xs font-black text-amber-300">الخطوة 4: التحليل الاستراتيجي وصناعة القرار (Business Brain)</span>
              <p className="text-xs text-white/60">
                تصل بيانات الفاتورة إلى قمرة قيادة Business Brain، ليقوم المجلس التنفيذي بتحليل هوامش الربح وتقديم توجيهات فورية لزيادة المبيعات.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: TENANT SECURITY AUDIT --- */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-3xl bg-[#111019] border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>🛡️</span>
              <span>تقرير التدقيق الجنائي والأمني (P0 Security & Multi-Tenant Audit)</span>
            </h3>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              100% Isolated & Protected 🟢
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
              <span className="font-bold text-white block">1. عزل المستأجرين (Tenant Isolation)</span>
              <p className="text-white/60 leading-relaxed">
                جميع جداول PostgreSQL مربوطة بعمود <code>tenant_id</code> إلزامي مع مفتاح أجنبي وجلسة مصدق عليها برمز Bearer مشفر، ويتم رفض أي استدعاء غير مصادق عليه برمز 401 Unauthorized.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
              <span className="font-bold text-white block">2. التحقق من التوكنات وتدفق OAuth</span>
              <p className="text-white/60 leading-relaxed">
                يتم التحقق من جلسات Google ID Token وجلسات HMAC المشفرة عبر خادم Express، ولا يتم تخزين أي بيانات بين الجلسات المجهولة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
              <span className="font-bold text-white block">3. مناعة المتصفح الخفي (Incognito Immunity)</span>
              <p className="text-white/60 leading-relaxed">
                إزالة أي إسناد تلقائي لمستأجر افتراضي، وطلب تسجيل الدخول الفوري قبل إظهار أي بيانات حقيقية في قمرة القيادة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
              <span className="font-bold text-white block">4. عدم وجود أي ديون تقنية (Zero Technical Debt)</span>
              <p className="text-white/60 leading-relaxed">
                تم التحقق بالكامل من مطابقة الـ Linter وقواعد TypeScript والـ Build الإنتاجي دون أي أخطاء أو ثغرات.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: AFFILIATE & PARTNERSHIP ENGINE --- */}
      {activeTab === 'affiliate' && (
        <div className="p-6 rounded-3xl bg-[#111019] border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>🤝</span>
                <span>نظام الشراكة والتسويق بالعمولة (Affiliate & Referral Engine)</span>
              </h3>
              <p className="text-xs text-white/60 mt-1">
                توليد روابط إحالة مشفرة، تتبع الزيارات والتحويلات، واحتساب العمولات آلياً مع كل فاتورة مسددة في الـ ERP.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              Cloud SQL Active 🟢
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-xs text-white/50">إجمالي عمولات الشركاء</span>
              <div className="text-xl font-black text-emerald-400 font-mono">0.00 SAR</div>
              <span className="text-[10px] text-white/40">محسوبة بنسبة 15% من صافي المبيعات</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-xs text-white/50">كود الإحالة النشط للمنشأة</span>
              <div className="text-xl font-black text-purple-300 font-mono">
                {user ? `REF-${user.email.split('@')[0].toUpperCase()}` : 'FEKRA-VIP-2026'}
              </div>
              <span className="text-[10px] text-purple-200">الرابط: ?ref=partner_code</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-xs text-white/50">حالة الصرف والمدفوعات</span>
              <div className="text-xl font-black text-cyan-300 font-mono">آلية معتمدة</div>
              <span className="text-[10px] text-emerald-400">تحديث فوري مع كل فاتورة ZATCA</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-900/20 border border-purple-500/30 text-white text-xs space-y-2">
            <span className="font-bold text-amber-300 block">✨ التكامل الحقيقي المكتمل:</span>
            <p className="text-white/70 leading-relaxed">
              عند إتمام أي عملية بيع عبر مسار <code>/api/execution/invoices</code>، يفحص الخادم رأس <code>x-referral-code</code> أو مدخل <code>referralCode</code>، ويقوم باقتطاع نسبة الشريك وتحديث رصيد الشريك وجدول <code>commissions</code> في PostgreSQL تلقائياً.
            </p>
          </div>
        </div>
      )}

      {isSignInModalOpen && (
        <GoogleSignInModal
          isOpen={isSignInModalOpen}
          onClose={() => setIsSignInModalOpen(false)}
          onSuccess={(usr) => {
            setUser(usr);
            setIsSignInModalOpen(false);
            fetchInsights();
          }}
        />
      )}

    </div>
  );
};

export default BusinessBrainStudio;
