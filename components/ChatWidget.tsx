import React, { useState, useEffect, useRef } from 'react';
import { generateContentWithCascade } from '../services/geminiService';
import { fetchAgentCapabilities, fetchKnowledgeEntries } from '../services/cloudSqlService';
import { useBusinessMemory } from '../src/contexts/BusinessMemoryContext';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  psychologicalTrigger?: string;
  timestamp: number;
}

export interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  onClose,
  initialContext
}) => {
  const { brand, inventory, selectedProduct, recentObjections, recordCustomerInteraction } = useBusinessMemory();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: `مرحباً بك! أنا وكيل المبيعات والتفاوض الذكي لنشاط "${brand.brandName || 'Fekra OS'}". كيف يمكنني مساعدتك في حسم الصفقات، الرد على اعتراضات العملاء، أو إغلاق طلبات ${selectedProduct ? selectedProduct.nameAr || selectedProduct.name : 'منتجاتك'} الآن؟`,
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

  if (!isOpen) {
    return null;
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const userText = input.trim();
    if (!userText || isTyping) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Psychological Trigger determination based on objection keywords
      let trigger = 'authority';
      if (/سعر|غالي|تكلفة|فلوس|خصم/i.test(userText)) {
        trigger = 'pain_amplification'; // تضخيم تكلفة إهدار الوقت والفرصة البديلة
        recordCustomerInteraction('اعتراض السعر', userText);
      } else if (/أفكر|بعدين|بكره|تأجيل|أسبوع/i.test(userText)) {
        trigger = 'urgency'; // الإلحاح ونفاذ الفرصة
        recordCustomerInteraction('طلب التأجيل', userText);
      } else if (/منافس|شركة تانية|غيركم/i.test(userText)) {
        trigger = 'authority';
        recordCustomerInteraction('مقارنة بالمنافسين', userText);
      }

      const activeProdContext = selectedProduct 
        ? `المنتج المختار حالياً: ${selectedProduct.nameAr || selectedProduct.name} - السعر: ${(selectedProduct.unitPrice / 100).toFixed(2)} ${selectedProduct.currency || 'EGP'} - المخزون المتوفر: ${selectedProduct.stockQuantity} قطعة.`
        : '';

      const prompt = `
[ROLE: CHIEF SALES CLOSER & NEGOTIATION AGENT (PHASE 2 - FEKRA AI BUSINESS OS)]
هوية المنشأة: ${brand.brandName} (${brand.industry}).
دستور الألوان والنبرة: ${brand.brandTone}.
${activeProdContext}
قاعدة المعرفة:
${knowledgeContext}

السياق الإضافي:
${initialContext || ''}

بروفايل الوكيل:
${agentPreset || 'وكيل مبيعات مصري محترف وخبير في علم النفس البيعي وحسم الصفقات وتضخيم ألم التأجيل'}

المحفز النفسي المطلوب استخدامه في الرد: "${trigger}".
سؤال أو اعتراض العميل: "${userText}"

تعليمات صارمة:
1. تحدث بالعامية المصرية الراقية والواثقة أو العربية الفصحى المبسطة بأسلوب محترف ومقنع.
2. استخدم محفز "${trigger}" لحسم التردد فوراً دون فزلكة.
3. قدم حلاً فورياً وعرضاً واضحاً يشجع على الحسم اللحظي.
4. الرد لا يتجاوز 3-4 جمل مركزة ومباشرة.
`;

      const response = await generateContentWithCascade({
        contents: prompt,
        preferredModels: ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest']
      });

      const replyText = response.text?.trim() || 'تمام جداً! نقدر ننفذ طلبك فوراً ونضمن لك أعلى عائد وأسرع تسليم اليوم.';
      
      const agentMessage: Message = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        text: replyText,
        psychologicalTrigger: trigger,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (err) {
      console.error('[ChatWidget] Generation failed:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: 'معاك لحظة بلحظة! طلبك قيد التنفيذ وفريقنا جاهز لتأكيد الصفقة بأفضل شروط لك.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div className="w-full max-w-lg h-[600px] max-h-[90vh] bg-[#0b101b] rounded-3xl border border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-tajawal">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-purple-950/80 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xl shadow-inner">
              💼
            </div>
            <div>
              <h3 className="font-black text-sm text-cyan-300 flex items-center gap-2">
                <span>وكيل التفاوض والمبيعات (Phase 2)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  متصل بذاكرة المنشأة ✓
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                {brand.brandName} • {selectedProduct ? selectedProduct.nameAr || selectedProduct.name : 'محرك حسم الصفقات'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-sm"
            title="إغلاق"
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
                  ⚡ المحفز النفسي: {msg.psychologicalTrigger === 'pain_amplification' ? 'تضخيم الألم والتكلفة' : msg.psychologicalTrigger === 'urgency' ? 'الإلحاح وحسم التردد' : 'السلطة والندرة'}
                </span>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-cyan-400/80 bg-cyan-950/30 p-2 rounded-xl w-fit border border-cyan-500/20">
              <span className="animate-spin text-sm">⚙️</span>
              <span>الوكيل يحلل الذاكرة ويصيغ محفز الإغلاق البيعي...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Triggers & Objections from Memory */}
        <div className="px-4 py-2 border-t border-cyan-500/10 bg-black/20 flex gap-2 overflow-x-auto suggestions-scrollbar text-xs">
          <button
            onClick={() => { setInput('سعركم مرتفع مقارنة بالحلول العادية في السوق'); }}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 whitespace-nowrap text-[11px]"
          >
            💸 اعتراض السعر
          </button>
          <button
            onClick={() => { setInput('هل يمكنني تأجيل الاشتراك أو الدفع للشهر القادم؟'); }}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 whitespace-nowrap text-[11px]"
          >
            ⏳ طلب التأجيل
          </button>
          <button
            onClick={() => { setInput('كيف يضمن لي نظام فكرة تفوقي التام على المنافسين؟'); }}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 whitespace-nowrap text-[11px]"
          >
            👑 تفوق المنافسة
          </button>
          {recentObjections.length > 0 && (
            <button
              onClick={() => { setInput(recentObjections[0]); }}
              className="px-2.5 py-1 rounded-lg bg-cyan-600/15 hover:bg-cyan-600/30 text-cyan-200 border border-cyan-400/30 whitespace-nowrap text-[11px]"
            >
              🧠 من الذاكرة: {recentObjections[0].substring(0, 18)}...
            </button>
          )}
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
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            إرسال
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget;
