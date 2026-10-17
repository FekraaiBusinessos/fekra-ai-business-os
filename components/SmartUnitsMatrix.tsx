import React, { useState } from 'react';
import { AppView } from '../types';

export interface SmartUnit {
  id: string;
  view: AppView;
  phaseNumber: number;
  phaseNameAr: string;
  phaseNameEn: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  descriptionAr: string;
  capabilities: string[];
  metricsBadge: string;
  status: 'active' | 'ready' | 'tier1';
  gradient: string;
  borderColor: string;
  glowColor: string;
  psychologyHookAr: string;
}

export const SMART_UNITS: SmartUnit[] = [
  // Phase 1: AI Foundation
  {
    id: 'unit-creator',
    view: 'creator_studio',
    phaseNumber: 1,
    phaseNameAr: 'الأساس الإدراكي',
    phaseNameEn: 'AI Foundation',
    titleAr: 'استوديو الإنتاج العالمي 8K',
    titleEn: 'Creator Studio V4 (Master Engine)',
    icon: '👑',
    descriptionAr: 'محرك التوليد السينمائي فائق الدقة 8K، دمج الـ Product-Lock و Face-Lock للموديل المعلن لمنع أي تشوه.',
    capabilities: ['توليد 8K سينمائي', 'Face-Lock ثابت للموديل', 'Product-Lock بدون هلوسة', 'دستور الألوان الثلاثي'],
    metricsBadge: '8K Ultra Cinema',
    status: 'tier1',
    gradient: 'from-cyan-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    glowColor: 'hover:shadow-cyan-500/20',
    psychologyHookAr: 'ترسيخ سلطة البراند (Authority) ومظهر الوكالة العالمية الفاخرة.'
  },
  {
    id: 'unit-photoshoot',
    view: 'photoshoot_director',
    phaseNumber: 1,
    phaseNameAr: 'الأساس الإدراكي',
    phaseNameEn: 'AI Foundation',
    titleAr: 'المخرج الفوتوغرافي الذكي',
    titleEn: 'Photoshoot Director & Camera AI',
    icon: '📸',
    descriptionAr: 'إخراج الجلسات التجارية بزوايا كاميرا ذكية (Macro, POV, Dutch, Drone) مع إضاءة استوديو دراماتيكية 85mm.',
    capabilities: ['8 زوايا تصوير سينمائية', 'عمق ميدان بصري Anamorphic', 'إضاءة Rembrandt و Golden Hour', 'انعكاسات رخامية ثلاثية'],
    metricsBadge: 'Hasselblad 100MP',
    status: 'ready',
    gradient: 'from-blue-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-blue-500/40 hover:border-blue-400',
    glowColor: 'hover:shadow-blue-500/20',
    psychologyHookAr: 'تضخيم القيمة المدركة للمنتج عبر إضاءة الفخامة المتدرجة.'
  },

  // Phase 2: Conversation & Sales Engine
  {
    id: 'unit-omni-crm',
    view: 'omni_crm_studio',
    phaseNumber: 2,
    phaseNameAr: 'عقل المحادثة والمبيعات',
    phaseNameEn: 'Conversation Engine',
    titleAr: 'استوديو أومني المتكامل للعملاء والحملات',
    titleEn: 'Omni CRM, Ads & Lead Engine',
    icon: '🎯',
    descriptionAr: 'إدارة علاقات العملاء الذكية، تصنيف الجمهور، إطلاق الإعلانات الإبداعية الفورية ورسائل المبيعات المؤثرة.',
    capabilities: ['تصنيف العملاء الـ VIP تلقائياً', 'إطلاق إعلانات الموديل الفورية', 'رسائل مبيعات ساخنة مقفولة', 'تتبع خطوط الأنابيب CRM'],
    metricsBadge: 'Omni Pipeline Active',
    status: 'tier1',
    gradient: 'from-emerald-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    glowColor: 'hover:shadow-emerald-500/20',
    psychologyHookAr: 'استثارة الرغبة العاجلة (Urgency) ومضاعفة معدل الإغلاق البيعي.'
  },
  {
    id: 'unit-video-flow',
    view: 'video_flow_studio',
    phaseNumber: 2,
    phaseNameAr: 'عقل المحادثة والمبيعات',
    phaseNameEn: 'Conversation Engine',
    titleAr: 'محرك الفيديو ومزامنة الشفاه (Lipsync)',
    titleEn: 'Video Flow & Comedic Sales Engine',
    icon: '🎬',
    descriptionAr: 'تحويل الصور الثابتة إلى فيديو سينمائي متحرك مع مزامنة الشفاه للهجات السعودية والمصرية والخليجية.',
    capabilities: ['مزامنة الشفاه Lipsync 98.6%', 'محرك حركات البيع والإشارة للمنتج', 'لهجات عربية متعددة', 'جودة 60 FPS فائقة النعومة'],
    metricsBadge: 'Lipsync 60 FPS',
    status: 'tier1',
    gradient: 'from-amber-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    glowColor: 'hover:shadow-amber-500/20',
    psychologyHookAr: 'كسر الحاجز النفسي بالفكاهة واللهجة المحلية المعاصرة.'
  },

  // Phase 3: Execution Engine & ERP
  {
    id: 'unit-execution-erp',
    view: 'execution_erp_studio',
    phaseNumber: 3,
    phaseNameAr: 'ذراع التنفيذ والمحاسبة',
    phaseNameEn: 'Execution Engine',
    titleAr: 'نظام الـ ERP وفواتير ZATCA Phase 2',
    titleEn: 'Execution ERP & E-Invoicing Hub',
    icon: '⚡',
    descriptionAr: 'إصدار الفواتير الضريبية المشفرة المعتمدة برمز QR، مراقبة المخزون، وربط حركة المبيعات بدفتر الأستاذ العام.',
    capabilities: ['امتثال ZATCA Phase 2 التام', 'رمز استجابة سريعة QR مشفر', 'خصم فوري للمخزون مع كل بيعة', 'تصدير PDF و XML معتمد'],
    metricsBadge: 'ZATCA Ph2 Compliant',
    status: 'tier1',
    gradient: 'from-teal-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-teal-500/40 hover:border-teal-400',
    glowColor: 'hover:shadow-teal-500/20',
    psychologyHookAr: 'الراحة والأمان القانوني والمالي التام لصاحب المنشأة.'
  },
  {
    id: 'unit-edit-typography',
    view: 'edit_studio',
    phaseNumber: 3,
    phaseNameAr: 'ذراع التنفيذ والمحاسبة',
    phaseNameEn: 'Execution Engine',
    titleAr: 'استوديو التحرير والتايبوجرافي 3D',
    titleEn: 'Edit Studio & Typography AI',
    icon: '✍️',
    descriptionAr: 'تصميم التايبوجرافي العربي البارز 3D بحدود بيضاء وستيكر، مع هوكات بيعية عميقة تتفاعل مع طبقات المشهد.',
    capabilities: ['تايبوجرافي عربي 3D مجسم', 'حدود ملصق بيضاء Sticker Style', 'طبقات عمق تفاعلية فوق وتحت المنتج', 'تحكم كامل في الظلال والتلوين'],
    metricsBadge: '3D Extrusion AI',
    status: 'ready',
    gradient: 'from-indigo-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-indigo-500/40 hover:border-indigo-400',
    glowColor: 'hover:shadow-indigo-500/20',
    psychologyHookAr: 'تثبيت الرسالة التسويقية بالهوكات البصرية الجريئة.'
  },

  // Phase 4: Marketing Engine
  {
    id: 'unit-marketing-campaigns',
    view: 'marketing_studio',
    phaseNumber: 4,
    phaseNameAr: 'صناعة الحملات وتحليل الجمهور',
    phaseNameEn: 'Marketing Engine',
    titleAr: 'استوديو التسويق وصناعة الحملات الشاملة',
    titleEn: 'Marketing & Campaign Architect',
    icon: '📣',
    descriptionAr: 'هندسة الحملات التسويقية المتكاملة مع تحليل سيكولوجي للجمهور وصياغة محفزات "تضخيم الألم" (Pain Amplification).',
    capabilities: ['استراتيجية حملة من 30 يوماً', 'هندسة زوايا الإقناع وعلم النفس', 'نصوص إعلانية موجهة لكل منصة', 'حساب تكلفة العميل المتوقعة (CAC)'],
    metricsBadge: 'Campaign Architect',
    status: 'ready',
    gradient: 'from-rose-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    glowColor: 'hover:shadow-rose-500/20',
    psychologyHookAr: 'تضخيم ألم تأجيل الشراء لإلزام العميل بالتحرك الفوري.'
  },
  {
    id: 'unit-storyboard',
    view: 'storyboard_studio',
    phaseNumber: 4,
    phaseNameAr: 'صناعة الحملات وتحليل الجمهور',
    phaseNameEn: 'Marketing Engine',
    titleAr: 'استوديو الستوري بورد والقصص البصرية',
    titleEn: 'Cinematic Storyboard Studio',
    icon: '🎞️',
    descriptionAr: 'بناء متسلسلات بصرية وسردية من 9 مشاهد سينمائية متصلة، مع الحفاظ على هوية الموديل والمنتج في كل لقطة.',
    capabilities: ['9 مشاهد سينمائية مترابطة', 'تثبيت الموديل عبر كل مشهد', 'بناء قوس السرد الإعلاني (Narrative Arc)', 'تصدير خطة التصوير للمخرجين'],
    metricsBadge: '9-Scene Grid Arc',
    status: 'ready',
    gradient: 'from-violet-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-violet-500/40 hover:border-violet-400',
    glowColor: 'hover:shadow-violet-500/20',
    psychologyHookAr: 'جذب العاطفة عبر سرد قصة تحول العميل بعد استخدام المنتج.'
  },

  // Phase 5: Social Engine
  {
    id: 'unit-social-hub',
    view: 'social_hub_studio',
    phaseNumber: 5,
    phaseNameAr: 'الربط الموحد لمنصات التواصل',
    phaseNameEn: 'Social Engine',
    titleAr: 'المركز الموحد لمنصات التواصل (Social Hub)',
    titleEn: 'Social Engine & Unified Publishing',
    icon: '🌐',
    descriptionAr: 'نشر وجدولة فورية ومباشرة للمحتوى المولد على إنستغرام، تيك توك، فيسبوك، وواتساب من منصة واحدة وبنقرة زر.',
    capabilities: ['نشر متعدد المنصات بنقرة واحدة', 'جدولة آلية في أوقات ذروة التفاعل', 'توليد الهاشتاجات الفيروسية بالذكاء', 'لوحة تحكم بالتفاعل والردود'],
    metricsBadge: 'Multi-Channel Auto',
    status: 'tier1',
    gradient: 'from-sky-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-sky-500/40 hover:border-sky-400',
    glowColor: 'hover:shadow-sky-500/20',
    psychologyHookAr: 'حضور شامل ومستمر يخلق انطباع الهيمنة على السوق.'
  },

  // Phase 6: Business Brain & Strategic Control
  {
    id: 'unit-business-brain',
    view: 'business_brain_studio',
    phaseNumber: 6,
    phaseNameAr: 'التحليل وصناعة القرار الاستراتيجي',
    phaseNameEn: 'Business Brain',
    titleAr: 'العقل الاستراتيجي والتحليل الجنائي',
    titleEn: 'Business Brain & Forensics Engine',
    icon: '🧠',
    descriptionAr: 'المراقبة الذاتية للمنظومة، تحليل الهوامش الربحية، منع الهلوسة، وتقديم توصيات تنفيذية تدفع النشاط للنمو المستدام.',
    capabilities: ['سجل تدقيق جنائي (Forensics Log)', 'تحليل هوامش الربح الحقيقية', 'مراقبة أداء الوكلاء الذاتيين', 'توصيات نمو يقدمها المجلس التنفيذي'],
    metricsBadge: 'Autonomous AI Mind',
    status: 'tier1',
    gradient: 'from-fuchsia-950/60 via-slate-900 to-slate-950',
    borderColor: 'border-fuchsia-500/40 hover:border-fuchsia-400',
    glowColor: 'hover:shadow-fuchsia-500/20',
    psychologyHookAr: 'الاستغناء الكامل عن الاستشارات الخارجية عبر ذكاء ذاتي موجه.'
  },
  {
    id: 'unit-vault',
    view: 'integrations_vault_studio',
    phaseNumber: 6,
    phaseNameAr: 'التحليل وصناعة القرار الاستراتيجي',
    phaseNameEn: 'Business Brain & Security',
    titleAr: 'خزينة المفاتيح والأمن وعزل المستأجرين',
    titleEn: 'Integrations Vault & Tenant Isolation',
    icon: '🔒',
    descriptionAr: 'تشفير عسكري AES-256 لمفاتيح الربط والـ API، عزل تام ومحكم لبيانات كل شركة ومستأجر، وتدوير المفاتيح دون انقطاع.',
    capabilities: ['تشفير عسكري AES-256 للمفاتيح', 'عزل تام لبيانات المستأجرين (Tenant Isolation)', 'تدوير تلقائي لكوتة Gemini API', 'حماية ضد الاختراق والوصول غير المصرح'],
    metricsBadge: 'P0 Security Hardened',
    status: 'tier1',
    gradient: 'from-slate-900 via-slate-950 to-black',
    borderColor: 'border-slate-700 hover:border-slate-500',
    glowColor: 'hover:shadow-slate-500/20',
    psychologyHookAr: 'أقصى معايير الموثوقية لحماية أسرار الأعمال وأصول الشركات.'
  }
];

