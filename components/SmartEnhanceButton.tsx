import React, { useState } from 'react';
import { smartEnhanceText, SmartEnhanceContext } from '../services/geminiService';

interface SmartEnhanceButtonProps {
  currentText: string;
  onApplyText: (newText: string) => void;
  context?: SmartEnhanceContext;
  label?: string;
  size?: 'sm' | 'md';
}

export const SmartEnhanceButton: React.FC<SmartEnhanceButtonProps> = ({
  currentText,
  onApplyText,
  context = 'general' as SmartEnhanceContext,
  label = 'تحسين ذكي ومبدع',
  size = 'sm'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previousText, setPreviousText] = useState<string | null>(null);
  const [justEnhanced, setJustEnhanced] = useState(false);

  const handleEnhance = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentText || !currentText.trim()) {
      return;
    }

    setIsLoading(true);
    setPreviousText(currentText);

    try {
      const enhanced = await smartEnhanceText(currentText, context);
      if (enhanced && enhanced !== currentText) {
        onApplyText(enhanced);
        setJustEnhanced(true);
        setTimeout(() => setJustEnhanced(false), 3000);
      }
    } catch (err) {
      console.warn('[Fekra Engine] Enhancement notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (previousText !== null) {
      onApplyText(previousText);
      setPreviousText(null);
      setJustEnhanced(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        onClick={handleEnhance}
        disabled={isLoading || !currentText?.trim()}
        title="انقر لتحسين هذا النص أو الأمر بذكاء وإبداع فائق بالذكاء الاصطناعي"
        className={`group inline-flex items-center gap-1 font-bold rounded-lg transition-all border ${
          size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
        } ${
          isLoading
            ? 'bg-purple-600/30 text-purple-200 border-purple-500/30 cursor-wait'
            : justEnhanced
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
            : 'bg-gradient-to-r from-purple-600/20 to-[var(--color-accent)]/20 hover:from-purple-600/30 hover:to-[var(--color-accent)]/30 text-white/90 hover:text-white border-white/10 hover:border-[var(--color-accent)]/40 shadow-sm'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin"></div>
            <span className="font-medium text-[10px]">جاري التحسين المبدع...</span>
          </>
        ) : justEnhanced ? (
          <>
            <span className="text-emerald-400">✓</span>
            <span>تم التحسين بنجاح!</span>
          </>
        ) : (
          <>
            <span className="text-amber-300 group-hover:scale-110 transition-transform">✨</span>
            <span>{label}</span>
          </>
        )}
      </button>

      {previousText !== null && !isLoading && (
        <button
          onClick={handleUndo}
          title="التراجع إلى النص السابق"
          className="text-[10px] px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors font-medium border border-white/5"
        >
          ↩ تراجع
        </button>
      )}
    </div>
  );
};

export default SmartEnhanceButton;
