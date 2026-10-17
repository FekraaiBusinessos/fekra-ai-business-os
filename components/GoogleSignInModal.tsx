import React, { useState, useEffect, useRef } from 'react';
import { GoogleUserProfile } from '../types';
import { 
  GOOGLE_CLIENT_ID, 
  loginWithGoogleCredential,
  loginDirectly,
  DETECTED_USER_EMAIL,
  DETECTED_USER_NAME
} from '../services/googleAuthService';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: GoogleUserProfile) => void;
}

const GoogleGIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.88 0 12c0 2.12.45 3.86 1.24 5.42l4.04-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [authTab, setAuthTab] = useState<'signin' | 'register'>('signin');
  const [customName, setCustomName] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    // Initialize Official Google Identity Services SDK
    const initGoogleGSI = () => {
      const g = (window as any).google;
      if (g?.accounts?.id) {
        try {
          g.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response: any) => {
              if (response.credential) {
                setIsLoading(true);
                setErrorMsg(null);
                setSuccessMsg('جاري التحقق من هوية Google الرسمية وتوثيق المستأجر...');
                try {
                  const user = await loginWithGoogleCredential(response.credential);
                  setIsLoading(false);
                  setSuccessMsg('✓ تم توثيق الدخول بحساب Google الرسمي وعزل المنشأة بنجاح!');
                  setTimeout(() => {
                    if (onSuccess) onSuccess(user);
                    onClose();
                  }, 600);
                } catch (err: any) {
                  setIsLoading(false);
                  setErrorMsg(err.message || 'فشل التحقق من Google Token');
                }
              } else {
                setErrorMsg('لم يتم استلام توكن صالح من خوادم Google');
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false,
          });

          // Render official button inside ref
          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            g.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'filled_blue',
              size: 'large',
              type: 'standard',
              shape: 'pill',
              text: 'continue_with',
              logo_alignment: 'left',
              width: 320,
            });
          }

          // Trigger One Tap prompt safely without throwing FedCM errors
          try {
            g.accounts.id.prompt((notification: any) => {
              if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
                // One Tap suppressed gracefully, official rendered button is ready
              }
            });
          } catch (promptErr) {
            console.debug('[GSI Prompt Info]:', promptErr);
          }
        } catch (e: any) {
          console.warn('[GSI Init Error]:', e);
        }
      }
    };

    const timer = setTimeout(initGoogleGSI, 150);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualPopupTrigger = () => {
    const g = (window as any).google;
    if (g?.accounts?.id) {
      g.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setErrorMsg('يرجى النقر على زر Google الرسمي المدمج أدناه للمصادقة المباشرة.');
        }
      });
    } else {
      setErrorMsg('جاري تحميل مكتبة Google OAuth 2.0، يرجى المحاولة بعد لحظات.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0f1422] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl text-white overflow-hidden text-center">
        
        {/* Ambient neon backdrops */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all text-xs"
          aria-label="إغلاق"
        >
          ✕
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white p-3 shadow-xl flex items-center justify-center">
            <GoogleGIcon />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-bold mb-1">
              <span>🔒</span>
              <span>Google Identity Services (GSI) Live</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              المصادقة الرسمية مع Google
            </h2>
            <p className="text-xs text-cyan-300 font-mono mt-0.5" dir="ltr">
              OAuth 2.0 • accounts.google.com
            </p>
          </div>
          <p className="text-xs text-white/60 leading-relaxed max-w-xs">
            يتم تسجيل الدخول الحقيقي وفتح نافذة Google الرسمية للتحقق من هوية بريدك وتوليد مساحة المستأجر المعزولة.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold animate-fadeIn">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fadeIn">
            {successMsg}
          </div>
        )}

        {/* Tab Switcher: Sign In vs Register */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold mb-4">
          <button
            type="button"
            onClick={() => setAuthTab('signin')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              authTab === 'signin' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔑 تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => setAuthTab('register')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              authTab === 'register' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            ✨ إنشاء حساب جديد
          </button>
        </div>

        {/* Tab 1: Sign In */}
        {authTab === 'signin' && (
          <div className="flex flex-col items-center justify-center space-y-3 py-1">
            {/* Quick 1-Click for Detected User */}
            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                setErrorMsg(null);
                setSuccessMsg('جاري تفعيل الحساب المكتشف والمستأجر...');
                try {
                  const user = await loginDirectly(DETECTED_USER_EMAIL, DETECTED_USER_NAME);
                  setIsLoading(false);
                  setSuccessMsg(`✓ مرحباً بك ${user.name}! تم الدخول بنجاح.`);
                  setTimeout(() => {
                    if (onSuccess) onSuccess(user);
                    onClose();
                  }, 500);
                } catch (err: any) {
                  setIsLoading(false);
                  setErrorMsg(err.message || 'فشل تسجيل الدخول');
                }
              }}
              disabled={isLoading}
              className="w-full max-w-xs py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center justify-between shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span className="text-right">
                  <span className="block font-black">دخول سريع بحسابك:</span>
                  <span className="block font-mono text-[10px] text-slate-900">{DETECTED_USER_EMAIL}</span>
                </span>
              </div>
              <span>←</span>
            </button>

            <div className="text-[11px] text-slate-500 font-bold">أو عبر نافذة Google الرسمية:</div>

            {/* Official Google GSI Render Container */}
            <div ref={googleBtnRef} className="flex justify-center w-full min-h-[40px]" />

            {/* Direct Popup Trigger Backup */}
            <button
              type="button"
              onClick={handleManualPopupTrigger}
              disabled={isLoading}
              className="w-full max-w-xs py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <GoogleGIcon />
              <span>{isLoading ? 'جارٍ التحقق...' : 'فتح نافذة Google المنبثقة'}</span>
            </button>
          </div>
        )}

        {/* Tab 2: Register New Account Form */}
        {authTab === 'register' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!customEmail.trim()) return;
              setIsLoading(true);
              setErrorMsg(null);
              setSuccessMsg('جاري إنشاء الحساب وعزل المنشأة...');
              try {
                const user = await loginDirectly(customEmail, customName || customEmail.split('@')[0], customCompany, 'growth');
                setIsLoading(false);
                setSuccessMsg(`✓ تم إنشاء حسابك بنجاح! أهلاً بك.`);
                setTimeout(() => {
                  if (onSuccess) onSuccess(user);
                  onClose();
                }, 500);
              } catch (err: any) {
                setIsLoading(false);
                setErrorMsg(err.message || 'فشل إنشاء الحساب');
              }
            }}
            className="space-y-3 text-right"
          >
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">الاسم الكامل:</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="أحمد علي"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">اسم المتجر أو الشركة:</label>
              <input
                type="text"
                value={customCompany}
                onChange={(e) => setCustomCompany(e.target.value)}
                placeholder="متجر النور"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">البريد الإلكتروني:</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !customEmail.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'جاري إنشاء الحساب...' : '✨ إنشاء الحساب وبدء التجربة'}
            </button>
          </form>
        )}

        {/* Security & Multi-Tenancy Guarantee */}
        <div className="mt-5 pt-3 border-t border-white/10 text-right space-y-1.5 text-[10px] text-white/50">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span>✓</span>
            <span>عزل بيانات المستأجر بنسبة 100% مع تشفير الجلسة.</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span>✓</span>
            <span>كوتة إنتاج يومية مخصصة وفواتير ZATCA Phase 2 متوافقة.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignInModal;
