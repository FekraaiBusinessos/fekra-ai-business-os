
import { LightingStyle, CameraPerspective, AspectRatio, ControllerSlider } from './types';

export const LIGHTING_STYLES: { value: LightingStyle; label: string }[] = [
  { value: 'Natural Light', label: 'Natural Light' },
  { value: 'Studio Light', label: 'Studio Light' },
  { value: 'Golden Hour', label: 'Golden Hour' },
  { value: 'Blue Hour', label: 'Blue Hour' },
  { value: 'Cinematic', label: 'Cinematic' },
  { value: 'Dramatic', label: 'Dramatic' },
];

export const CAMERA_PERSPECTIVES: { value: CameraPerspective; label: string }[] = [
  { value: 'Front View', label: 'Front View' },
  { value: 'Top View', label: 'Top View' },
  { value: 'Side View', label: 'Side View' },
  { value: '45° Angle', label: '45° Angle' },
  { value: 'Close-up', label: 'Close-up' },
  { value: 'Macro Shot', label: 'Macro Shot' },
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '16:9', label: 'Landscape (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
  { value: '4:3', label: 'Classic (4:3)' },
  { value: '3:4', label: 'Classic Portrait (3:4)' },
  { value: '1:1', label: 'Square (1:1)' },
];

// --- New constants for Photoshoot Director ---
export const MAX_SHOT_SELECTION = 6;

export const SHOT_TYPES: { category: string; types: string[] }[] = [
  {
    category: 'Shot Angle',
    types: [
        'Close-Up', 'Medium Shot', 'Full Shot', 'High Angle',
        'Low Angle', 'Dutch Angle', 'Top-Down Shot', 'Macro Shot',
        'Eye-Level Shot', 'Worm\'s-Eye View', 'Detailed Texture Shot', 'Symmetrical Front-On',
        'Dynamic 3/4 Angle', 'Hero Shot (Slightly Low Angle)'
    ]
  },
  {
    category: 'Product in Action / Use Case',
    types: [
        'Lifestyle: Model Interacting with Product',
        'Dynamic Motion Shot (Pouring/Spraying)',
        'Close-up on Product Usage',
        'Product in its Intended Setting (e.g., Kitchen, Gym)',
        'Product as part of a Daily Routine',
        'With hands, showing usage',
        'On a creative desk',
        'In a travel setting (e.g., backpack)',
        'As part of a flat lay composition',
        'During a fitness activity',
        'In a cozy home environment',
        'Unboxing experience',
        'On Cafe Table (Hands Nearby)',
        'Held by Model (Close-up)',
    ]
  },
  {
    category: 'Environment & Style',
    types: [
        'On a Modern Kitchen Counter', 'On a Sandy Beach', 'On a Rustic Wooden Table', 'In a Lush Green Forest',
        'On a windowsill (morning light)', 'In nature (with dew drops)', 'Splash Shot',
        'Minimalist Studio (Gradient Background)', 'On a Marble Surface', 'Floating in Mid-Air (Surreal)', 'Amidst Urban Cityscape (Bokeh)',
        'On a bed of flowers', 'With Geometric Shapes & Shadows', 'Neon-lit Cyberpunk Setting', 'Luxury Velvet Background',
        'Submerged in Water', 'Industrial Concrete Background', 'Packaging Shot'
    ]
  }
];

// --- Comprehensive Constants for Voice Over Studio (All Arabic Dialects & Tones) ---
export interface DialectOption {
  id: string;
  label: string;
  region: string;
  flag: string;
  promptInstruction: string;
  sampleText: string;
}

