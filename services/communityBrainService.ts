import { CommunityThoughtItem, ThinkingRationale, ImageFile } from '../types';
import { generateContentWithCascade } from './geminiService';

const STORAGE_KEY = 'fekra_community_brain_feed_v1';
const LIKES_STORAGE_KEY = 'fekra_community_user_likes_v1';

// Seed benchmarks from world-class campaigns crafted with Fekra AI OS
const SEED_COMMUNITY_ITEMS: CommunityThoughtItem[] = [
  {
    id: 'seed-perfume-01',
    authorName: 'سلطان القحطاني • Creative Director',
    authorAvatar: '👑',
    industry: 'عطور شرقية وفاخرة',
    title: 'عطر العود الملكي مع بخار البخور وانعكاسات رخامية',
    prompt: 'Commercial product photograph of Royal Black Oud perfume bottle on polished obsidian marble base. Anamorphic amber rim lighting, rising realistic frankincense smoke swirls, micro-gold dust floating in air, shallow depth of field, 8k resolution, luxury commercial studio finish.',
    thinking: {
      audiencePainPointAr: 'رغبة العميل في إثبات الهيبة والمكانة الاجتماعية والشعور بالفخامة المطلقة برائحة تثبت لساعات.',
      scrollStopStrategyAr: 'خطاف التباين الصارخ بين سواد الرخام وبريق الذهب مع تصاعد دخان البخور الحركي يجبر العين على الوقوف خلال 0.6 ثانية.',
      dnaRulesSummaryAr: 'دستور الألوان الثلاثي: ذهبي إمبراطوري (#f59e0b)، أسود عقيق (#0a0602)، رمادي عاجي (#e2e8f0). قفل الشعار 100%.',
      lipSyncAndGesturesAr: 'لهجة سعودية معاصرة: "تدري وش يفرق عن غيره؟ ثبات وهيبة ما تكرر!" مع إشارة حاسمة وإيماءة ثقة وغمزة.',
      promptArchitectureEn: 'Hero product centered on obsidian marble -> Anamorphic amber rim lighting -> Volumetric incense particles -> 8k resolution.',
      estimatedConversionRate: '4.8% CTR (أعلى بـ 3.2x من الإعلانات التقليدية)',
      reasoningStepsAr: [
        'تحليل زجاجة العطر وتحديد زاوية 45 درجة لإظهار انعكاس الإضاءة الذهبية على الحواف.',
        'استبعاد أي نصوص عشوائية وتثبيت الشعار الأصلي تماماً.',
        'إضافة رذاذ ذرات الذهب المعلقة لإضفاء شعور الندرة والفخامة.',
        'صياغة خطاف لكسر التمرير يعتمد على صدمة الجمال البصري.'
      ]
    },
    promptPowerScore: 99,
    scrollStopRating: 98,
    likesCount: 342,
    remixCount: 189,
    dialect: 'سعودي معاصر',
    createdAt: Date.now() - 86400000 * 2,
    tags: ['عطور', 'فخامة', 'استوديو', 'سعودي'],
    isFeatured: true
  },
  {
    id: 'seed-burger-02',
    authorName: 'أحمد الشريف • Viral Ad Strategist',
    authorAvatar: '🍔',
    industry: 'مطاعم وأغذية',
    title: 'برجر ترافل كرسبي مع شلال الجبن المذاب والمشروب المثلج',
    prompt: 'Ultra-close commercial macro photo of gourmet double smash burger with melting cheddar cheese waterfall, crisp brioche bun glistening, iced cola splashing in background with condensation beads, dynamic commercial lighting, appetizing food photography, hyper-realistic 8k.',
    thinking: {
      audiencePainPointAr: 'الرغبة اللحظية في إشباع الجوع بوجبة استثنائية المذاق ومقرمشة تفصل عن الوجبات السريعة الرديئة.',
      scrollStopStrategyAr: 'خطاف الجبن المتدفق في حالة حركة (Cheese Pull) مع قطرات الندى على المشروب يثير الشهية الفورية (Sensory Shock).',
      dnaRulesSummaryAr: 'دستور الألوان: كهرماني مشتعل (#ea580c)، أصفر عسلي (#facc15)، بني إسبريسو داكن (#180e06).',
      lipSyncAndGesturesAr: 'لهجة مصرية حماسية: "بص بقى وركز في قرمشة العيش وشلال الجبنة دي... متتفوتش!" مع حركة لقطة سقوط الفك المذهول.',
      promptArchitectureEn: 'Sensory macro hook -> Dripping cheddar dynamics -> Cold splash contrast -> Fast depth ramp.',
      estimatedConversionRate: '6.2% CTR على تيك توك وإنستغرام',
      reasoningStepsAr: [
        'اختيار لقطة ماكرو سينمائية لإبراز لمعان خبز البريوش وذوبان الجبن.',
        'موازنة درجات حرارة الألوان لتكون دافئة ومغرية للشهية.',
        'دمج حركة المشروب المثلج في الخلفية لإعطاء إحساس بالانتعاش المزدوج.',
        'تحديد الكلمات الأولى لتكون صدمة حركية سريعة تمنع التمرير فوراً.'
      ]
    },
    promptPowerScore: 97,
    scrollStopRating: 99,
    likesCount: 521,
    remixCount: 264,
    dialect: 'مصري حماسي',
    createdAt: Date.now() - 86400000 * 4,
    tags: ['مطاعم', 'طعام', 'ماكرو', 'مصري'],
    isFeatured: true
  },
  {
    id: 'seed-saas-03',
    authorName: 'م. لين العبدالله • B2B Growth Lead',
    authorAvatar: '💼',
    industry: 'أنظمة SaaS و ERP',
    title: 'نظام فكرة الذكي للأعمال - تحويل الفوضى إلى لوحة تحكم ذكية',
    prompt: 'Futuristic high-tech enterprise dashboard floating in glass holographic display, glowing cyan and violet data streams, modern executive workspace background, sharp typography, premium SaaS marketing hero visual, 8k resolution, cinematic isometric view.',
    thinking: {
      audiencePainPointAr: 'خوف صاحب العمل والمدير التنفيذي من ضياع الحسابات، وتشتت الموظفين، وضغط العمل اليومي غير المنظم.',
      scrollStopStrategyAr: 'خطاف الهولوجرام المستقبلي المتحرك وتوضيح مؤشر الأرباح باللون الأخضر الصاعد يوجه العقل مباشرة للحل المنقذ.',
      dnaRulesSummaryAr: 'دستور الألوان: سماوي تقني (#00e5ff)، أرجواني عميق (#8b5cf6)، كحلي فضائي (#050b14).',
      lipSyncAndGesturesAr: 'لهجة عالمي فصحى: "ودّع فوضى الفواتير بضغطة زر واحدة! نظام Fekra يدير نشاطك بالكامل بالذكاء الاصطناعي."',
      promptArchitectureEn: 'Futuristic holographic glass UI -> Real-time analytics -> Executive office depth -> Crisp clarity.',
      estimatedConversionRate: '3.9% B2B Qualified Lead Conversion',
      reasoningStepsAr: [
        'التركيز على واجهة سهلة القراءة تعطي انطباع السيطرة الكاملة على العمليات.',
        'استخدام زاوية الإيزومترك ثلاثية الأبعاد لإبراز عمق المنصة.',
        'إضافة إضاءة نيون هادئة تدل على الذكاء الاصطناعي والحداثة.'
      ]
    },
    promptPowerScore: 96,
    scrollStopRating: 94,
    likesCount: 289,
    remixCount: 142,
    dialect: 'عالمي فصحى',
    createdAt: Date.now() - 86400000 * 5,
    tags: ['SaaS', 'ERP', 'تقنية', 'فصحى'],
    isFeatured: true
  },
  {
    id: 'seed-realestate-04',
    authorName: 'فهد المنصور • Luxury Broker',
    authorAvatar: '🏙️',
    industry: 'عقارات وفلل فاخرة',
    title: 'بنتهاوس ملكي بإطلالة بانورامية وقت الغروب مع مسبح إنفينيتي',
    prompt: 'Architectural photography of ultra-luxury penthouse terrace with infinity pool overlooking futuristic city skyline at golden hour sunset. Warm softbox lighting on travertine floors, floor-to-ceiling glass, ultra-sharp reflections, 8k commercial real estate render.',
    thinking: {
      audiencePainPointAr: 'بحث المستثمر أو المشتري الراقي عن الخصوصية، والإطلالة الخاطفة للأنفاس، والأمان الاستثماري طويل الأمد.',
      scrollStopStrategyAr: 'انعكاس سماء الغروب الذهبية على سطح مياه المسبح اللانهائي (Infinity Pool) يخلق شعوراً بالسلام والرغبة في الامتلاك.',
      dnaRulesSummaryAr: 'دستور الألوان: برونزي دافئ (#d97706)، ذهبي الشفق (#fef3c7)، أزرق داكن (#0f172a).',
      lipSyncAndGesturesAr: 'لهجة خليجي فخم: "شوف الإطلالة واحكم بنفسك يا غالي... سكن يليق بمقامك في أرقى بقعة!" مع إيماءة فخر.',
      promptArchitectureEn: 'Golden hour architectural panorama -> Travertine stone reflections -> Glass boundaries -> Elite prestige atmosphere.',
      estimatedConversionRate: '4.2% إرسال استفسار عبر واتساب',
      reasoningStepsAr: [
        'تحديد وقت الساعة الذهبية (Golden Hour) لمنح المبنى هالة دافئة تجذب العين.',
        'توسيع زاوية الرؤية لإظهار اتساع التراس والمدينة معاً.',
        'التأكيد على نظافة الخامات المعمارية والرخام الترافيرتين.'
      ]
    },
    promptPowerScore: 98,
    scrollStopRating: 97,
    likesCount: 412,
    remixCount: 198,
    dialect: 'خليجي فخم',
    createdAt: Date.now() - 86400000 * 6,
    tags: ['عقارات', 'بنتهاوس', 'غروب', 'خليجي'],
    isFeatured: true
  },
  {
    id: 'seed-clinic-05',
    authorName: 'د. ياسمين الشامي • Dental Clinic Director',
    authorAvatar: '✨',
    industry: 'عيادات ومراكز تجميل',
    title: 'ابتسامة هوليوود وإشراقة الثقة مع عيادة طبية فائقة الحداثة',
    prompt: 'Commercial aesthetic healthcare photograph. Confident dentist smiling charismatically next to state-of-the-art clinic equipment, natural pristine teeth smile, clean white and mint-cyan ambiance, soft ring light illumination, commercial medical advertisement 8k.',
    thinking: {
      audiencePainPointAr: 'الخوف من الألم، والتردد من مظهر الأسنان غير المثالي في المناسبات والمقابلات المهمة.',
      scrollStopStrategyAr: 'الابتسامة المشرقة البراقة مع الإضاءة الدائرية الناعمة تبدد الخوف فوراً وتبني الثقة في ثوانٍ معدودة.',
      dnaRulesSummaryAr: 'دستور الألوان: تركواز طبي (#06b6d4)، أبيض نقي (#ffffff)، رمادي بلاتيني (#64748b).',
      lipSyncAndGesturesAr: 'لهجة شامي مرح: "لك شوف هالابتسامة كيف عم تضوّي! لا تخلي الخوف يمنعك، حان وقت تبتسم بثقة!" مع غمزة كاريزمية.',
      promptArchitectureEn: 'Confident hero portrait -> Clinical high-tech cleanliness -> Ring light eye highlights -> Pristine trustworthy finish.',
      estimatedConversionRate: '5.4% حجز موعد مباشر',
      reasoningStepsAr: [
        'بناء التكوين حول ملامح الوجه الإيجابية والابتسامة المريحة.',
        'إظهار التجهيزات الحديثة في الخلفية كعنصر أمان دون تشتيت الانتباه.',
        'صياغة لهجة ودودة تكسر حاجز الخوف من طبيب الأسنان.'
      ]
    },
    promptPowerScore: 95,
    scrollStopRating: 96,
    likesCount: 388,
    remixCount: 175,
    dialect: 'شامي مرح',
    createdAt: Date.now() - 86400000 * 7,
    tags: ['عيادات', 'تجميل', 'أسنان', 'شامي'],
    isFeatured: false
  }
];

