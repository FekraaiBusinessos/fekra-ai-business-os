import React, { useState, useEffect } from 'react';

export type UserRole = 'superadmin' | 'tenant_owner' | 'cashier' | 'courier' | 'branch_manager';

export type IndustryType = 'restaurants' | 'clinics' | 'retail' | 'real_estate' | 'gyms';

export interface TenantModuleConfig {
  posCashier: boolean;
  publicStoreMenu: boolean;
  lehgaVideoEngine: boolean;
  deliveryDispatch: boolean;
  crmMarketing: boolean;
  aiNegotiator: boolean;
}

export interface TenantRecord {
  id: number;
  tenantId: string;
  businessName: string;
  industry: IndustryType;
  brandLockScore: number;
  activePhase: number;
  settings?: {
    modules?: TenantModuleConfig;
    phone?: string;
    currency?: string;
    address?: string;
    [key: string]: any;
  };
  createdAt?: string;
}

interface SuperAdminControlRoomProps {
  onClose: () => void;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onSelectTenant?: (tenantId: string) => void;
}

const INDUSTRY_PROFILES: Record<IndustryType, {
  labelAr: string;
  labelEn: string;
  icon: string;
  features: string[];
  color: string;
}> = {
  restaurants: {
    labelAr: 'مطاعم وكافيهات',
    labelEn: 'Restaurants & Cafes',
    icon: '🍽️',
    features: ['طاولات الصالة الداخلية (Dine-in Tables)', 'منيو QR الرقمي الذكي', 'نظام تذاكر المطبخ KDS', 'مناطق التوصيل والمناديل'],
    color: 'from-amber-500 to-orange-600'
  },
  clinics: {
    labelAr: 'عيادات ومراكز طبية',
    labelEn: 'Clinics & Medical Centers',
    icon: '🩺',
    features: ['حجوزات ومواعيد المرضى', 'جداول الأطباء والمناوبات', 'الملفات الطبية والملاحظات', 'تذكير الواتساب التلقائي'],
    color: 'from-emerald-500 to-teal-600'
  },
  retail: {
    labelAr: 'متاجر التجزئة والأزياء',
    labelEn: 'Retail & Fashion Stores',
    icon: '👗',
    features: ['قارئ الباركود والجرد السريع', 'أكواد SKU والقياسات والألوان', 'نقاط الولاء والخصومات', 'تنبيهات نواقص المخزون'],
    color: 'from-cyan-500 to-blue-600'
  },
  real_estate: {
    labelAr: 'عقارات ومطورين',
    labelEn: 'Real Estate & Developers',
    icon: '🏢',
    features: ['قوائم الوحدات والمشاريع', 'حجز ومعاينة الوحدات', 'خط أنابيب تأهيل العملاء (Leads Pipeline)', 'حسابات الدفعات والأقساط'],
    color: 'from-purple-500 to-indigo-600'
  },
  gyms: {
    labelAr: 'نوادي رياضية ولياقة',
    labelEn: 'Gyms & Fitness Clubs',
    icon: '🏋️',
    features: ['باقات واشتراكات العضوية', 'حجز المدربين والكلاسات', 'سجل الحضور والبصمة', 'برامج التدريب المخصصة'],
    color: 'from-rose-500 to-red-600'
  }
};

const DEFAULT_MODULES: TenantModuleConfig = {
  posCashier: true,
  publicStoreMenu: true,
  lehgaVideoEngine: true,
  deliveryDispatch: true,
  crmMarketing: true,
  aiNegotiator: true,
};