export const ARABIC_DIALECTS: DialectOption[] = [
  {
    id: 'saudi_najdi',
    label: 'سعودي (نجدي - الرياض)',
    region: 'السعودية',
    flag: '🇸🇦',
    promptInstruction: 'in an authentic, confident Saudi Najdi dialect with charismatic native Riyadh pronunciation',
    sampleText: 'يا هلا ومسهلا! جربت الجديد اليوم؟ فرصة لا تفوتك والزين عندنا دايم يفرق.'
  },
  {
    id: 'saudi_hijazi',
    label: 'سعودي (حجازي - جدة)',
    region: 'السعودية',
    flag: '🇸🇦',
    promptInstruction: 'in a warm, melodious, friendly Saudi Hijazi dialect (Jeddah style)',
    sampleText: 'يا سيدي مرحبتين فيك! شي على أصوله وما يتقارن، خذ راحتك وشوف الفرق بنفسك.'
  },
  {
    id: 'saudi_youth',
    label: 'سعودي شبابي (سوشيال / TikTok)',
    region: 'السعودية',
    flag: '🇸🇦',
    promptInstruction: 'in a fast-paced, high-energy modern Saudi youth dialect for viral social media ads',
    sampleText: 'تبغى الصراحة؟ هذا اللي كان ناقصك بالضبط! لا تفوت العرض وادخل الرابط الحين.'
  },
  {
    id: 'saudi_sharqiyyah',
    label: 'سعودي (شرقاوي)',
    region: 'السعودية',
    flag: '🇸🇦',
    promptInstruction: 'in a polished Eastern Province Saudi dialect, confident and engaging',
    sampleText: 'حياكم الله! معنا كل شي محسوب ومتقن، اطلب الآن واستمتع بأفضل تجربة.'
  },
  {
    id: 'egyptian_promo',
    label: 'مصري (إعلاني سريع - Promo)',
    region: 'مصر',
    flag: '🇪🇬',
    promptInstruction: 'in a dynamic, viral Egyptian advertising dialect with maximum punch and enthusiasm',
    sampleText: 'من الآخر كده، الحل اللي بتدور عليه وصل! متفوتش الفرصة والحق عروضنا دلوقتي.'
  },
  {
    id: 'egyptian_urban',
    label: 'مصري (عصري قاهري - ودود)',
    region: 'مصر',
    flag: '🇪🇬',
    promptInstruction: 'in a warm, natural, relatable contemporary Cairo Egyptian dialect',
    sampleText: 'عارف الشعور لما تلاقي كل اللي محتاجه في مكان واحد؟ ده بالظبط اللي عملناه علشانك.'
  },
  {
    id: 'egyptian_drama',
    label: 'مصري (قصصي / درامي هادئ)',
    region: 'مصر',
    flag: '🇪🇬',
    promptInstruction: 'in a deeply emotional, warm storytelling Egyptian voice with cinematic pauses',
    sampleText: 'كل قصة نجاح بتبدأ بفكرة صغيرة، وإحنا هنا علشان نكبر الفكرة دي خطوة بخطوة.'
  },
  {
    id: 'emirati_luxury',
    label: 'إماراتي (فخم وراقي)',
    region: 'الإمارات والخليج',
    flag: '🇦🇪',
    promptInstruction: 'in an elite, luxurious Emirati Gulf dialect with prestige and executive confidence',
    sampleText: 'مرحباً الساع.. للفخامة عنوان واحد، اختر التميز وعش التجربة الاستثنائية بكل تفاصيلها.'
  },
  {
    id: 'kuwaiti_business',
    label: 'كويتي (تجاري معاصر)',
    region: 'الكويت والخليج',
    flag: '🇰🇼',
    promptInstruction: 'in a polished, persuasive Kuwaiti Gulf dialect with commercial appeal',
    sampleText: 'حياك الله يالغالي.. شغل نظيف ومضمون مية بالمية، لا تطوفك أقوى عروض الموسم!'
  },
  {
    id: 'gulf_qatari_bahraini',
    label: 'خليجي (قطري / بحريني)',
    region: 'الخليج العربي',
    flag: '🇶🇦',
    promptInstruction: 'in a smooth, refined and clear Qatari and Bahraini Gulf dialect',
    sampleText: 'يا هلا فيك.. تميز باختياراتك وجرب الجودة اللي تليق فيك بكل فخر.'
  },
  {
    id: 'levantine_syrian',
    label: 'شامي (سوري دافئ وراقي)',
    region: 'بلاد الشام',
    flag: '🇸🇾',
    promptInstruction: 'in a warm, polite, resonant Syrian Levantine dialect with emotional depth',
    sampleText: 'أهلاً وسهلاً فيكن.. الجودة والذوق الرفيع مو بس كلام، معنا بتعيشوا الفرق من أول تجربة.'
  },
  {
    id: 'levantine_lebanese',
    label: 'لبناني (عصري / لايف ستايل)',
    region: 'بلاد الشام',
    flag: '🇱🇧',
    promptInstruction: 'in a chic, modern Lebanese accent, elegant, upbeat and engaging',
    sampleText: 'أهلاً فيكن! لكل حدا بحب يتميز ويعيش الحياة بأناقة، هيدا العرض معمول كرمالك.'
  },
  {
    id: 'levantine_jordanian',
    label: 'أردني / فلسطيني (واثق وقوي)',
    region: 'بلاد الشام',
    flag: '🇯🇴',
    promptInstruction: 'in a strong, clear, articulate Jordanian and Palestinian Arabic dialect',
    sampleText: 'أهلاً بك! الحل الأفضل والأضمن بين إيديك اليوم، خطوتك الأولى نحو التميز بتبدأ هون.'
  },
  {
    id: 'iraqi_baghdadi',
    label: 'عراقي (بغدادي أصيل)',
    region: 'العراق',
    flag: '🇮🇶',
    promptInstruction: 'in a rich, prestigious, authentic Baghdadi Iraqi dialect with warmth and authority',
    sampleText: 'يا هلا بيك عيني! كل اللي تتمناه وأكثر، بأعلى جودة وتستاهل كل خير وأنت الدلال كله.'
  },
  {
    id: 'maghrebi_moroccan',
    label: 'مغاربي (مغربي مبسط جذاب)',
    region: 'المغرب العربي',
    flag: '🇲🇦',
    promptInstruction: 'in an accessible, melodic Moroccan Darija dialect suitable for commercial marketing',
    sampleText: 'مرحباً بكم معنا! الجودة العالية والهمزة اللي كنتو كتقلبو عليها كاينة هنا دابا.'
  },
  {
    id: 'fusha_doc',
    label: 'فصحى (وثائقية فخمة وسلطوية)',
    region: 'العربية الفصحى',
    flag: '🎙️',
    promptInstruction: 'in Modern Standard Arabic with a deep, authoritative, prestigious documentary narrator voice',
    sampleText: 'في عالم يتسارع بلا توقف، وحدها الرؤية الثاقبة تصنع الفارق. اكتشف المعنى الحقيقي للريادة.'
  },
  {
    id: 'fusha_promo',
    label: 'فصحى (إعلانية حماسية رنانة)',
    region: 'العربية الفصحى',
    flag: '⚡',
    promptInstruction: 'in energetic, powerful Modern Standard Arabic with bold commercial resonance and clear diction',
    sampleText: 'انطلاقة جديدة تبدأ اليوم! اغتنم الفرصة ولا تدع التردد يفوت عليك أعظم الصفقات.'
  },
  {
    id: 'fusha_story',
    label: 'فصحى (بودكاست وقصصي دافئ)',
    region: 'العربية الفصحى',
    flag: '📻',
    promptInstruction: 'in a calm, reflective, intimate Modern Standard Arabic podcast storytelling tone',
    sampleText: 'بين كل بداية ووجهة، تفاصيل صغيرة تصنع أثراً لا ينسى. دعنا نروي قصتك للعالم.'
  },
  {
    id: 'fusha_fomo',
    label: 'فصحى (عاجل وتنبيه / FOMO)',
    region: 'العربية الفصحى',
    flag: '🚨',
    promptInstruction: 'in an urgent, time-sensitive Modern Standard Arabic commercial tone with high urgency',
    sampleText: 'انتبه! العرض سارٍ لفترة محدودة جداً والكميات أوشكت على النفاد. احجز نسختك الآن فوراً!'
  }
];