/**
 * Loads all community works, merging pre-seeded benchmarks with user contributions from localStorage.
 */
export function getCommunityBrainItems(industryFilter?: string, searchQuery?: string): CommunityThoughtItem[] {
  let items = [...SEED_COMMUNITY_ITEMS];
  
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: CommunityThoughtItem[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Prepend user-published community items
          items = [...parsed, ...items];
        }
      }
    } catch (e) {
      console.warn('[Fekra Brain] Failed to read stored community items:', e);
    }
  }

  // Deduplicate by ID
  const map = new Map<string, CommunityThoughtItem>();
  items.forEach(item => {
    if (!map.has(item.id)) map.set(item.id, item);
  });
  let allItems = Array.from(map.values());

  // Apply filters
  if (industryFilter && industryFilter !== 'all') {
    allItems = allItems.filter(item => 
      item.industry.toLowerCase().includes(industryFilter.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(industryFilter.toLowerCase()))
    );
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    allItems = allItems.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.prompt.toLowerCase().includes(q) ||
      item.authorName.toLowerCase().includes(q) ||
      item.thinking.scrollStopStrategyAr.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  return allItems.sort((a, b) => b.promptPowerScore - a.promptPowerScore);
}

/**
 * Publishes a user's work, prompt, and thinking rationale to the community feed.
 */
