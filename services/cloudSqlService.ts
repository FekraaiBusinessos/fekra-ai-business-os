/**
 * Fekra AI Solutions - Cloud SQL & Multi-Tenant Synchronization Client
 * Bridges frontend state with backend Cloud SQL PostgreSQL database & tenant isolation
 */

import { auth } from '../src/lib/firebase';

export interface ProductionPayload {
  type: 'image' | 'video' | 'banner' | 'story';
  prompt: string;
  assetUrl: string;
  aspectRatio?: string;
  metaInfo?: Record<string, any>;
  isCommunityShowcase?: boolean;
}

export interface KnowledgeEntryPayload {
  title: string;
  category: 'policy' | 'offer' | 'psychology_rule' | 'product' | 'brand_voice' | 'general';
  content: string;
  metadata?: Record<string, any>;
}

import { getAuthHeaders } from './googleAuthService';

/**
 * Fetches community visual showcase from Cloud SQL
 */
export async function fetchCommunityShowcaseFromCloudSQL() {
  try {
    const res = await fetch('/api/productions');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[SyncService] Failed to fetch community showcase from Cloud SQL:', err);
    return [];
  }
}

/**
 * Saves generated production to Cloud SQL with tenant isolation
 */
export async function syncProductionToCloudSQL(payload: ProductionPayload) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/productions', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[SyncService] Cloud SQL sync skipped (${res.status}):`, errText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn('[SyncService] Network error syncing to Cloud SQL:', err);
    return null;
  }
}

/**
 * Fetches tenant cognitive knowledge base entries (Phase 1 AI Foundation)
 */
export async function fetchKnowledgeEntries() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/knowledge', {
      method: 'GET',
      headers,
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn('[SyncService] Error fetching knowledge entries:', err);
    return [];
  }
}

/**
 * Fetches agent capabilities matrix & psychological triggers
 */
export async function fetchAgentCapabilities() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/agent-capabilities', {
      method: 'GET',
      headers,
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn('[SyncService] Error fetching agent capabilities:', err);
    return [];
  }
}
