import React, { useState, useEffect } from 'react';
import { StudioWorkItem, ImageFile } from '../types';
import { 
  getStudioWorks, 
  deleteStudioWork, 
  toggleFavoriteStudioWork, 
  exportStudioWorksJSON, 
  importStudioWorksJSON 
} from '../services/studioStorageService';

interface UserStudioWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImageForEdit?: (image: ImageFile) => void;
  onSelectPromptForCreator?: (prompt: string, image?: ImageFile) => void;
  onOpenSocialEngine?: (work: StudioWorkItem) => void;
  onRequestVideoFlow?: (image: ImageFile | null, prompt: string) => void;
}

export const UserStudioWorksModal: React.FC<UserStudioWorksModalProps> = ({
  isOpen,
  onClose,
  onSelectImageForEdit,
  onSelectPromptForCreator,
  onOpenSocialEngine,
  onRequestVideoFlow,
}) => {
  const [works, setWorks] = useState<StudioWorkItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWork, setSelectedWork] = useState<StudioWorkItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExportLayerPackageForWork = (item: StudioWorkItem) => {
    if (!item.metadata?.sceneAnalysis) return;
    const sa = item.metadata.sceneAnalysis;
    const packageData = {
      framework: 'Fekra AI Multi-Layer Scene Architecture v5.0',
      exportedAt: new Date().toISOString(),
      heroSubject: sa.heroSubject,
      estimatedAtmosphere: sa.estimatedAtmosphere,
      referenceAnalysis: sa.referenceAnalysis,
      arabicSummary: sa.arabicSummary,
      synthesizedPrompt: item.prompt,
      opticalDirectiveEn: sa.optimizedPromptEn,
      layers: sa.layers,
    };
    const blob = new Blob([JSON.stringify(packageData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fekra-multilayer-scene-${item.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadWorks = () => {
    setWorks(getStudioWorks());
  };

  useEffect(() => {
    if (isOpen) {
      loadWorks();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleStorageUpdate = () => loadWorks();
    window.addEventListener('fekra_studio_works_updated', handleStorageUpdate);
    return () => window.removeEventListener('fekra_studio_works_updated', handleStorageUpdate);
  }, []);

  if (!isOpen) return null;

  const filteredWorks = works.filter(item => {
    const matchesCategory = 
      activeFilter === 'all' ? true :
      activeFilter === 'favorites' ? !!item.isFavorite :
      item.studioType === activeFilter;

    const matchesSearch = 
      !searchQuery.trim() ||
      item.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata?.atmosphere?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleFavoriteStudioWork(id);
    loadWorks();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا العمل من استوديو أعمالك؟')) {
      deleteStudioWork(id);
      loadWorks();
      if (selectedWork?.id === id) setSelectedWork(null);
    }
  };

  const handleDownloadImage = (e: React.MouseEvent, item: StudioWorkItem) => {
    e.stopPropagation();
    if (!item.image?.base64) return;
    const link = document.createElement('a');
    link.href = `data:${item.image.mimeType || 'image/png'};base64,${item.image.base64}`;
    link.download = `fekra-work-${item.title || 'creation'}-${item.id.slice(-6)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = (e: React.MouseEvent, prompt: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportStudioWorksJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fekra-studio-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importStudioWorksJSON(content);
      if (res.success) {
        setImportStatus(`تم استيراد ${res.count} عمل بنجاح!`);
        loadWorks();
      } else {
        setImportStatus(res.error || 'فشل الاستيراد');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getStudioLabel = (type: string) => {
    switch (type) {
      case 'creator_studio': return { label: 'Creator Studio', icon: '🎨', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'photoshoot': return { label: 'Photoshoot Director', icon: '📸', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'marketing': return { label: 'Marketing Studio', icon: '📊', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'storyboard': return { label: 'Storyboard Studio', icon: '🎬', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'voiceover': return { label: 'Voice Over', icon: '🎙️', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'edit': return { label: 'Edit Studio', icon: '🖌️', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      default: return { label: 'Studio Work', icon: '✨', color: 'bg-white/10 text-white border-white/20' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col glass-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-gradient-to-b from-[#13121d] via-[#0b0a12] to-black">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-[var(--color-accent)] to-pink-500 flex items-center justify-center text-2xl text-white shadow-xl shadow-purple-900/30">
              💼
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  استوديو أعمالي الإبداعية (My Creative Studio)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black border border-purple-500/30">
                  {works.length} عمل محفوظ
                </span>
              </div>
              <p className="text-xs text-white/50">
                أرشيفك الشخصي المستدام لحفظ وإدارة وتطوير كافة التصاميم، الصور الإعلانية، والسكربتات.
              </p>
            </div>
          </div>

          {/* Quick Actions (Export / Import / Close) */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportBackup}
                title="تصدير نسخة احتياطية من أعمالك"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>💾</span>
                <span className="hidden sm:inline">نسخ احتياطي</span>
              </button>

              <label className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                <span>📥</span>
                <span className="hidden sm:inline">استيراد</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-all text-sm font-bold border border-white/10"
            >
              ✕
            </button>
          </div>
        </div>

        {importStatus && (
          <div className="bg-purple-600/30 border-y border-purple-500/40 text-purple-200 text-xs font-bold px-4 py-2 text-center">
            {importStatus}
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="p-4 sm:px-6 border-b border-white/5 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-black/40">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            {[
              { id: 'all', label: 'الكل', count: works.length },
              { id: 'favorites', label: 'المفضلة ⭐', count: works.filter(w => w.isFavorite).length },
              { id: 'creator_studio', label: 'Creator Studio 🎨', count: works.filter(w => w.studioType === 'creator_studio').length },
              { id: 'photoshoot', label: 'Photoshoot 📸', count: works.filter(w => w.studioType === 'photoshoot').length },
              { id: 'marketing', label: 'Marketing 📊', count: works.filter(w => w.studioType === 'marketing').length },
              { id: 'storyboard', label: 'Storyboard 🎬', count: works.filter(w => w.studioType === 'storyboard').length },
              { id: 'voiceover', label: 'Voice Over 🎙️', count: works.filter(w => w.studioType === 'voiceover').length },
              { id: 'edit', label: 'Edit Studio 🖌️', count: works.filter(w => w.studioType === 'edit').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-[var(--color-accent)] text-white shadow-lg'
                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === tab.id ? 'bg-black/30 text-white' : 'bg-white/10 text-white/40'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الأوامر والتصاميم..."
              className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 pr-8 text-xs text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-all"
            />
            <span className="absolute right-2.5 top-2.5 text-xs text-white/40 pointer-events-none">🔍</span>
          </div>
        </div>

        {/* Gallery Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredWorks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center gap-3">
              <span className="text-4xl">🎨</span>
              <h3 className="text-sm font-bold text-white">لا توجد أعمال في هذا القسم حالياً</h3>
              <p className="text-xs text-white/40 max-w-sm">
                كل صورة، جلسة تصوير، حملة، أو فويس أوفر تقوم بتوليده في أي قسم سيُحفظ هنا تلقائياً في استوديو أعمالك!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredWorks.map((item) => {
                const studioMeta = getStudioLabel(item.studioType);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedWork(item)}
                    className="group relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl flex flex-col cursor-pointer"
                  >
                    {/* Media Thumbnail */}
                    <div className="relative aspect-square w-full bg-black/60 overflow-hidden">
                      {item.image?.base64 ? (
                        <img
                          src={`data:${item.image.mimeType || 'image/png'};base64,${item.image.base64}`}
                          alt={item.title || item.prompt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : item.audio?.base64 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-950/40 to-black p-4 text-center gap-2">
                          <span className="text-4xl animate-pulse">🎙️</span>
                          <span className="text-xs font-bold text-purple-300">تسجيل صوتي إعلاني</span>
                          <span className="text-[10px] text-white/40 line-clamp-2 px-2 font-mono">
                            {item.prompt}
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <span>لا توجد معاينة</span>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-2.5 inset-x-2.5 flex justify-between items-center z-10 pointer-events-none">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border backdrop-blur-md ${studioMeta.color}`}>
                          {studioMeta.icon} {studioMeta.label}
                        </span>

                        <button
                          onClick={(e) => handleToggleFavorite(e, item.id)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all pointer-events-auto backdrop-blur-md ${
                            item.isFavorite ? 'bg-amber-500 text-white' : 'bg-black/50 text-white/60 hover:text-white'
                          }`}
                        >
                          {item.isFavorite ? '★' : '☆'}
                        </button>
                      </div>

                      {/* Hover Overlay with Quick Actions */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
                        <div className="flex items-center gap-2 pointer-events-auto">
                          {item.image?.base64 && (
                            <button
                              onClick={(e) => handleDownloadImage(e, item)}
                              title="تحميل الصورة"
                              className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white text-xs transition-all backdrop-blur-md"
                            >
                              ⬇️
                            </button>
                          )}
                          <button
                            onClick={(e) => handleCopyPrompt(e, item.prompt, item.id)}
                            title="نسخ الأمر"
                            className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white text-xs transition-all backdrop-blur-md"
                          >
                            {copiedId === item.id ? '✓' : '📋'}
                          </button>
                          {item.image && onRequestVideoFlow && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRequestVideoFlow(item.image!, item.prompt);
                                onClose();
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold transition-all flex items-center gap-1"
                              title="توليد فيديو عبر نموذج Flow"
                            >
                              <span>🎬</span>
                              <span>Flow</span>
                            </button>
                          )}
                          {item.image && onSelectImageForEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectImageForEdit(item.image!);
                                onClose();
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold transition-all"
                            >
                              تعديل 🖌️
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            title="حذف"
                            className="p-2 rounded-xl bg-red-500/40 hover:bg-red-500/70 text-white text-xs transition-all backdrop-blur-md mr-auto"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-3 bg-black/60 flex-1 flex flex-col justify-between gap-2 border-t border-white/5">
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-white/40 mb-1">
                          <span>{new Date(item.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          {item.metadata?.atmosphere && (
                            <span className="text-purple-300 font-medium truncate max-w-[110px]">
                              {item.metadata.atmosphere}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/80 font-medium line-clamp-2 leading-relaxed">
                          {item.prompt || item.title}
                        </p>
                      </div>

                      {item.metadata?.sceneAnalysis && (
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                          <span>🪐 كامل الطبقات (5 Layers)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed Work Inspector Modal */}
        {selectedWork && (
          <div 
            onClick={() => setSelectedWork(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl p-6 border border-purple-500/30 bg-[#0d0c15] shadow-2xl space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStudioLabel(selectedWork.studioType).icon}</span>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      تفاصيل العمل الإبداعي ({getStudioLabel(selectedWork.studioType).label})
                    </h3>
                    <span className="text-xs text-white/40">
                      {new Date(selectedWork.createdAt).toLocaleString('ar-EG')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleFavorite(e, selectedWork.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                      selectedWork.isFavorite ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    {selectedWork.isFavorite ? '★ في المفضلة' : '☆ أضف للمفضلة'}
                  </button>
                  <button
                    onClick={() => setSelectedWork(null)}
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Main Content (Image / Audio) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-xl">
                  {selectedWork.image?.base64 ? (
                    <img
                      src={`data:${selectedWork.image.mimeType || 'image/png'};base64,${selectedWork.image.base64}`}
                      alt={selectedWork.title || selectedWork.prompt}
                      className="w-full h-auto max-h-[450px] object-contain mx-auto"
                    />
                  ) : selectedWork.audio?.base64 ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
                      <span className="text-6xl animate-pulse">🎙️</span>
                      <audio 
                        controls 
                        src={`data:${selectedWork.audio.mimeType || 'audio/wav'};base64,${selectedWork.audio.base64}`}
                        className="w-full mt-2" 
                      />
                    </div>
                  ) : null}
                </div>

                {/* Details Breakdown */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white/60">الأمر البرمجي التوجيهي (Prompt):</span>
                      <button
                        onClick={(e) => handleCopyPrompt(e, selectedWork.prompt, selectedWork.id)}
                        className="text-[10px] text-purple-300 hover:text-purple-200 font-bold"
                      >
                        {copiedId === selectedWork.id ? 'تم النسخ ✓' : 'نسخ الأمر 📋'}
                      </button>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-white/90 leading-relaxed font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {selectedWork.prompt}
                    </div>
                  </div>

                  {selectedWork.metadata?.sceneAnalysis && (
                    <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                      <span className="text-xs font-black text-purple-300 block">
                        معمارية المشهد كامل الطبقات (Multi-Layer breakdown):
                      </span>
                      <div className="space-y-1.5 text-xs text-white/80">
                        {selectedWork.metadata.sceneAnalysis.layers?.map(l => (
                          <div key={l.id} className="flex items-center gap-2 text-[11px]">
                            <span>{l.icon}</span>
                            <span className="font-bold">{l.nameAr}:</span>
                            <span className="text-white/60 line-clamp-1">{l.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {onOpenSocialEngine && (
                      <button
                        onClick={() => {
                          const w = selectedWork;
                          setSelectedWork(null);
                          onClose();
                          onOpenSocialEngine(w);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-[var(--color-accent)] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2"
                      >
                        <span>🚀</span>
                        <span>تجهيز ونشر في Social Engine (Phase 5)</span>
                      </button>
                    )}

                    {selectedWork.metadata?.sceneAnalysis && (
                      <button
                        onClick={() => handleExportLayerPackageForWork(selectedWork)}
                        className="w-full px-4 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <span>📦</span>
                        <span>تصدير حزمة المشهد كامل الطبقات (JSON Manifest)</span>
                      </button>
                    )}

                    {selectedWork.image?.base64 && (
                      <button
                        onClick={(e) => handleDownloadImage(e, selectedWork)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>⬇️</span>
                        <span>تحميل بأعلى دقة</span>
                      </button>
                    )}

                    {selectedWork.image && onRequestVideoFlow && (
                      <button
                        onClick={() => {
                          onRequestVideoFlow(selectedWork.image!, selectedWork.prompt);
                          setSelectedWork(null);
                          onClose();
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
                      >
                        <span>🎬</span>
                        <span>توليد فيديو بنموذج Flow</span>
                      </button>
                    )}

                    {selectedWork.image && onSelectImageForEdit && (
                      <button
                        onClick={() => {
                          onSelectImageForEdit(selectedWork.image!);
                          setSelectedWork(null);
                          onClose();
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>🖌️</span>
                        <span>فتح في Edit Studio</span>
                      </button>
                    )}

                    {onSelectPromptForCreator && (
                      <button
                        onClick={() => {
                          onSelectPromptForCreator(selectedWork.prompt, selectedWork.image);
                          setSelectedWork(null);
                          onClose();
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>🚀</span>
                        <span>إعادة التوليد في Creator</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserStudioWorksModal;