export const VOICES: { value: string; label: string; description: string; gender: 'Male' | 'Female' }[] = [
  { value: 'Kore', label: 'Kore (أنثوي)', description: 'Professional & Clear - واثق وواضح', gender: 'Female' },
  { value: 'Puck', label: 'Puck (ذكوري)', description: 'Energetic & Youthful - شبابي حماسي', gender: 'Male' },
  { value: 'Charon', label: 'Charon (ذكوري)', description: 'Deep & Authoritative - فخم وسلطوي', gender: 'Male' },
  { value: 'Fenrir', label: 'Fenrir (ذكوري)', description: 'Warm & Narrative - دافئ وقصصي', gender: 'Male' },
  { value: 'Zephyr', label: 'Zephyr (ذكوري)', description: 'Calm & Soothing - هادئ ومقنع', gender: 'Male' },
  { value: 'Despina', label: 'Despina (أنثوي)', description: 'Clear & Melodic - رنانة وأنيقة', gender: 'Female' },
  { value: 'Orus', label: 'Orus (ذكوري)', description: 'Crisp & Announcer - إعلاني وإخباري', gender: 'Male' },
  { value: 'Leda', label: 'Leda (أنثوي)', description: 'Elegant & Sophisticated - فخمة ومترفة', gender: 'Female' },
  { value: 'Gacrux', label: 'Gacrux (ذكوري)', description: 'Powerful & Bold - قوي وجهوري', gender: 'Male' },
  { value: 'Umbriel', label: 'Umbriel (أنثوي)', description: 'Grounded & Natural - عفوية وطبيعية', gender: 'Female' },
];