export interface SmartUnitsMatrixProps {
  onSelectUnit: (view: AppView) => void;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  activeView?: AppView;
  className?: string;
  showPhaseFilters?: boolean;
}

export const SmartUnitsMatrix: React.FC<SmartUnitsMatrixProps> = ({
  onSelectUnit,
  isAuthenticated,
  onRequireAuth,
  activeView,
  className = '',
  showPhaseFilters = true,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');

  const filteredUnits = SMART_UNITS.filter(unit => 
    selectedPhase === 'all' || unit.phaseNumber === selectedPhase
  );

  const handleUnitClick = (view: AppView) => {
    if (!isAuthenticated && view !== 'home') {
      onRequireAuth();
      return;
    }
    onSelectUnit(view);
  };

  return (
    <section className={`w-full flex flex-col items-center select-none ${className}`} dir="rtl">
      
      {/* Header Info */}
      <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>مصفوفة الوحدات الذكية التفاعلية • Fekra AI Operating Grid v7.0</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            وحدات نظام التشغيل المتكاملة والمترابطة
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            مستطيلات ذكية تفاعلية تمثل المراحل الست لمعمارية فكرة: من التوليد الإدراكي 8K وحتى المحاسبة والفواتير والعقل الاستراتيجي، دون أي عوائق إنتاجية أو ازدواجية.
          </p>
        </div>

        {/* Phase Filter Tabs */}
        {showPhaseFilters && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedPhase('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedPhase === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              الكل (11 وحدة)
            </button>
            {[
              { phase: 1, label: '1. الأساس الإدراكي' },
              { phase: 2, label: '2. عقل المبيعات' },
              { phase: 3, label: '3. ذراع التنفيذ' },
              { phase: 4, label: '4. التسويق' },
              { phase: 5, label: '5. السوشيال' },
              { phase: 6, label: '6. العقل الاستراتيجي' },
            ].map(p => (
              <button
                key={p.phase}
                onClick={() => setSelectedPhase(p.phase)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedPhase === p.phase
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Smart Units Rectangles Grid (مصفوفة المستطيلات الذكية بجانب بعضها) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredUnits.map((unit) => {
          const isActive = activeView === unit.view;
          return (
            <div
              key={unit.id}
              onClick={() => handleUnitClick(unit.view)}
              className={`group relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br ${unit.gradient} border ${unit.borderColor} shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${unit.glowColor} cursor-pointer flex flex-col justify-between overflow-hidden ${
                isActive ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950' : ''
              }`}
            >
              {/* Subtle Ambient Hover Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-400/10 transition-colors" />

              {/* Top Row: Phase Tag + Live Metric + Launch Indicator */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>مرحلة {unit.phaseNumber}: {unit.phaseNameAr}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950/70 border border-white/10 text-cyan-300 text-[10px] font-mono font-bold">
                    {unit.metricsBadge}
                  </span>
                  {unit.status === 'tier1' && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                      Tier-1
                    </span>
                  )}
                </div>
              </div>

              {/* Icon & Title Row */}
              <div className="flex items-start gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-white/15 flex items-center justify-center text-2xl shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform">
                  {unit.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors tracking-tight truncate">
                    {unit.titleAr}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    {unit.titleEn}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-2">
                {unit.descriptionAr}
              </p>

              {/* Capabilities Chips */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {unit.capabilities.slice(0, 3).map((cap, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-slate-950/60 border border-white/5 text-slate-300 text-[10px] font-medium"
                  >
                    ✓ {cap}
                  </span>
                ))}
              </div>

              {/* Psychological Anchor & Action Trigger */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-auto">
                <div className="text-[10px] text-amber-300/80 font-medium truncate flex items-center gap-1">
                  <span>💡</span>
                  <span className="truncate">{unit.psychologyHookAr}</span>
                </div>

                <div className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-[-2px] transition-transform">
                  <span>تشغيل الوحدة</span>
                  <span>←</span>
                </div>
              </div>

              {/* Active Badge if current view */}
              {isActive && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-black shadow-md">
                  نشط حالياً
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SmartUnitsMatrix;
