import { StudioWorkItem } from '../types';

const STORAGE_KEY = 'fekra_user_studio_works_v1';
const DB_NAME = 'fekra_studio_db';
const STORE_NAME = 'studio_works';
const DB_VERSION = 1;
const MAX_LOCAL_STORAGE_ITEMS = 5; // Keep localStorage small to prevent quota limits

// In-memory cache for ultra-fast, synchronous UI queries
let inMemoryWorks: StudioWorkItem[] = [];
let isDbInitialized = false;

/**
 * Dispatches an event to notify all components that user studio works updated.
 */
function notifyUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fekra_studio_works_updated'));
  }
}

/**
 * Open or create the IndexedDB database for large multi-megabyte image storage.
 */
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Loads all items from IndexedDB into memory and merges with local storage.
 */
async function loadFromIndexedDB(): Promise<StudioWorkItem[]> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const items: StudioWorkItem[] = request.result || [];
        resolve(items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      };
      request.onerror = () => {
        resolve([]);
      };
    });
  } catch (err) {
    console.warn('[Fekra Studio] IndexedDB load failed, using local cache:', err);
    return [];
  }
}

/**
 * Saves a single work item to IndexedDB.
 */
async function persistToIndexedDB(item: StudioWorkItem): Promise<void> {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(item);
  } catch (err) {
    console.warn('[Fekra Studio] IndexedDB save failed:', err);
  }
}

/**
 * Deletes a work item from IndexedDB.
 */
async function removeFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);
  } catch (err) {
    console.warn('[Fekra Studio] IndexedDB delete failed:', err);
  }
}

/**
 * Clears all items from IndexedDB.
 */
async function clearIndexedDB(): Promise<void> {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
  } catch (err) {
    console.warn('[Fekra Studio] IndexedDB clear failed:', err);
  }
}

/**
 * Safely persists a trimmed subset to localStorage without throwing QuotaExceeded errors.
 */
function safeSaveToLocalStorage(items: StudioWorkItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Only store at most MAX_LOCAL_STORAGE_ITEMS in localStorage to prevent 5MB overflow
    const trimmed = items.slice(0, MAX_LOCAL_STORAGE_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (quotaErr) {
    // If quota exceeded, try storing with empty images in localStorage as fallback
    try {
      const lightweight = items.slice(0, 3).map(w => ({
        ...w,
        image: { ...w.image, base64: '' } // strip large base64 payload from localStorage
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
    } catch {
      // If even lightweight fails, remove the key completely from localStorage
      // All data is safely preserved in IndexedDB
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

/**
 * Initial synchronous bootstrap from localStorage.
 */
function initFromLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryWorks = parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      }
    }
  } catch (e) {
    inMemoryWorks = [];
  }
}

// Bootstrap on module load
initFromLocalStorage();

// Asynchronously hydrate and sync with high-capacity IndexedDB
if (typeof window !== 'undefined' && !isDbInitialized) {
  isDbInitialized = true;
  loadFromIndexedDB().then(dbItems => {
    if (dbItems && dbItems.length > 0) {
      // Merge with in-memory works
      const existingIds = new Set(inMemoryWorks.map(w => w.id));
      const newFromDb = dbItems.filter(w => !existingIds.has(w.id));
      inMemoryWorks = [...inMemoryWorks, ...newFromDb].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      safeSaveToLocalStorage(inMemoryWorks);
      notifyUpdate();
    } else if (inMemoryWorks.length > 0) {
      // Migrate initial localStorage items to IndexedDB
      inMemoryWorks.forEach(item => persistToIndexedDB(item));
    }
  });
}

/**
 * Retrieves all saved works from persistent storage synchronously.
 */
export function getStudioWorks(): StudioWorkItem[] {
  return [...inMemoryWorks].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

/**
 * Saves a new creative work to the user's persistent studio portfolio.
 * Stores in high-capacity IndexedDB and keeps memory cache updated.
 */
export function saveStudioWork(item: Omit<StudioWorkItem, 'id' | 'createdAt'>): StudioWorkItem {
  const newItem: StudioWorkItem = {
    ...item,
    id: `work_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
    isFavorite: item.isFavorite ?? false,
  };

  inMemoryWorks = [newItem, ...inMemoryWorks.filter(w => w.id !== newItem.id)];

  // Asynchronously persist full-fidelity image to IndexedDB (no 5MB quota limit)
  persistToIndexedDB(newItem);

  // Safely update small localStorage preview cache
  safeSaveToLocalStorage(inMemoryWorks);

  notifyUpdate();
  return newItem;
}

/**
 * Toggles the favorite status of a work in the user's studio.
 */
export function toggleFavoriteStudioWork(id: string): boolean {
  let newStatus = false;
  inMemoryWorks = inMemoryWorks.map(item => {
    if (item.id === id) {
      newStatus = !item.isFavorite;
      const updatedItem = { ...item, isFavorite: newStatus };
      persistToIndexedDB(updatedItem);
      return updatedItem;
    }
    return item;
  });

  safeSaveToLocalStorage(inMemoryWorks);
  notifyUpdate();
  return newStatus;
}

/**
 * Deletes a work from the user's studio portfolio.
 */
export function deleteStudioWork(id: string): void {
  inMemoryWorks = inMemoryWorks.filter(item => item.id !== id);
  removeFromIndexedDB(id);
  safeSaveToLocalStorage(inMemoryWorks);
  notifyUpdate();
}

/**
 * Clears all works from storage.
 */
export function clearAllStudioWorks(): void {
  inMemoryWorks = [];
  clearIndexedDB();
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  notifyUpdate();
}

/**
 * Exports all user works as a JSON file backup.
 */
export function exportStudioWorksJSON(): string {
  const works = getStudioWorks();
  return JSON.stringify({
    app: 'Fekra AI Solutions',
    version: '5.0',
    exportedAt: new Date().toISOString(),
    totalWorks: works.length,
    works: works,
  }, null, 2);
}

/**
 * Imports works from a JSON file backup.
 */
export function importStudioWorksJSON(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    const incoming: StudioWorkItem[] = Array.isArray(data) ? data : data?.works;
    if (!Array.isArray(incoming)) {
      return { success: false, count: 0, error: 'تنسيق الملف غير صالح' };
    }

    const existingIds = new Set(inMemoryWorks.map(w => w.id));
    const toAdd = incoming.filter(w => w && w.id && !existingIds.has(w.id));
    
    toAdd.forEach(item => persistToIndexedDB(item));
    inMemoryWorks = [...toAdd, ...inMemoryWorks].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    safeSaveToLocalStorage(inMemoryWorks);
    notifyUpdate();
    return { success: true, count: toAdd.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'خطأ أثناء استيراد البيانات' };
  }
}