export interface VoiceoverToneOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  instructionSuffix: string;
}

export const VOICEOVER_TONES: VoiceoverToneOption[] = [
  {
    id: 'viral_hype',
    label: 'حماسي وإعلاني خارق',
    description: 'طاقة عالية تخطف الانتباه في أول 3 ثوانٍ',
    icon: '⚡',
    instructionSuffix: 'with intense energy, enthusiasm, high confidence and viral commercial appeal'
  },
  {
    id: 'luxury_authority',
    label: 'فخم وسلطوي (Brand Authority)',
    description: 'نبرة عميقة ووقورة توحي بالثقة والمكانة الرفيعة',
    icon: '👑',
    instructionSuffix: 'with deep resonance, executive authority, luxury prestige, and deliberate composure'
  },
  {
    id: 'warm_persuasive',
    label: 'دافئ ومقنع وودود',
    description: 'نبرة محببة تبني الألفة وتفكك الاعتراضات بذكاء',
    icon: '🤝',
    instructionSuffix: 'in a warm, friendly, empathetic and naturally persuasive conversational tone'
  },
  {
    id: 'urgent_fomo',
    label: 'عاجل وعرض محدود (FOMO)',
    description: 'تحفيز الشراء الفوري وتضخيم الخوف من فوات الفرصة',
    icon: '🔥',
    instructionSuffix: 'with urgency, sharp pacing, excitement, and strong call-to-action emphasis'
  },
  {
    id: 'cinematic_story',
    label: 'سينمائي وقصصي عميق',
    description: 'مشاعر مؤثرة، وقفات مدروسة، وتشويق عاطفي',
    icon: '🎬',
    instructionSuffix: 'in a cinematic storytelling tone, paced with meaningful dramatic pauses and emotional depth'
  },
  {
    id: 'humorous_playful',
    label: 'مرح وفكاهي وعفوي',
    description: 'خفة دم وابتسامة مسموعة في الصوت تكسر الجليد',
    icon: '😄',
    instructionSuffix: 'with a playful, humorous, joyful, smiling and witty delivery'
  },
  {
    id: 'documentary_crisp',
    label: 'تقريري ووثائقي دقيق',
    description: 'مخارج حروف دقيقة جداً وإيصال للمعلومة باحتراف',
    icon: '📊',
    instructionSuffix: 'with articulate clarity, neutral professionalism, and balanced educational pacing'
  }
];

export const VOICEOVER_SPEEDS = [
  { label: '0.8x متأنٍ', value: 0.8 },
  { label: '1.0x طبيعي', value: 1.0 },
  { label: '1.2x سريع إعلاني', value: 1.2 },
  { label: '1.35x خاطف (Reels)', value: 1.35 }
];

// --- Master Prompt Industry Presets for All Studios ---
export interface MasterPromptIndustry {
  id: string;
  name: string;
  icon: string;
  visualKeywords: string;
  hookIdeas: string[];
  adScriptTemplates: string[];
}

