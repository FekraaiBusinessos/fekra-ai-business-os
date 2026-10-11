import React from 'react';
import { WHATSAPP_BETA_URL, WHATSAPP_SECONDARY_URL, PRIMARY_WHATSAPP_PHONE } from '../services/quotaGuard';

interface WhatsAppButtonProps {
  label?: string;
  subLabel?: string;
  variant?: 'primary' | 'secondary' | 'badge' | 'floating';
  className?: string;
  showIcon?: boolean;
}

export const WhatsAppIcon = ({ className = "w-5 h-5 fill-current" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.668-.699c.969.54 1.771.815 2.792.815 3.18 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.801-5.768-5.801zm3.376 8.212c-.14.394-.71.748-1.002.779-.283.03-.647.051-2.072-.544-1.748-.729-2.883-2.508-2.971-2.625-.088-.117-.716-.954-.716-1.819 0-.865.452-1.292.613-1.468.161-.176.351-.22.468-.22.117 0 .234.001.336.006.108.005.253-.041.395.3.146.351.498 1.214.542 1.302.044.088.073.19.015.307-.059.117-.088.19-.176.293-.088.102-.186.228-.266.307-.088.088-.18.184-.077.36.103.176.457.754.981 1.221.674.601 1.242.787 1.418.875.176.088.278.073.38-.044.103-.117.439-.512.556-.688.117-.176.234-.146.395-.088.161.059 1.025.483 1.2.571.176.088.293.132.336.205.044.073.044.424-.096.818zM12 2C6.477 2 2 6.477 2 12c0 1.892.524 3.662 1.435 5.176L2 22l4.966-1.398A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
  </svg>
);

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  label = "احجز مقعدك في البيتا الخاصة وتواصل عبر واتساب",
  subLabel,
  variant = 'primary',
  className = '',
  showIcon = true,
}) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-black transition-all active:scale-95 text-center";
  
  let variantClasses = "bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 hover:from-emerald-400 hover:to-green-500 text-white shadow-xl shadow-emerald-600/30 border border-emerald-400/40 rounded-2xl py-3.5 px-5 text-xs sm:text-sm";
  
  if (variant === 'secondary') {
    variantClasses = "bg-white/10 hover:bg-white/20 text-emerald-300 border border-emerald-500/30 rounded-xl py-2.5 px-4 text-xs";
  } else if (variant === 'badge') {
    variantClasses = "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-lg py-1 px-2.5 text-[10px]";
  }

  return (
    <a
      href={WHATSAPP_BETA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${variantClasses} ${className}`}
      title={`تواصل عبر واتساب (${PRIMARY_WHATSAPP_PHONE})`}
    >
      {showIcon && <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />}
      <div className="flex flex-col items-center">
        <span>{label}</span>
        {subLabel && <span className="text-[10px] font-normal opacity-80">{subLabel}</span>}
      </div>
      <span className="text-xs opacity-70">↗</span>
    </a>
  );
};

export default WhatsAppButton;
