import React, { useState } from 'react';
import { AppView, GoogleUserProfile } from '../types';
import { SmartUnitsMatrix } from './SmartUnitsMatrix';

interface HomeLandingPageProps {
  onNavigateToView: (view: AppView) => void;
  user: GoogleUserProfile | null;
  onOpenSignIn: () => void;
  onOpenProfile: () => void;
  onOpenQuotaModal: () => void;
  onOpenRegistration?: () => void;
}

export type ShowcaseCategory = 'all' | 'products' | 'models' | 'video' | 'typography' | 'zatca';

interface ShowcaseItem {
  id: string;
  title: string;
  category: ShowcaseCategory;
  categoryLabelAr: string;
  imageUrl: string;
  badge: string;
  engine: string;
  hookAr: string;
  targetView: AppView;
  promptSnippet: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'sc-1',
    title: 'إعلان تجاري فخم لساعة تيتانيوم ذكية مع Face-Lock للموديل',
    category: 'products',
    categoryLabelAr: 'تصوير المنتجات 8K',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    badge: 'Product-Lock 100%',
    engine: 'Wan 2.1 • 8K Master',
    hookAr: 'ولعها بالتيتانيوم ⚡',
    targetView: 'omni_crm_studio',
    promptSnippet: 'Commercial luxury product shoot, titanium smart watch hero on marble pedestal, crisp reflection, 50mm f/1.4 lens, 5500K studio softbox'
  },
  {
    id: 'sc-2',
    title: 'معلنة مصرية تحمل المنتج الحصري مع قفل 7 معالم بيومترية',
    category: 'models',
    categoryLabelAr: 'قفل الموديل والمعلن',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    badge: '7 Biometric Attributes',
    engine: 'Face-Lock v2.0',
    hookAr: 'سر الفخامة بين إيديكي 👑',
    targetView: 'creator_studio',
    promptSnippet: 'Egyptian executive model wearing brand attire, locked facial geometry, charismatic gaze holding physical cosmetics packaging, volumetric studio backlight'
  },
  {
    id: 'sc-3',
    title: 'فيديو إعلاني حركي سريع مع Lipsync ومزامنة الشفاه الصوتية',
    category: 'video',
    categoryLabelAr: 'فيديو سينمائي وموشن',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    badge: 'Lipsync 98.6%',
    engine: 'Seedance 2.0 • 60 FPS',
    hookAr: 'انتهى وجع الراس فوراً 🚀',
    targetView: 'omni_crm_studio',
    promptSnippet: 'Cinematic commercial video sequence, charismatic male actor delivering viral Arabic sales pitch, synchronized lip movement, dynamic Dutch angle'
  },
  {
    id: 'sc-4',
    title: 'تايبوجرافي عربي 3D بحدود بيضاء وستيكر مغناطيسي فيروسي',
    category: 'typography',
    categoryLabelAr: 'تايبوجرافي وهوكات 3D',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    badge: '3D Arabic Extrusion',
    engine: 'Typography AI Engine',
    hookAr: 'وفر 30% كاش اليوم 💰',
    targetView: 'marketing_studio',
    promptSnippet: 'Bold extruded Arabic calligraphy sticker interacting physically with 3D scene depth, crisp white outer stroke, heavy shadow drop'
  },
  {
    id: 'sc-5',
    title: 'فاتورة ضريبية ZATCA Phase 2 مربوطة مباشرة برمز QR ومخزون الـ ERP',
    category: 'zatca',
    categoryLabelAr: 'المبيعات وفواتير ZATCA',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    badge: 'ZATCA Phase 2 QR',
    engine: 'Execution ERP Hub',
    hookAr: 'إصدار فوري معتمد 🧾',
    targetView: 'execution_erp_studio',
    promptSnippet: 'Real-time B2B/B2C tax invoice generation with cryptographic cryptographic compliance hash, dynamic QR code, synchronized ledger'
  },
  {
    id: 'sc-6',
    title: 'عطر فاخر داخل بيئة أندلسية مع إضاءة سينمائية متباينة',
    category: 'products',
    categoryLabelAr: 'تصوير المنتجات 8K',
    imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    badge: 'Golden Ratio 3x3',
    engine: 'Photoshoot Director',
    hookAr: 'عبير يسبق حضورك ✨',
    targetView: 'photoshoot_director',
    promptSnippet: 'Luxury perfume bottle on dark polished stone, fine golden liquid reflections, cinematic atmospheric mist, sharp macro detailing'
  }
];

