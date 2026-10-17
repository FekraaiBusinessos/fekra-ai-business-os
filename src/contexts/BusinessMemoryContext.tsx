import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getAuthHeaders, getGoogleUser } from '../../services/googleAuthService';

export interface BrandMemory {
  brandName: string;
  industry: string;
  primaryColor: string;
  secondaryColor: string;
  neutralColor: string;
  brandTone: string;
  faceLockProfile?: {
    locked: boolean;
    features?: string[];
    details?: any;
  };
}

export interface ProductMemoryItem {
  id: number;
  sku: string;
  name: string;
  nameAr?: string;
  category: string;
  unitPrice: number;
  stockQuantity: number;
  imageUrl?: string | null;
  currency?: string;
}

export interface CampaignMemoryItem {
  id: number;
  name: string;
  targetSegment?: string;
  productId?: number;
  platform?: string;
  status?: string;
  createdAt: string;
}

export interface BusinessMemoryState {
  isInitialized: boolean;
  tenantId: string;
  brand: BrandMemory;
  inventory: ProductMemoryItem[];
  selectedProduct: ProductMemoryItem | null;
  campaigns: CampaignMemoryItem[];
  consciousnessScore: number;
  systemStatus: string;
  recentObjections: string[];
  
  // Actions & Mutators
  setSelectedProductId: (id: number | null) => void;
  updateBrandMemory: (updates: Partial<BrandMemory>) => Promise<void>;
  recordCampaignDecision: (campaign: any) => Promise<void>;
  recordCustomerInteraction: (topic: string, objection?: string) => void;
  refreshMemory: () => Promise<void>;
}

const DEFAULT_BRAND_MEMORY: BrandMemory = {
  brandName: 'Fekra AI Studio',
  industry: 'التجارة الإلكترونية والتسويق الرقمي',
  primaryColor: '#00e5ff',
  secondaryColor: '#ec4899',
  neutralColor: '#090d16',
  brandTone: 'احترافي، مقنع، وسلطوي مباشر',
  faceLockProfile: {
    locked: true,
    features: ['face', 'hair', 'eyes', 'smile', 'skin_tone', 'age', 'energy']
  }
};

const BusinessMemoryContext = createContext<BusinessMemoryState | undefined>(undefined);

