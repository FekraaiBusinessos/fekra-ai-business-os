import React, { useState } from 'react';
import { HyperUniversalSocialDNA, ImageFile } from '../types';

export interface VisualDNAInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dna: HyperUniversalSocialDNA | null;
  isLoading?: boolean;
  onApplyDNA?: (dna: HyperUniversalSocialDNA) => void;
  onSendToVideoFlow?: (prompt: string, image?: ImageFile | null) => void;
  onReanalyzeWithDialect?: (dialect: 'سعودي معاصر' | 'مصري حماسي' | 'خليجي فخم' | 'شامي مرح' | 'عالمي فصحى') => void;
}

export const VisualDNAInspectorModal: React.FC<VisualDNAInspectorModalProps> = ({
  isOpen,
  onClose,
  dna,
  isLoading = false,
  onApplyDNA,
  onSendToVideoFlow,
  onReanalyzeWithDialect,
}) => {
  const [activeTab, setActiveTab] = useState<'brand_color' | 'face_character' | 'story_hook' | 'depth_layers' | 'video_comedy'>('brand_color');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto" dir="rtl">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[94vh] sm:max-w-5xl bg-[#070b13] border-0 sm:border border-cyan-500/30 rounded-none sm:rounded-[2rem] shadow-2xl p-3 sm:p-6 text-white overflow-hidden flex flex-col">
        
        {/* Background Ambient Glows */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-xl font-bold flex-shrink-0">
              🧬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black bg-gradient-to-r from-cyan-300 via-white to-blue-200 bg-clip-text text-transparent">
                  HYPER UNIVERSAL SOCIAL ENGINE V1.0
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  VISUAL DNA • 15 LAYERS
                </span>
              </div>
              <p className="text-[11px] text-white/50 line-clamp-1">
                تحليل الـ DNA الإعلاني الموحد • قفل الوجه Face Lock • دستور الـ 3 ألوان • محرك الكوميديا البيعية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {dna && onApplyDNA && (
              <button
                type="button"
                onClick={() => {
                  onApplyDNA(dna);
                  onClose();
                }}
                className="hidden sm:flex py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-black font-black text-xs items-center gap-1.5 shadow-md shadow-cyan-500/25 active:scale-95"
              >
                <span>🔒</span>
                <span>تثبيت الـ DNA على الحملة (Brand Lock)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 text-base font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-purple-500/20 border-b-purple-400 animate-spin" style={{ animationDirection: 'reverse' }} />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                🧬
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-cyan-300 animate-pulse">
                جاري استخلاص الـ DNA الإعلاني عبر المحرك الخماسي عشر...
              </h3>
              <p className="text-xs text-white/60 max-w-sm leading-relaxed">
                تحليل ألوان اللوجو (دستور الـ 3 ألوان)، قفل ملامح الوجه Face Lock، تحديد الخطاف البصري، وصياغة الإخراج الكوميدي البيعي...
              </p>
            </div>
          </div>
        ) : !dna ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <span className="text-4xl">🔍</span>
            <p className="text-xs text-white/60">لم يتم استخراج DNA بعد. قم برفع صورة مرجعية للبدء فوراً.</p>
          </div>
        ) : (
          <>
            {/* Scroll-Stop Rating Banner */}
            <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-blue-950/40 to-purple-950/40 border border-cyan-500/35 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-lg">⚡</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">حكم محرك كسر التمرير (Scroll Stop Engine):</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      معدل الجذب: {dna.scrollStopVerdict.curiosityFactor}% (خلال أقل من ثانية)
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
                    {dna.scrollStopVerdict.stopScrollHookAr}
                  </p>
                </div>
              </div>

              {/* 3 Colors Swatch Quick View */}
              <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 flex-shrink-0">
                <span className="text-[10px] text-white/50 font-bold ml-1">دستور الألوان (3 Max):</span>
                <span className="w-4 h-4 rounded-full border border-white/30 shadow-sm" style={{ backgroundColor: dna.colorConstitution.primary }} title={`Primary: ${dna.colorConstitution.primaryName}`} />
                <span className="w-4 h-4 rounded-full border border-white/30 shadow-sm" style={{ backgroundColor: dna.colorConstitution.secondary }} title={`Secondary: ${dna.colorConstitution.secondaryName}`} />
                <span className="w-4 h-4 rounded-full border border-white/30 shadow-sm" style={{ backgroundColor: dna.colorConstitution.neutral }} title={`Neutral: ${dna.colorConstitution.neutralName}`} />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between gap-1 bg-black/50 p-1 mb-3 rounded-xl border border-white/10 flex-shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('brand_color')}
                className={`py-2 px-3 rounded-lg text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'brand_color' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' : 'text-white/60 hover:text-white'
                }`}
              >
                <span>🎨</span>
                <span>الألوان والهوية (Layers 1-2)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('face_character')}
                className={`py-2 px-3 rounded-lg text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'face_character' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' : 'text-white/60 hover:text-white'
                }`}
              >
                <span>👤</span>
                <span>قفل الوجه والشخصية (Layers 3-4)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('story_hook')}
                className={`py-2 px-3 rounded-lg text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'story_hook' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' : 'text-white/60 hover:text-white'
                }`}
              >
                <span>🧲</span>
                <span>الخطاف والقصة (Layers 5-7, 10)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('depth_layers')}
                className={`py-2 px-3 rounded-lg text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'depth_layers' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' : 'text-white/60 hover:text-white'
                }`}
              >
                <span>📐</span>
                <span>العمق الثماني والتايبوغرافي (Layers 8, 11-13)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('video_comedy')}
                className={`py-2 px-3 rounded-lg text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'video_comedy' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-md shadow-orange-500/20' : 'text-white/60 hover:text-white'
                }`}
              >
                <span>🎬</span>
                <span>الإخراج الكوميدي البيعي</span>
              </button>
            </div>

            {/* Tab Contents Scrollable Area */}
            <div className="overflow-y-auto flex-1 pr-1 pb-16 sm:pb-2 space-y-3 custom-scroll">
              
              {/* TAB 1: Brand & Color Constitution */}
              {activeTab === 'brand_color' && (
                <div className="space-y-3 animate-fadeIn">
                  
                  {/* Layer 02: Color Constitution (Strict 3 Colors) */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/25 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                        <span>🎨</span>
                        <span>LAYER 02 — COLOR CONSTITUTION (دستور الـ 3 ألوان الصارم)</span>
                      </span>
                      <span className="text-[10px] text-white/50">Maximum 3 Colors • Unified Cinematic Grading</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Primary */}
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl border border-white/20 shadow-inner flex-shrink-0" style={{ backgroundColor: dna.colorConstitution.primary }} />
                        <div className="min-w-0">
                          <div className="text-[10px] text-white/40 font-bold">1 PRIMARY (الأساسي)</div>
                          <div className="text-xs font-black text-white truncate">{dna.colorConstitution.primaryName}</div>
                          <div className="text-[10px] font-mono text-cyan-300">{dna.colorConstitution.primary}</div>
                        </div>
                      </div>

                      {/* Secondary */}
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl border border-white/20 shadow-inner flex-shrink-0" style={{ backgroundColor: dna.colorConstitution.secondary }} />
                        <div className="min-w-0">
                          <div className="text-[10px] text-white/40 font-bold">1 SECONDARY (الثانوي)</div>
                          <div className="text-xs font-black text-white truncate">{dna.colorConstitution.secondaryName}</div>
                          <div className="text-[10px] font-mono text-cyan-300">{dna.colorConstitution.secondary}</div>
                        </div>
                      </div>

                      {/* Neutral */}
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl border border-white/20 shadow-inner flex-shrink-0" style={{ backgroundColor: dna.colorConstitution.neutral }} />
                        <div className="min-w-0">
                          <div className="text-[10px] text-white/40 font-bold">1 NEUTRAL (المحايد)</div>
                          <div className="text-xs font-black text-white truncate">{dna.colorConstitution.neutralName}</div>
                          <div className="text-[10px] font-mono text-cyan-300">{dna.colorConstitution.neutral}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-white/70">
                      <strong>قواعد التدرج السينمائي الموحد (Grading): </strong>
                      <span>{dna.colorConstitution.cinematicGradingRules}</span>
                    </div>
                  </div>

                  {/* Layer 01: Universal Brand AI */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>🏢</span>
                        <span>LAYER 01 — UNIVERSAL BRAND AI (هوية النشاط التجاري)</span>
                      </span>
                      <span className="text-[10px] text-cyan-300">{dna.brandAI.industry}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/5">
                        <span className="text-[10px] text-white/40 block">النشاط التجاري:</span>
                        <strong className="text-white text-[11px]">{dna.brandAI.businessActivity}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5">
                        <span className="text-[10px] text-white/40 block">شخصية البراند:</span>
                        <strong className="text-white text-[11px]">{dna.brandAI.brandPersonality}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5">
                        <span className="text-[10px] text-white/40 block">المشاعر المستهدفة:</span>
                        <strong className="text-white text-[11px]">{dna.brandAI.brandEmotion}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5">
                        <span className="text-[10px] text-white/40 block">الهدف التسويقي:</span>
                        <strong className="text-white text-[11px]">{dna.brandAI.marketingObjective}</strong>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: Face Lock AI & Character Engine */}
              {activeTab === 'face_character' && (
                <div className="space-y-3 animate-fadeIn">
                  
                  {/* Layer 03: Face Lock AI */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                        <span>🔒</span>
                        <span>LAYER 03 — FACE LOCK AI (قفل ملامح وهوية المعلن للأبد)</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/20 text-purple-200 border border-purple-500/40">
                        PERMANENT IDENTITY LOCK
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white/5">
                        <span className="text-[10px] text-white/40 block">هندسة الوجه والفك:</span>
                        <span className="text-white text-[11px]">{dna.faceLock.facialStructure}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5">
                        <span className="text-[10px] text-white/40 block">الشعر والتصفيفة:</span>
                        <span className="text-white text-[11px]">{dna.faceLock.hairStyleAndColor}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5">
                        <span className="text-[10px] text-white/40 block">لون ونظرة العين:</span>
                        <span className="text-white text-[11px]">{dna.faceLock.eyeColorAndExpression}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200 flex items-center justify-between">
                      <span><strong>أمر القفل بالإنجليزية: </strong>{dna.faceLock.persistentLockPromptEn.slice(0, 90)}...</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(dna.faceLock.persistentLockPromptEn, 'facelock')}
                        className="text-[10px] text-cyan-300 underline flex-shrink-0 mr-2"
                      >
                        {copiedKey === 'facelock' ? 'تم النسخ ✓' : 'نسخ أمر القفل'}
                      </button>
                    </div>
                  </div>

                  {/* Layer 04: Character Engine */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <span>🎭</span>
                        <span>LAYER 04 — CHARACTER ENGINE (تحويل المعلن لشخصية إعلانية مبهرة)</span>
                      </span>
                      <span className="text-[10px] text-white/50">{dna.characterEngine.characterArchetype}</span>
                    </div>

                    <p className="text-[11px] text-white/70">
                      <strong>أسلوب الكوميديا والتعبير: </strong>{dna.characterEngine.comedyStyle}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/5 space-y-1">
                        <span className="text-[10px] text-amber-300 font-bold block">تعبيرات وجه ضخمة (Huge Facial Expressions):</span>
                        {dna.characterEngine.facialExpressions.map((exp, idx) => (
                          <div key={idx} className="text-[11px] text-white/80">• {exp}</div>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/5 space-y-1">
                        <span className="text-[10px] text-amber-300 font-bold block">وضعيات تفاعلية مجنونة (Crazy Poses):</span>
                        {dna.characterEngine.exaggeratedPoses.map((pose, idx) => (
                          <div key={idx} className="text-[11px] text-white/80">• {pose}</div>
                        ))}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                      <strong>تفاعل الأيدي المضخمة (Oversized Hands): </strong>{dna.characterEngine.oversizedHandsInteraction}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: Visual Story, Hook & Smart Camera */}
              {activeTab === 'story_hook' && (
                <div className="space-y-3 animate-fadeIn">
                  
                  {/* Layer 10: Visual Hook AI */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-transparent border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                        <span>🧲</span>
                        <span>LAYER 10 — VISUAL HOOK AI (الخطاف البصري الذي لا ينسى)</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-200 border border-cyan-500/40">
                        {dna.visualHook.type}
                      </span>
                    </div>

                    <p className="text-xs text-white/90 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5">
                      {dna.visualHook.descriptionAr}
                    </p>

                    <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-center justify-between font-mono">
                      <span>{dna.visualHook.promptEn}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(dna.visualHook.promptEn, 'hookprompt')}
                        className="text-[10px] underline text-cyan-300 flex-shrink-0 mr-2"
                      >
                        {copiedKey === 'hookprompt' ? 'تم النسخ ✓' : 'نسخ'}
                      </button>
                    </div>
                  </div>

                  {/* Layer 06: Visual Story AI */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>📖</span>
                      <span>LAYER 06 — VISUAL STORY AI (القصة البصرية الموحدة)</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-cyan-300 font-bold block">1. البداية</span>
                        <p className="text-[11px] text-white/70 mt-1">{dna.visualStory.beginning}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-amber-300 font-bold block">2. الفضول</span>
                        <p className="text-[11px] text-white/70 mt-1">{dna.visualStory.curiosity}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-pink-300 font-bold block">3. الشعور</span>
                        <p className="text-[11px] text-white/70 mt-1">{dna.visualStory.emotion}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-emerald-300 font-bold block">4. الحل</span>
                        <p className="text-[11px] text-white/70 mt-1">{dna.visualStory.solution}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-purple-300 font-bold block">5. العلامة</span>
                        <p className="text-[11px] text-white/70 mt-1">{dna.visualStory.brandLock}</p>
                      </div>
                    </div>
                  </div>

                  {/* Layer 07 & 09: Smart Camera & Smart Environment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-xs font-bold text-cyan-300">LAYER 07 — SMART CAMERA:</span>
                      <p className="text-xs text-white/80">{dna.smartCamera}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                      <span className="text-xs font-bold text-cyan-300">LAYER 09 — SMART ENVIRONMENT:</span>
                      <p className="text-xs text-white/80">{dna.smartEnvironment}</p>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: 8-Depth Engine & Typography AI */}
              {activeTab === 'depth_layers' && (
                <div className="space-y-3 animate-fadeIn">
                  
                  {/* Layer 11 & 12: Typography AI & Viral Headline */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-cyan-950/30 border border-cyan-500/25 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                        <span>✍️</span>
                        <span>LAYER 11 & 12 — TYPOGRAPHY AI & SMART HEADLINE</span>
                      </span>
                      <span className="text-[10px] text-white/50">3D Sticker Style • Viral Hook</span>
                    </div>

                    <div className="p-4 rounded-xl bg-black/70 border border-cyan-500/30 text-center space-y-1">
                      <span className="text-[10px] text-cyan-400 font-bold block">المانشيت الفيروسي المقترح (2-5 كلمات):</span>
                      <div className="text-xl sm:text-2xl font-black text-white tracking-wide drop-shadow-md">
                        {dna.smartHeadlineAI.viralHookHeadlineAr}
                      </div>
                      {dna.smartHeadlineAI.subheadAr && (
                        <div className="text-xs text-white/60">{dna.smartHeadlineAI.subheadAr}</div>
                      )}
                    </div>

                    <p className="text-[11px] text-white/70">
                      <strong>فلسفة وتفاعل التايبوغرافي مع البطل: </strong>{dna.typographyAI.interactionWithHero}
                    </p>
                  </div>

                  {/* Layer 08: 8-Layer Depth Engine */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>📐</span>
                        <span>LAYER 08 — DEPTH ENGINE (بناء المشهد عبر 8 طبقات عمق فيزيائي)</span>
                      </span>
                      <span className="text-[10px] text-cyan-300">3D Spatial Stacking</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {Object.entries(dna.depthEngine).map(([k, val], idx) => (
                        <div key={k} className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                          <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-[10px] text-white/40 font-bold block">{k.replace('layer', 'طبقة ')}</span>
                            <span className="text-[11px] text-white/80">{val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: Comedic Sales Video Direction */}
              {activeTab === 'video_comedy' && (
                <div className="space-y-3 animate-fadeIn">
                  
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-orange-950/20 to-transparent border border-amber-500/35 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                          <span>🎬</span>
                          <span>الإخراج السينمائي الكوميدي والمبيعات (Comedic Sales Video Direction)</span>
                        </span>
                        <p className="text-[11px] text-white/60 mt-0.5">
                          يتبع اللهجة العربية المحددة، مزامنة الشفاه (Lip-Sync)، وحركات جسدية مضحكة تحقق مبيعات فورية
                        </p>
                      </div>

                      {/* Dialect Switcher */}
                      {onReanalyzeWithDialect && (
                        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
                          {(['سعودي معاصر', 'مصري حماسي', 'خليجي فخم'] as const).map(d => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => onReanalyzeWithDialect(d)}
                              className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all ${
                                dna.comedicSalesVideo.dialect === d ? 'bg-amber-400 text-black font-black' : 'text-white/60 hover:text-white'
                              }`}
                            >
                              {d.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Lip-Sync Arabic Script */}
                    <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/25 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                        <span>🎙️ سكريبت الحوار والـ Lip-Sync باللهجة ({dna.comedicSalesVideo.dialect}):</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(dna.comedicSalesVideo.lipSyncScriptAr, 'lipsync')}
                          className="text-[10px] underline text-cyan-300"
                        >
                          {copiedKey === 'lipsync' ? 'تم النسخ ✓' : 'نسخ السكريبت'}
                        </button>
                      </div>
                      <p className="text-sm font-bold text-white leading-relaxed">
                        "{dna.comedicSalesVideo.lipSyncScriptAr}"
                      </p>
                    </div>

                    {/* Selling Gestures (حركات تبيع) */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <span className="text-xs font-black text-amber-300 block">
                        🔥 حركات جسدية كوميدية تبيع (High-Converting Sales Gestures):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {dna.comedicSalesVideo.sellingGesturesAr.map((g, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] text-white/90 flex items-center gap-2">
                            <span className="text-amber-400 font-bold">✓</span>
                            <span>{g}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button: Send to Video Flow */}
                    {onSendToVideoFlow && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSendToVideoFlow(dna.comedicSalesVideo.sceneDirectorialPromptEn);
                            onClose();
                          }}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:opacity-95 text-white font-black text-xs shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 active:scale-98"
                        >
                          <span>🎬</span>
                          <span>إطلاق توليد هذا الفيديو الكوميدي في نموذج Flow فوراً</span>
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              )}

            </div>

            {/* Modal Bottom Action Footer */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0">
              <span className="text-[11px] text-white/50">
                بصمة الـ DNA الفريدة: <code className="text-cyan-300">{dna.uniqueSignatureKey}</code>
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onApplyDNA && (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyDNA(dna);
                      onClose();
                    }}
                    className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                  >
                    تطبيق الـ DNA على جميع التصاميم والفيديوهات ✓
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default VisualDNAInspectorModal;
