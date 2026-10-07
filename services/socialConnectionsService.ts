import { SocialPlatformId, SocialConnectedAccount, SocialScheduledPost, ImageFile } from '../types';

const SOCIAL_STORAGE_KEY = 'fekra_social_accounts_v1';
const SOCIAL_POSTS_KEY = 'fekra_social_posts_v1';
const SOCIAL_EVENT = 'fekra_social_state_changed';

export const INITIAL_PLATFORMS: SocialConnectedAccount[] = [
  {
    id: 'instagram',
    name: 'Instagram Pro',
    icon: '📸',
    color: 'from-pink-500 via-purple-500 to-amber-500',
    badge: 'Feed, Reels & Stories',
    isConnected: true,
    username: 'Marketing Pro Brand',
    handle: '@fekra_creator',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    followers: '124.8K',
    autoSync: true,
    permissions: ['نشر الوسائط الفورية', 'إدارة التعليقات', 'تحليلات Insights'],
    aspectRatioHint: '1:1 مربع أو 9:16 ريلز',
    characterLimit: 2200,
  },
  {
    id: 'tiktok',
    name: 'TikTok for Business',
    icon: '🎵',
    color: 'from-cyan-400 to-rose-500',
    badge: 'Viral Videos & Commercial',
    isConnected: true,
    username: 'Fekra Creative Studio',
    handle: '@fekra.tiktok',
    avatarUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=120&q=80',
    followers: '286.4K',
    autoSync: true,
    permissions: ['نشر الفيديو التلقائي', 'الصوتيات التجارية', 'إعلانات Spark'],
    aspectRatioHint: '9:16 فيديو عمودي كامل',
    characterLimit: 4000,
  },
  {
    id: 'youtube',
    name: 'YouTube Shorts & Channel',
    icon: '▶️',
    color: 'from-red-600 to-red-700',
    badge: 'Shorts & Long-form 4K',
    isConnected: false,
    username: 'Fekra AI Official',
    handle: '@FekraAIOfficial',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    followers: '54.2K',
    autoSync: false,
    permissions: ['تحميل الفيديوهات', 'إدارة القوائم', 'تحليلات الاستوديو'],
    aspectRatioHint: '9:16 للشورتس و 16:9 للأفقي',
    characterLimit: 5000,
  },
  {
    id: 'twitter',
    name: 'X (Twitter) Pro',
    icon: '𝕏',
    color: 'from-neutral-800 to-black',
    badge: 'Visual Threads & Ads',
    isConnected: false,
    username: 'Fekra Business OS',
    handle: '@FekraBusiness',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    followers: '38.9K',
    autoSync: false,
    permissions: ['نشر التغريدات والوسائط', 'إحصائيات Analytics'],
    aspectRatioHint: '16:9 أو 1:1',
    characterLimit: 280,
  },
  {
    id: 'facebook',
    name: 'Facebook Business Pages',
    icon: '📘',
    color: 'from-blue-600 to-indigo-700',
    badge: 'Pages & Sponsored Ads',
    isConnected: false,
    username: 'Fekra AI Marketing Suite',
    handle: 'fb.me/FekraAISuite',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    followers: '89.1K',
    autoSync: false,
    permissions: ['إدارة الصفحات', 'النشر التلقائي', 'مدير الإعلانات'],
    aspectRatioHint: '1:1 أو 4:5 للإعلانات',
    characterLimit: 63206,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Company',
    icon: '💼',
    color: 'from-blue-700 to-blue-900',
    badge: 'B2B Authority & Leads',
    isConnected: false,
    username: 'Fekra AI Technologies',
    handle: 'linkedin.com/company/fekra-ai',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    followers: '42.6K',
    autoSync: false,
    permissions: ['نشر المحتوى المؤسسي', 'بيانات الزوار المهنية'],
    aspectRatioHint: '1:1 أو 16:9 وثائقي',
    characterLimit: 3000,
  },
  {
    id: 'pinterest',
    name: 'Pinterest Business',
    icon: '📌',
    color: 'from-rose-600 to-red-600',
    badge: 'Idea Pins & eCommerce',
    isConnected: false,
    username: 'Fekra Design Hub',
    handle: '@fekra_pins',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    followers: '67.3K',
    autoSync: false,
    permissions: ['إنشاء الدبابيس', 'روابط المتاجر الإلكترونية'],
    aspectRatioHint: '2:3 طولي عمودي',
    characterLimit: 500,
  },
  {
    id: 'threads',
    name: 'Threads by Instagram',
    icon: '🧵',
    color: 'from-neutral-900 to-black',
    badge: 'Micro-blogging',
    isConnected: false,
    username: 'Fekra Creator',
    handle: '@fekra_creator',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    followers: '31.2K',
    autoSync: false,
    permissions: ['نشر الخيوط والردود', 'الوسائط المرفقة'],
    aspectRatioHint: '1:1 أو 4:5',
    characterLimit: 500,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business API',
    icon: '💬',
    color: 'from-emerald-500 to-green-600',
    badge: 'Direct Catalog & Broadcast',
    isConnected: true,
    username: 'Fekra Business Concierge',
    handle: '+20 106 541 4900',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    followers: '19.4K Clients',
    autoSync: true,
    permissions: ['إرسال الكتالوج', 'الردود الفورية الذكية'],
    aspectRatioHint: 'كتالوج المنتجات والرسائل',
    characterLimit: 1024,
  },
];

