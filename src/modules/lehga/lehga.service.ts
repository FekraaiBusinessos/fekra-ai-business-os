/**
 * ====================================================================
 * LEHGA COMMERCIAL DIALECT & VIDEO ENGINE (V1.0)
 * AUTHENTIC EGYPTIAN DIALECT • 10 PSYCHOLOGICAL ANGLES • MULTI-SCENE DIRECTOR
 * ====================================================================
 */

export type LehgaPsychologicalAngle = 
  | 'pain_amplification' // 1. تضخيم الألم
  | 'feature_showcase'   // 2. استعراض الميزات
  | 'smart_irony'        // 3. السخرية الذكية
  | 'authentic_proof'    // 4. الشهادة الحقيقية
  | 'quick_surprise'     // 5. المفاجأة السريعة
  | 'positive_shock'     // 6. الصدمة الإيجابية
  | 'gentle_teasing'     // 7. الإحراج اللطيف
  | 'bold_challenge'     // 8. التحدي الجريء
  | 'irresistible_deal'  // 9. العرض الذي لا يرفض
  | 'extreme_urgency';   // 10. الإلحاح الشديد

export interface LehgaSceneItem {
  sceneNumber: number;
  durationSeconds: number;
  cameraMovement: string; // POV, Dutch Angle, Macro Zoom, Orbit 360, Low Angle
  visualDescription: string;
  egyptianVoiceover: string;
  soundEffects: string;
  onScreenTextAr: string;
}

export interface LehgaCommercialScript {
  angle: LehgaPsychologicalAngle;
  angleTitleAr: string;
  hookThreeSeconds: string;
  scenes: LehgaSceneItem[];
  totalDurationSeconds: number;
  callToAction: string;
  brandSignoff: string;
}

export const LEHGA_ANGLES_METADATA: Record<LehgaPsychologicalAngle, {
  nameAr: string;
  psychologicalTrigger: string;
  exampleHook: string;
  targetEmotion: string;
}> = {
  pain_amplification: {
    nameAr: 'تضخيم الألم (Pain Amplification)',
    psychologicalTrigger: 'التركيز على المشكلة اليومية المستفزة التي يدفع العميل ثمناً باهظاً لتجاهلها',
    exampleHook: 'لسه بتضيع ساعتين كل يوم في زحمة التوصيل والأوردرات بتوصل باردة؟',
    targetEmotion: 'القلق والرغبة الفورية في الخلاص من المعاناة'
  },
  feature_showcase: {
    nameAr: 'استعراض الميزات (Feature Showcase)',
    psychologicalTrigger: 'التركيز على الفخامة والتفاصيل الدقيقة والنتيجة الفورية',
    exampleHook: 'شايف اللمعة والكرانشي ده؟ ده مش مجرد أكل، دي تجربة 5 نجوم في بيتك!',
    targetEmotion: 'الانبهار والرغبة في التميز والتلذذ'
  },
  smart_irony: {
    nameAr: 'السخرية الذكية (Smart Irony)',
    psychologicalTrigger: 'الاستهزاء بالحلول التقليدية الفاشلة التي يستخدمها المنافسون',
    exampleHook: 'يعني تسيب التكنولوجيا والذكاء الاصطناعي وتروح تسجل حساباتك في كشكول مخروم؟! كفاية بقى!',
    targetEmotion: 'الضحك مع الإدراك الفوري لضرورة التغيير'
  },
  authentic_proof: {
    nameAr: 'الشهادة الحقيقية (Authentic Proof)',
    psychologicalTrigger: 'كلام من القلب بالبلدي بدون أي تصنع أو إعلانات مفبركة',
    exampleHook: 'أنا مش طالع أبيعلك.. أنا طالع أقولك اللي حصلي بالظبط لما جربت المنتج ده أول مرة!',
    targetEmotion: 'الثقة المطلقة والأمان'
  },
  quick_surprise: {
    nameAr: 'المفاجأة السريعة (Quick Surprise)',
    psychologicalTrigger: 'كسر النمط في أول ثانيتين وإلزام العين بالبقاء',
    exampleHook: 'أوعى ترمي علبة المنتج بعد ما تخلصه! استنى هتشوف بنفسك السر!',
    targetEmotion: 'الفضول الشديد والارتباط'
  },
  positive_shock: {
    nameAr: 'الصدمة الإيجابية (Positive Shock)',
    psychologicalTrigger: 'مقارنة مستحيلة بين السعر والجودة الخرافية',
    exampleHook: 'كل العظمة دي وبالسعر ده؟! لأ.. أكيد فيه حاجة غلط!',
    targetEmotion: 'الدهشة والإحساس باقتناص فرصة العمر'
  },
  gentle_teasing: {
    nameAr: 'الإحراج اللطيف (Gentle Teasing)',
    psychologicalTrigger: 'مواجهة العميل بعادة سلبية بأسلوب مصري محبب وخفيف الظل',
    exampleHook: 'شكلك كده لسه مأجل نزول الجيم من يوم السبت اللي فات بتاع 2024؟! كفاية تلاكيك!',
    targetEmotion: 'التحفيز الداخلي والتحدي الإيجابي'
  },
  bold_challenge: {
    nameAr: 'التحدي الجريء (Bold Challenge)',
    psychologicalTrigger: 'ضمان استرداد وثقة عمياء في تفوق المنتج',
    exampleHook: 'لو ملقتش فرق حقيقي من أول استخدام، فلوسك هترجعلك كاملة وبدون ما نسألك سؤال واحد!',
    targetEmotion: 'انعدام المخاطرة وشجاعة الشراء'
  },
  irresistible_deal: {
    nameAr: 'العرض الذي لا يرفض (Irresistible Deal)',
    psychologicalTrigger: 'حزمة بونص وهدايا تجعل الشراء قراراً بديهياً',
    exampleHook: 'اشتري قطعة وخود التانية هدية ومعاهم شحن مجاني وضمان سنة كاملة.. هترفض إزاي بقى؟! ',
    targetEmotion: 'الطمع المشروع في الاستفادة القصوى'
  },
  extreme_urgency: {
    nameAr: 'الإلحاح الشديد (Extreme Urgency)',
    psychologicalTrigger: 'نفاذ الكمية وضغط الوقت الصارم (FOMO)',
    exampleHook: 'فاضل بالظبط 7 قطع في المخزن والخصم هيتقفل النهاردة الساعة 12 بالليل.. متستناش!',
    targetEmotion: 'الخوف من فوات الفرصة والتحرك اللحظي'
  }
};

