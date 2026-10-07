import { getUserGeminiKey, hasUserGeminiKey, getActiveApiKey, clearServiceCaches } from './geminiService';

export interface QuotaValidationResult {
  allowed: boolean;
  reason?: string;
  actionRequired?: 'CONNECT_KEY' | 'WAIT_COOLDOWN' | 'INPUT_REQUIRED' | 'DUPLICATE_CONFIRM';
}

export interface QuotaStats {
  totalRequests: number;
  savedSpamRequests: number;
  lastUsedTimestamp: number;
  dailyRequestsCount: number;
  dailyVideosCount: number;
  lastResetDate: string;
}

export interface VideoQuotaStatus {
  dailyFreeLimit: number;
  usedToday: number;
  remainingToday: number;
  hasCustomKey: boolean;
  canGenerate: boolean;
  renewalCycle: string;
}

export const DAILY_FREE_VIDEOS_LIMIT = 3;

export interface DailyQuotaStatus {
  source: 'google_daily_free' | 'user_custom_key';
  usedToday: number;
  dailyLimit: number;
  remainingToday: number;
  percentUsed: number;
  isAvailable: boolean;
  renewalCycle: string;
  statusText: string;
  videoStatus: VideoQuotaStatus;
}

const STORAGE_QUOTA_STATS = 'fekra_quota_stats';
const COOLDOWN_MS = 300; // Ultra-fast debounce: allows rapid iteration while preventing accidental double clicks
let lastRequestTimestamp = 0;

function getTodayString(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export function getQuotaStats(): QuotaStats {
  const today = getTodayString();
  const defaultStats: QuotaStats = {
    totalRequests: 0,
    savedSpamRequests: 0,
    lastUsedTimestamp: 0,
    dailyRequestsCount: 0,
    dailyVideosCount: 0,
    lastResetDate: today
  };

  if (typeof window === 'undefined') {
    return defaultStats;
  }

  try {
    const raw = localStorage.getItem(STORAGE_QUOTA_STATS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-refresh daily counter if new day
      if (parsed.lastResetDate !== today) {
        parsed.dailyRequestsCount = 0;
        parsed.dailyVideosCount = 0;
        parsed.lastResetDate = today;
        localStorage.setItem(STORAGE_QUOTA_STATS, JSON.stringify(parsed));
      }
      return { ...defaultStats, ...parsed };
    }
  } catch (e) {
    // fallback
  }

  return defaultStats;
}

function updateQuotaStats(updater: (prev: QuotaStats) => QuotaStats): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getQuotaStats();
    const updated = updater(current);
    localStorage.setItem(STORAGE_QUOTA_STATS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('fekra_quota_stats_updated', { detail: updated }));
  } catch (e) {
    // fallback
  }
}

/**
 * Returns current status of Google Flow video credits (Unrestricted, zero roadblocks).
 */
export function getVideoQuotaStatus(): VideoQuotaStatus {
  const stats = getQuotaStats();
  const hasCustom = hasUserGeminiKey();
  const usedToday = stats.dailyVideosCount || 0;

  return {
    dailyFreeLimit: 999,
    usedToday,
    remainingToday: 999,
    hasCustomKey: hasCustom,
    canGenerate: true,
    renewalCycle: 'متاح ومفتوح دائماً دون قيود'
  };
}

/**
 * Records the generation of a Flow video and increments the daily counter.
 */
export function recordFlowVideoGenerated(): void {
  const today = getTodayString();
  updateQuotaStats(s => ({
    ...s,
    dailyVideosCount: (s.lastResetDate === today ? (s.dailyVideosCount || 0) : 0) + 1,
    lastResetDate: today,
    lastUsedTimestamp: Date.now()
  }));
}

/**
 * Validates whether user can generate a Flow Video (Always unrestricted).
 */
export function validateFlowVideoQuota(): { allowed: boolean; reason?: string; remainingToday: number } {
  return {
    allowed: true,
    remainingToday: 999
  };
}

/**
 * Returns detailed status of Google's daily renewing quota and connection mode.
 */
export function getDailyQuotaStatus(): DailyQuotaStatus {
  const stats = getQuotaStats();
  const hasCustom = hasUserGeminiKey();
  const videoStatus = getVideoQuotaStatus();

  return {
    source: hasCustom ? 'user_custom_key' : 'google_daily_free',
    usedToday: stats.dailyRequestsCount,
    dailyLimit: 9999,
    remainingToday: 9999,
    percentUsed: 0,
    isAvailable: true,
    renewalCycle: 'تتجدد الكوتة تلقائياً كل 24 ساعة (00:00 UTC)',
    statusText: 'كوتة Fekra AI و Google مفتوحة ومفعلة تلقائياً بدون أي قيود',
    videoStatus
  };
}

/**
 * Validates generation requests with ZERO roadblocks for legitimate users.
 * Never blocks, never asks for a key, allowing smooth and immediate creation.
 */
export function validateQuotaUsage(_options?: {
  studio?: string;
  prompt?: string;
  hasRequiredMedia?: boolean;
  isMediaRequired?: boolean;
  fingerprint?: string;
  allowSystemFallback?: boolean;
}): QuotaValidationResult {
  // Always allowed without any roadblocks or forced key requirements
  const now = Date.now();
  lastRequestTimestamp = now;
  const today = getTodayString();
  updateQuotaStats(s => ({
    ...s,
    totalRequests: s.totalRequests + 1,
    dailyRequestsCount: (s.lastResetDate === today ? s.dailyRequestsCount : 0) + 1,
    lastResetDate: today,
    lastUsedTimestamp: now
  }));

  return { allowed: true };
}

/**
 * Refreshes the entire system engine: clears caches, refreshes timestamps,
 * resets transient locks, and broadcasts a fresh state to all studios.
 */
export function refreshSystemEngine(): {
  status: 'refreshed';
  timestamp: number;
  clearedCaches: boolean;
  dailyStatus: DailyQuotaStatus;
} {
  lastRequestTimestamp = 0;
  clearServiceCaches();
  const dailyStatus = getDailyQuotaStatus();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fekra_system_refreshed', { 
      detail: { timestamp: Date.now(), dailyStatus } 
    }));
  }

  return {
    status: 'refreshed',
    timestamp: Date.now(),
    clearedCaches: true,
    dailyStatus
  };
}

/**
 * Triggers the Google Quota Management UI across the application
 */
export function promptGoogleQuotaSetup(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fekra_open_quota_modal', { detail: { reason: 'REQUIRED' } }));
  }
}