export const MASTER_PROMPT_INDUSTRIES: MasterPromptIndustry[] = [
  {
    id: 'restaurants',
    name: 'المطاعم والكافيهات',
    icon: '☕',
    visualKeywords: 'cinematic culinary photography, appetizing macro steam, vibrant rich ingredients, warm ambient bistro glow, floating garnish, crisp textures',
    hookIdeas: [
      'طعم ينسيك يومك الطويل!',
      'أول قضمة.. حكاية ثانية!',
      'السر مش في الخلطة.. السر في الإحساس',
      'ريحة تسبق خطوتك، وطعم يستاهل المشوار!'
    ],
    adScriptTemplates: [
      'جربت قبل كدة تدوق طعم يعدل مزاجك من أول لقمة؟ في [اسم البراند] جهزنا لك تجربة ما تتنسيش! اطلب دلوقتي وعيش الطعم على أصوله.'
    ]
  },
  {
    id: 'perfumes_luxury',
    name: 'العطور والموضة والفخامة',
    icon: '✨',
    visualKeywords: 'luxury commercial lighting, crystal bottle refraction, dramatic velvet background, golden hour rim reflections, floating mist particles, high fashion aesthetic',
    hookIdeas: [
      'رائحة تترك أثرك قبل حضورك!',
      'الفخامة ليست صدفة.. بل بصمة',
      'عطر يختصر شخصيتك في رشة واحدة',
      'التميز يبدأ من هُنا'
    ],
    adScriptTemplates: [
      'حضورك يستحق هيبة تليق بمقامك. عطر [اسم المنتج] مزيج استثنائي يدوم لأيام ويترك وراك أثر ما ينتهي. اطلبه اليوم وتألق بفخامة لا تُقاوم.'
    ]
  },
  {
    id: 'real_estate',
    name: 'العقارات والتطوير العمراني',
    icon: '🏛️',
    visualKeywords: 'architectural luxury photography, golden hour sunset reflections, grand ultra-wide interior, clean modern minimalism, prestige lifestyle view',
    hookIdeas: [
      'بيتك الجديد.. عنوان فخرك!',
      'استثمار اليوم.. أمان أجيالك القادمة',
      'إطلالة تسحر العين وموقع يحقق أحلامك',
      'حيث تلتقي الفخامة بالاستقرار'
    ],
    adScriptTemplates: [
      'مش بس عقار.. ده أسلوب حياة استثنائي يضمن راحتك وقيمة استثمارك للأبد. في [المشروع] نقدم لك وحدات فاخرة بأنظمة سداد مريحة جداً. تواصل معنا واحجز وحدتك الآن.'
    ]
  },
  {
    id: 'tech_saas',
    name: 'التقنية والأنظمة وERP',
    icon: '💻',
    visualKeywords: 'futuristic glassmorphism UI holographic, clean hyper-modern tech workspace, cyan and deep navy lighting, seamless speed and efficiency aura',
    hookIdeas: [
      'وداعاً للفوضى والوقت الضائع!',
      'إدارة مشروعك في شاشة واحدة وبضغطة زر',
      'أتمتة ذكية تضاعف أرباحك وتريح بالك',
      'نظام أعمالك القادم بقوة الذكاء الاصطناعي'
    ],
    adScriptTemplates: [
      'تعبت من الحسابات المعقدة ومتابعة الفواتير يدوياً؟ مع نظام [البرنامج] كل عمليات نشاطك من المخزون للمبيعات مؤتمتة ومضبوطة بالكامل. ابدأ تجربتك المجانية اليوم وضاعف إنتاجية فريقك.'
    ]
  },
  {
    id: 'clinics_beauty',
    name: 'العيادات والتجميل والمراكز الطبية',
    icon: '💎',
    visualKeywords: 'clean clinical luxury, soft diffused daylight, pristine glow, serene organic wellness aesthetic, premium medical authority',
    hookIdeas: [
      'ابتسامة واثقة تعيد إشراقتك!',
      'جمالك الطبيعي بأيدي نخبة الخبراء',
      'عناية فائقة بأحدث التقنيات العالمية',
      'الراحة والنتيجة التي تستحقينها'
    ],
    adScriptTemplates: [
      'لأن ثقتك بجمالك وصحتك تبدأ من العناية الصحيحة، وفرنا لك في مركزنا أحدث الأجهزة العالمية مع استشاريين متميزين. احجزي موعد كشفك الآن وتمتعي بعروض حصرية.'
    ]
  },
  {
    id: 'ecommerce_retail',
    name: 'المتاجر الإلكترونية والمنتجات',
    icon: '🛍️',
    visualKeywords: 'vibrant unboxing commercial, floating product hero, crisp studio softbox lighting, dynamic geometric podium, ultra sharp 8k details',
    hookIdeas: [
      'الأكثر طلباً وصل مجدداً!',
      'الجودة التي تحلم بها وبسعر غير مسبوق',
      'توصيل سريع وضمان حقيقي حتى باب بيتك',
      'فرصة العيد.. قبل نفاد الكمية!'
    ],
    adScriptTemplates: [
      'المنتج اللي قلب السوشيال ميديا وصل عندنا بأعلى جودة وضمان استرجاع كامل! لا تفوت الخصم الحصري اليوم واطلب الآن قبل انتهاء الكمية.'
    ]
  },
  {
    id: 'fitness_gym',
    name: 'اللياقة والرياضة والمكملات',
    icon: '🏋️‍♂️',
    visualKeywords: 'gritty dynamic athletic photography, dramatic rim lighting on muscle contours, sweat particles, high energy motion blur, intense focus',
    hookIdeas: [
      'هدفك مش مستحيل.. ابدأ اليوم!',
      'طاقة تتجدد، وقوة تصنع الفارق',
      'غير جسمك ونمط حياتك للأفضل',
      'لا مجال للأعذار بعد اليوم'
    ],
    adScriptTemplates: [
      'كل يوم تأجيل هو يوم بتخسر فيه نسختك الأفضل! انضم اليوم لبرامجنا التدريبية المخصصة وحقق أهدافك مع كباتن محترفين. سجل الآن واستفد من خصم الاشتراك.'
    ]
  }
];


