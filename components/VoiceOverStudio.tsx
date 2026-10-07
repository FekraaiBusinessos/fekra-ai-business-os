import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VoiceOverStudioProject, VoiceOverHistoryItem, AudioFile } from '../types';
import { generateSpeech, rewriteVoiceoverScript } from '../services/geminiService';
import { validateQuotaUsage } from '../services/quotaGuard';
import { saveStudioWork } from '../services/studioStorageService';
import { VOICES, ARABIC_DIALECTS, VOICEOVER_TONES, VOICEOVER_SPEEDS, DialectOption, VoiceoverToneOption } from '../constants';
import { decodeBase64, decodeAudioData, pcmToWavBlob } from '../utils';
import SmartEnhanceButton from './SmartEnhanceButton';

// --- ICONS ---
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 11-2 0V6H3a1 1 0 110-2h1V3a1 1 0 011-1zm12 10a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1zM10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 14a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const PreviewPlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const PreviewPauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const PreviewLoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[var(--color-accent)]"></div>
);
// --- END ICONS ---

const VoiceOverStudio: React.FC<{
  project: VoiceOverStudioProject;
  setProject: React.Dispatch<React.SetStateAction<VoiceOverStudioProject>>;
}> = ({ project, setProject }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const previewAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Local state for UI enhancements
  const [selectedDialectId, setSelectedDialectId] = useState<string>(project.dialect || 'saudi_najdi');
  const [selectedToneId, setSelectedToneId] = useState<string>(project.tone || 'viral_hype');
  const [selectedSpeed, setSelectedSpeed] = useState<number>(project.speed || 1.0);
  const [isScriptAssistantOpen, setIsScriptAssistantOpen] = useState(false);
  const [scriptBriefInput, setScriptBriefInput] = useState('');
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [activeTab, setActiveTab] = useState<'dialects' | 'tones' | 'advanced'>('dialects');
  const [playbackTime, setPlaybackTime] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [copiedText, setCopiedText] = useState(false);

  // Initialize AudioContext
  useEffect(() => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return () => {
      audioSourceRef.current?.stop();
      audioSourceRef.current = null;
      previewAudioSourceRef.current?.stop();
      previewAudioSourceRef.current = null;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Filter voices safely
  useEffect(() => {
    const filteredVoices = project.voiceGenderFilter === 'All'
      ? VOICES
      : VOICES.filter(v => v.gender === project.voiceGenderFilter);

    const isCurrentVoiceInFilteredList = filteredVoices.some(v => v.value === project.selectedVoice);
    if (!isCurrentVoiceInFilteredList && filteredVoices.length > 0) {
      setProject(s => ({ ...s, selectedVoice: filteredVoices[0].value }));
    }
  }, [project.voiceGenderFilter, project.selectedVoice, setProject]);

  // Synchronize dialect selection with style instructions
  const handleSelectDialect = (dialect: DialectOption) => {
    setSelectedDialectId(dialect.id);
    const toneObj = VOICEOVER_TONES.find(t => t.id === selectedToneId);
    const combinedInstructions = `${dialect.promptInstruction} ${toneObj ? toneObj.instructionSuffix : ''}`.trim();
    setProject(s => ({
      ...s,
      dialect: dialect.id,
      styleInstructions: combinedInstructions
    }));
  };

  const handleSelectTone = (tone: VoiceoverToneOption) => {
    setSelectedToneId(tone.id);
    const dialectObj = ARABIC_DIALECTS.find(d => d.id === selectedDialectId);
    const combinedInstructions = `${dialectObj ? dialectObj.promptInstruction : ''} ${tone.instructionSuffix}`.trim();
    setProject(s => ({
      ...s,
      tone: tone.id,
      styleInstructions: combinedInstructions
    }));
  };

  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed);
    setProject(s => ({ ...s, speed }));
  };

  // Generate Speech Audio
  const handleGenerate = useCallback(async () => {
    if (!project.text.trim()) {
      setProject(s => ({ ...s, error: 'الرجاء إدخال نص لإنشاء التعليق الصوتي.' }));
      return;
    }

    const val = validateQuotaUsage({
      studio: 'voiceover',
      prompt: project.text,
      fingerprint: `voice_${project.selectedVoice}_${project.text.slice(0, 30)}_${selectedSpeed}`
    });
    if (!val.allowed) {
      setProject(s => ({ ...s, error: val.reason || 'حماية الكوتة نشطة لمنع الهدر التكراري.' }));
      return;
    }

    setProject(s => ({ ...s, isLoading: true, error: null, generatedAudio: null }));
    try {
      const dialectObj = ARABIC_DIALECTS.find(d => d.id === selectedDialectId);
      const toneObj = VOICEOVER_TONES.find(t => t.id === selectedToneId);

      const audio = await generateSpeech(
        project.text,
        project.styleInstructions,
        project.selectedVoice,
        {
          dialectInstruction: dialectObj?.promptInstruction,
          toneInstruction: toneObj?.instructionSuffix,
          speed: selectedSpeed,
        }
      );

      const newHistoryItem: VoiceOverHistoryItem = {
        audio,
        text: project.text,
        style: `${dialectObj?.label || 'مخصص'} - ${toneObj?.label || 'افتراضي'}`,
        voice: project.selectedVoice,
      };

      setProject(s => ({
        ...s,
        isLoading: false,
        generatedAudio: audio,
        history: [newHistoryItem, ...s.history]
      }));

      // Automatically persist to user's Studio Works Portfolio (استوديو أعمالي)
      saveStudioWork({
        title: `تسجيل صوتي: ${dialectObj?.label || 'فويس أوفر'}`,
        prompt: project.text,
        studioType: 'voiceover',
        audio: audio,
        metadata: {
          atmosphere: `${dialectObj?.label || 'لهجة عربية'} | ${toneObj?.label || 'نبرة إعلانية'}`,
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء توليد الصوت.';
      setProject(s => ({ ...s, isLoading: false, error: errorMessage }));
    }
  }, [project.text, project.styleInstructions, project.selectedVoice, selectedDialectId, selectedToneId, selectedSpeed, setProject]);

  // Audio Waveform Animation helper
  const drawWaveform = (analyser?: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barCount = 36;
    const barWidth = width / barCount - 2;

    for (let i = 0; i < barCount; i++) {
      // Create reactive bar animation
      const factor = Math.sin(Date.now() * 0.008 + i * 0.3) * 0.5 + 0.5;
      const barHeight = Math.max(4, factor * (height - 8));
      const x = i * (barWidth + 2);
      const y = (height - barHeight) / 2;

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#00e5ff');
      gradient.addColorStop(1, '#7928ca');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 3);
      ctx.fill();
    }

    if (project.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(() => drawWaveform(analyser));
    }
  };

  // Play Full Audio
  const playAudio = useCallback(async (audioFile: AudioFile) => {
    if (!audioContextRef.current) return;

    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
    }

    setProject(s => ({ ...s, isPlaying: true }));

    const audioCtx = audioContextRef.current;
    const pcmBytes = decodeBase64(audioFile.base64);
    const audioBuffer = await decodeAudioData(pcmBytes, audioCtx, 24000, 1);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = selectedSpeed;
    source.connect(audioCtx.destination);

    setPlaybackTime({ current: 0, total: Math.round(audioBuffer.duration / selectedSpeed) });

    const startTime = audioCtx.currentTime;
    const duration = audioBuffer.duration / selectedSpeed;

    const timerInterval = setInterval(() => {
      const elapsed = audioCtx.currentTime - startTime;
      if (elapsed >= duration) {
        clearInterval(timerInterval);
        setPlaybackTime({ current: Math.round(duration), total: Math.round(duration) });
      } else {
        setPlaybackTime({ current: Math.round(elapsed), total: Math.round(duration) });
      }
    }, 250);

    source.start();
    drawWaveform();

    source.onended = () => {
      clearInterval(timerInterval);
      setProject(s => ({ ...s, isPlaying: false }));
      audioSourceRef.current = null;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
    audioSourceRef.current = source;
  }, [selectedSpeed, setProject]);

  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setProject(s => ({ ...s, isPlaying: false }));
  }, [setProject]);

  // Voice Preview
  const handlePreview = useCallback(async (e: React.MouseEvent, voiceName: string) => {
    e.stopPropagation();

    if (project.previewPlayingVoice === voiceName && previewAudioSourceRef.current) {
      previewAudioSourceRef.current.stop();
      return;
    }

    if (previewAudioSourceRef.current) {
      previewAudioSourceRef.current.stop();
    }

    setProject(s => ({ ...s, previewLoadingVoice: voiceName, previewPlayingVoice: null, error: null }));

    try {
      const dialectObj = ARABIC_DIALECTS.find(d => d.id === selectedDialectId);
      const sampleText = dialectObj?.sampleText || "أهلاً بك، هذه تجربة حية لنقاء وجودة هذا الصوت الإعلاني.";
      const audio = await generateSpeech(sampleText, dialectObj?.promptInstruction || '', voiceName);

      if (!audioContextRef.current) return;

      const audioCtx = audioContextRef.current;
      const pcmBytes = decodeBase64(audio.base64);
      const audioBuffer = await decodeAudioData(pcmBytes, audioCtx, 24000, 1);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      setProject(s => s.previewLoadingVoice === voiceName ? { ...s, previewLoadingVoice: null, previewPlayingVoice: voiceName } : s);
      source.start();

      source.onended = () => {
        setProject(s => s.previewPlayingVoice === voiceName ? { ...s, previewPlayingVoice: null } : s);
        if (previewAudioSourceRef.current === source) {
          previewAudioSourceRef.current = null;
        }
      };
      previewAudioSourceRef.current = source;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'تعذر تحميل معاينة الصوت.';
      setProject(s => ({ ...s, error: errorMessage, previewLoadingVoice: null }));
    }
  }, [project.previewPlayingVoice, selectedDialectId, setProject]);

  // Download Audio
  const handleDownload = useCallback(async (audioFile: AudioFile) => {
    if (!audioContextRef.current) return;

    const pcmBytes = decodeBase64(audioFile.base64);
    const audioBuffer = await decodeAudioData(pcmBytes, audioContextRef.current, 24000, 1);
    const pcmFloat32 = audioBuffer.getChannelData(0);
    const wavBlob = pcmToWavBlob(pcmFloat32, 24000, 1);

    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fekra-Voiceover-${selectedDialectId}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [selectedDialectId]);

  // Script Intelligence Handlers
  const handleAiScriptRewrite = async (mode: 'rewrite_dialect' | 'generate_ad_script' | 'add_tashkeel_and_pauses') => {
    const textToProcess = mode === 'generate_ad_script' ? scriptBriefInput : project.text;
    if (!textToProcess.trim()) {
      setProject(s => ({ ...s, error: 'الرجاء إدخال نص أو فكرة أولاً.' }));
      return;
    }

    setIsAiWorking(true);
    setProject(s => ({ ...s, error: null }));
    try {
      const dialectObj = ARABIC_DIALECTS.find(d => d.id === selectedDialectId) || ARABIC_DIALECTS[0];
      const toneObj = VOICEOVER_TONES.find(t => t.id === selectedToneId) || VOICEOVER_TONES[0];

      const refinedScript = await rewriteVoiceoverScript(
        textToProcess,
        dialectObj.label,
        toneObj.label,
        mode
      );

      setProject(s => ({ ...s, text: refinedScript }));
      if (mode === 'generate_ad_script') {
        setIsScriptAssistantOpen(false);
      }
    } catch (err) {
      console.error(err);
      setProject(s => ({ ...s, error: 'تعذر معالجة السكربت بالذكاء الاصطناعي.' }));
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleCopyScript = () => {
    if (!project.text) return;
    navigator.clipboard.writeText(project.text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Metrics
  const wordCount = project.text ? project.text.trim().split(/\s+/).length : 0;
  const charCount = project.text ? project.text.length : 0;
  const estimatedSeconds = Math.round(wordCount * 0.45 / selectedSpeed);

  const filteredVoices = project.voiceGenderFilter === 'All'
    ? VOICES
    : VOICES.filter(v => v.gender === project.voiceGenderFilter);

  const currentDialect = ARABIC_DIALECTS.find(d => d.id === selectedDialectId) || ARABIC_DIALECTS[0];
  const currentTone = VOICEOVER_TONES.find(t => t.id === selectedToneId) || VOICEOVER_TONES[0];

  return (
    <main className="w-full max-w-6xl flex flex-col gap-6 pt-4 pb-12 mx-auto">
      {/* Top Banner / Master Suite Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--color-accent)] to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-[var(--color-accent)]/20">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">استوديو التعليق الصوتي الاحترافي</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                PRO ULTRA ENGINE
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              جميع اللهجات العربية الأصيلة • تحكم سيكولوجي بالنبرات • تشكيل دقيق ومنع اللبس • جودة استوديو 24kHz
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Inputs, Scripting & Dialects) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Script Area with AI Tools */}
          <div className="glass-card rounded-3xl p-5 border border-white/5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <label htmlFor="vo-text" className="text-sm font-black text-white flex items-center gap-2">
                <span>📝</span>
                <span>السكربت الإعلاني (Script)</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 font-bold">
                  {wordCount} كلمة • {charCount} حرف • تقريباً ~{estimatedSeconds} ثانية
                </span>
                {project.text && (
                  <>
                    <button
                      onClick={handleCopyScript}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                      title="نسخ السكربت"
                    >
                      <CopyIcon />
                    </button>
                    <button
                      onClick={() => setProject(s => ({ ...s, text: '' }))}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="مسح النص"
                    >
                      <TrashIcon />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Smart Script AI Assist Buttons */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-[10px] font-black text-[var(--color-accent-light)] flex items-center gap-1">
                <SparkleIcon /> مساعد السكربت:
              </span>

              <SmartEnhanceButton
                currentText={project.text}
                onApplyText={(t) => setProject(s => ({ ...s, text: t }))}
                context="voiceover_script"
                label="تحسين ذكي ومبدع"
              />

              <button
                onClick={() => setIsScriptAssistantOpen(!isScriptAssistantOpen)}
                disabled={isAiWorking}
                className="text-xs px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 font-bold transition-all flex items-center gap-1"
              >
                <span>✍️</span>
                <span>توليد سكربت من فكرة</span>
              </button>

              <button
                onClick={() => handleAiScriptRewrite('rewrite_dialect')}
                disabled={isAiWorking || !project.text.trim()}
                className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 font-bold transition-all flex items-center gap-1 disabled:opacity-40"
              >
                <span>🪄</span>
                <span>تحويل للهجة ({currentDialect.label.split(' ')[0]})</span>
              </button>

              <button
                onClick={() => handleAiScriptRewrite('add_tashkeel_and_pauses')}
                disabled={isAiWorking || !project.text.trim()}
                className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 font-bold transition-all flex items-center gap-1 disabled:opacity-40"
                title="إضافة تشكيل دقيق ووقفات صوتية لمنع الخطأ"
              >
                <span>🎯</span>
                <span>ضبط التشكيل والوقفات</span>
              </button>
            </div>

            {/* Script Generator Drawer */}
            {isScriptAssistantOpen && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col gap-3 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-purple-200">
                    ✍️ توليد سكربت إعلاني مقنع بمحفزات علم النفس البيعي:
                  </span>
                  <div className="flex items-center gap-2">
                    <SmartEnhanceButton
                      currentText={scriptBriefInput}
                      onApplyText={(t) => setScriptBriefInput(t)}
                      context="voiceover_brief"
                      label="تحسين الفكرة"
                    />
                    <button
                      onClick={() => setIsScriptAssistantOpen(false)}
                      className="text-xs text-white/40 hover:text-white"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={scriptBriefInput}
                  onChange={(e) => setScriptBriefInput(e.target.value)}
                  placeholder="مثال: متجر عطور سعودي فاخر، عطر شتوي ثابت، عرض خصم 50% لفترة محدودة..."
                  className="w-full glass-input rounded-xl p-3 text-xs text-white"
                />
                <button
                  onClick={() => handleAiScriptRewrite('generate_ad_script')}
                  disabled={isAiWorking || !scriptBriefInput.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isAiWorking ? 'جاري كتابة السكربت الإعلاني...' : 'توليد السكربت فوراً'}
                </button>
              </div>
            )}

            <textarea
              id="vo-text"
              value={project.text}
              onChange={e => setProject({ ...project, text: e.target.value })}
              rows={5}
              className="w-full glass-input rounded-2xl p-4 text-sm leading-relaxed text-white suggestions-scrollbar"
              placeholder="اكتب السكربت هنا، أو استخدم أزرار الذكاء الاصطناعي بالأعلى لتوليد نص إعلاني فتاك..."
            />

            {/* Quick Sample Chips from Active Dialect */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-white/40 font-bold">نموذج مقترح لهذه اللهجة:</span>
              <button
                onClick={() => setProject(s => ({ ...s, text: currentDialect.sampleText }))}
                className="text-[11px] px-3 py-1 rounded-lg bg-white/5 hover:bg-[var(--color-accent)]/20 text-white/80 hover:text-white transition-all border border-white/5 truncate max-w-md text-right"
              >
                "{currentDialect.sampleText}"
              </button>
            </div>
          </div>

          {/* Dialects, Tones, and Settings Selector */}
          <div className="glass-card rounded-3xl p-5 border border-white/5 space-y-4 shadow-xl">
            {/* Tabs */}
            <div className="flex border-b border-white/10 pb-2 gap-2">
              <button
                onClick={() => setActiveTab('dialects')}
                className={`text-xs font-black px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'dialects'
                    ? 'bg-[var(--color-accent)] text-white shadow-md'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                🗺️ اللهجات العربية ({ARABIC_DIALECTS.length})
              </button>
              <button
                onClick={() => setActiveTab('tones')}
                className={`text-xs font-black px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'tones'
                    ? 'bg-[var(--color-accent)] text-white shadow-md'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                🎭 النبرات والمشاعر ({VOICEOVER_TONES.length})
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`text-xs font-black px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'advanced'
                    ? 'bg-[var(--color-accent)] text-white shadow-md'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                ⚡ السرعة والإيقاع
              </button>
            </div>

            {/* Dialects Grid */}
            {activeTab === 'dialects' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60 font-bold">
                    اختر اللهجة المستهدفة للإعلان:
                  </span>
                  <span className="text-xs text-[var(--color-accent)] font-bold">
                    الحالية: {currentDialect.flag} {currentDialect.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto suggestions-scrollbar pr-1">
                  {ARABIC_DIALECTS.map(dialect => (
                    <div
                      key={dialect.id}
                      onClick={() => handleSelectDialect(dialect)}
                      role="radio"
                      tabIndex={0}
                      className={`cursor-pointer p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        selectedDialectId === dialect.id
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20 shadow-md'
                          : 'border-white/5 bg-black/30 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{dialect.flag}</span>
                        <span className="text-[10px] text-white/40">{dialect.region}</span>
                      </div>
                      <p className="text-xs font-bold text-white mt-1 leading-tight">{dialect.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tones Grid */}
            {activeTab === 'tones' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60 font-bold">
                    اختر النبرة السيكولوجية للإلقاء:
                  </span>
                  <span className="text-xs text-amber-300 font-bold">
                    الحالية: {currentTone.icon} {currentTone.label}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto suggestions-scrollbar pr-1">
                  {VOICEOVER_TONES.map(tone => (
                    <div
                      key={tone.id}
                      onClick={() => handleSelectTone(tone)}
                      role="radio"
                      tabIndex={0}
                      className={`cursor-pointer p-3 rounded-xl border text-right transition-all ${
                        selectedToneId === tone.id
                          ? 'border-amber-400 bg-amber-500/20 shadow-md'
                          : 'border-white/5 bg-black/30 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tone.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{tone.label}</p>
                          <p className="text-[10px] text-white/60 mt-0.5">{tone.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced & Speed Controls */}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-2">سرعة الإلقاء (Speech Pace):</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {VOICEOVER_SPEEDS.map(speedOption => (
                      <button
                        key={speedOption.value}
                        onClick={() => handleSpeedChange(speedOption.value)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          selectedSpeed === speedOption.value
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-white'
                            : 'border-white/5 bg-black/30 text-white/60 hover:text-white'
                        }`}
                      >
                        {speedOption.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-white/80">توجيه مخصص للذكاء الاصطناعي (Style Prompt):</label>
                    <SmartEnhanceButton
                      currentText={project.styleInstructions}
                      onApplyText={(t) => setProject(s => ({ ...s, styleInstructions: t }))}
                      context="style_instruction"
                      label="تحسين التوجيه"
                    />
                  </div>
                  <input
                    type="text"
                    value={project.styleInstructions}
                    onChange={e => setProject({ ...project, styleInstructions: e.target.value })}
                    placeholder="توجيه خاص باللغة الإنجليزية أو العربية..."
                    className="w-full glass-input rounded-xl p-3 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* Voice Timbre Picker */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>👤</span>
                  <span>اختيار خامة الصوت (Voice Timbre)</span>
                </span>
                <div className="flex items-center gap-1 p-0.5 bg-black/30 rounded-full border border-white/5">
                  {(['All', 'Male', 'Female'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setProject(s => ({ ...s, voiceGenderFilter: filter }))}
                      className={`text-[10px] px-3 py-1 rounded-full transition-all font-bold ${
                        project.voiceGenderFilter === filter
                          ? 'bg-[var(--color-accent)] text-white shadow'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {filter === 'All' ? 'الكل' : filter === 'Male' ? 'ذكوري' : 'أنثوي'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredVoices.map(voice => (
                  <div
                    key={voice.value}
                    onClick={() => {
                      if (previewAudioSourceRef.current) previewAudioSourceRef.current.stop();
                      setProject(s => ({ ...s, selectedVoice: voice.value }));
                    }}
                    role="radio"
                    tabIndex={0}
                    className={`cursor-pointer p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                      project.selectedVoice === voice.value
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20 shadow-md'
                        : 'border-white/5 bg-black/30 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-black text-white">{voice.label}</p>
                      <p className="text-[10px] text-white/50">{voice.description.split('-')[0]}</p>
                    </div>

                    <button
                      onClick={(e) => handlePreview(e, voice.value)}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white transition-colors"
                      title={`معاينة صوت ${voice.label}`}
                    >
                      {project.previewLoadingVoice === voice.value ? (
                        <PreviewLoadingSpinner />
                      ) : project.previewPlayingVoice === voice.value ? (
                        <PreviewPauseIcon />
                      ) : (
                        <PreviewPlayIcon />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={project.isLoading || !project.text.trim()}
              className="w-full bg-gradient-to-r from-[var(--color-accent)] via-purple-600 to-indigo-600 hover:opacity-95 text-white font-black py-4 px-8 rounded-2xl text-lg transition-all duration-300 shadow-xl shadow-[var(--color-accent)]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.99]"
            >
              {project.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span>جاري هندسة وتوليد التعليق الصوتي بأعلى نقاوة...</span>
                </>
              ) : (
                <>
                  <span>🎙️ توليد التعليق الصوتي الآن (Generate Voiceover)</span>
                </>
              )}
            </button>

            {project.error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs text-center font-bold">
                {project.error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audio Waveform Player & Studio History */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Active Audio Result Card */}
          <div className="glass-card rounded-3xl p-5 border border-white/5 shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>🎧</span>
                <span>المشغل الصوتي المتقدم (Studio Player)</span>
              </h3>
              {project.generatedAudio && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  WAV 24kHz
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/5 flex flex-col items-center justify-center gap-4 min-h-[160px]">
              {!project.generatedAudio && !project.isLoading && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-xl text-white/40 mb-2">
                    🔊
                  </div>
                  <p className="text-xs text-white/50 font-bold">الصوت المولد سيظهر هنا مباشرة مع موجة بصرية تفاعلية.</p>
                </div>
              )}

              {project.isLoading && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--color-accent)] border-t-transparent"></div>
                  <p className="text-xs text-white/70 font-bold animate-pulse">تطبيق التشكيل والنبرة وبناء الملف الصوتي...</p>
                </div>
              )}

              {project.generatedAudio && !project.isLoading && (
                <div className="w-full flex flex-col gap-4">
                  {/* Visualizer Canvas */}
                  <div className="w-full h-16 rounded-xl bg-black/60 border border-white/5 flex items-center justify-center overflow-hidden">
                    <canvas ref={canvasRef} width={340} height={64} className="w-full h-full" />
                  </div>

                  {/* Player Controls & Timer */}
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => project.isPlaying ? stopAudio() : playAudio(project.generatedAudio as AudioFile)}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-[var(--color-accent)]/30 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                    >
                      {project.isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>

                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between items-center text-xs text-white font-mono">
                        <span>00:{playbackTime.current < 10 ? `0${playbackTime.current}` : playbackTime.current}</span>
                        <span className="text-white/40">/</span>
                        <span className="text-white/60">00:{playbackTime.total < 10 ? `0${playbackTime.total}` : playbackTime.total}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-[var(--color-accent)] h-full transition-all duration-200"
                          style={{
                            width: `${playbackTime.total > 0 ? (playbackTime.current / playbackTime.total) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Download Action */}
                  <button
                    onClick={() => handleDownload(project.generatedAudio as AudioFile)}
                    className="w-full flex items-center justify-center py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs transition-all border border-white/10"
                  >
                    <DownloadIcon />
                    <span>تحميل التعليق الصوتي (.WAV بدقة 24kHz)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* History */}
          <div className="glass-card rounded-3xl p-5 border border-white/5 shadow-xl flex flex-col gap-3 flex-grow">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>📁</span>
                <span>سجل التعليقات الصوتية ({project.history.length})</span>
              </h3>
              {project.history.length > 0 && (
                <button
                  onClick={() => setProject(s => ({ ...s, history: [] }))}
                  className="text-[10px] text-white/40 hover:text-red-400 font-bold transition-colors"
                >
                  مسح السجل
                </button>
              )}
            </div>

            {project.history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-xs text-white/40 font-bold">السجل فارغ حالياً.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto suggestions-scrollbar pr-1">
                {project.history.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                    <button
                      onClick={() => playAudio(item.audio)}
                      className="w-9 h-9 rounded-full bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)] text-[var(--color-accent-light)] hover:text-white flex items-center justify-center flex-shrink-0 transition-all"
                    >
                      <PlayIcon />
                    </button>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-xs font-bold text-white truncate">"{item.text}"</p>
                      <p className="text-[10px] text-white/50">{item.style} • صوت: {item.voice}</p>
                    </div>
                    <button
                      onClick={() => handleDownload(item.audio)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                      title="تحميل"
                    >
                      <DownloadIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default VoiceOverStudio;