/**
 * Generate commercial multi-scene script in authentic Egyptian dialect
 */
export async function generateLehgaCommercialScript(params: {
  productName: string;
  brandName?: string;
  angle: LehgaPsychologicalAngle;
  targetAudience?: string;
  callToAction?: string;
}): Promise<LehgaCommercialScript> {
  const meta = LEHGA_ANGLES_METADATA[params.angle] || LEHGA_ANGLES_METADATA.pain_amplification;
  const brand = params.brandName || 'Fekra AI';
  const cta = params.callToAction || 'اطلب دلوقتي واستلم خلال ساعة مع كود خصم خاص!';

  // Multi-scene structured commercial for video engines
  const scenes: LehgaSceneItem[] = [
    {
      sceneNumber: 1,
      durationSeconds: 3,
      cameraMovement: 'Extreme Close-up Dutch Angle with Fast Push-in',
      visualDescription: `لقطة افتتاحية درامية مفاجئة تركز على المشكلة أو المنتج (${params.productName}) بإضاءة سينمائية قوية مع حركة كاميرا مائلة سريعة تكسر التمرير فوراً.`,
      egyptianVoiceover: meta.exampleHook,
      soundEffects: 'صوت فرملة قوية أو نبضة سينمائية Bass Drop تهز الشاشة',
      onScreenTextAr: 'استنى ثانية واحدة! ⚡'
    },
    {
      sceneNumber: 2,
      durationSeconds: 7,
      cameraMovement: 'Macro Orbit 360 with Soft Rim Lighting',
      visualDescription: `الكاميرا تدور بزاوية 360 درجة حول (${params.productName}) مستعرضة الخامات والتفاصيل فائقة الجودة بدقة 8K مع انعكاسات ضوئية فاخرة.`,
      egyptianVoiceover: `الموضوع مش محتاج فزلكة.. لما تكون عايز أعلى جودة في السوق ومن غير ما تصرف كل ميزانيتك، يبقى الحل قدامك واضح ومجرب من آلاف العملاء.`,
      soundEffects: 'موسيقى حماسية تصاعدية (Upbeat Cinematic Rhythm)',
      onScreenTextAr: `${params.productName} • أعلى جودة وأضمن نتيجة`
    },
    {
      sceneNumber: 3,
      durationSeconds: 6,
      cameraMovement: 'Hero Low-Angle Tracking Shot',
      visualDescription: `شخصية المعلن في لقطة منخفضة مفعمة بالثقة والسعادة وهو يتفاعل مع المنتج بكل أريحية.`,
      egyptianVoiceover: `إحنا عملنا المعادلة الصعبة: الفخامة اللي تستاهلها بالسعر اللي يناسبك وبدون أي مصاريف خفية.`,
      soundEffects: 'نغمة تأكيد إيجابية مبهجة (Positive Chime FX)',
      onScreenTextAr: 'ثقة مطلقة • ضمان حقيقي ✓'
    },
    {
      sceneNumber: 4,
      durationSeconds: 4,
      cameraMovement: 'Front Hero Static with Subtle Floating FX',
      visualDescription: `شاشة الختام: ظهور عبوة المنتج بجانب لوجو (${brand}) والستيكر الإعلاني بالخط العربي المجسم 3D وزر الاتصال أو الشراء.`,
      egyptianVoiceover: `${cta} دوس على اللينك تحت وسيب الباقي علينا!`,
      soundEffects: 'صوت إغلاق الصندوق مع نقرة زر الشراء وWhistle مبهجة',
      onScreenTextAr: 'اطلب الآن • التوصيل فوري 🛍️'
    }
  ];

  return {
    angle: params.angle,
    angleTitleAr: meta.nameAr,
    hookThreeSeconds: meta.exampleHook,
    scenes,
    totalDurationSeconds: scenes.reduce((sum, s) => sum + s.durationSeconds, 0),
    callToAction: cta,
    brandSignoff: `${brand} • الحل الأوحد الذي لا يُستبدل`
  };
}
