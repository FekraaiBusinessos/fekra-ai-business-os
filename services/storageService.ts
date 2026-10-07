/**
 * Fekra AI Business OS - Universal Studio Persistence Engine
 * Saves each user's studio projects, work history, and settings safely.
 * Includes intelligent storage quota management to prevent browser storage exhaustion.
 */

const STORAGE_PREFIX = 'fekra_studio_';

export type StudioStorageKey = 
  | 'creator'
  | 'photoshoot'
  | 'prompt'
  | 'voiceover'
  | 'branding'
  | 'campaign'
  | 'plan'
  | 'storyboard'
  | 'marketing'
  | 'edit';

// Helper to safely serialize and prune large binary data if nearing storage limit
function safeSerialize(data: any): string {
  try {
    return JSON.stringify(data);
  } catch (e) {
    console.warn('[StudioStorage] Circular reference or serialization error:', e);
    return '[]';
  }
}

/**
 * Prune project history images if storage quota is approached
 */
function pruneHeavyData(projects: any[]): any[] {
  return projects.map(proj => {
    const clone = { ...proj };
    // Keep at most 4 history items to prevent hitting localStorage 5MB quota
    if (Array.isArray(clone.history) && clone.history.length > 4) {
      clone.history = clone.history.slice(0, 4);
    }
    return clone;
  });
}

export function saveStudioProjects<T>(studioKey: StudioStorageKey, projects: T[]): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  const key = `${STORAGE_PREFIX}${studioKey}`;

  try {
    const serialized = safeSerialize(projects);
    localStorage.setItem(key, serialized);
    localStorage.setItem(`${STORAGE_PREFIX}last_saved`, new Date().toISOString());
    return true;
  } catch (err: any) {
    const isQuota = err?.name === 'QuotaExceededError' || err?.code === 22 || err?.number === -2147024882;
    if (isQuota) {
      console.warn(`[StudioStorage] Quota limit reached for ${studioKey}. Pruning heavy history and retrying...`);
      try {
        const pruned = pruneHeavyData(projects);
        localStorage.setItem(key, safeSerialize(pruned));
        return true;
      } catch (retryErr) {
        console.error('[StudioStorage] Failed to save even after pruning:', retryErr);
      }
    }
    return false;
  }
}

export function loadStudioProjects<T>(studioKey: StudioStorageKey): T[] | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  const key = `${STORAGE_PREFIX}${studioKey}`;
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as T[];
    }
    return null;
  } catch (e) {
    console.warn(`[StudioStorage] Could not restore projects for ${studioKey}:`, e);
    return null;
  }
}

export function getLastSavedTimestamp(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}last_saved`);
  } catch {
    return null;
  }
}

export function clearStudioProjects(studioKey: StudioStorageKey): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${studioKey}`);
  } catch (e) {
    console.error(e);
  }
}