export function publishWorkToCommunityBrain(item: Omit<CommunityThoughtItem, 'id' | 'createdAt' | 'likesCount' | 'remixCount'>): CommunityThoughtItem {
  const newItem: CommunityThoughtItem = {
    ...item,
    id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
    likesCount: 1,
    remixCount: 0,
  };

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const existing: CommunityThoughtItem[] = stored ? JSON.parse(stored) : [];
      const updated = [newItem, ...existing.slice(0, 49)];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('fekra_community_brain_updated'));
    } catch (e) {
      console.warn('[Fekra Brain] Failed to publish community item:', e);
    }
  }

  return newItem;
}

/**
 * Toggles a like on a community thought item.
 */
export function toggleLikeCommunityItem(id: string): { likesCount: number; isLiked: boolean } {
  let isLiked = false;
  let likesCount = 0;

  if (typeof window !== 'undefined') {
    try {
      const likesRaw = localStorage.getItem(LIKES_STORAGE_KEY);
      const likedIds: string[] = likesRaw ? JSON.parse(likesRaw) : [];
      isLiked = likedIds.includes(id);

      let newLikedIds: string[];
      if (isLiked) {
        newLikedIds = likedIds.filter(item => item !== id);
        isLiked = false;
      } else {
        newLikedIds = [...likedIds, id];
        isLiked = true;
      }
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(newLikedIds));

      // Update in storage if local item
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: CommunityThoughtItem[] = JSON.parse(stored);
        const target = items.find(i => i.id === id);
        if (target) {
          target.likesCount = Math.max(0, target.likesCount + (isLiked ? 1 : -1));
          likesCount = target.likesCount;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }
      }
    } catch (e) {
      console.warn('[Fekra Brain] Like toggle failed:', e);
    }
  }

  return { likesCount, isLiked };
}

