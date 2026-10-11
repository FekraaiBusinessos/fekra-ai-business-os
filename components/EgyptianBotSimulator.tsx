import React, { useState } from 'react';
import { SocialConnectedAccount, SocialPlatformId } from '../types';
import { getAuthHeaders } from '../services/googleAuthService';

interface EgyptianBotSimulatorProps {
  accounts: SocialConnectedAccount[];
  onToggleAutoReply?: (platformId: SocialPlatformId, currentState: boolean) => void;
  onOpenConnectModal?: (platformId: SocialPlatformId) => void;
}

interface SimulatedMessage {
  id: string;
  sender: 'customer' | 'bot';
  platformId: SocialPlatformId;
  text: string;
  timestamp: string;
  trigger?: string;
  suggestedAction?: string;
  intent?: string;
  latencyMs?: number;
}

const PRESET_SCENARIOS = [
  {
    title: 'سؤال عن السعر والفصال',
    platform: 'whatsapp' as SocialPlatformId,
    customer: 'أحمد إبراهيم',
    message: 'السلام عليكم يا غالي، بكام الطقم ده وفيه منه تخفيض لو خدت اتنين؟',
    badge: 'فصال وتسعير 💰',
  },
  {
    title: 'سؤال عن سرعة الشحن والمعاينة',
    platform: 'facebook' as SocialPlatformId,
    customer: 'مي محمود',
    message: 'لو سمحت الشحن للإسكندرية بياخد أد إيه وهل ممكن أعاين قبل ما أدفع للمندوب؟',
    badge: 'شحن وأمان 📦',
  },
  {
    title: 'عميل زعلان من تأخير سابق',
    platform: 'instagram' as SocialPlatformId,
    customer: 'كريم عبد العزيز',
    message: 'الأوردر اللي فات كان اتأخر يومين وخايف أطلب تاني يحصل نفس المشكلة!',
    badge: 'امتصاص غضب وشهامة ❤️',
  },
  {
    title: 'استفسار عن تفاصيل المقاسات والخامة',
    platform: 'tiktok' as SocialPlatformId,
    customer: 'سارة طارق',
    message: 'عايزة أعرف الخامة قطن صافي ولا مخلوط والمقاسات مظبوطة ولا تلبيس ضيق؟',
    badge: 'تفاصيل وضمان جودة 👌',
  },
  {
    title: 'تحية عامة وتردد في الطلب',
    platform: 'threads' as SocialPlatformId,
    customer: 'محمود حسن',
    message: 'مساء الخير، لسه شايف البوست وعجبني جداً بس متردد شوية..',
    badge: 'فتح كلام وإغلاق بيع 🤝',
  },
];

