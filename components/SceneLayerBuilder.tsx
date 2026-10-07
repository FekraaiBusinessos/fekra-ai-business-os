import React, { useState, useEffect } from 'react';
import { SceneAnalysisResult, SceneLayer } from '../types';

interface SceneLayerBuilderProps {
  sceneAnalysis: SceneAnalysisResult;
  isAnalyzing?: boolean;
  onApplyAndGenerate: (optimizedPrompt: string) => void;
  onClose?: () => void;
  isGenerating?: boolean;
  onOpenSocialEngine?: () => void;
}

export const SceneLayerBuilder: React.FC<SceneLayerBuilderProps> = ({
  sceneAnalysis,
  isAnalyzing = false,
  onApplyAndGenerate,
  onClose,
  isGenerating = false,
  onOpenSocialEngine,
}) => {
  const [layers, setLayers] = useState<SceneLayer[]>(sceneAnalysis.layers || []);
  const [activeTab, setActiveTab] = useState<'stack' | 'preview' | 'depth'>('stack');
  const [expandedLayerId, setExpandedLayerId] = useState<string | null>(layers[0]?.id || null);

  useEffect(() => {
    if (sceneAnalysis?.layers && sceneAnalysis.layers.length > 0) {
      setLayers(sceneAnalysis.layers);
      setExpandedLayerId(sceneAnalysis.layers[0]?.id || null);
    }
  }, [sceneAnalysis]);

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, active: !l.active } : l));
  };

  const handleExportLayerPackage = () => {
    const packageData = {
      framework: 'Fekra AI Multi-Layer Scene Architecture v5.0',
      exportedAt: new Date().toISOString(),
      heroSubject: sceneAnalysis.heroSubject,
      estimatedAtmosphere: sceneAnalysis.estimatedAtmosphere,
      referenceAnalysis: sceneAnalysis.referenceAnalysis,
      arabicSummary: sceneAnalysis.arabicSummary,
      synthesizedPrompt: synthesizedPrompt,
      opticalDirectiveEn: sceneAnalysis.optimizedPromptEn,
      totalLayers: layers.length,
      activeLayersCount: activeLayers.length,
      layers: layers.map((l, i) => ({
        layerIndex: i + 1,
        id: l.id,
        name: l.name,
        nameAr: l.nameAr,
        category: l.category,
        depthPlane: `Z-0${i + 1}`,
        active: l.active,
        color: l.color,
        architecturalDirectiveAr: l.description,
        opticalDirectiveEn: l.descriptionEn,
      }))
    };

    const blob = new Blob([JSON.stringify(packageData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fekra-multilayer-scene-${(sceneAnalysis.heroSubject || 'scene').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Re-synthesize prompt from currently active layers
  const activeLayers = layers.filter(l => l.active);
  const synthesizedPrompt = activeLayers.length === layers.length 
    ? sceneAnalysis.optimizedPromptEn 
    : activeLayers.map(l => l.descriptionEn).join('. ') + ', 8k resolution, commercial photography, sharp focus, clean surfaces.';

  return (
    <div className="w-full glass-card rounded-3xl p-5 border border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-black/40 to-black/60 shadow-2xl space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-[var(--color-accent)] flex items-center justify-center text-xl text-white shadow-lg animate-pulse">
            🪐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-wide">
                معمارية المشهد كامل الطبقات (Multi-Layer Scene Architecture)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                {sceneAnalysis.estimatedAtmosphere || 'استوديو تجاري فخم'}
              </span>
            </div>
            <p className="text-[11px] text-white/50 font-medium">
              تم تحليل الأمر العربي والصور المرجعية وبناء مشهد ثلاثي الأبعاد مقسم لـ 5 طبقات حركية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 text-[10px] font-bold">
            <button
              onClick={() => setActiveTab('stack')}
              className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'stack' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'}`}
            >
              طبقات المشهد ({activeLayers.length}/5)
            </button>
            <button
              onClick={() => setActiveTab('depth')}
              className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'depth' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'}`}
            >
              عمق المشهد (3D Spatial)
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg transition-all ${activeTab === 'preview' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'}`}
            >
              الأمر المولد (Prompt)
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/5"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Reference Analysis Banner */}
      {sceneAnalysis.referenceAnalysis && (
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
          <span className="text-lg">🔍</span>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-[var(--color-accent-light)] uppercase tracking-wider block">
              تحليل المرجع والمنتج (Reference Intelligence):
            </span>
            <p className="text-xs text-white/80 leading-relaxed">
              {sceneAnalysis.referenceAnalysis}
            </p>
          </div>
        </div>
      )}

      {/* Tab 1: Animated Interactive Layers Stack */}
      {activeTab === 'stack' && (
        <div className="space-y-2.5">
          {layers.map((layer, index) => {
            const isExpanded = expandedLayerId === layer.id;
            return (
              <div 
                key={layer.id}
                onClick={() => setExpandedLayerId(isExpanded ? null : layer.id)}
                className={`rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                  layer.active 
                    ? isExpanded 
                      ? 'bg-purple-900/25 border-purple-500/50 shadow-lg' 
                      : 'bg-black/30 border-white/10 hover:border-purple-500/30'
                    : 'bg-black/20 border-white/5 opacity-50'
                }`}
              >
                <div className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{layer.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">
                          الطبقة 0{index + 1}: {layer.nameAr}
                        </span>
                        <span className="text-[10px] text-white/40 font-medium">
                          ({layer.name})
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 line-clamp-1 mt-0.5">
                        {layer.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => toggleLayer(layer.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        layer.active
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-white/5 text-white/30 border-white/10'
                      }`}
                    >
                      {layer.active ? 'نشطة ✓' : 'معطلة'}
                    </button>
                    <span className="text-xs text-white/30">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/5 bg-black/40 space-y-2 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-white/40 block">التفاصيل المعمارية للطبقة:</span>
                      <p className="text-xs text-white/90 leading-relaxed">
                        {layer.description}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/5">
                      <span className="text-[10px] font-mono text-purple-300 block mb-0.5">Optical Prompt Directive:</span>
                      <p className="text-[11px] font-mono text-white/70 leading-relaxed">
                        "{layer.descriptionEn}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: 3D Depth Spatial Visualizer */}
      {activeTab === 'depth' && (
        <div className="p-6 rounded-3xl bg-black/60 border border-purple-500/20 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-black text-purple-300">مصفوفة العمق البصري للمشهد ثلاثي الأبعاد:</span>
            <span className="text-[10px] text-white/40">5 مستويات متتالية (Z-Axis Depth Layers)</span>
          </div>

          <div className="relative py-8 px-4 flex flex-col items-center justify-center min-h-[220px] overflow-hidden rounded-2xl bg-gradient-to-b from-purple-950/30 via-black to-black border border-white/5">
            {layers.map((l, i) => {
              const depthOffset = (4 - i) * 14;
              const opacity = l.active ? 1 : 0.25;
              const scale = 1 - (4 - i) * 0.05;
              return (
                <div
                  key={l.id}
                  style={{
                    transform: `translateY(${depthOffset}px) scale(${scale})`,
                    zIndex: i + 1,
                    borderColor: l.color || '#8B5CF6',
                    opacity: opacity,
                  }}
                  className={`w-full max-w-md p-3 rounded-2xl border transition-all duration-300 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 ${
                    l.active ? 'bg-purple-950/40 text-white' : 'bg-black/60 text-white/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{l.icon}</span>
                    <div>
                      <div className="text-xs font-black flex items-center gap-1.5">
                        <span>Z-0{i + 1}</span>
                        <span className="text-white/40">|</span>
                        <span>{l.nameAr}</span>
                      </div>
                      <div className="text-[10px] text-white/60 line-clamp-1">{l.descriptionEn}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/30'}`}>
                    {l.active ? 'LIVE' : 'OFF'}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-center text-white/40">
            تتداخل هذه الطبقات بدقة متناهية أثناء التوليد لإنتاج عمق استوديو فوتوغرافي واقعي يبرز جمالية تفاصيل المنتج.
          </p>
        </div>
      )}

      {/* Tab 3: Prompt Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-3 p-4 bg-black/40 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-white">الأمر النهائي المولد للذكاء الاصطناعي:</span>
            <span className="text-[10px] text-emerald-400 font-bold">خالٍ 100% من تشوه الحروف والنصوص</span>
          </div>
          <div className="p-3.5 rounded-xl bg-black/60 font-mono text-xs text-purple-200 leading-relaxed border border-purple-500/20 whitespace-pre-wrap">
            {synthesizedPrompt}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportLayerPackage}
            title="تنزيل حزمة الطبقات الـ 5 كملف توجيهي للمصممين"
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span>📦</span>
            <span>تصدير حزمة الطبقات</span>
          </button>

          {onOpenSocialEngine && (
            <button
              type="button"
              onClick={onOpenSocialEngine}
              title="تجهيز المنشور للنشر عبر منصات التواصل الاجتماعي"
              className="px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>📱</span>
              <span>نشر في Social Engine</span>
            </button>
          )}
        </div>

        <button
          onClick={() => onApplyAndGenerate(synthesizedPrompt)}
          disabled={isGenerating || isAnalyzing || activeLayers.length === 0}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-[var(--color-accent)] hover:from-purple-500 hover:to-[var(--color-accent-dark)] text-white text-xs font-black shadow-xl shadow-purple-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              <span>جاري توليد المشهد كامل الطبقات...</span>
            </>
          ) : (
            <>
              <span>🚀</span>
              <span>اعتماد وتوليد المشهد الآن</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SceneLayerBuilder;
