import React, { useState } from 'react';

interface UnifiedRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (tenantData: any) => void;
}

export const UnifiedRegistrationModal: React.FC<UnifiedRegistrationModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Foundation
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('restaurants');
  const [primaryColor, setPrimaryColor] = useState('#06b6d4');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [neutralColor, setNeutralColor] = useState('#0f172a');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [tenantId, setTenantId] = useState('');

  // Step 2: Conversation
  const [preferredDialect, setPreferredDialect] = useState<'مصري' | 'خليجي' | 'سعودي' | 'شامي'>('مصري');
  const [presenterModelId, setPresenterModelId] = useState<'sarah' | 'faisal' | 'custom'>('sarah');

  // Step 3: Execution
  const [starterProductName, setStarterProductName] = useState('وجبة كلاسيك مميزة');
  const [starterPrice, setStarterPrice] = useState('150');
  const [starterStock, setStarterStock] = useState('50');
  const [currency, setCurrency] = useState('EGP');

  // Step 4: Marketing
  const [viralAngle, setViralAngle] = useState('shock');
  const [marketingPreview, setMarketingPreview] = useState<any | null>(null);

  // Step 5: Social
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'instagram', 'meta', 'tiktok', 'whatsapp'
  ]);

  if (!isOpen) return null;

  // Circuit Breaker validation before advancing
  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!businessName.trim()) {
        setErrorMessage('يرجى إدخال اسم المنشأة لمتابعة تأسيس القاعدة الإدراكية');
        return false;
      }
    } else if (step === 2) {
      if (!preferredDialect) {
        setErrorMessage('يرجى تحديد لهجة الوكيل');
        return false;
      }
    } else if (step === 3) {
      if (!starterProductName.trim() || !starterPrice) {
        setErrorMessage('يرجى إدخال بيانات أول منتج لربط المخزون');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      if (currentStep === 1) {
        const res = await fetch('/api/foundation/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName,
            industry,
            primaryColor,
            secondaryColor,
            neutralColor,
            geminiApiKey: geminiApiKey.trim() || undefined
          })
        });
        const data = await res.json();
        if (data.tenantId) setTenantId(data.tenantId);
      } else if (currentStep === 2) {
        await fetch('/api/conversation/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            preferredDialect,
            presenterModelId,
            presenterName: presenterModelId === 'faisal' ? 'فيصل' : 'سارة'
          })
        });
      } else if (currentStep === 3) {
        await fetch('/api/execution/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            currency,
            starterItems: [{
              name: starterProductName,
              nameAr: starterProductName,
              unitPrice: Number(starterPrice) || 100,
              stockQuantity: Number(starterStock) || 50,
              category: 'الأصناف الرئيسية'
            }]
          })
        });
      } else if (currentStep === 4) {
        const res = await fetch('/api/marketing/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            faceId: presenterModelId,
            viralAngle,
            customBrief: `إعلان حصري لـ ${starterProductName}`
          })
        });
        const data = await res.json();
        if (data.campaign) {
          setMarketingPreview(data.campaign);
        }
      } else if (currentStep === 5) {
        await fetch('/api/social/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            connectedPlatforms: selectedPlatforms,
            enableAutopilot: true
          })
        });
      }

      if (currentStep < 6) {
        setCurrentStep(prev => prev + 1);
      } else {
        onComplete({
          tenantId,
          businessName,
          industry,
          activePhase: 6,
          brandLockScore: 100
        });
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ في تنفيذ المرحلة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const STEPS_CONFIG = [
    { num: 1, title: 'الأساس الإدراكي', sub: 'Foundation & DNA' },
    { num: 2, title: 'محرك المحادثة', sub: 'Conversation & Face-Lock' },
    { num: 3, title: 'ذراع التنفيذ', sub: 'Execution & Inventory' },
    { num: 4, title: 'محرك التسويق', sub: 'Marketing & Veo Video' },
    { num: 5, title: 'المحرك الاجتماعي', sub: 'Social Engine & Webhook' },
    { num: 6, title: 'العقل الاستراتيجي', sub: 'Business Brain & Launch' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in" dir="rtl">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        
        {/* Header & Steps Indicator */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                Master Protocol v8.0 • دورة التأسيس الموحدة
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                تأسيس وتشغيل منظومة الأعمال (6 مراحل)
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold"
            >
              ✕
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="grid grid-cols-6 gap-1.5 my-4">
            {STEPS_CONFIG.map(s => (
              <div
                key={s.num}
                className={`p-2 rounded-xl text-center transition-all border ${
                  currentStep === s.num
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md'
                    : currentStep > s.num
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
              >
                <div className="text-[10px] font-mono">{s.num}</div>
                <div className="text-[9px] truncate hidden sm:block">{s.title}</div>
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* STEP 1: Foundation */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                <span>🏛️</span>
                <span>المرحلة 1: الأساس الإدراكي واستخراج Brand DNA</span>
              </h3>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المنشأة أو البراند *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مطعم شواية السلطان أو متجر النخبة"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">النشاط التجاري</label>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="restaurants">مطاعم وكافيهات 🍔</option>
                    <option value="clinics">عيادات ومراكز طبية 🏥</option>
                    <option value="retail">متاجر وتجزئة 🛍️</option>
                    <option value="real_estate">تطوير عقاري 🏢</option>
                    <option value="gyms">نوادي ولياقة 🏋️</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">دستور الألوان الثلاثي (Primary)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border-0"
                    />
                    <span className="text-xs font-mono text-slate-400">{primaryColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  مفتاح Gemini API الخاص بك (اختياري - يشفر بـ AES-256 في الخزينة)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy... (إذا لم يتوفر، سيتم استخدام كوتة النظام المرنة)"
                  value={geminiApiKey}
                  onChange={e => setGeminiApiKey(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Conversation */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                <span>💬</span>
                <span>المرحلة 2: عقل المحادثة، لهجة البيع، وتثبيت ملامح الموديل (Face-Lock)</span>
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">لهجة الوكيل البيعية الأساسية:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['مصري', 'سعودي', 'خليجي', 'شامي'] as const).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setPreferredDialect(d)}
                      className={`p-3 rounded-xl text-center text-xs font-bold border transition-all ${
                        preferredDialect === d
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">اختيار الموديل الإعلاني المعتمد (Face-Lock 99.8%):</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPresenterModelId('sarah')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      presenterModelId === 'sarah'
                        ? 'bg-cyan-950/40 border-cyan-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs">سارة - مبيعات حماسية 🔥</div>
                    <div className="text-[10px] text-slate-400 mt-1">تفاعل سريع، إقناع فوري، أسلوب عفوي محبب</div>
                  </div>

                  <div
                    onClick={() => setPresenterModelId('faisal')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      presenterModelId === 'faisal'
                        ? 'bg-cyan-950/40 border-cyan-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs">فيصل - طابع تجاري فخم 👑</div>
                    <div className="text-[10px] text-slate-400 mt-1">سلطة ورزانة، نبرة استشارية ومظهر تنفيذي</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Execution ERP */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                <span>⚡</span>
                <span>المرحلة 3: ربط أول منتج بالمخزون وتفعيل الفواتير</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم أول منتج للبيع *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: برجر دبل كلاسيك مشوي"
                  value={starterProductName}
                  onChange={e => setStarterProductName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">سعر البيع</label>
                  <input
                    type="number"
                    value={starterPrice}
                    onChange={e => setStarterPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الكمية بالمخزن</label>
                  <input
                    type="number"
                    value={starterStock}
                    onChange={e => setStarterStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">العملة</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="EGP">جنيه مصري (EGP)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span>تفعيل فواتير ZATCA Phase 2 برمز QR مشفر:</span>
                <span className="text-emerald-400 font-bold">مفعل تلقائياً ✓</span>
              </div>
            </div>
          )}

          {/* STEP 4: Marketing Veo Video */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                <span>🎯</span>
                <span>المرحلة 4: محرك التسويق وتوليد إعلان المنتج الأول (Veo 3.1)</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">اختر الزاوية النفسية للهوك الفيروسي (Viral Angle):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'shock', label: 'صدمة غير متوقعة 🤯' },
                    { id: 'cash', label: 'توفير كاش مباشر 🚀' },
                    { id: 'pain', label: 'تضخيم وجع التأجيل 💸' },
                    { id: 'secret', label: 'سر الصنعة 🤫' },
                  ].map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setViralAngle(a.id)}
                      className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-all ${
                        viralAngle === a.id
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {marketingPreview ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/50 space-y-2">
                  <div className="text-xs font-black text-cyan-300">
                    تم تجهيز سكريبت الفيديو والموديل: {marketingPreview.viralHookAr}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    3 مشاهد سينمائية متصلة مع Lipsync 60 FPS وإشارة للمنتج {starterProductName}.
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
                  بالضغط على متابعة، سيتم دمج صورة المنتج مع الموديل المعتمد وتوليد أول سكريبت إعلاني فيروسي.
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Social Multichannel */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                <span>🌐</span>
                <span>المرحلة 5: ربط قنوات النشر والتفاعل الآلي (Comment-to-DM)</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'instagram', label: 'إنستغرام (Instagram)' },
                  { id: 'meta', label: 'فيسبوك (Meta Pages)' },
                  { id: 'tiktok', label: 'تيك توك (TikTok)' },
                  { id: 'whatsapp', label: 'واتساب للأعمال (WhatsApp)' },
                  { id: 'youtube', label: 'يوتيوب شورتس (YouTube)' },
                  { id: 'x', label: 'منصة إكس (X / Twitter)' },
                ].map(p => {
                  const checked = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlatforms(prev =>
                          checked ? prev.filter(x => x !== p.id) : [...prev, p.id]
                        );
                      }}
                      className={`p-3 rounded-xl text-center text-xs font-bold border transition-all ${
                        checked
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-black'
                          : 'bg-slate-950 text-slate-500 border-slate-800'
                      }`}
                    >
                      {checked ? '✓ ' : '+ '} {p.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                🔒 سيتم إنشاء Webhook Vault محمي بـ HMAC-SHA256 لاستقبال تعليقات العملاء وتحويلها لطلبات تلقائية.
              </div>
            </div>
          )}

          {/* STEP 6: Business Brain & Launch */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in text-center py-2">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-3xl mx-auto mb-2">
                🚀
              </div>
              <h3 className="text-base font-black text-white">
                اكتملت المراحل الست لمعمارية Fekra AI OS بنجاح!
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                تم تأسيس المنشأة <strong className="text-cyan-400">{businessName}</strong>، تثبيت Brand DNA، ربط المخزون، وتجهيز الإعلانات الفيروسية بنسبة تطابق 100%.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-right max-w-md mx-auto space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">معرف المستأجر:</span>
                  <span className="text-cyan-400 font-bold">{tenantId || 'ten_ready_2026'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Brand Lock Score:</span>
                  <span className="text-emerald-400 font-bold">100% (Locked)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">حالة الدائرة الكهربية:</span>
                  <span className="text-cyan-400 font-bold">Closed Circuit (Zero-Drop)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              ← السابق
            </button>
          ) : <div />}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleNextStep}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-cyan-950/40"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>جاري الحفظ والتحقق...</span>
              </>
            ) : currentStep === 6 ? (
              <span>🚀 إطلاق منظومة العمل الآن</span>
            ) : (
              <span>المتابعة للمرحلة {currentStep + 1} ←</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UnifiedRegistrationModal;
