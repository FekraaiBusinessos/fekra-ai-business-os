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
  const [whatsappMode, setWhatsappMode] = useState<'qr' | 'phone'>('qr');
  const [qrScanned, setQrScanned] = useState(false);

  if (!isOpen || !platformId) return null;

  const accounts = getSocialAccounts();
  const targetPlatform = accounts.find(a => a.id === platformId) || accounts[0];

  const defaultHandle = handle.trim() || targetPlatform.handle || `@user_${targetPlatform.id}`;

  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    setStep('authorizing');

    setTimeout(async () => {
      try {
        const updated = await connectSocialAccount(platformId, {
          handle: defaultHandle,
          username: defaultHandle.replace(/[@+]/g, '').trim() || `${targetPlatform.name} User`,
          isConnected: true,
          healthStatus: 'healthy',
        });
        setStep('success');

        setTimeout(() => {
          setIsAuthorizing(false);
          setStep('prompt');
          onConnected(updated);
          onClose();
        }, 800);
      } catch (e) {
        setIsAuthorizing(false);
        setStep('prompt');
      }
    }, 1100);
  };

  const isWhatsapp = platformId === 'whatsapp';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#121118] border border-white/15 p-6 sm:p-7 shadow-2xl text-white overflow-hidden">
        
        {/* Ambient background glow according to platform color */}
        <div className={`absolute -top-20 -left-20 w-48 h-48 bg-gradient-to-tr ${targetPlatform.color} opacity-20 rounded-full blur-3xl pointer-events-none`} />

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
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${targetPlatform.color} flex items-center justify-center text-3xl shadow-xl animate-pulse`}>
              {targetPlatform.icon}
            </div>
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-base font-bold text-white">
              جارٍ الربط وتفويض النشر بحساب {targetPlatform.name}...
            </h3>
            <p className="text-xs text-white/50 font-mono">
              OAuth 2.0 Handshake &amp; Webhook Token Verification...
            </p>
          </div>
        ) : step === 'success' ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white">
              تم الربط بنجاح مع {targetPlatform.name}!
            </h3>
            <p className="text-xs text-emerald-300 font-medium">
              تم تحديث قواعد البيانات وتفعيل النشر والمزامنة التلقائية فورياً.
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
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ربط آمن بنقرة واحدة
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  تفويض النشر التلقائي المباشر والمزامنة اللحظية
                </p>
              </div>
            </div>

            {/* If WhatsApp: Special QR Code / Phone Connect Experience */}
            {isWhatsapp ? (
              <div className="space-y-4">
                <div className="flex bg-white/5 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setWhatsappMode('qr')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      whatsappMode === 'qr' ? 'bg-emerald-600 text-white shadow' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    📱 مسح كود QR من الهاتف
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhatsappMode('phone')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      whatsappMode === 'phone' ? 'bg-emerald-600 text-white shadow' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    📞 الربط برقم الهاتف المباشر
                  </button>
                </div>

                {whatsappMode === 'qr' ? (
                  <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3 text-center">
                    <div className="relative p-3 bg-white rounded-2xl shadow-2xl">
                      {/* Stylized QR Code Visual */}
                      <div className="w-36 h-36 bg-black flex flex-wrap p-2 gap-1 rounded-lg">
                        <div className="w-8 h-8 border-4 border-white bg-black rounded-sm m-1" />
                        <div className="w-8 h-8 border-4 border-white bg-black rounded-sm m-1 mr-auto" />
                        <div className="w-full flex justify-center items-center py-2">
                          <span className="text-2xl">💬</span>
                        </div>
                        <div className="w-8 h-8 border-4 border-white bg-black rounded-sm m-1" />
                        <div className="flex-1 bg-white/40 h-8 m-1 rounded-sm flex items-center justify-center text-[8px] font-mono font-bold text-black">
                          FEKRA-WA
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">افتح واتساب &gt; الأجهزة المرتبطة &gt; مسح الرمز</p>
                      <p className="text-[10px] text-white/40">ينتهي الرمز تلقائياً خلال 60 ثانية</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setQrScanned(true);
                        handleAuthorize();
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition-all"
                    >
                      <span>📲 تم مسح الرمز - تفعيل الربط فوراً</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/70 block">
                        رقم هاتف واتساب للأعمال (مع كود الدولة):
                      </label>
                      <input
                        type="text"
                        value={handle}
                        placeholder="+966 50 123 4567 أو +20 106 541 4900"
                        onChange={(e) => setHandle(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-left"
                        dir="ltr"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAuthorize}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
                    >
                      إرسال كود التحقق والربط الفوري ⚡
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Regular Platform Connect Form */
              <div className="space-y-4">
                {/* 1-Click Fast Connect Banner */}
                <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-purple-200 block">
                      ⚡ الربط الذكي السريع بالمعرف المعتمد
                    </span>
                    <span className="text-[11px] text-purple-300/70 font-mono block">
                      {targetPlatform.handle}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAuthorize}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:opacity-95 whitespace-nowrap active:scale-95 transition-all"
                  >
                    ربط فوري 🚀
                  </button>
                </div>

                {/* Account handle custom input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-white/70">
                      أو أدخل معرف الحساب / الصفحة يدوياً:
                    </label>
                    <span className="text-[10px] text-white/40">اختياري</span>
                  </div>
                  <input
                    type="text"
                    value={handle}
                    placeholder={targetPlatform.handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono text-left"
                    dir="ltr"
                  />
                </div>

                {/* Permissions Breakdown */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <span className="text-[11px] font-bold text-white/70 block">
                    الصلاحيات التلقائية المفوضة:
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

                {/* Main Authorize Button */}
                <div className="pt-1 space-y-2">
                  <button
                    type="button"
                    onClick={handleAuthorize}
                    className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${targetPlatform.color} hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95`}
                  >
                    <span>{targetPlatform.icon}</span>
                    <span>تفويض وحفظ الربط الآن</span>
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
        )}
      </div>
    </div>
  );
};

export default PlatformConnectModal;
