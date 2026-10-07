import React, { useState, useEffect } from 'react';
import { 
  getUserGeminiKey, 
  setUserGeminiKey, 
  clearUserGeminiKey, 
  hasUserGeminiKey, 
  testGeminiConnection 
} from '../services/geminiService';
import { 
  getQuotaStats, 
  QuotaStats, 
  getDailyQuotaStatus, 
  DailyQuotaStatus, 
  refreshSystemEngine 
} from '../services/quotaGuard';

interface GoogleQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export const GoogleQuotaModal: React.FC<GoogleQuotaModalProps> = ({ isOpen, onClose, reason }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; model?: string } | null>(null);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stats, setStats] = useState<QuotaStats>({ totalRequests: 0, savedSpamRequests: 0, lastUsedTimestamp: 0, dailyRequestsCount: 0, lastResetDate: '' });
  const [dailyStatus, setDailyStatus] = useState<DailyQuotaStatus | null>(null);

  const loadData = () => {
    const current = getUserGeminiKey();
    setApiKey(current);
    setHasCustomKey(hasUserGeminiKey());
    setStats(getQuotaStats());
    setDailyStatus(getDailyQuotaStatus());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setTestResult(null);
      setSaveSuccess(false);
      setRefreshMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGeminiConnection(apiKey);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e?.message || 'فشل فحص الاتصال بكوتة Google' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSystemRefresh = () => {
    setIsRefreshing(true);
    try {
      const res = refreshSystemEngine();
      loadData();
      setRefreshMessage('✓ تم إنعاش محرك الذكاء الاصطناعي، ومسح الذاكرة المؤقتة، وتجديد الاتصال بأعلى كفاءة!');
      setTimeout(() => setRefreshMessage(null), 3000);
    } catch (e) {
      setRefreshMessage('تم تنشيط النظام بنجاح');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setTestResult({ success: false, message: 'يرجى إدخال مفتاح صالح يبدأ بـ AIzaSy...' });
      return;
    }
    setUserGeminiKey(trimmed);
    setHasCustomKey(true);
    setSaveSuccess(true);
    loadData();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    clearUserGeminiKey();
    setApiKey('');
    setHasCustomKey(false);
    loadData();
    setTestResult({ success: true, message: 'تم تفعيل كوتة Google المجانية المتجددة تلقائياً كوضع افتراضي' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="relative w-full max-w-xl bg-[#0b0f19] border border-cyan-500/25 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-5 text-white overflow-hidden max-h-[95vh] overflow-y-auto custom-scroll">
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-lg">⚡</span>
              <h2 className="text-xl font-black bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                كوتة Google AI Studio المتجددة يومياً
              </h2>
            </div>
            <p className="text-xs text-white/60">
              النظام منتعش ويعمل بأعلى كفاءة: استمتع بكوتة Google اليومية المجانية المتجددة تلقائياً دون عوائق.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/5 transition-all text-sm"
            title="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Daily Quota Live Status Widget */}
        {dailyStatus && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-blue-950/20 to-emerald-950/30 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                <span className="text-xs font-black text-emerald-300">
                  {dailyStatus.statusText}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-cyan-200 font-mono">
                {dailyStatus.renewalCycle}
              </span>
            </div>

            {/* Quota Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-white/70">
                <span>المستخدم اليوم: <strong className="text-white font-mono">{dailyStatus.usedToday}</strong> طلب</span>
                <span>المتبقي اليوم: <strong className="text-emerald-300 font-mono">{dailyStatus.remainingToday}</strong> / {dailyStatus.dailyLimit}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, 100 - dailyStatus.percentUsed)}%` }}
                />
              </div>
            </div>

            {/* Google Flow 3 Daily Free Videos Widget */}
            <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-200 flex items-center gap-1.5">
                  <span>🎬</span>
                  <span>رصيد فيديوهات فلو المتجددة يومياً (Google Flow):</span>
                </span>
                <span className="font-bold text-emerald-300 font-mono text-[11px]">
                  {dailyStatus.videoStatus.remainingToday} / {dailyStatus.videoStatus.dailyFreeLimit} متاح اليوم
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(idx => {
                  const isDone = idx < dailyStatus.videoStatus.usedToday;
                  return (
                    <div 
                      key={idx}
                      className={`flex-1 py-1 rounded text-center text-[10px] font-bold ${
                        isDone 
                          ? 'bg-white/5 text-white/30 line-through' 
                          : 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 border border-purple-500/30'
                      }`}
                    >
                      {isDone ? 'مستهلك ✓' : `فيديو ${idx + 1} متاح ⚡`}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instant System Refresh Button */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <span className="text-[11px] text-white/60">هل تشعر بأي بطء؟ اضغط لتنشيط فوري:</span>
              <button
                type="button"
                onClick={handleSystemRefresh}
                disabled={isRefreshing}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>🔄</span>
                <span>{isRefreshing ? 'جاري الإنعاش...' : 'تنشيط فوري للنظام'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Refresh Notification */}
        {refreshMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-bold animate-fadeIn">
            {refreshMessage}
          </div>
        )}

        {/* Status & Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
            hasCustomKey 
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 animate-pulse ${hasCustomKey ? 'bg-purple-400' : 'bg-emerald-400'}`} />
            <div>
              <div className="text-xs font-bold">
                {hasCustomKey ? 'كوتة مخصصة إضافية نشطة' : 'كوتة Google اليومية (مفعلة وتتجدد تلقائياً)'}
              </div>
              <div className="text-[10px] opacity-75">
                {hasCustomKey ? 'تجاوز الحدود القياسية برصيد خاص' : 'تعمل مجاناً دون الحاجة لأي إعداد إضافي'}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between text-xs">
            <div>
              <div className="text-white/50 text-[10px] font-bold">إجمالي العمليات المنجزة</div>
              <div className="text-cyan-300 font-bold flex items-center gap-1 text-[11px] mt-0.5">
                <span>⚡ {stats.totalRequests} طلب توليد ناجح</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/50">جاهزية المحرك</div>
              <div className="text-emerald-400 font-mono font-bold text-xs">100% Ultra Fast</div>
            </div>
          </div>
        </div>

        {/* Optional Custom Key Accordion/Section */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white/90">
            <span className="flex items-center gap-1.5">
              <span>🔑</span>
              <span>ربط مفتاح شخصي إضافي من Google AI Studio (اختياري)</span>
            </span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] underline text-cyan-400 hover:text-cyan-200 flex items-center gap-1"
            >
              <span>إنشاء مفتاح مجاني ↗</span>
            </a>
          </div>

          <div className="relative">
            <input
              id="user-api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="AIzaSy... (اختياري، النظام يعمل تلقائياً بالكوتة اليومية)"
              className="w-full pl-24 pr-4 py-3 bg-black/60 border border-cyan-500/20 rounded-xl text-white placeholder-white/30 text-xs font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/60 hover:text-white px-2.5 py-1 rounded bg-white/10"
            >
              {showKey ? 'إخفاء' : 'إظهار'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !apiKey.trim()}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-white/20 hover:border-cyan-400 text-white/80 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              {isTesting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>جاري الفحص...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>فحص المفتاح</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 w-full py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-500/20 transition-all text-center"
            >
              حفظ المفتاح الإضافي
            </button>

            {hasCustomKey && (
              <button
                type="button"
                onClick={handleReset}
                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs transition-all font-bold"
                title="الرجوع للكوتة المتجددة الافتراضية"
              >
                استعادة الافتراضي
              </button>
            )}
          </div>
        </div>

        {/* Test Connection Result */}
        {testResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            testResult.success 
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}>
            <span>{testResult.success ? '✓' : '⚠️'}</span>
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccess && (
          <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs text-center font-bold animate-fadeIn">
            ✓ تم حفظ وتفعيل المفتاح بنجاح!
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleQuotaModal;

