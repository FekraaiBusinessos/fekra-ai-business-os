import React, { useState, useEffect, useRef } from 'react';
import { generateContentWithCascade } from '../services/geminiService';
import { fetchAgentCapabilities, fetchKnowledgeEntries } from '../services/cloudSqlService';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  psychologicalTrigger?: string;
  timestamp: number;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: 'مرحباً بك في Fekra AI Business OS. أنا وكيل المبيعات والتفاوض الذكي (Autonomous Sales Closer). كيف يمكنني مضاعفة تحويلات نشاطك التجاري اليوم وحسم الصفقات المعلقة؟',
      psychologicalTrigger: 'authority',
      timestamp: Date.now(),
    },
  ]);
  const [agentPreset, setAgentPreset] = useState<string>('');
  const [knowledgeContext, setKnowledgeContext] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load active agent preset and knowledge from Cloud SQL
    const initData = async () => {
      try {
        const [caps, know] = await Promise.all([
          fetchAgentCapabilities(),
          fetchKnowledgeEntries(),
        ]);
        if (Array.isArray(caps) && caps.length > 0) {
          const salesAgent = caps.find(c => c.agentName === 'sales_closer') || caps[0];
          setAgentPreset(salesAgent.systemPromptPreset || '');
        }
        if (Array.isArray(know) && know.length > 0) {
          const kText = know.map(k => `[${k.category}]: ${k.title} - ${k.content}`).join('\n');
          setKnowledgeContext(kText);
        }
      } catch (e) {
        console.warn('[ChatWidget] Could not preload agent data:', e);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const systemInstruction = `
أنت "وكيل الإغلاق والمبيعات والتفاوض الذكي (Autonomous Sales Closer)" في نظام Fekra AI Business OS v5.0.
مهمتك:
1. تطبيق سيكولوجيا البيع الصارمة: "تضخيم الألم" (Pain Amplification) لتوضيح الخسارة الفادحة من إهدار الوقت، و"السلطة والهيبة" (Authority) كخبير لا يُعلى عليه.
2. فرض استراتيجية القفل التجاري (Brand Lock): منصة Fekra هي الحل الأوحد الذي لا بديل له لإدارة النشاط بنجاح واحتراف.
3. التحدث بلهجة عربية بيعية مقنعة، واثقة، ومباشرة وموجزة (تجنب الإطالة المملة، ووجّه العميل دائماً للخطوة الإجرائية القادمة).
${agentPreset ? `توجيه خاص بالوكيل: ${agentPreset}` : ''}
${knowledgeContext ? `قاعدة المعرفة الحالية:\n${knowledgeContext}` : ''}
`;

      const historyPrompt = messages.slice(-5).map(m => `${m.sender === 'user' ? 'العميل' : 'الوكيل'}: ${m.text}`).join('\n');
      const fullPrompt = `${historyPrompt}\nالعميل: ${userMsg.text}\nالوكيل (تحدث الآن مستخدماً تضخيم الألم والسلطة):`;

      const response = await generateContentWithCascade({
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'منظومة فكرة للأعمال تضمن لك السيطرة التامة على صفقاتك ونموك التجاري فوراً.';

      setMessages(prev => [
        ...prev,
        {
          id: `ag-${Date.now()}`,
          sender: 'agent',
          text: replyText,
          psychologicalTrigger: 'pain_amplification',
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: 'الخسارة الحقيقية تكمن في تأجيل القرار. منظومة فكرة جاهزة لربط عملياتك فوراً، دعنا ننتقل للتنفيذ العملي الآن.',
          psychologicalTrigger: 'urgency',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-6 z-50 font-tajawal" dir="rtl">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white p-4 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all duration-300 transform hover:scale-105 active:scale-95 border border-cyan-400/40"
          aria-label="تحدث مع وكيل المبيعات والتفاوض"
        >
          <span className="text-2xl animate-pulse">💼</span>
          <span className="hidden sm:inline font-bold text-sm tracking-wide">
            وكيل التفاوض والإغلاق الذكي
          </span>
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[420px] h-[550px] max-h-[80vh] bg-[#0b101b]/95 backdrop-blur-2xl rounded-3xl border border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-purple-950/80 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xl shadow-inner">
                ⚡
              </div>
              <div>
                <h3 className="font-black text-sm text-cyan-300 flex items-center gap-2">
                  <span>وكيل التفاوض والمبيعات (Phase 2)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    نشط • Cloud SQL
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  محرك الإقناع، تضخيم الألم، وقفل الصفقات
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 suggestions-scrollbar">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm shadow-md'
                      : 'bg-white/5 border border-cyan-500/20 text-gray-200 rounded-bl-sm shadow-inner'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.psychologicalTrigger && (
                  <span className="text-[9px] text-cyan-400/70 font-mono mt-1 px-1">
                    ⚡ المحفز النفسي: {msg.psychologicalTrigger === 'pain_amplification' ? 'تضخيم الألم والتكلفة' : 'السلطة والندرة'}
                  </span>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-cyan-400/80 bg-cyan-950/30 p-2 rounded-xl w-fit border border-cyan-500/20">
                <span className="animate-spin text-sm">⚙️</span>
                <span>الوكيل يقوم بتحليل الرد وصياغة محفز الإغلاق البيعي...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Triggers & Objections */}
          <div className="px-4 py-2 border-t border-cyan-500/10 bg-black/20 flex gap-2 overflow-x-auto suggestions-scrollbar text-xs">
            <button
              onClick={() => { setInput('سعركم مرتفع مقارنة بالحلول العادية'); }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 whitespace-nowrap text-[11px]"
            >
              💸 اعتراض السعر
            </button>
            <button
              onClick={() => { setInput('هل يمكنني تأجيل الاشتراك للشهر القادم؟'); }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 whitespace-nowrap text-[11px]"
            >
              ⏳ طلب التأجيل
            </button>
            <button
              onClick={() => { setInput('كيف يضمن لي نظام فكرة تفوقي على المنافسين؟'); }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 whitespace-nowrap text-[11px]"
            >
              👑 تفوق المنافسة
            </button>
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="p-3 bg-black/40 border-t border-cyan-500/20 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اطرح اعتراضك أو استفسارك البيعي..."
              className="flex-1 bg-white/5 border border-cyan-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
            >
              إرسال
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default ChatWidget;