export const BusinessMemoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [tenantId, setTenantId] = useState<string>('tenant_default_demo');
  const [brand, setBrand] = useState<BrandMemory>(DEFAULT_BRAND_MEMORY);
  const [inventory, setInventory] = useState<ProductMemoryItem[]>([]);
  const [selectedProductId, setSelectedProductIdState] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignMemoryItem[]>([]);
  const [consciousnessScore, setConsciousnessScore] = useState<number>(94.5);
  const [systemStatus, setSystemStatus] = useState<string>('الوعي الداخلي متصل بنسبة 100% ✓');
  const [recentObjections, setRecentObjections] = useState<string[]>([
    'التردد بشأن السعر والتكلفة الاستثمارية',
    'طلب تأجيل إطلاق الحملة للأسبوع القادم',
    'الرغبة في ضمان استرداد فوري وتأكيد جودة النتائج'
  ]);

  const refreshMemory = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const currentUser = getGoogleUser();
      const activeTenant = currentUser?.tenantId || 'tenant_default_demo';
      setTenantId(activeTenant);

      // 1. Fetch Inventory Memory
      try {
        const invRes = await fetch('/api/execution/inventory', { headers });
        if (invRes.ok) {
          const invData = await invRes.json();
          if (Array.isArray(invData) && invData.length > 0) {
            setInventory(invData);
            // Default selected product to Fiesta or first product if none selected
            setSelectedProductIdState(prev => {
              if (prev !== null && invData.some(p => p.id === prev)) return prev;
              const fiesta = invData.find(p => p.sku === 'FIESTA-BAN-001' || p.name?.toLowerCase().includes('fiesta'));
              return fiesta ? fiesta.id : invData[0].id;
            });
          }
        }
      } catch (e) {
        console.warn('[MemoryEngine] Inventory sync handled safely:', e);
      }

      // 2. Fetch Brand DNA Memory
      try {
        const dnaRes = await fetch('/api/dna', { headers });
        if (dnaRes.ok) {
          const dnaData = await dnaRes.json();
          if (dnaData && dnaData.brandName) {
            setBrand({
              brandName: dnaData.brandName,
              industry: dnaData.industry || DEFAULT_BRAND_MEMORY.industry,
              primaryColor: dnaData.primaryColor || DEFAULT_BRAND_MEMORY.primaryColor,
              secondaryColor: dnaData.secondaryColor || DEFAULT_BRAND_MEMORY.secondaryColor,
              neutralColor: dnaData.neutralColor || DEFAULT_BRAND_MEMORY.neutralColor,
              brandTone: dnaData.brandPersonality || DEFAULT_BRAND_MEMORY.brandTone,
              faceLockProfile: dnaData.faceLockProfile || DEFAULT_BRAND_MEMORY.faceLockProfile
            });
          }
        }
      } catch (e) {
        console.warn('[MemoryEngine] Brand DNA sync handled safely:', e);
      }

      // 3. Fetch Consciousness Telemetry & Equilibrium
      try {
        const brainRes = await fetch('/api/brain/consciousness', { headers });
        if (brainRes.ok) {
          const brainData = await brainRes.json();
          if (brainData.cognitiveEquilibrium) {
            setConsciousnessScore(Number(brainData.cognitiveEquilibrium));
            setSystemStatus('الوعي الداخلي متصل ومتكامل عبر المحركات الستة ✓');
          }
        }
      } catch (e) {
        console.warn('[MemoryEngine] Consciousness telemetry sync handled safely:', e);
      }

      // 4. Fetch Campaign History Memory
      try {
        const campRes = await fetch('/api/campaigns', { headers });
        if (campRes.ok) {
          const campData = await campRes.json();
          if (Array.isArray(campData)) {
            setCampaigns(campData);
          }
        }
      } catch (e) {
        console.warn('[MemoryEngine] Campaign history sync handled safely:', e);
      }

      setIsInitialized(true);
    } catch (err) {
      console.warn('[MemoryEngine] Unified memory hydration handled gracefully:', err);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    refreshMemory();
  }, [refreshMemory]);

  const setSelectedProductId = useCallback((id: number | null) => {
    setSelectedProductIdState(id);
  }, []);

  const updateBrandMemory = useCallback(async (updates: Partial<BrandMemory>) => {
    setBrand(prev => ({ ...prev, ...updates }));
    try {
      const headers = await getAuthHeaders();
      await fetch('/api/dna', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          brandName: updates.brandName || brand.brandName,
          industry: updates.industry || brand.industry,
          primaryColor: updates.primaryColor || brand.primaryColor,
          secondaryColor: updates.secondaryColor || brand.secondaryColor,
          neutralColor: updates.neutralColor || brand.neutralColor,
          brandPersonality: updates.brandTone || brand.brandTone,
          faceLockProfile: updates.faceLockProfile || brand.faceLockProfile
        })
      });
    } catch (err) {
      console.warn('[MemoryEngine] Update brand memory handled:', err);
    }
  }, [brand]);

  const recordCampaignDecision = useCallback(async (campaign: any) => {
    setCampaigns(prev => [campaign, ...prev]);
  }, []);

  const recordCustomerInteraction = useCallback((topic: string, objection?: string) => {
    if (objection) {
      setRecentObjections(prev => [objection, ...prev.slice(0, 4)]);
    }
  }, []);

  const selectedProduct = inventory.find(p => p.id === selectedProductId) || inventory[0] || null;

  return (
    <BusinessMemoryContext.Provider
      value={{
        isInitialized,
        tenantId,
        brand,
        inventory,
        selectedProduct,
        campaigns,
        consciousnessScore,
        systemStatus,
        recentObjections,
        setSelectedProductId,
        updateBrandMemory,
        recordCampaignDecision,
        recordCustomerInteraction,
        refreshMemory
      }}
    >
      {children}
    </BusinessMemoryContext.Provider>
  );
};

export const useBusinessMemory = (): BusinessMemoryState => {
  const context = useContext(BusinessMemoryContext);
  if (!context) {
    throw new Error('useBusinessMemory must be used within a BusinessMemoryProvider');
  }
  return context;
};