export const getSocialAccounts = (): SocialConnectedAccount[] => {
  try {
    const raw = localStorage.getItem(SOCIAL_STORAGE_KEY);
    if (!raw) return INITIAL_PLATFORMS;
    const parsed = JSON.parse(raw);
    return INITIAL_PLATFORMS.map(p => {
      const saved = parsed.find((item: any) => item.id === p.id);
      return saved ? { ...p, ...saved } : p;
    });
  } catch (e) {
    console.error('Failed to get social accounts:', e);
    return INITIAL_PLATFORMS;
  }
};

export const saveSocialAccounts = (accounts: SocialConnectedAccount[]) => {
  try {
    localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(accounts));
    window.dispatchEvent(new CustomEvent(SOCIAL_EVENT, { detail: accounts }));
  } catch (e) {
    console.error('Failed to save social accounts:', e);
  }
};

export const isPlatformConnected = (platformId: SocialPlatformId): boolean => {
  const accounts = getSocialAccounts();
  const acc = accounts.find(a => a.id === platformId);
  return Boolean(acc?.isConnected);
};

export const connectSocialAccount = (
  platformId: SocialPlatformId,
  details?: Partial<SocialConnectedAccount>
): SocialConnectedAccount => {
  const accounts = getSocialAccounts();
  const index = accounts.findIndex(a => a.id === platformId);
  if (index === -1) throw new Error('Platform not found');

  const updatedAccount: SocialConnectedAccount = {
    ...accounts[index],
    ...details,
    isConnected: true,
    lastConnectedAt: Date.now(),
    autoSync: true,
  };

  accounts[index] = updatedAccount;
  saveSocialAccounts(accounts);
  return updatedAccount;
};

export const disconnectSocialAccount = (platformId: SocialPlatformId): SocialConnectedAccount => {
  const accounts = getSocialAccounts();
  const index = accounts.findIndex(a => a.id === platformId);
  if (index === -1) throw new Error('Platform not found');

  const updatedAccount: SocialConnectedAccount = {
    ...accounts[index],
    isConnected: false,
    autoSync: false,
  };

  accounts[index] = updatedAccount;
  saveSocialAccounts(accounts);
  return updatedAccount;
};

export const togglePlatformAutoSync = (platformId: SocialPlatformId): boolean => {
  const accounts = getSocialAccounts();
  const index = accounts.findIndex(a => a.id === platformId);
  if (index === -1) return false;

  const current = accounts[index].autoSync;
  accounts[index].autoSync = !current;
  saveSocialAccounts(accounts);
  return !current;
};

export const getScheduledPosts = (): SocialScheduledPost[] => {
  try {
    const raw = localStorage.getItem(SOCIAL_POSTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get scheduled posts:', e);
    return [];
  }
};

export const saveScheduledPosts = (posts: SocialScheduledPost[]) => {
  try {
    localStorage.setItem(SOCIAL_POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Failed to save scheduled posts:', e);
  }
};

export const dispatchPostToPlatform = async (
  platformId: SocialPlatformId,
  postData: {
    caption: string;
    hashtags?: string;
    image?: ImageFile | null;
    videoUrl?: string | null;
    scheduledTime?: string;
  }
): Promise<{ success: boolean; postUrl: string; message: string }> => {
  // Simulate API latency
  await new Promise(r => setTimeout(r, 900));

  const post: SocialScheduledPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    platformId,
    caption: postData.caption,
    hashtags: postData.hashtags || '',
    scheduledTime: postData.scheduledTime || new Date().toISOString(),
    image: postData.image,
    videoUrl: postData.videoUrl,
    status: postData.scheduledTime && new Date(postData.scheduledTime).getTime() > Date.now() + 60000 ? 'scheduled' : 'published',
    publishedAt: Date.now(),
    engagement: {
      likes: Math.floor(Math.random() * 850) + 120,
      comments: Math.floor(Math.random() * 95) + 14,
      shares: Math.floor(Math.random() * 45) + 6,
      reach: Math.floor(Math.random() * 12500) + 2100,
    },
  };

  const existing = getScheduledPosts();
  saveScheduledPosts([post, ...existing]);

  const platformSlugs: Record<SocialPlatformId, string> = {
    instagram: 'https://instagram.com/p/C',
    tiktok: 'https://tiktok.com/@fekra/video/',
    youtube: 'https://youtube.com/shorts/',
    twitter: 'https://x.com/FekraAI/status/',
    facebook: 'https://facebook.com/fekra/posts/',
    linkedin: 'https://linkedin.com/feed/update/urn:li:activity:',
    pinterest: 'https://pinterest.com/pin/',
    threads: 'https://threads.net/@fekra_creator/post/',
    whatsapp: 'https://wa.me/?text=',
  };

  const postUrl = `${platformSlugs[platformId]}${Math.random().toString(36).substring(2, 10)}`;

  return {
    success: true,
    postUrl,
    message: post.status === 'scheduled' ? 'تمت جدولة المنشور بنجاح!' : 'تم النشر التلقائي المباشر على المنصة بنجاح!',
  };
};

export const subscribeSocialChanges = (callback: (accounts: SocialConnectedAccount[]) => void) => {
  const handler = () => {
    callback(getSocialAccounts());
  };
  window.addEventListener(SOCIAL_EVENT, handler);
  return () => {
    window.removeEventListener(SOCIAL_EVENT, handler);
  };
};
