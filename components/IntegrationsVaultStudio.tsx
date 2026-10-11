import React, { useState, useEffect } from 'react';
import { getGoogleUser, getAuthHeaders, subscribeGoogleAuth } from '../services/googleAuthService';
import GoogleSignInModal from './GoogleSignInModal';
import { GoogleUserProfile } from '../types';

interface ApiKeyItem {
  serviceName: string;
  keyIdentifier: string;
  status: string;
  lastTestedAt: string | null;
  extraConfig?: Record<string, any>;
}

interface KnowledgeSourceItem {
  id: number;
  sourceType: string;
  title: string;
  driveFolderId?: string;
  driveFileId?: string;
  chunksCount: number;
  syncStatus: string;
  lastSyncedAt: string;
  extractedText?: string;
}

interface WebhookConfig {
  tenantId: string;
  webhookUrl: string;
  verifyToken: string;
  supportedPlatforms: string[];
}

export const IntegrationsVaultStudio: React.FC = () => {
  const [user, setUser] = useState<GoogleUserProfile | null>(() => getGoogleUser());
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'vault' | 'drive_context' | 'webhook'>('vault');
  const [keys, setKeys] = useState<Record<string, ApiKeyItem>>({});
  const [sources, setSources] = useState<KnowledgeSourceItem[]>([]);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);

  // Form states for adding/editing keys
  const [inputs, setInputs] = useState<Record<string, string>>({
    gemini: '',
    telegram: '',
    meta: '',
    metaPageId: '',
    whatsapp: '',
    whatsappPhoneId: '',
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testingStatus, setTestingStatus] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Facebook One-Click Connect State
  const [isFbLoggingIn, setIsFbLoggingIn] = useState(false);
  const [availableFbPages, setAvailableFbPages] = useState<Array<{ id: string; name: string; access_token: string; category?: string }>>([]);
  const [showFbPageModal, setShowFbPageModal] = useState(false);
  const [isSelectingPage, setIsSelectingPage] = useState(false);
  const [showManualMetaSettings, setShowManualMetaSettings] = useState(false);

  // Drive integration state
  const [driveTitle, setDriveTitle] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [driveSourceType, setDriveSourceType] = useState<'drive' | 'text' | 'file'>('drive');
  const [driveDirectContent, setDriveDirectContent] = useState('');
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);


  // Load Vault keys, Webhook info, and Knowledge sources
  const loadVaultData = async () => {
    try {
      const headers = await getAuthHeaders();
      
      // 1. Fetch Keys
      const keysRes = await fetch('/api/vault/keys', { headers });
      if (keysRes.ok) {
        const keysList: ApiKeyItem[] = await keysRes.json();
        const map: Record<string, ApiKeyItem> = {};
        keysList.forEach(k => { map[k.serviceName] = k; });
        setKeys(map);
      }

      // 2. Fetch Webhook Config
      const whRes = await fetch('/api/vault/webhook-config', { headers });
      if (whRes.ok) {
        setWebhookConfig(await whRes.json());
      }

      // 3. Fetch Knowledge Sources
      const srcRes = await fetch('/api/knowledge/sources', { headers });
      if (srcRes.ok) {
        setSources(await srcRes.json());
      }
    } catch (err) {
      console.error('Failed to load vault data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadVaultData();
    }
    const unsub = subscribeGoogleAuth((usr) => {
      setUser(usr);
      if (usr) loadVaultData();
    });
    return unsub;
  }, []);


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Test connection ping
  const handleTestKey = async (serviceName: string) => {
    setTestingStatus(prev => ({ ...prev, [serviceName]: 'testing' }));
    try {
      const headers = await getAuthHeaders();
      const secret = inputs[serviceName];
      const extra: Record<string, any> = {};
      if (serviceName === 'meta' && inputs.metaPageId) extra.pageId = inputs.metaPageId;
      if (serviceName === 'whatsapp' && inputs.whatsappPhoneId) extra.phoneNumberId = inputs.whatsappPhoneId;

      const res = await fetch('/api/vault/test-key', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          serviceName,
          secretKey: secret || undefined,
          extraConfig: extra,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestingStatus(prev => ({ ...prev, [serviceName]: 'success' }));
        showToast(`✓ ${data.message} (${data.latencyMs}ms)`);
        loadVaultData();
      } else {
        setTestingStatus(prev => ({ ...prev, [serviceName]: 'error' }));
        showToast(`⚠️ ${data.error || 'فشل فحص الاتصال'}`);
      }
    } catch (e) {
      setTestingStatus(prev => ({ ...prev, [serviceName]: 'error' }));
      showToast('خطأ في الاتصال بالخادم');
    }
  };

  // Save / Encrypt Key (AES-256)
  const handleSaveKey = async (serviceName: string) => {
    const secret = inputs[serviceName];
    if (!secret) return;

    try {
      const headers = await getAuthHeaders();
      const extra: Record<string, any> = {};
      if (serviceName === 'meta') extra.pageId = inputs.metaPageId;
      if (serviceName === 'whatsapp') extra.phoneNumberId = inputs.whatsappPhoneId;

      const res = await fetch('/api/vault/keys', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          serviceName,
          secretKey: secret,
          extraConfig: extra,
        }),
      });

      if (res.ok) {
        showToast('✓ تم تشفير المفتاح بتقنية AES-256 وحفظه في Vault المنشأة بنجاح 🔒');
        setInputs(prev => ({ ...prev, [serviceName]: '' }));
        loadVaultData();
      }
    } catch (e) {
      showToast('حدث خطأ أثناء تشفير المفتاح');
    }
  };

  // One-Click Facebook Login Dialog Handler (Meta JS SDK)
  const handleFacebookOneClickConnect = () => {
    setIsFbLoggingIn(true);
    showToast('جارٍ تشغيل نافذة مصادقة Facebook الرسمية...');

    if (typeof window !== 'undefined' && (window as any).FB) {
      try {
        (window as any).FB.login((response: any) => {
          if (response && response.authResponse && response.authResponse.accessToken) {
            exchangeFacebookToken(response.authResponse.accessToken);
          } else {
            setIsFbLoggingIn(false);
            showToast('تم إلغاء تسجيل الدخول أو لم يتم منح صلاحيات إدارة الصفحات');
          }
        }, { scope: 'pages_show_list,pages_messaging,pages_manage_metadata,pages_read_engagement' });
      } catch (err) {
        console.warn('[Meta SDK] Direct login error, fallback to prompt:', err);
        fallbackFbTokenExchange();
      }
    } else {
      fallbackFbTokenExchange();
    }
  };

  const fallbackFbTokenExchange = () => {
    const inputToken = window.prompt(
      'نافذة Facebook SDK الرسمية جاري تحميلها. يمكنك إدخال User Access Token أو Page Token الخاص بفيسبوك هنا للاستبدال الفوري بتوكن دائم:'
    );
    if (inputToken && inputToken.trim()) {
      exchangeFacebookToken(inputToken.trim());
    } else {
      setIsFbLoggingIn(false);
    }
  };

  const exchangeFacebookToken = async (shortLivedToken: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/social/meta/oauth-exchange', {
        method: 'POST',
        headers,
        body: JSON.stringify({ shortLivedToken }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.pages && data.pages.length > 0) {
          setAvailableFbPages(data.pages);
          setShowFbPageModal(true);
          showToast(`✓ تم الربط بفيسبوك بنجاح! تم العثور على ${data.pages.length} صفحة`);
        } else {
          showToast(data.message || '✓ تم ربط صفحة فيسبوك وتوليد التوكن الدائم بنجاح 🚀');
        }
        loadVaultData();
      } else {
        showToast(`⚠️ ${data.error || 'فشل استبدال توكن فيسبوك'}`);
      }
    } catch (err) {
      showToast('حدث خطأ أثناء تبادل التوكن مع الخادم');
    } finally {
      setIsFbLoggingIn(false);
    }
  };

  const handleSelectFbPage = async (page: any) => {
    setIsSelectingPage(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/social/meta/select-page', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pageId: page.id,
          pageName: page.name,
          pageToken: page.access_token,
        }),
      });
      if (res.ok) {
        showToast(`✓ تم تثبيت وربط الصفحة "${page.name}" بنجاح 🚀`);
        setShowFbPageModal(false);
        loadVaultData();
      }
    } catch (e) {
      showToast('فشل ربط الصفحة المحددة');
    } finally {
      setIsSelectingPage(false);
    }
  };


  // Sync Google Drive Document / Folder
  const handleSyncDriveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveTitle.trim()) return;

    setIsSyncingDrive(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/knowledge/sources/drive-sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: driveTitle,
          driveUrlOrId: driveUrl,
          sourceType: driveSourceType,
          contentText: driveDirectContent || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`✓ ${data.message} (${data.chunksCount} سياق مستخرج)`);
        setDriveTitle('');
        setDriveUrl('');
        setDriveDirectContent('');
        loadVaultData();
      } else {
        showToast(`⚠️ ${data.error || 'فشل ربط ملفات الـ Drive'}`);
      }
    } catch (err) {
      showToast('خطأ في استيعاب سياق Drive');
    } finally {
      setIsSyncingDrive(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
    showToast('تم نسخ رابط الـ Webhook الخاص بمنشأتك إلى الحافظة!');
  };

  // If user is unauthenticated: show Google Login Gate for P0 Tenant Isolation
  if (!user) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12" dir="rtl">
        <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-[#18132d] via-[#0f0c1e] to-[#080611] border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.15)] text-center space-y-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-inner mb-4">
              🔐
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
              <span>🔒</span>
              <span>خزينة تشفير المفاتيح وسياق المنشأة (AES-256 Vault)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              قمرة إدارة المفاتيح وسياق Google Drive
            </h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed mt-3">
              هذه المنطقة مخصصة لإدارة وتشفير مفاتيح الـ APIs الخاصة بمنشأتك (Gemini, Meta, WhatsApp, Telegram) وربط ملفات Google Drive لعزل سياقك التجاري. يتطلب النظام تسجيل الدخول الرسمي عبر Google لفك تشفير وعرض خزينة حسابك فقط.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-md mx-auto">
            <button
              onClick={() => setIsSignInModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <span>تسجيل الدخول الفوري بحساب Google</span>
            </button>
          </div>
        </div>

        {isSignInModalOpen && (
          <GoogleSignInModal
            isOpen={isSignInModalOpen}
            onClose={() => setIsSignInModalOpen(false)}
            onSuccess={(usr) => {
              setUser(usr);
              setIsSignInModalOpen(false);
              loadVaultData();
            }}
          />
        )}
      </div>
    );
  }

  return (

    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300" dir="rtl">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/30 to-purple-600/30 border border-emerald-500/40 text-white text-xs sm:text-sm font-black text-center shadow-2xl animate-in fade-in duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#17132a] via-[#0f0c1e] to-[#080611] border border-cyan-500/30 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🔐</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                قمرة إدارة المفاتيح والربط المؤسسي (Integrations & Keys Vault)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed">
              مستودع تشفير المفاتيح (AES-256-GCM)، وربط ملفات Google Drive لسياق الوكلاء الذكي، وتوليد روابط Webhooks المعزولة لكل منشأة.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md text-right space-y-1">
            <span className="text-[10px] text-white/50 block">حالة العزل والتشفير</span>
            <span className="text-xs font-black text-emerald-400 block font-mono">
              AES-256-GCM Active 🔒
            </span>
            <span className="text-[10px] text-cyan-300 font-mono block">
              مستأجر: {user?.tenantId || 'ten_workspace'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'vault'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🔑</span>
            <span>مستودع المفاتيح المشفرة (API Keys Vault)</span>
          </button>

          <button
            onClick={() => setActiveTab('drive_context')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'drive_context'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>📁</span>
            <span>سياق Google Drive وقاعدة المعرفة</span>
          </button>

          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'webhook'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>⚡</span>
            <span>الـ Webhook المخصص للمنشأة</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: API KEYS VAULT (AES-256) --- */}
      {activeTab === 'vault' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card 1: Google Gemini Personal API Key */}
          <div className="p-6 rounded-3xl bg-[#111019] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="text-sm font-black text-white">Google Gemini API Key</h3>
                  <span className="text-[10px] text-white/50">Google AI Studio • كوتة شخصية مخصصة</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                keys.gemini?.status === 'active' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-white/5 text-white/40 border-white/10'
              }`}>
                {keys.gemini?.status === 'active' ? 'مفتاح نشط وموثق 🟢' : 'غير مهيأ ⚪'}
              </span>
            </div>

            {keys.gemini?.keyIdentifier && (
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-white/60">المفتاح الحالي:</span>
                <span className="text-cyan-300">{keys.gemini.keyIdentifier}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/70 block">
                تحديث المفتاح السري (AI Studio Key):
              </label>
              <div className="relative">
                <input
                  type={showSecrets.gemini ? 'text' : 'password'}
                  value={inputs.gemini}
                  onChange={e => setInputs(prev => ({ ...prev, gemini: e.target.value }))}
                  placeholder="AIzaSy..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono text-left"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(prev => ({ ...prev, gemini: !prev.gemini }))}
                  className="absolute left-3 top-2.5 text-xs text-white/40 hover:text-white"
                >
                  {showSecrets.gemini ? 'إخفاء 👁️' : 'إظهار 👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleTestKey('gemini')}
                disabled={testingStatus.gemini === 'testing'}
                className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <span>⚡</span>
                <span>{testingStatus.gemini === 'testing' ? 'جارٍ الفحص...' : 'فحص وتفعيل العقدة'}</span>
              </button>
              <button
                onClick={() => handleSaveKey('gemini')}
                disabled={!inputs.gemini}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs shadow-md transition-all disabled:opacity-30"
              >
                حفظ وتشفير
              </button>
            </div>
          </div>

          {/* Card 2: Telegram Bot Token */}
          <div className="p-6 rounded-3xl bg-[#111019] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✈️</span>
                <div>
                  <h3 className="text-sm font-black text-white">Telegram Bot Token</h3>
                  <span className="text-[10px] text-white/50">ربط بوت التليجرام التجاري المباشر</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                keys.telegram?.status === 'active' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-white/5 text-white/40 border-white/10'
              }`}>
                {keys.telegram?.status === 'active' ? 'مفتاح نشط وموثق 🟢' : 'غير مهيأ ⚪'}
              </span>
            </div>

            {keys.telegram?.keyIdentifier && (
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-white/60">التوكن الحالي:</span>
                <span className="text-cyan-300">{keys.telegram.keyIdentifier}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/70 block">
                توكن البوت من BotFather:
              </label>
              <div className="relative">
                <input
                  type={showSecrets.telegram ? 'text' : 'password'}
                  value={inputs.telegram}
                  onChange={e => setInputs(prev => ({ ...prev, telegram: e.target.value }))}
                  placeholder="123456789:ABCdefGHI..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono text-left"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(prev => ({ ...prev, telegram: !prev.telegram }))}
                  className="absolute left-3 top-2.5 text-xs text-white/40 hover:text-white"
                >
                  {showSecrets.telegram ? 'إخفاء 👁️' : 'إظهار 👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleTestKey('telegram')}
                disabled={testingStatus.telegram === 'testing'}
                className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <span>⚡</span>
                <span>{testingStatus.telegram === 'testing' ? 'جارٍ الفحص...' : 'فحص وتفعيل العقدة'}</span>
              </button>
              <button
                onClick={() => handleSaveKey('telegram')}
                disabled={!inputs.telegram}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs shadow-md transition-all disabled:opacity-30"
              >
                حفظ وتشفير
              </button>
            </div>
          </div>

          {/* Card 3: Meta Pages & Messenger Token - One-Click Facebook Connect */}
          <div className="p-6 rounded-3xl bg-[#111019] border border-blue-500/30 space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Facebook &amp; Messenger Pro</h3>
                  <span className="text-[10px] text-white/50">ربط الصفحات والماسنجر التلقائي بضغطة زر</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                keys.meta?.status === 'active' || keys.meta?.status === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-white/5 text-white/40 border-white/10'
              }`}>
                {keys.meta?.status === 'active' || keys.meta?.status === 'connected' ? 'صفحة متصلة وموثقة 🟢' : 'غير متصل ⚪'}
              </span>
            </div>

            {/* Connected State Badge if connected */}
            {keys.meta?.keyIdentifier && keys.meta?.keyIdentifier !== 'غير مربوط' && (
              <div className="p-3 rounded-2xl bg-black/50 border border-blue-500/20 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">معرف الصفحة:</span>
                  <span className="text-blue-300 font-bold">{keys.meta?.extraConfig?.pageId || 'الصفحة المعتمدة'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">التوكن الدائم المشفر:</span>
                  <span className="text-emerald-400">{keys.meta?.keyIdentifier}</span>
                </div>
              </div>
            )}

            {/* Primary One-Click Connect Facebook Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleFacebookOneClickConnect}
                disabled={isFbLoggingIn}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-900/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>
                  {isFbLoggingIn ? 'جارٍ الاتصال بنافذة Facebook الرسمية...' : 'ربط صفحة فيسبوك بضغطة زر (Connect Facebook Page)'}
                </span>
              </button>
            </div>

            {/* Expandable Manual / Advanced Settings */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowManualMetaSettings(!showManualMetaSettings)}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
              >
                <span>{showManualMetaSettings ? '▼ إخفاء الإدخال اليدوي' : '◀ إعدادات متقدمة / إدخال يدوي للتوكن'}</span>
              </button>

              {showManualMetaSettings && (
                <div className="mt-3 p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/60 block">معرف الصفحة (Page ID):</label>
                      <input
                        type="text"
                        value={inputs.metaPageId}
                        onChange={e => setInputs(prev => ({ ...prev, metaPageId: e.target.value }))}
                        placeholder="10928374..."
                        className="w-full bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono text-left"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/60 block">توكن الصفحة الدائم (Token):</label>
                      <input
                        type="password"
                        value={inputs.meta}
                        onChange={e => setInputs(prev => ({ ...prev, meta: e.target.value }))}
                        placeholder="EAAB..."
                        className="w-full bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleTestKey('meta')}
                      disabled={testingStatus.meta === 'testing'}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>⚡</span>
                      <span>{testingStatus.meta === 'testing' ? 'جارٍ الفحص...' : 'فحص الاتصال'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveKey('meta')}
                      disabled={!inputs.meta}
                      className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all disabled:opacity-30"
                    >
                      حفظ وتشفير
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Card 4: WhatsApp Cloud API */}
          <div className="p-6 rounded-3xl bg-[#111019] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <h3 className="text-sm font-black text-white">WhatsApp Business Cloud API</h3>
                  <span className="text-[10px] text-white/50">WABA Phone ID &amp; System User Token</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                keys.whatsapp?.status === 'active' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-white/5 text-white/40 border-white/10'
              }`}>
                {keys.whatsapp?.status === 'active' ? 'مفتاح نشط وموثق 🟢' : 'غير مهيأ ⚪'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/60 block">معرف رقم الهاتف (Phone ID):</label>
                <input
                  type="text"
                  value={inputs.whatsappPhoneId}
                  onChange={e => setInputs(prev => ({ ...prev, whatsappPhoneId: e.target.value }))}
                  placeholder="104928374..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/60 block">التوكن الدائم (Permanent Token):</label>
                <input
                  type="password"
                  value={inputs.whatsapp}
                  onChange={e => setInputs(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="EAAG..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleTestKey('whatsapp')}
                disabled={testingStatus.whatsapp === 'testing'}
                className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <span>⚡</span>
                <span>{testingStatus.whatsapp === 'testing' ? 'جارٍ الفحص...' : 'فحص وتفعيل العقدة'}</span>
              </button>
              <button
                onClick={() => handleSaveKey('whatsapp')}
                disabled={!inputs.whatsapp}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs shadow-md transition-all disabled:opacity-30"
              >
                حفظ وتشفير
              </button>
            </div>
          </div>

        </div>
      )}

      {/* --- TAB 2: GOOGLE DRIVE & CONTEXT HUB --- */}
      {activeTab === 'drive_context' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#111019] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>📁</span>
                  <span>عقدة استيعاب سياق Google Drive وقاعدة المعرفة</span>
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  قم بربط مجلد أو مستند من Google Drive أو إضافة نصوص سياساتك البيعية، ليقوم النظام بتقسيمها (Chunking) وتلقيمها لوكلاء المبيعات والردود الآلية.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                Agent Memory Active 🧠
              </span>
            </div>

            <form onSubmit={handleSyncDriveSource} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-white/70 block">عنوان المصدر (مثال: كتالوج المنتجات 2026 أو لائحة الأسعار):</label>
                  <input
                    type="text"
                    required
                    value={driveTitle}
                    onChange={e => setDriveTitle(e.target.value)}
                    placeholder="كتالوج منتجات المنشأة وسياسات الاستبدال"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-white/70 block">نوع المصدر:</label>
                  <select
                    value={driveSourceType}
                    onChange={e => setDriveSourceType(e.target.value as any)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="drive">Google Drive Folder / Doc</option>
                    <option value="text">نص مباشر / كتالوج تسعير</option>
                    <option value="file">ملف PDF / Docs</option>
                  </select>
                </div>
              </div>

              {driveSourceType === 'drive' ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-white/70 block">
                    رابط ملف أو مجلد Google Drive (أو الـ File ID):
                  </label>
                  <input
                    type="text"
                    value={driveUrl}
                    onChange={e => setDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/1ABCxyz... أو ID المجلد"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono text-left"
                    dir="ltr"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-white/70 block">محتوى المستند أو السياسة البيعية (لتلقين الوكيل فورياً):</label>
                  <textarea
                    rows={4}
                    value={driveDirectContent}
                    onChange={e => setDriveDirectContent(e.target.value)}
                    placeholder="اكتب هنا تفاصيل المنتجات، باقات الأسعار، شروط التوصيل والاسترجاع ليستخدمها البوت في إقناع الزبائن..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSyncingDrive}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl active:scale-95 disabled:opacity-40 flex items-center gap-2"
                >
                  <span>{isSyncingDrive ? 'جارٍ الاستيعاب والتقسيم...' : 'استيعاب ومزامنة السياق مع الوكلاء ⚡'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Currently Synced Sources */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white/70">المصادر المستوعبة حالياً في ذاكرة المنشأة ({sources.length}):</h4>
            {sources.length === 0 ? (
              <div className="p-8 rounded-3xl bg-black/30 border border-white/5 text-center text-xs text-white/40">
                لم يتم ربط أي ملفات من Google Drive بعد. قم بإضافة المصدر الأول لتمكين الوكلاء من فهم نشاطك بدقة.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sources.map(src => (
                  <div key={src.id} className="p-4 rounded-2xl bg-[#111019] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[200px]">{src.title}</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                        {src.chunksCount} سياق مقسم
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 line-clamp-2">
                      {src.extractedText || 'تم استخراج السياق وتخزينه في جدول المعرفة الإدراكية.'}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-white/40">
                      <span>النوع: {src.sourceType}</span>
                      <span>آخر مزامنة: {new Date(src.lastSyncedAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: DEDICATED TENANT WEBHOOK --- */}
      {activeTab === 'webhook' && (
        <div className="p-6 rounded-3xl bg-[#111019] border border-white/10 space-y-6 shadow-xl">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>⚡</span>
              <span>الـ Webhook المخصص لمنشأتك (Tenant Dedicated Webhook)</span>
            </h3>
            <p className="text-xs text-white/60 mt-1">
              استخدم هذا الرابط المخصص لمنشأتك في إعدادات Meta Developer أو منصة تليجرام لاستقبال الرسائل وتوجيهها آلياً دون أي خلط مع باقي المشتركين.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
            <span className="text-xs font-bold text-white/70 block">رابط الـ Webhook المخصص لمنشأتك:</span>
            <div className="flex items-center gap-2">
              <input
                readOnly
                type="text"
                value={webhookConfig?.webhookUrl || `https://${window.location.host}/api/webhooks/incoming?tenant=${user?.tenantId || 'ten_active'}`}
                className="flex-1 bg-black/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-mono text-left"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(webhookConfig?.webhookUrl || `https://${window.location.host}/api/webhooks/incoming?tenant=${user?.tenantId || 'ten_active'}`)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all active:scale-95 whitespace-nowrap"
              >
                {copiedWebhook ? '✓ تم النسخ' : 'نسخ الرابط 📋'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-cyan-300 block">رمز التحقق السري (Verify Token):</span>
              <span className="text-xs text-white/80 font-mono block select-all">
                {webhookConfig?.verifyToken || `fekra_sec_${user?.tenantId || 'ten_default'}_2026`}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-xs font-bold text-emerald-300 block">المنصات المدعومة بالربط المباشر:</span>
              <span className="text-xs text-white/70 block">WhatsApp Cloud, Messenger, Instagram, Telegram</span>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Pages Selection Modal */}
      {showFbPageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
          <div className="w-full max-w-lg rounded-3xl bg-[#141221] border border-blue-500/40 p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📘</span>
                <div>
                  <h3 className="text-base font-black text-white">اختر صفحة فيسبوك للربط بالمنشأة</h3>
                  <span className="text-[11px] text-white/50">تم جلب صفحاتك المعتمدة عبر Meta Graph API</span>
                </div>
              </div>
              <button
                onClick={() => setShowFbPageModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {availableFbPages.map((page) => (
                <div
                  key={page.id}
                  className="p-3.5 rounded-2xl bg-black/50 border border-white/10 hover:border-blue-500/50 transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="text-xs font-black text-white block truncate">{page.name}</span>
                    <span className="text-[10px] text-blue-300 font-mono block">ID: {page.id}</span>
                    {page.category && (
                      <span className="text-[9px] text-white/40 block">{page.category}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleSelectFbPage(page)}
                    disabled={isSelectingPage}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs active:scale-95 transition-all whitespace-nowrap shadow-md"
                  >
                    {isSelectingPage ? 'جارٍ الحفظ...' : 'ربط هذه الصفحة 🚀'}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowFbPageModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


export default IntegrationsVaultStudio;