// --- Constants for Controller Studio ---
export const CONTROLLER_SLIDERS: ControllerSlider[] = [
    // Face Category
    { id: 'smile', label: 'Smile', value: 0, min: -1, max: 1, step: 0.1, category: 'Face' },
    { id: 'frown', label: 'Frown', value: 0, min: 0, max: 1, step: 0.1, category: 'Face' },
    { id: 'mouth_open', label: 'Mouth Open', value: 0, min: 0, max: 1, step: 0.1, category: 'Face' },
    { id: 'wink_left', label: 'Wink Left', value: 0, min: 0, max: 1, step: 0.1, category: 'Face' },
    { id: 'wink_right', label: 'Wink Right', value: 0, min: 0, max: 1, step: 0.1, category: 'Face' },
    { id: 'eyebrow_raise', label: 'Eyebrow Raise', value: 0, min: -1, max: 1, step: 0.1, category: 'Face' },
    { id: 'squint', label: 'Squint', value: 0, min: 0, max: 1, step: 0.1, category: 'Face' },
    { id: 'eye_direction', label: 'Eye Direction', value: 0, min: -1, max: 1, step: 0.1, category: 'Face' },
    { id: 'age', label: 'Age', value: 0, min: -1, max: 1, step: 0.1, category: 'Face' },
    
    // Head Category
    { id: 'head_pitch', label: 'Head Pitch (Up/Down)', value: 0, min: -1, max: 1, step: 0.1, category: 'Head' },
    { id: 'head_yaw', label: 'Head Yaw (Left/Right)', value: 0, min: -1, max: 1, step: 0.1, category: 'Head' },
    { id: 'head_roll', label: 'Head Roll', value: 0, min: -1, max: 1, step: 0.1, category: 'Head' },

    // Body Category
    { id: 'body_turn', label: 'Body Turn', value: 0, min: -1, max: 1, step: 0.1, category: 'Body' },
    { id: 'shoulder_shrug', label: 'Shoulder Shrug', value: 0, min: 0, max: 1, step: 0.1, category: 'Body' },

    // Retouch Category
    { id: 'skin_smooth', label: 'Skin Smoothing', value: 0, min: 0, max: 1, step: 0.1, category: 'Retouch' },
    { id: 'brightness', label: 'Brightness', value: 0, min: -1, max: 1, step: 0.1, category: 'Retouch' },
    { id: 'contrast', label: 'Contrast', value: 0, min: -1, max: 1, step: 0.1, category: 'Retouch' },
    { id: 'sharpness', label: 'Sharpness', value: 0, min: 0, max: 1, step: 0.1, category: 'Retouch' },
];