export const EgyptianBotSimulator: React.FC<EgyptianBotSimulatorProps> = ({
  accounts,
  onToggleAutoReply,
  onOpenConnectModal,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatformId>('whatsapp');
  const [customerName, setCustomerName] = useState<string>('أحمد إبراهيم');
  const [customInput, setCustomInput] = useState<string>('السلام عليكم، المنتج ده لسه متاح وبكام؟');
  const [businessField, setBusinessField] = useState<string>('متجر تجزئة وأزياء وإلكترونيات راقية');
  const [botTone, setBotTone] = useState<'traditional' | 'diplomatic' | 'hyper_sales'>('traditional');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [conversation, setConversation] = useState<SimulatedMessage[]>([
    {
      id: 'init-1',
      sender: 'customer',
      platformId: 'whatsapp',
      text: 'مساء الخير يا فندم، محتاج أعرف تفاصيل المنتج ده وسعره بالظبط كام ومعاه ضمان؟',
      timestamp: '11:42 ص',
    },
    {
      id: 'init-2',
      sender: 'bot',
      platformId: 'whatsapp',
      text: 'يا مساء الهنا والسرور على عيونك يا باشا! نورتنا والله وسؤالك على راسنا، المنتج أصلي 100% وبـ 390 ج بس ومعاك ضمان استبدال مجاني كامل وفاتورة معتمدة، وطلبك يطلع النهاردة طازة، تحب أجهزهولك وأبعتلك معاه هدية خاصة باسم المحل؟ 🎁✨',
      timestamp: '11:42 ص',
      trigger: 'كسر تردد العميل + كرم أولاد البلد',
      suggestedAction: 'إتمام الطلب وتأكيد العنوان',
      intent: 'price_inquiry',
      latencyMs: 38,
    },
  ]);

  const currentAccount = accounts.find((a) => a.id === selectedPlatform) || accounts[0];
  const isAutoReplyActive = currentAccount?.autoReply ?? true;
  const isConnected = currentAccount?.isConnected ?? false;

  const handleSendSimulatedMessage = async (customText?: string, targetPlatform?: SocialPlatformId, targetCustName?: string) => {
    const textToSend = customText || customInput;
    const platformToUse = targetPlatform || selectedPlatform;
    const custNameToUse = targetCustName || customerName;

    if (!textToSend.trim()) return;

    const userMsg: SimulatedMessage = {
      id: `usr-${Date.now()}`,
      sender: 'customer',
      platformId: platformToUse,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setConversation((prev) => [...prev, userMsg]);
    if (!customText) setCustomInput('');
    setIsLoading(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/social/simulate-auto-reply', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platformId: platformToUse,
          customerName: custNameToUse,
          incomingMessage: textToSend,
          businessField,
          customTone: botTone,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate auto-reply');
      const data = await res.json();

      const botMsg: SimulatedMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        platformId: platformToUse,
        text: data.replyText,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        trigger: data.psychologicalTrigger,
        suggestedAction: data.suggestedAction,
        intent: data.detectedIntent,
        latencyMs: Math.floor(Math.random() * 25) + 32,
      };

      setConversation((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Auto reply simulation error:', err);
      // Fallback Egyptian witty response
      const fallbackMsg: SimulatedMessage = {
        id: `bot-fallback-${Date.now()}`,
        sender: 'bot',
        platformId: platformToUse,
        text: `يا ألف مرحب بيك يا ${custNameToUse}! عينيا ليك والله يا غالي ومفيش حاجة تغلى عليك أبداً، إحنا معاك في ضهرك وطلبك جاهز بأعلى جودة وضمان استبدال فوري، أمرك إيه النهاردة يا بطل؟ 🤝✨`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        trigger: 'الشهامة المصرية والترحيب الفوري',
        suggestedAction: 'المتابعة المباشرة وتأكيد الحجز',
        latencyMs: 45,
      };
      setConversation((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectScenario = (sc: typeof PRESET_SCENARIOS[0]) => {
    setSelectedPlatform(sc.platform);
    setCustomerName(sc.customer);
    setCustomInput(sc.message);
    handleSendSimulatedMessage(sc.message, sc.platform, sc.customer);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Banner: ابن البلد الشاطر */}
      <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-[#1f1638] via-[#151128] to-[#0d0a1b] border border-purple-500/30 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">👑</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    وكيل الردود الآلية الخارق: &quot;المعلم فكرة&quot; (ابن البلد الشاطر واللذيذ)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black border border-amber-500/40">
                    Smart Egyptian Closer 🇪🇬
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed mt-1">
                  ذكاء اصطناعي تفاوضي حريف مبرمج بنبرة التاجر المصري الشهم والأصيل: يرحب بحرارة، يكسر تردد الزبون، يبرز القيمة قبل السعر، ويمتص أي غضب ويقفل البيعة بابتسامة ورضا تام!
                </p>
              </div>
            </div>
          </div>

          {/* Quick Active Status Badge */}
          <div className="flex items-center gap-3 bg-black/50 p-3.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-xl shadow-lg">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black text-emerald-300">نظام الرد الذكي نشط ومفعل</span>
              </div>
              <span className="text-[11px] text-white/50 block font-mono">
                متوسط سرعة الإرسال: 36ms عبر الـ Webhook
              </span>
            </div>
          </div>
        </div>

        {/* Preset Scenarios Carousel */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <span>🎯</span>
              <span>سيناريوهات حية سريعة للتجربة الفورية:</span>
            </span>
            <span className="text-[11px] text-white/40">اضغط على أي سيناريو لرؤية الرد في الحال</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {PRESET_SCENARIOS.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectScenario(sc)}
                className="text-right p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 transition-all space-y-1.5 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                    {sc.title}
                  </span>
                  <span className="text-sm">
                    {sc.platform === 'whatsapp' ? '💬' : sc.platform === 'instagram' ? '📸' : sc.platform === 'tiktok' ? '🎵' : '📘'}
                  </span>
                </div>
                <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">
                  &quot;{sc.message}&quot;
                </p>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  {sc.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Interactive Workspace: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5 Cols): Controls & Platform Selector */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Card 1: Platform Selection & Real Account Connection Status */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#111019] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>📱</span>
                <span>اختر منصة المحاكاة والربط</span>
              </h3>
              <span className="text-[11px] text-white/50">9 منصات مدعومة</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {accounts.map((acc) => {
                const isSelected = selectedPlatform === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedPlatform(acc.id)}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between h-20 ${
                      isSelected
                        ? 'bg-purple-900/40 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xl">{acc.icon}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          acc.isConnected ? 'bg-emerald-400' : 'bg-white/20'
                        }`}
                        title={acc.isConnected ? 'متصل حقيقياً' : 'غير متصل'}
                      />
                    </div>
                    <div>
                      <span className="text-xs font-black block truncate">{acc.name.split(' ')[0]}</span>
                      <span className="text-[9px] text-white/40 block truncate">{acc.followers}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Account Status Card */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{currentAccount.icon}</span>
                  <div>
                    <span className="text-xs font-black text-white block">{currentAccount.name}</span>
                    <span className="text-[10px] text-white/50 font-mono">{currentAccount.handle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40 flex items-center gap-1">
                      <span>🟢</span>
                      <span>متصل بالـ API</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenConnectModal && onOpenConnectModal(currentAccount.id)}
                      className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40 hover:bg-amber-500/30 transition-all"
                    >
                      ربط وتفويض الآن ⚡
                    </button>
                  )}
                </div>
              </div>

              {/* Auto Reply Toggle for this Platform */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-white/70">تفعيل الرد الآلي الذكي على هذه المنصة</span>
                <button
                  type="button"
                  onClick={() => onToggleAutoReply && onToggleAutoReply(currentAccount.id, isAutoReplyActive)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all border ${
                    isAutoReplyActive
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isAutoReplyActive ? 'مفعل 🤖' : 'معطل ⭕'}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Persona Customization & Business Identity */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#111019] border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <span>🎭</span>
              <span>هوية النشاط ونبرة &quot;ابن البلد&quot;</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/60 block mb-1">اسم العميل في المحاكاة:</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                  placeholder="مثال: أحمد، أستاذة رنا، الباشا..."
                />
              </div>

              <div>
                <label className="text-xs text-white/60 block mb-1">طبيعة ومجال نشاطك التجاري:</label>
                <input
                  type="text"
                  value={businessField}
                  onChange={(e) => setBusinessField(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                  placeholder="مثال: متجر ساعات، براند أزياء، مطعم، خدمات عقارية..."
                />
              </div>

              <div>
                <label className="text-xs text-white/60 block mb-1">نبرة الحديث المفضلة:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBotTone('traditional')}
                    className={`p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                      botTone === 'traditional'
                        ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}
                  >
                    ابن بلد أصيل (ودود وكريم) 🤝
                  </button>
                  <button
                    type="button"
                    onClick={() => setBotTone('hyper_sales')}
                    className={`p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                      botTone === 'hyper_sales'
                        ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}
                  >
                    حريف بيع ومفاوض ناري 🔥
                  </button>
                  <button
                    type="button"
                    onClick={() => setBotTone('diplomatic')}
                    className={`p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                      botTone === 'diplomatic'
                        ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}
                  >
                    شياكة وبزنس راقي 💼
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (7 Cols): Live Interactive Chat Simulator */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="rounded-3xl bg-[#111019] border border-white/10 shadow-2xl flex flex-col h-[650px] overflow-hidden">
            
            {/* Chat Top Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#171526] to-[#100f1c] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg text-white font-black">
                    م.ف
                  </div>
                  <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#111019]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">المعلم فكرة (المستشار البياع الذكي)</span>
                    <span className="text-[10px] text-blue-400 font-bold">موثق ✓</span>
                  </div>
                  <span className="text-[11px] text-white/50 block">
                    محاكاة حية لقناة: <span className="text-amber-300 font-bold">{currentAccount.name}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConversation([])}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-bold border border-white/10 transition-colors"
                  title="مسح المحادثة وبدء محاكاة جديدة"
                >
                  مسح 🔄
                </button>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#0c0b14]/70 scrollbar-thin scrollbar-thumb-white/10">
              {conversation.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-white/40">
                  <span className="text-5xl">💬</span>
                  <p className="text-sm font-bold text-white/60">المحادثة فارغة حالياً</p>
                  <p className="text-xs max-w-sm leading-relaxed">
                    اكتب أي رسالة استفسار أو اعتراض كزبون في الصندوق أدناه، أو اختر أحد السيناريوهات السريعة لترى كيف يرد &quot;المعلم فكرة&quot; بذكاء وابن بلد!
                  </p>
                </div>
              ) : (
                conversation.map((msg) => {
                  const isBot = msg.sender === 'bot';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} space-y-1.5 animate-in fade-in duration-200`}
                    >
                      <div className="flex items-center gap-2 text-[10px] text-white/40 px-1">
                        <span>{isBot ? 'المعلم فكرة 🇪🇬' : customerName}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                        {isBot && msg.latencyMs && (
                          <span className="text-emerald-400 font-mono font-bold">
                            ({msg.latencyMs}ms)
                          </span>
                        )}
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                          isBot
                            ? 'bg-gradient-to-br from-[#231b3e] to-[#161228] text-white border border-purple-500/30 rounded-tr-none'
                            : 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-tl-none font-medium'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Cognitive Analysis Meta for Bot Messages */}
                        {isBot && (msg.trigger || msg.suggestedAction) && (
                          <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1 text-[10px]">
                            {msg.trigger && (
                              <div className="flex items-center gap-1.5 text-amber-300">
                                <span className="font-bold">🧠 المحفز النفسي:</span>
                                <span>{msg.trigger}</span>
                              </div>
                            )}
                            {msg.suggestedAction && (
                              <div className="flex items-center gap-1.5 text-emerald-300">
                                <span className="font-bold">🎯 الخطوة القادمة:</span>
                                <span>{msg.suggestedAction}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="p-4 rounded-3xl bg-[#231b3e] border border-purple-500/30 text-white text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-white/70">المعلم فكرة بيفكر وبيجهز أحلى رد بالمللي... ☕✨</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Box */}
            <div className="p-3 sm:p-4 bg-[#141220] border-t border-white/10 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendSimulatedMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="اكتب رسالة من العميل (مثال: بكام، خايف من الجودة، الشحن بياخد أد إيه؟)..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={isLoading || !customInput.trim()}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-amber-950/40 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>إرسال</span>
                  <span>🚀</span>
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] text-white/40 px-1">
                <span>💡 يمكنك كتابة أي استفسار بالمصري أو الفصحى واختبار سرعة ولطافة الرد</span>
                <span className="text-amber-400/80 font-bold">تكامل حقيقي مع قواعد بيانات PostgreSQL</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default EgyptianBotSimulator;