/**
 * Increments the remix counter for an item when cloned or remixed by another user.
 */
export function incrementRemixCount(id: string): void {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: CommunityThoughtItem[] = JSON.parse(stored);
        const target = items.find(i => i.id === id);
        if (target) {
          target.remixCount += 1;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
          window.dispatchEvent(new CustomEvent('fekra_community_brain_updated'));
        }
      }
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Checks if current user has liked an item.
 */
export function isItemLikedByUser(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const likesRaw = localStorage.getItem(LIKES_STORAGE_KEY);
    const likedIds: string[] = likesRaw ? JSON.parse(likesRaw) : [];
    return likedIds.includes(id);
  } catch {
    return false;
  }
}

/**
 * Uses Google Gemini 3.1 Pro / 3.8 Flash to analyze any user prompt, image, or creation
 * and deconstruct its deep Chain-of-Thought (سلسلة التفكير ومنطق العقل الإعلاني)
 * so it can feed the platform and educate other creators.
 */
export async function extractThinkingRationaleWithAI(
  prompt: string,
  industry: string = 'عام',
  image?: ImageFile
): Promise<ThinkingRationale> {
  const systemInstruction = `You are the Chief Creative Psychologist & Master Prompt Architect for Fekra AI Business OS.
Your task: Analyze the creative work / prompt and deconstruct the exact "Chain of Thought" (طريقة التفكير وسلسلة التعليل الإعلاني) that makes this concept convert and sell.

Output JSON matching this exact structure:
{
  "audiencePainPointAr": "شرح دقيق لنقطة الألم النفسية أو الرغبة العميقة للجمهور المستهدف بالعربية",
  "scrollStopStrategyAr": "استراتيجية كسر التمرير في أقل من ثانية واحدة؛ لماذا تجبر العين على التوقف بالعربية",
  "dnaRulesSummaryAr": "ملخص دستور الألوان والـ DNA البصري المطبق بالعربية",
  "lipSyncAndGesturesAr": "سر نجاح المزامنة الصوتية والشفاهية والحركات البيعية المقترحة بالعربية",
  "promptArchitectureEn": "English breakdown of the key architectural layers inside the prompt",
  "estimatedConversionRate": "تقدير معدل التحويل والنقر CTR المتوقع (مثلاً: 4.5% CTR)",
  "reasoningStepsAr": [
    "الخطوة 1 في تفكير المخرج الإعلاني",
    "الخطوة 2 في تفكير المخرج الإعلاني",
    "الخطوة 3 في تفكير المخرج الإعلاني",
    "الخطوة 4 في تفكير المخرج الإعلاني"
  ]
}`;

  const parts: any[] = [];
  if (image && image.base64) {
    const rawB64 = image.base64.includes(',') ? image.base64.split(',')[1] : image.base64;
    parts.push({
      inlineData: {
        data: rawB64,
        mimeType: image.mimeType || 'image/png'
      }
    });
  }

  parts.push({
    text: `Industry: ${industry}
Prompt to Deconstruct: "${prompt}"

Deconstruct the thinking chain and psychological rationale in detail.`
  });

  try {
    const res = await generateContentWithCascade({
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
      preferredModels: ['gemini-3.1-pro-preview', 'gemini-3.8-flash', 'gemini-flash-latest']
    });

    const parsed = JSON.parse(res.text || '{}');
    if (parsed.audiencePainPointAr && parsed.scrollStopStrategyAr) {
      return {
        audiencePainPointAr: parsed.audiencePainPointAr,
        scrollStopStrategyAr: parsed.scrollStopStrategyAr,
        dnaRulesSummaryAr: parsed.dnaRulesSummaryAr || 'دستور ثلاثي الألوان مع إضاءة استوديو سينمائية متوازنة.',
        lipSyncAndGesturesAr: parsed.lipSyncAndGesturesAr || 'حركة يد عريضة وإشارة حاسمة للسعر مع اتساع العينين من الصدمة الإيجابية.',
        promptArchitectureEn: parsed.promptArchitectureEn || prompt,
        estimatedConversionRate: parsed.estimatedConversionRate || '4.2% CTR المتوقع',
        reasoningStepsAr: Array.isArray(parsed.reasoningStepsAr) && parsed.reasoningStepsAr.length > 0
          ? parsed.reasoningStepsAr
          : [
              'تحليل زاوية الرؤية والإضاءة لإبراز القيمة الاستثنائية للمنتج.',
              'استخدام خطاف لكسر التمرير يركز على الفضول والمشاعر.',
              'تثبيت عناصر الهوية دون أي تشويه أو نصوص عشوائية.'
            ]
      };
    }
  } catch (err) {
    console.warn('[Fekra Brain] AI Thinking Extraction fallback:', err);
  }

  // Deterministic fallback
  return {
    audiencePainPointAr: `رغبة العميل في الحصول على تجربة استثنائية في قطاع (${industry}) والابتعاد عن البدائل الرديئة والمملة.`,
    scrollStopStrategyAr: 'خطاف بصري يجمع بين التباين اللوني الحاد وحركة لقطة البطل المركزية، ما يوقف التمرير فوراً في أقل من ثانية.',
    dnaRulesSummaryAr: 'دستور الألوان الثلاثي المتناسق مع إضاءة حواف سينمائية عميقة ونظافة كاملة للشعار.',
    lipSyncAndGesturesAr: 'إشارة حاسمة بالإصبع نحو العرض مع اتساع حدقة العين وغمزة ثقة كاريزمية لتأكيد الجودة.',
    promptArchitectureEn: `Master production prompt formatted with cinematic lighting, depth layers, and sharp product textures.`,
    estimatedConversionRate: '4.6% CTR',
    reasoningStepsAr: [
      'تحديد المشاعر المستهدفة (الهيبة، المتعة، أو التميز التقني).',
      'اختيار زاوية الكاميرا ونمط الإضاءة بما يعزز الرغبة في الشراء.',
      'توزيع الطبقات بحيث يكون المنتج هو البطل المطلق في الكادر.',
      'صياغة الكلمات المفتاحية بالإنجليزية لضمان أعلى واقعية وجودة 8K.'
    ]
  };
}
