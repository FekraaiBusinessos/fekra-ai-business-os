import React from 'react';
import { GoogleUserProfile } from '../types';
import { logoutGoogle } from '../services/googleAuthService';
import { getDailyQuotaStatus, getVideoQuotaStatus } from '../services/quotaGuard';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: GoogleUserProfile | null;
  onOpenSocialHub: () => void;
  onOpenSignIn: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenSocialHub,
  onOpenSignIn,
}) => {
  if (!isOpen) return null;

  const dailyQuota = getDailyQuotaStatus();
  const videoQuota = getVideoQuotaStatus();

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-[#12111d] border border-white/15 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            <h3 className="text-sm font-black text-white">ملف المستأجر وحساب Google</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* User Card */}
        {user ? (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/80 shadow-md flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-sm font-black text-white block truncate">{user.name}</span>
              <span className="text-[11px] text-white/50 block font-mono truncate">{user.email}</span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>حساب موثق وعزل المستأجر نشط ✓</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/5 text-center space-y-2">
            <span className="text-3xl block">👤</span>
            <p className="text-xs text-white/70 font-bold">لم تسجل الدخول بحساب Google بعد</p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSignIn();
              }}
              className="w-full py-2.5 rounded-xl bg-white text-black font-black text-xs hover:bg-neutral-200 transition-all cursor-pointer"
            >
              تسجيل الدخول الفوري بـ Google
            </button>
          </div>
        )}

        {/* Quota Insights */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-white/80">
            <span className="flex items-center gap-1.5">
              <span>⚡</span>
              <span>كوتة التوليد اليومية المتجددة:</span>
            </span>
            <span className="text-emerald-300 font-mono font-bold">
              {dailyQuota.remainingToday} / {dailyQuota.dailyLimit}
            </span>
          </div>

          <div className="flex items-center justify-between text-white/80">
            <span className="flex items-center gap-1.5">
              <span>🎬</span>
              <span>رصيد فيديو Flow (Google Veo):</span>
            </span>
            <span className="text-cyan-300 font-mono font-bold">
              {videoQuota.remainingToday} من 3 متاح اليوم
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSocialHub();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>🌐</span>
              <span>إدارة منصات التواصل (Social Hub)</span>
            </span>
            <span>←</span>
          </button>

          {user && (
            <button
              type="button"
              onClick={() => {
                logoutGoogle();
                onClose();
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-black transition-colors flex items-center justify-between cursor-pointer active:scale-98"
            >
              <span className="flex items-center gap-2">
                <span>🚪</span>
                <span>تسجيل الخروج من الحساب</span>
              </span>
              <span className="text-[11px] text-red-400/80">خروج فوري</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
