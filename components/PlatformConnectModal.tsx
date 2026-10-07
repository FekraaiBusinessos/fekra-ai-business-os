import React, { useState } from 'react';
import { SocialPlatformId, SocialConnectedAccount } from '../types';
import { getSocialAccounts, connectSocialAccount } from '../services/socialConnectionsService';

interface PlatformConnectModalProps {
  isOpen: boolean;
  platformId: SocialPlatformId | null;
  onClose: () => void;
  onConnected: (account: SocialConnectedAccount) => void;
}

export const PlatformConnectModal: React.FC<PlatformConnectModalProps> = ({
  isOpen,
  platformId,
  onClose,
  onConnected,
}) => {
  const [handle, setHandle] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [step, setStep] = useState<'prompt' | 'authorizing' | 'success'>('prompt');

  if (!isOpen || !platformId) return null;

  const accounts = getSocialAccounts();
  const targetPlatform = accounts.find(a => a.id === platformId) || accounts[0];

  const defaultHandle = handle || targetPlatform.handle || `@user_${targetPlatform.id}`;

  const handleAuthorize = () => {
    setIsAuthorizing(true);
    setStep('authorizing');

    setTimeout(() => {
      const updated = connectSocialAccount(platformId, {
        handle: defaultHandle,
        username: defaultHandle.replace('@', ''),
        isConnected: true,
      });
      setStep('success');

      setTimeout(() => {
        setIsAuthorizing(false);
        setStep('prompt');
        onConnected(updated);
        onClose();
      }, 700);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-md rounded-3xl bg-[#121118] border border-white/15 p-6 sm:p-7 shadow-2xl text-white overflow-hidden">
        
        {/* Ambient background glow according to platform color */}
        <div className={`absolute -top-20 -left-20 w-44 h-44 bg-gradient-to-tr ${targetPlatform.color} opacity-20 rounded-full blur-3xl pointer-events-none`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isAuthorizing}
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-all text-xs"
        >
          ✕
        </button>

        {step === 'authorizing' ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl animate-pulse">
              {targetPlatform.icon}
            </div>
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-base font-bold text-white">
              جارٍ الربط وتفويض النشر بحساب {targetPlatform.name}...
            </h3>
            <p className="text-xs text-white/50">
              يتم إنشاء مفتاح الربط الآمن (OAuth Token) للنشر المباشر.
            </p>
          </div>
        ) : step === 'success' ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white">
              تم تسجيل الدخول والربط بنجاح!
            </h3>
            <p className="text-xs text-emerald-300 font-medium">
              جارٍ استكمال النشر على {targetPlatform.name} تلقائياً الآن...
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3.5">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${targetPlatform.color} flex items-center justify-center text-3xl text-white shadow-xl`}>
                {targetPlatform.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{targetPlatform.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    مطلوب الربط للنشر
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  سجّل الدخول بحسابك للمتابعة والنشر التلقائي المباشر
                </p>
              </div>
            </div>

            {/* Account handle input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/70 block">
                معرف الحساب أو الصفحة المراد النشر عليها:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={handle}
                  placeholder={targetPlatform.handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Requested Permissions */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <span className="text-[11px] font-bold text-white/70 block">
                الصلاحيات المطلوبة للنشر الآلي:
              </span>
              <div className="space-y-1">
                {targetPlatform.permissions.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-white/60">
                    <span className="text-emerald-400 text-xs">✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleAuthorize}
                className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${targetPlatform.color} hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95`}
              >
                <span>{targetPlatform.icon}</span>
                <span>تسجيل الدخول وتفويض النشر التلقائي الآن</span>
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-xl text-xs text-white/40 hover:text-white transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformConnectModal;
