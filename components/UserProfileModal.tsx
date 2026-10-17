import React, { useState, useEffect } from 'react';
import { GoogleUserProfile } from '../types';
import { logoutGoogle, updateUserProfile, generateGoogleAvatar } from '../services/googleAuthService';
import { getDailyQuotaStatus, getVideoQuotaStatus } from '../services/quotaGuard';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: GoogleUserProfile | null;
  onOpenSocialHub: () => void;
  onOpenSignIn: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenSocialHub,
  onOpenSignIn,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'plan' | 'quota'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [companyName, setCompanyName] = useState(user?.companyName || 'شركة فكرة للتجارة');
  const [phone, setPhone] = useState(user?.phone || '+966 50 123 4567');
  const [industry, setIndustry] = useState(user?.industry || 'التجارة الإلكترونية والتسويق الرقمي');
  const [country, setCountry] = useState(user?.country || 'المملكة العربية السعودية');
  const [city, setCity] = useState(user?.city || 'الرياض');
  const [currency, setCurrency] = useState(user?.currency || 'SAR');
  const [plan, setPlan] = useState<'starter' | 'growth' | 'enterprise'>(user?.plan || 'growth');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCompanyName(user.companyName || 'شركة فكرة للتجارة');
      setPhone(user.phone || '+966 50 123 4567');
      setIndustry(user.industry || 'التجارة الإلكترونية والتسويق الرقمي');
      setCountry(user.country || 'المملكة العربية السعودية');
      setCity(user.city || 'الرياض');
      setCurrency(user.currency || 'SAR');
      setPlan(user.plan || 'growth');
    }
  }, [user]);

  const dailyQuota = getDailyQuotaStatus();
  const videoQuota = getVideoQuotaStatus();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateUserProfile({
        name,
        companyName,
        phone,
        industry,
        country,
        city,
        currency,
        plan,
        avatar: user?.avatar || generateGoogleAvatar(name)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-right text-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-lg shadow-md">
              👤
            </div>
            <div>
              <h3 className="text-base font-black text-white">ملف المستأجر والحساب التجاري</h3>
              <p className="text-[11px] text-slate-400">إدارة وتعديل بيانات الحساب، الشركة، والباقة الحالية</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* User Status Bar */}
        {user ? (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/30">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/80 shadow-md flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-sm font-black text-white block truncate">{user.name}</span>
                <span className="text-xs text-slate-400 block font-mono truncate">{user.email}</span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>مستأجر موثق: {user.tenantId?.substring(0, 14)}...</span>
                </span>
              </div>
            </div>

            <div className="text-left flex flex-col items-end">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                plan === 'enterprise' 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                  : plan === 'growth' 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {plan === 'enterprise' ? '👑 باقة المؤسسات' : plan === 'growth' ? '⭐ باقة النمو Pro' : '🌱 باقة البداية'}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-center space-y-2">
            <span className="text-2xl block">⚠️</span>
            <p className="text-xs text-amber-200 font-bold">أنت تعمل حالياً كزائر تجريبي. سجل الدخول لحفظ بياناتك وعزل مستأجرك بالكامل.</p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSignIn();
              }}
              className="px-4 py-2 rounded-xl bg-white text-slate-950 font-black text-xs hover:bg-neutral-200 transition-all cursor-pointer"
            >
              تسجيل الدخول / إنشاء حساب جديد
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            ✏️ بيانات الحساب والشركة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'plan' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            💎 باقة الاشتراك والترقية
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quota')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'quota' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ استهلاك الكوتا
          </button>
        </div>

        {/* TAB 1: EDITABLE PROFILE FORM */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">الاسم الكامل للمستخدم:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-cyan-400 focus:outline-none"
                  placeholder="مثال: أحمد محمد"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">اسم المتجر / الشركة (البراند):</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-cyan-400 focus:outline-none"
                  placeholder="مثال: متجر النخبة"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">رقم هاتف الواتساب:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono font-bold focus:border-cyan-400 focus:outline-none"
                  placeholder="+966 50 123 4567"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">مجال النشاط / الصناعة:</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-cyan-400 focus:outline-none"
                >
                  <option value="التجارة الإلكترونية والتسويق الرقمي">التجارة الإلكترونية والتسويق الرقمي</option>
                  <option value="العطور ومستحضرات التجميل الفاخرة">العطور ومستحضرات التجميل الفاخرة</option>
                  <option value="المطاعم والكافيهات والأغذية">المطاعم والكافيهات والأغذية</option>
                  <option value="الموضة والأزياء والإكسسوارات">الموضة والأزياء والإكسسوارات</option>
                  <option value="العقارات والمقاولات">العقارات والمقاولات</option>
                  <option value="العيادات والمراكز الطبية">العيادات والمراكز الطبية</option>
                  <option value="التكنولوجيا وتطبيقات الـ SaaS">التكنولوجيا وتطبيقات الـ SaaS</option>
                  <option value="التعليم والدورات التدريبية">التعليم والدورات التدريبية</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">الدولة والمدينة:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-cyan-400 focus:outline-none"
                    placeholder="السعودية"
                  />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-cyan-400 focus:outline-none"
                    placeholder="الرياض"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">العملة الافتراضية للنظام:</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-cyan-400 focus:outline-none"
                >
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="EGP">جنيه مصري (EGP)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                </select>
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 font-bold flex items-center gap-2">
                <span>✓</span>
                <span>تم حفظ وتحديث بيانات الملف الشخصي والمستأجر بنجاح!</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <span>💾 حفظ التعديلات فوراً</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  logoutGoogle();
                  onClose();
                  onOpenSignIn();
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
              >
                تسجيل الخروج / تبديل الحساب
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: PLANS & UPGRADE */}
        {activeTab === 'plan' && (
          <div className="space-y-3.5">
            <p className="text-xs text-slate-300">حدد باقتك الحالية أو قم بالترقية لفتح كامل مميزات الـ Brand-Lock و ZATCA:</p>

            <div className="space-y-2.5">
              {[
                { id: 'starter', title: 'باقة البداية (Starter)', price: 'مجاناً', desc: '50 صورة 8K شهرياً، كوتة Google اليومية، ومشغل الفيديو التجريبي' },
                { id: 'growth', title: 'باقة النمو Pro (الأكثر طلباً ⭐)', price: '199 ر.س / شهر', desc: 'Product-Lock غير محدود، Face-Lock بيومتري لـ 7 معالم، Wan 2.1 Lipsync، وفواتير ZATCA Phase 2' },
                { id: 'enterprise', title: 'باقة المؤسسات (Enterprise OS)', price: '599 ر.س / شهر', desc: 'خزانة مفاتيح AES-256، نظام الـ ERP والمخزون، طيار آلي للنمو، وعزل تام للمستأجرين' },
              ].map(p => (
                <div
                  key={p.id}
                  onClick={() => setPlan(p.id as any)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    plan === p.id 
                      ? 'bg-cyan-500/20 border-cyan-400 ring-1 ring-cyan-400 shadow-lg' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{p.title}</span>
                      <span className="text-xs font-mono font-bold text-cyan-300">({p.price})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{p.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    plan === p.id ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-600'
                  }`}>
                    {plan === p.id && <span className="text-[10px] font-black">✓</span>}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSaveProfile}
              className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
            >
              تثبيت الباقة المختارة ({plan === 'enterprise' ? 'المؤسسات' : plan === 'growth' ? 'النمو Pro' : 'البداية'})
            </button>
          </div>
        )}

        {/* TAB 3: QUOTA USAGE */}
        {activeTab === 'quota' && (
          <div className="space-y-3 p-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-white font-bold">
                <span className="flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>كوتة Google AI Studio اليومية المتجددة:</span>
                </span>
                <span className="text-emerald-300 font-mono font-bold">
                  {dailyQuota.remainingToday} / {dailyQuota.dailyLimit}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div 
                  className="h-full bg-emerald-400"
                  style={{ width: `${(dailyQuota.remainingToday / dailyQuota.dailyLimit) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-white font-bold">
                <span className="flex items-center gap-1.5">
                  <span>🎬</span>
                  <span>رصيد فيديو Flow (Google Veo & Wan 2.1):</span>
                </span>
                <span className="text-cyan-300 font-mono font-bold">
                  {videoQuota.remainingToday} / {videoQuota.dailyFreeLimit}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div 
                  className="h-full bg-cyan-400"
                  style={{ width: `${(videoQuota.remainingToday / Math.max(1, videoQuota.dailyFreeLimit)) * 100}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSocialHub();
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>🌐 فتح Social Hub وقنوات النشر المربوطة</span>
              <span>←</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserProfileModal;