export const SuperAdminControlRoom: React.FC<SuperAdminControlRoomProps> = ({
  onClose,
  currentRole = 'superadmin',
  onRoleChange,
  onSelectTenant
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(currentRole);
  const [tenantsList, setTenantsList] = useState<TenantRecord[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter or edit state
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('restaurants');
  const [modulesState, setModulesState] = useState<TenantModuleConfig>(DEFAULT_MODULES);
  const [brandLockScore, setBrandLockScore] = useState<number>(98);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/tenants');
      if (res.ok) {
        const data = await res.json();
        if (data.tenants && data.tenants.length > 0) {
          setTenantsList(data.tenants);
          const first = data.tenants[0];
          setSelectedTenant(first);
          setSelectedIndustry((first.industry as IndustryType) || 'restaurants');
          setBrandLockScore(first.brandLockScore || 98);
          if (first.settings?.modules) {
            setModulesState({ ...DEFAULT_MODULES, ...first.settings.modules });
          }
        }
      }
    } catch (err) {
      console.warn('Could not load tenants, using demo tenant:', err);
      const demo: TenantRecord = {
        id: 1,
        tenantId: 'demo-tenant',
        businessName: 'Fekra AI Flagship Tenant',
        industry: 'restaurants',
        brandLockScore: 99,
        activePhase: 6,
        settings: { modules: DEFAULT_MODULES }
      };
      setTenantsList([demo]);
      setSelectedTenant(demo);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTenantRecord = (tenant: TenantRecord) => {
    setSelectedTenant(tenant);
    setSelectedIndustry((tenant.industry as IndustryType) || 'restaurants');
    setBrandLockScore(tenant.brandLockScore || 95);
    if (tenant.settings?.modules) {
      setModulesState({ ...DEFAULT_MODULES, ...tenant.settings.modules });
    } else {
      setModulesState(DEFAULT_MODULES);
    }
    onSelectTenant?.(tenant.tenantId);
  };

  const handleSaveTenantConfiguration = async () => {
    if (!selectedTenant) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/admin/tenant/${selectedTenant.tenantId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: selectedIndustry,
          brandLockScore,
          modules: modulesState
        })
      });

      if (res.ok) {
        setSuccessToast(`تم تحديث إعدادات المستأجر [${selectedTenant.businessName}] بنجاح ✓`);
        setTimeout(() => setSuccessToast(null), 4000);
        // Update local state
        setTenantsList(prev => prev.map(t => t.tenantId === selectedTenant.tenantId ? {
          ...t,
          industry: selectedIndustry,
          brandLockScore,
          settings: { ...t.settings, modules: modulesState }
        } : t));
      } else {
        alert('حدث خطأ أثناء حفظ الإعدادات');
      }
    } catch (err) {
      alert('تعذر الاتصال بالخادم لحفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleModule = (moduleKey: keyof TenantModuleConfig) => {
    setModulesState(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  const handleRoleSwitch = (role: UserRole) => {
    setActiveRole(role);
    onRoleChange?.(role);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col overflow-hidden text-white" dir="rtl">
      {/* Top Bar */}
      <div className="h-16 border-b border-cyan-500/20 bg-slate-900/80 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping" />
          <h2 className="text-lg font-black text-white tracking-wide">
            غرفة التحكم المركزية • Super-Admin & Tenant Adaptation Hub
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Multi-Tenant Isolation P0
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* RBAC Role Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <span className="text-xs text-slate-400 px-2 font-bold">صلاحية المعاينة:</span>
            {[
              { id: 'superadmin', label: '👑 سوبر أدمن' },
              { id: 'tenant_owner', label: '🏢 مالك النشاط' },
              { id: 'cashier', label: '💳 كاشير' },
              { id: 'courier', label: '🛵 دليفري' },
              { id: 'branch_manager', label: '👔 مدير فرع' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => handleRoleSwitch(r.id as UserRole)}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                  activeRole === r.id
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      {successToast && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 px-6 py-2 text-center text-sm font-bold animate-in fade-in">
          {successToast}
        </div>
      )}

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Tenants Directory (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
              <span>📋</span> قائمة المستأجرين النشطين ({tenantsList.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Isolated Schemas</span>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              جاري فحص المستأجرين...
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2.5">
              {tenantsList.map(t => {
                const isSelected = selectedTenant?.tenantId === t.tenantId;
                const indProfile = INDUSTRY_PROFILES[t.industry as IndustryType] || INDUSTRY_PROFILES.restaurants;
                return (
                  <div
                    key={t.tenantId}
                    onClick={() => handleSelectTenantRecord(t)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-sm truncate">{t.businessName}</div>
                      <span className="text-xs">{indProfile.icon}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-400 font-mono">
                      <span>ID: {t.tenantId}</span>
                      <span className="text-emerald-400 font-bold">Brand Lock: {t.brandLockScore || 98}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick QR & Store Link for Selected Tenant */}
          {selectedTenant && (
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <span className="text-xs text-slate-400 font-bold">روابط الكتالوج العام للمستأجر:</span>
              <div className="flex items-center gap-2">
                <a
                  href={`/menu/${selectedTenant.tenantId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all"
                >
                  🔗 رابط المنيو (/menu)
                </a>
                <a
                  href={`/store/${selectedTenant.tenantId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 text-xs font-bold transition-all"
                >
                  🛍️ رابط المتجر (/store)
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Tenant Adaptation & Module Control (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Section 1: Industry Adaptation Switcher */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>🎯</span> محول النشاط والتكييف الديناميكي (Industry Adaptation Switcher)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تغيير النشاط يعيد فوراً تشكيل واجهة المستخدم والمصطلحات والحقول التشغيلية
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                Active: {selectedIndustry}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(Object.keys(INDUSTRY_PROFILES) as IndustryType[]).map(indKey => {
                const ind = INDUSTRY_PROFILES[indKey];
                const isCurrent = selectedIndustry === indKey;
                return (
                  <button
                    key={indKey}
                    onClick={() => setSelectedIndustry(indKey)}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1.5 ${
                      isCurrent
                        ? `bg-gradient-to-br ${ind.color} text-white border-white/40 shadow-lg scale-105 font-black`
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-xl">{ind.icon}</span>
                    <span className="text-xs font-bold leading-tight">{ind.labelAr}</span>
                    <span className="text-[9px] opacity-80 leading-tight">{ind.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Industry Features Badge Preview */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-xs font-bold text-cyan-400 block mb-2">
                الوحدات المفعلة تلقائياً لنشاط [{INDUSTRY_PROFILES[selectedIndustry].labelAr}]:
              </span>
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_PROFILES[selectedIndustry].features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-700 text-slate-200 font-semibold"
                  >
                    ✓ {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Tenant Module Switches */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
              <span>🎛️</span> مفاتيح الوحدات التشغيلية (Tenant Module Toggles)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              التحكم في ظهور أو حجب الوحدات التشغيلية على مستوى المستأجر الحالي
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                {
                  key: 'posCashier' as const,
                  title: 'كاشير ومخزون POS السريع',
                  desc: 'إصدار الفواتير الفورية وإدارة النواقص والباركود',
                  icon: '💳'
                },
                {
                  key: 'publicStoreMenu' as const,
                  title: 'المتجر والمنيو الرقمي العام (QR)',
                  desc: 'واجهة الكتالوج للعملاء والطلب المباشر عبر الواتساب',
                  icon: '🛍️'
                },
                {
                  key: 'lehgaVideoEngine' as const,
                  title: 'محرك اللهجة المصرية وفيديو Veo (LEHGA)',
                  desc: 'توليد سيناريوهات إعلانية بـ 10 زوايا نفسية وفيديو حقيقي',
                  icon: '🎬'
                },
                {
                  key: 'deliveryDispatch' as const,
                  title: 'توجيه المناديل والخرائط (Dispatch)',
                  desc: 'تعقب موقع العميل ومسار التوصيل والمناديب',
                  icon: '🛵'
                },
                {
                  key: 'crmMarketing' as const,
                  title: 'Omni CRM والحملات التسويقية',
                  desc: 'تجزئة العملاء والربط المباشر مع Meta و TikTok',
                  icon: '🎯'
                },
                {
                  key: 'aiNegotiator' as const,
                  title: 'وكيل التفاوض وإغلاق الصفقات الذكي',
                  desc: 'محرك المحادثة التفاعلي للإقناع والبيع الآلي',
                  icon: '💬'
                }
              ].map(mod => {
                const isEnabled = modulesState[mod.key];
                return (
                  <div
                    key={mod.key}
                    onClick={() => toggleModule(mod.key)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isEnabled
                        ? 'bg-slate-950 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mod.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-white">{mod.title}</div>
                        <div className="text-xs text-slate-400">{mod.desc}</div>
                      </div>
                    </div>

                    <div
                      className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
                        isEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Brand Lock Score Controller */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-300 block">
                  مؤشر قفل العلامة التجارية (Brand Lock Score):
                </span>
                <span className="text-[11px] text-slate-500">
                  درجة التزام المستأجر بالنظام كحل أوحد لا غنى عنه
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={brandLockScore}
                  onChange={(e) => setBrandLockScore(Number(e.target.value))}
                  className="w-32 accent-cyan-400 cursor-pointer"
                />
                <span className="font-mono text-cyan-400 font-black text-sm w-12 text-left">
                  {brandLockScore}%
                </span>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveTenantConfiguration}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? 'جاري حفظ التغييرات...' : 'حفظ ونشر التكوين للمستأجر ✓'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