export const HomeLandingPage: React.FC<HomeLandingPageProps> = ({
  onNavigateToView,
  user,
  onOpenSignIn,
  onOpenProfile,
  onOpenQuotaModal,
  onOpenRegistration,
}) => {
  const [selectedShowcaseCategory, setSelectedShowcaseCategory] = useState<ShowcaseCategory>('all');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const filteredShowcase = SHOWCASE_ITEMS.filter(
    item => selectedShowcaseCategory === 'all' || item.category === selectedShowcaseCategory
  );

  return (
    <div className="w-full flex flex-col items-center min-w-0 text-right text-white selection:bg-cyan-500 selection:text-slate-950" dir="rtl">
      
      {/* ============================================================== */}
      {/* 1. HERO SECTION                                                */}
      {/* ============================================================== */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-14 pb-12 sm:pb-20 relative overflow-hidden flex flex-col items-center">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-purple-600/20 to-pink-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Platform Protocol Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 shadow-lg shadow-cyan-950/40 text-xs sm:text-sm font-bold text-cyan-300 mb-6 backdrop-blur-md animate-in fade-in duration-500">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Fekra AI Business OS v8.0 • Master Restructuring & 6-Phase Architecture</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 text-[10px] font-mono border border-cyan-400/30">Tier-1 P0</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-center tracking-tight leading-[1.15] max-w-5xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300">
          شغّل استوديو أعمالك التجاري واصنع إعلانات عالمية <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-300 underline decoration-cyan-500/50 decoration-wavy decoration-2">توقف التمرير فوراً</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-lg md:text-xl text-slate-300 max-w-3xl text-center leading-relaxed font-medium">
          المنصة العربية الشاملة التي تجمع بين التوليد السينمائي فائق الدقة 8K، حماية ملامح المعلن وهوية البراند (Brand-Lock & Face-Lock)، وأتمتة مسار المبيعات وفواتير ZATCA Phase 2 في منظومة واحدة متصلة.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 z-10">
          <button
            onClick={() => onNavigateToView('omni_crm_studio')}
            className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-xl shadow-cyan-900/40 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>🎯 تشغيل الاستوديو المتكامل (Omni CRM)</span>
            <span>←</span>
          </button>

          <button
            onClick={() => onNavigateToView('public_store')}
            className="px-5 sm:px-7 py-3.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-300 font-bold text-sm sm:text-base shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <span>📱 المنيو الذكي والمتجر (QR)</span>
          </button>

          <button
            onClick={() => onNavigateToView('creator_studio')}
            className="px-5 sm:px-7 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/60 text-white font-bold text-sm sm:text-base shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <span>👑 جولة داخل استوديو الـ 8K</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('pricing-plans-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 sm:px-6 py-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-sm sm:text-base transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>💎 باقات الاشتراك</span>
          </button>

          {/* User Profile & Account Action Buttons */}
          {user ? (
            <button
              onClick={onOpenProfile}
              className="px-4 sm:px-6 py-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-sm sm:text-base transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              title="عرض وتعديل الملف الشخصي والشركة والباقة"
            >
              <span>👤 ملف المستخدم: {user.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-mono">تعديل ⚙️</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSignIn}
                className="px-5 py-3.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 font-black text-sm transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>🔑 تسجيل الدخول</span>
              </button>
              <button
                onClick={onOpenRegistration || onOpenSignIn}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>✨ تأسيس منشأة (6 خطوات)</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Forensic Counters */}
        <div className="mt-12 sm:mt-16 w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center justify-center text-center shadow-lg">
            <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">+35,000</span>
            <span className="text-xs text-slate-300 mt-1 font-bold">إعلان تجاري مولد</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center justify-center text-center shadow-lg">
            <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">99.8%</span>
            <span className="text-xs text-slate-300 mt-1 font-bold">دقة Face-Lock للموديل</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center justify-center text-center shadow-lg">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">0.08 ر.س</span>
            <span className="text-xs text-slate-300 mt-1 font-bold">متوسط تكلفة الرندرة</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center justify-center text-center shadow-lg">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">100%</span>
            <span className="text-xs text-slate-300 mt-1 font-bold">امتثال ZATCA Phase 2</span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. SMART OPERATING UNITS MATRIX (مصفوفة الوحدات الذكية)        */}
      {/* ============================================================== */}
      <section id="smart-units-matrix-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 border-t border-slate-800/80">
        <SmartUnitsMatrix
          isAuthenticated={!!user}
          onRequireAuth={onOpenSignIn}
          onSelectUnit={onNavigateToView}
          showPhaseFilters={true}
        />
      </section>

      {/* ============================================================== */}
      {/* 3. PLATFORM SHOWCASE & PORTFOLIO GALLERY                       */}
      {/* ============================================================== */}
      <section id="showcase-portfolio-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-2">
              <span>🎨</span>
              <span>معرض أعمال المنصة العالمي (Live Platform Portfolio)</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              إبداعات حقيقية أُنتجت بواسطة محركات فكرة
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              تصاميم سينمائية 8K، موديلات حقيقية مع Face-Lock، وهوكات عربية بارزة، وفواتير نظامية معتمدة.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'products', label: 'تصوير المنتجات 8K' },
              { id: 'models', label: 'الموديل وFace-Lock' },
              { id: 'video', label: 'الفيديو ومزامنة Lipsync' },
              { id: 'typography', label: 'تايبوجرافي وهوكات 3D' },
              { id: 'zatca', label: 'المبيعات وZATCA' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedShowcaseCategory(cat.id as ShowcaseCategory)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedShowcaseCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShowcase.map(item => (
            <div
              key={item.id}
              className="group rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              {/* Media Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                {/* Top Badges */}
                <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-[10px] font-bold">
                    {item.badge}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-purple-950/85 backdrop-blur-md border border-purple-400/40 text-purple-300 text-[10px] font-mono">
                    {item.engine}
                  </span>
                </div>

                {/* Viral Hook Sticker in Preview */}
                <div className="absolute bottom-3 right-3">
                  <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs border border-white shadow-lg">
                    {item.hookAr}
                  </span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-cyan-400">{item.categoryLabelAr}</span>
                  <span className="font-mono text-[10px]">Tier-1 Commercial</span>
                </div>

                <h3 className="text-base font-black text-white line-clamp-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 font-mono line-clamp-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                  {item.promptSnippet}
                </p>

                {/* Launch Template in Studio Action */}
                <button
                  onClick={() => onNavigateToView(item.targetView)}
                  className="w-full mt-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-700 hover:border-transparent cursor-pointer"
                >
                  <span>🚀 فتح هذا القالب في الاستوديو</span>
                  <span>←</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. SUBSCRIPTION PACKAGES & PRICING PLANS                       */}
      {/* ============================================================== */}
      <section id="pricing-plans-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-slate-800/80">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2">
            <span>💎</span>
            <span>باقات الاشتراك المرنة (Subscription Plans & Pricing)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            اختر باقة النجاح التي تناسب حجم نشاطك التجاري
          </h2>
          <p className="text-xs sm:text-base text-slate-400 max-w-2xl mt-2">
            جميع الباقات تمنحك وصولاً مباشراً إلى محركات فكرة الذكية، مع عزل تام للبيانات وربط بالفواتير الضريبية.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-6 flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-cyan-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              دفع شهري
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                billingCycle === 'yearly' ? 'bg-cyan-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>دفع سنوي</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black">خصم 20%</span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* Plan 1: Starter */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">باقة البداية</span>
                <span className="text-lg">🌱</span>
              </div>
              <div>
                <div className="text-3xl font-black text-white">مجاناً</div>
                <div className="text-xs text-slate-400 mt-0.5">تجربة غير محدودة بمدة زمنية</div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                مثالية للمصممين والمتاجر الناشئة لتجربة قوة التوليد الإعلاني 8K واستكشاف قدرات المنصة.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>50 صورة تجارية عالية الدقة 8K شهرياً</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>مشغل فيديو فكرة التجريبي مع Lipsync</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>كوتة Google AI Studio المتجددة يومياً</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>حفظ ومشاركة الأعمال في استوديو الأعمال</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <span>✕</span>
                  <span>Face-Lock متعدد الزوايا للموديل</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <span>✕</span>
                  <span>ربط الـ ERP وفواتير ZATCA Phase 2</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                if (user) {
                  onNavigateToView('creator_studio');
                } else {
                  onOpenSignIn();
                }
              }}
              className="mt-8 w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 cursor-pointer"
            >
              {user ? 'أنت على الباقة التجريبية ✓' : 'ابدأ مجاناً الآن'}
            </button>
          </div>

          {/* Plan 2: Growth Pro (Hero Plan) */}
          <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/40 border-2 border-cyan-500 shadow-2xl shadow-cyan-950/60 p-6 sm:p-8 flex flex-col justify-between relative transform md:-translate-y-2">
            <div className="absolute -top-3.5 right-1/2 translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs shadow-md">
              ⭐ الباقة الأكثر طلباً للمتاجر
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold">باقة النمو والمتاجر</span>
                <span className="text-lg">🚀</span>
              </div>
              <div>
                <div className="text-3xl font-black text-cyan-400 font-mono">
                  {billingCycle === 'monthly' ? '199 ر.س' : '159 ر.س'}
                  <span className="text-xs text-slate-400 font-sans mr-1">/ شهرياً</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {billingCycle === 'yearly' ? 'يُدفع 1,908 ر.س سنوياً (وفرت 480 ر.س)' : 'تجديد شهري مرن، إلغاء بأي وقت'}
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                المحرك الكامل للمتاجر الإلكترونية والمسوقين لتوليد إعلانات مقفولة بالمنتج ونشرها فوراً على السوشيال والواتساب.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-200 pt-2 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong className="text-white">Product-Lock غير محدود:</strong> منع هلوسة المنتج 100%</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong className="text-white">Face-Lock لـ 7 معالم:</strong> وجه الموديل يظهر بكل الزوايا</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong className="text-white">فيديو Wan 2.1 & Seedance:</strong> موشن سينمائي عالي الإطارات</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong className="text-white">مزامنة Lipsync والتعليق:</strong> لهجات سعودية ومصرية وخليجية</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong className="text-white">فواتير ZATCA Phase 2:</strong> توليد لحظي برمز QR معتمد</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>نشر مباشر على واتساب، إنستغرام، وفيسبوك</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                if (user) {
                  onOpenProfile();
                } else {
                  onOpenSignIn();
                }
              }}
              className="mt-8 w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-900/40 transition-all cursor-pointer"
            >
              {user ? 'ترقية / تثبيت باقة النمو' : 'اختر باقة النمو الآن'}
            </button>
          </div>

          {/* Plan 3: Enterprise OS */}
          <div className="rounded-3xl bg-slate-900/80 border border-purple-500/30 p-6 sm:p-8 flex flex-col justify-between shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold">باقة المؤسسات والوكالات</span>
                <span className="text-lg">👑</span>
              </div>
              <div>
                <div className="text-3xl font-black text-purple-400 font-mono">
                  {billingCycle === 'monthly' ? '599 ر.س' : '499 ر.س'}
                  <span className="text-xs text-slate-400 font-sans mr-1">/ شهرياً</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">حل شامل للوكالات والشركات الكبرى</div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                نظام تشغيل متكامل يشمل خزانة المفاتيح المشفرة، إدارة المخزون والمحاسبة، ووكلاء النمو الذاتيين.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span><strong className="text-white">خزينة مفاتيح مخصصة:</strong> تشفير AES-256 و Key Rotation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span><strong className="text-white">عزل تام للمستأجرين:</strong> Multi-tenant وسجل تدقيق جنائي</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span>استوديو الـ ERP وإدارة المخزون ودفتر الأستاذ العام</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span>وكيل النمو الذاتي (Autopilot Growth Agent)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span>مستودع المعرفة RAG عبر الذكاء الاصطناعي</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span>دعم فني VIP وأولوية قصوى على المعالجات</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                if (user) {
                  onOpenProfile();
                } else {
                  onOpenSignIn();
                }
              }}
              className="mt-8 w-full py-3 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 font-bold text-xs transition-all cursor-pointer"
            >
              {user ? 'تواصل مع مستشار المؤسسات' : 'طلب باقة المؤسسات'}
            </button>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. FOOTER CALL-TO-ACTION                                       */}
      {/* ============================================================== */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-cyan-400">Fekra AI Solutions</span>
          <span>© 2026 جميع الحقوق محفوظة لشركة فكرة</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigateToView('omni_crm_studio')} className="hover:text-cyan-300">استوديو الحملات</button>
          <button onClick={() => onNavigateToView('execution_erp_studio')} className="hover:text-cyan-300">الـ ERP والفواتير</button>
          <button onClick={() => onNavigateToView('business_brain_studio')} className="hover:text-cyan-300">العقل الاستراتيجي</button>
          <button onClick={onOpenQuotaModal} className="text-amber-400 font-bold">كوتة Google</button>
        </div>
      </footer>

    </div>
  );
};

export default HomeLandingPage;
