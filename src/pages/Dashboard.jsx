import { useState, useEffect, useRef } from "react";
import {
  Wand2,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  Mail,
  Film,
  Library,
  User,
  Mic,
  Bot,
  Shuffle,
  Music,
  Copy,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useTranslation, LANGUAGES } from "../store/i18nStore";
import { useVideoStore } from "../store/videoStore";
import { useVideoLibraryStore } from "../store/videoLibraryStore";
import { useAdStore } from "../store/adStore";
import { generateScript } from "../services/geminiService";
import {
  getRecommendedVoices,
  speak,
  stopSpeaking,
} from "../services/speechService";
import {
  createVideoWithLibrary,
  generateLocalAIVoice,
} from "../services/videoGenerator";
import {
  checkTransformersAvailable,
  loadAIVoiceModel,
  AI_VOICE_STATUS,
  getAIVoiceStatus,
} from "../services/aiVoiceService";
import {
  PREINSTALLED_VIDEOS,
  PREINSTALLED_CATEGORIES,
  getPreinstalledByCategory,
} from "../services/preinstalledVideos";
import { isYouTubeConnected, uploadVideo } from "../services/youtubeService";
import { isServiceConfigured } from "../config/apiConfig";
import { VIDEO_TEMPLATES, getRandomIdea } from "../services/videoTemplates";
import {
  saveCustomTrack,
  getCustomTracks,
  deleteCustomTrack,
  getTrackBlob,
  MUSIC_CATEGORIES,
} from "../services/musicLibrary";
import ApiTutorial from "../components/ui/ApiTutorial";
import EmailModal from "../components/ui/EmailModal";
import WelcomeOnboarding from "../components/ui/WelcomeOnboarding";
import VideoDownloadPrompt from "../components/ui/VideoDownloadPrompt";

export default function Dashboard() {
  const { user, getTierInfo, canGenerateVideo, incrementVideoCount } =
    useAuthStore();
  const { t, language } = useTranslation();
  const {
    videos,
    currentVideo,
    isGenerating,
    progress: generationProgress,
    progressMessage,
    error: generationError,
    startGeneration,
    updateProgress,
    completeGeneration,
    updateVideo,
    loadVideos,
    setError,
    clearCurrentVideo,
  } = useVideoStore();

  const tierInfo = getTierInfo();

  const [idea, setIdea] = useState("");
  const [voiceType, setVoiceType] = useState("female");
  const [videoLanguage, setVideoLanguage] = useState(language);
  const [voices, setVoices] = useState({ female: [], male: [] });
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [tipMessage, setTipMessage] = useState("");
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("facelesstube_onboarding_done");
  });

  // Video library
  const {
    videos: libraryVideos,
    selectedVideo: librarySelectedVideo,
    loadVideos: loadLibraryVideos,
    selectVideo: selectLibraryVideo,
  } = useVideoLibraryStore();

  // Video source toggle and preinstalled
  const [videoSource, setVideoSource] = useState("preinstalled"); // 'user' | 'preinstalled'
  const [preinstalledCategory, setPreinstalledCategory] = useState("all");
  const [selectedPreinstalled, setSelectedPreinstalled] = useState(null);

  // Get filtered preinstalled videos
  const filteredPreinstalled = getPreinstalledByCategory(preinstalledCategory);

  // AI Voice state
  const [voiceMode, setVoiceMode] = useState("basic"); // 'basic' | 'ai'
  const [aiVoiceAvailable, setAiVoiceAvailable] = useState(false);
  const [aiVoiceLoading, setAiVoiceLoading] = useState(false);

  // Template / Niche state
  const [selectedTemplate, setSelectedTemplate] = useState("general");

  // Music state
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [customTracks, setCustomTracks] = useState([]);
  const [musicCategory, setMusicCategory] = useState("all");
  const musicInputRef = useRef(null);

  // Hashtag copy state
  const [hashtagsCopied, setHashtagsCopied] = useState(false);

  // Load custom music tracks
  useEffect(() => {
    getCustomTracks().then(setCustomTracks);
  }, []);

  const handleMusicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      alert("Solo se permiten archivos de audio (mp3, wav, ogg, etc.)");
      return;
    }
    const id = await saveCustomTrack(file, {
      name: file.name.replace(/\.[^.]+$/, ""),
    });
    if (id) {
      const updated = await getCustomTracks();
      setCustomTracks(updated);
    }
  };

  const handleDeleteTrack = async (trackId) => {
    await deleteCustomTrack(trackId);
    const updated = await getCustomTracks();
    setCustomTracks(updated);
    if (selectedMusic?.id === trackId) setSelectedMusic(null);
  };

  const handleRandomIdea = () => {
    const randomIdea = getRandomIdea(selectedTemplate);
    setIdea(randomIdea);
  };

  const handleCopyHashtags = () => {
    const hashtags = currentVideo?.hashtags || currentVideo?.tags || [];
    const text = hashtags
      .map((h) => (h.startsWith("#") ? h : `#${h}`))
      .join(" ");
    navigator.clipboard.writeText(text).then(() => {
      setHashtagsCopied(true);
      setTimeout(() => setHashtagsCopied(false), 2000);
    });
  };

  // Check if AI voice is available
  useEffect(() => {
    checkTransformersAvailable().then(setAiVoiceAvailable);
  }, []);

  // Load library videos on mount
  useEffect(() => {
    loadLibraryVideos();
  }, []);

  // Load generated videos on mount
  useEffect(() => {
    loadVideos(user?.id || "__local__");
  }, [user?.id]);

  // AI is now server-side, no API keys needed from users
  const apisConfigured = true;

  const canGenerate = canGenerateVideo();
  const videosRemaining =
    tierInfo.videosPerMonth === Infinity
      ? "∞"
      : tierInfo.videosPerMonth - (user?.videosThisMonth || 0);

  // Load voices on mount and language change
  useEffect(() => {
    const loadVoices = async () => {
      const recommended = await getRecommendedVoices(videoLanguage);
      setVoices(recommended);
      setSelectedVoice(recommended[voiceType]?.[0] || null);
    };
    loadVoices();
  }, [videoLanguage, voiceType]);

  // Preview voice — uses backend Resemble.AI TTS
  const previewAudioRef = useRef(null);
  const handlePreviewVoice = async () => {
    if (isPreviewing) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      stopSpeaking();
      setIsPreviewing(false);
      return;
    }

    setIsPreviewing(true);
    const previewTexts = {
      es: "Hola, esta es una prueba de la voz para tu video.",
      en: "Hello, this is a voice test for your video.",
      pt: "Olá, este é um teste de voz para o seu vídeo.",
    };
    const text = previewTexts[videoLanguage] || previewTexts.es;

    // Use backend Resemble.AI TTS
    const backendUrl =
      import.meta.env.VITE_API_URL ||
      "https://facelesstube-backend.onrender.com";
    try {
      const voiceMap = {
        "es-female": "03d58457",
        "es-male": "a253156d",
        "en-female": "00b1fd4e",
        "en-male": "a52c4efc",
        "pt-female": "02136f6a",
        "pt-male": "01aa67f7",
      };
      const voiceUuid =
        voiceMap[`${videoLanguage}-${voiceType}`] || voiceMap["es-female"];

      const res = await fetch(`${backendUrl}/api/generate-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice_uuid: voiceUuid }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio_url) {
          const audio = new Audio(`${backendUrl}${data.audio_url}`);
          previewAudioRef.current = audio;
          audio.onended = () => setIsPreviewing(false);
          audio.onerror = () => setIsPreviewing(false);
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn("Backend TTS failed, trying Web Speech:", e);
    }

    // Fallback: Web Speech API (works on desktop)
    try {
      if (selectedVoice) {
        await speak(text, selectedVoice);
      }
    } catch (e) {
      console.error("Voice preview error:", e);
    }
    setIsPreviewing(false);
  };

  // Main generation handler
  const handleGenerate = async () => {
    if (!idea.trim()) {
      setError(t("dashboard.ideaPlaceholder"));
      return;
    }

    if (!canGenerate) {
      setError(t("dashboard.noVideosLeft"));
      return;
    }

    // Check if video selected based on source
    const selectedVideo =
      videoSource === "user" ? librarySelectedVideo : selectedPreinstalled;
    if (!selectedVideo) {
      setError(
        videoSource === "user"
          ? "Selecciona un video de tus videos"
          : "Selecciona un video de la biblioteca",
      );
      return;
    }

    const backendUrl =
      import.meta.env.VITE_API_URL ||
      "https://facelesstube-backend.onrender.com";

    // Start generation
    startGeneration();

    // Smooth progress helper — never goes backwards
    let currentProgress = 0;
    const smoothProgress = (targetPercent, message, durationMs = 2000) => {
      return new Promise((resolve) => {
        const start = currentProgress;
        const increment = (targetPercent - start) / (durationMs / 100);
        const timer = setInterval(() => {
          currentProgress = Math.min(
            currentProgress + increment,
            targetPercent,
          );
          updateProgress(Math.round(currentProgress), message);
          if (currentProgress >= targetPercent) {
            clearInterval(timer);
            currentProgress = targetPercent;
            resolve();
          }
        }, 100);
      });
    };

    // Simulate slow background progress during long operations
    let bgTimer = null;
    const startSlowProgress = (
      fromPercent,
      toPercent,
      message,
      totalMs = 60000,
    ) => {
      currentProgress = fromPercent;
      const increment = (toPercent - fromPercent) / (totalMs / 500);
      bgTimer = setInterval(() => {
        currentProgress = Math.min(currentProgress + increment, toPercent);
        updateProgress(Math.round(currentProgress), message);
      }, 500);
    };
    const stopSlowProgress = () => {
      if (bgTimer) {
        clearInterval(bgTimer);
        bgTimer = null;
      }
    };

    // Creator tips — rotate throughout the entire process
    const creatorTips = [
      "💡 Tip: Escoge un nicho y especialízate en él",
      "🔥 Tip: La constancia es la clave del éxito en YouTube",
      "📈 Tip: Publica al menos 3 videos por semana",
      "💰 Tip: La constancia te llevará a vivir de tus videos",
      "🎨 Tip: Un buen thumbnail vale más que mil palabras",
      "📱 Tip: Los Shorts son la forma más rápida de crecer",
      "🧠 Tip: Estudia a los creadores que admiras",
      "🌟 Tip: Tu primer video no será perfecto, ¡y está bien!",
      "🎬 Tip: Cuenta historias, no solo des información",
      "💪 Tip: Cada video que subes es un paso más cerca del éxito",
      "🌱 Tip: Al principio es lento, pero cada video suma",
      "🏆 Tip: Celebra cada view, cada suscriptor cuenta",
      "😊 Tip: Disfruta el proceso, el éxito viene con el tiempo",
      "🚀 Tip: Los canales más grandes empezaron desde cero",
      "❤️ Tip: No te compares con otros, cada canal crece diferente",
    ];
    let tipIdx = Math.floor(Math.random() * creatorTips.length);

    // Start rotating tips independently (separate from progress status)
    setTipMessage(creatorTips[tipIdx]);
    const tipsTimer = setInterval(() => {
      tipIdx = (tipIdx + 1) % creatorTips.length;
      setTipMessage(creatorTips[tipIdx]);
    }, 6000); // New tip every 6 seconds

    try {
      // === Phase 1: Wake up server (if cold start) ===
      await smoothProgress(5, "🔌 Conectando con servidor...", 1000);

      try {
        const wakeUp = await fetch(`${backendUrl}/health`, {
          signal: AbortSignal.timeout(15000),
        });
        if (!wakeUp.ok) throw new Error("Servidor no disponible");
      } catch (e) {
        // Server might be cold-starting, give it more time
        await smoothProgress(
          8,
          "⏳ Servidor despertando... (puede tomar ~30s)",
          2000,
        );
        try {
          await fetch(`${backendUrl}/health`, {
            signal: AbortSignal.timeout(60000),
          });
        } catch (e2) {
          throw new Error(
            "No se puede conectar al servidor. El servidor puede estar reiniciándose. Intenta de nuevo en 1 minuto.",
          );
        }
      }

      // === Phase 2: Generate script with AI (5% → 25%) ===
      startSlowProgress(8, 24, "🧠 Generando guión con IA...", 30000);

      let scriptData;
      try {
        scriptData = await generateScript(
          idea,
          videoLanguage,
          selectedTemplate,
        );
      } catch (firstErr) {
        // Retry once if AI fails (intermittent issues)
        console.warn("First AI attempt failed, retrying...", firstErr);
        await new Promise((r) => setTimeout(r, 2000));
        scriptData = await generateScript(
          idea,
          videoLanguage,
          selectedTemplate,
        );
      }
      stopSlowProgress();

      // Parse script data
      const rawScript = scriptData.script || scriptData.guion || "";
      let fullScript =
        typeof rawScript === "string" ? rawScript : JSON.stringify(rawScript);

      // Clean script: remove section markers that TTS would read aloud
      fullScript = fullScript
        .replace(
          /\[(?:HOOK|INTRO|INTRODUCTION|DEVELOPMENT|BODY|CLIMAX|CONCLUSION|CTA|OUTRO|CALL TO ACTION|CIERRE|GANCHO|DESARROLLO)\]/gi,
          "",
        )
        .replace(
          /^(?:Title|Titulo|Hook|Gancho|Intro|Development|Desarrollo|CTA|Conclusion|Cierre|Script|Guion|Narration)\s*:\s*/gim,
          "",
        )
        .replace(/\[.*?\]/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      const rawTags = scriptData.tags || [];
      const tags = Array.isArray(rawTags)
        ? rawTags
        : typeof rawTags === "string"
          ? rawTags.split(",").map((t) => t.trim())
          : [];
      const rawHashtags = scriptData.hashtags || [];
      const hashtags = Array.isArray(rawHashtags) ? rawHashtags : [];
      const title = String(scriptData.title || scriptData.titulo || idea);
      const description = String(
        scriptData.description || scriptData.descripcion || "",
      );

      await smoothProgress(25, "✅ Guión generado", 800);

      // === Phase 3: Get background photos/video (25% → 35%) ===
      startSlowProgress(25, 34, "📸 Buscando fondos para tu video...", 10000);

      // For user library videos, use the stored data URL
      let backgroundVideoData = null;
      if (videoSource === "user" && librarySelectedVideo) {
        backgroundVideoData =
          librarySelectedVideo.dataUrl || librarySelectedVideo.url;
      }

      // Fetch photos from Pexels API (preferred over videos — faster, more reliable)
      let photoUrls = [];
      let backgroundUrl = null;
      if (videoSource !== "user") {
        const searchTerm =
          selectedVideo?.category || selectedVideo?.name || idea;
        try {
          const pRes = await fetch(
            `${backendUrl}/api/pexels/photos?query=${encodeURIComponent(searchTerm)}&per_page=8&orientation=portrait`,
            {
              signal: AbortSignal.timeout(15000),
            },
          );
          if (pRes.ok) {
            const pData = await pRes.json();
            if (pData.photos && pData.photos.length > 0) {
              // Get portrait URLs (best for vertical video)
              photoUrls = pData.photos
                .map((p) => p.src.portrait || p.src.large)
                .slice(0, 6);
              console.log(
                `✅ Got ${photoUrls.length} Pexels photos for "${searchTerm}"`,
              );
            }
          }
        } catch (e) {
          console.warn("Pexels photos API failed:", e);
        }

        // If no photos, try video as fallback
        if (photoUrls.length === 0) {
          try {
            const vRes = await fetch(
              `${backendUrl}/api/pexels/videos?query=${encodeURIComponent(searchTerm)}&per_page=3&orientation=portrait`,
              {
                signal: AbortSignal.timeout(10000),
              },
            );
            if (vRes.ok) {
              const vData = await vRes.json();
              const pVideo = vData.videos?.[0];
              if (pVideo) {
                const sdFile = pVideo.video_files
                  ?.filter((f) => f.width && f.width <= 720)
                  ?.sort((a, b) => (b.width || 0) - (a.width || 0))?.[0];
                backgroundUrl = sdFile?.link || pVideo.video_files?.[0]?.link;
              }
            }
          } catch (e) {
            console.warn("Pexels video fallback also failed:", e);
          }
        }
      }

      stopSlowProgress();
      const bgStatus =
        photoUrls.length > 0
          ? `✅ ${photoUrls.length} fotos de fondo listas`
          : backgroundUrl
            ? "✅ Video de fondo listo"
            : "🎨 Se usará fondo animado";
      await smoothProgress(35, bgStatus, 500);

      // === Phase 4: Generate TTS audio on backend (35% → 55%) ===
      const voiceMap = {
        "es-female": "03d58457",
        "es-male": "a253156d",
        "en-female": "00b1fd4e",
        "en-male": "a52c4efc",
        "pt-female": "02136f6a",
        "pt-male": "01aa67f7",
      };
      const voiceUuid =
        voiceMap[`${videoLanguage}-${voiceType}`] || voiceMap["es-female"];

      startSlowProgress(35, 54, "🎙️ Generando narración con IA...", 30000);

      let audioBlob = null;
      try {
        const audioRes = await fetch(`${backendUrl}/api/generate-audio`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: fullScript,
            voice_uuid: voiceUuid,
          }),
          signal: AbortSignal.timeout(60000),
        });

        if (audioRes.ok) {
          const audioData = await audioRes.json();
          if (audioData.audio_url) {
            // Download the actual audio file
            const audioDownload = await fetch(
              `${backendUrl}${audioData.audio_url}`,
              {
                signal: AbortSignal.timeout(30000),
              },
            );
            if (audioDownload.ok) {
              audioBlob = await audioDownload.blob();
              console.log("✅ Audio TTS descargado:", audioBlob.size, "bytes");
            }
          }
        }
      } catch (e) {
        console.warn("Backend TTS failed, video will be without audio:", e);
      }
      stopSlowProgress();
      await smoothProgress(
        55,
        audioBlob ? "✅ Narración lista" : "⚠️ Sin audio, creando video...",
        500,
      );

      // === Phase 5: Render video CLIENT-SIDE (55% → 95%) ===
      startSlowProgress(55, 94, "🎥 Renderizando video...", 60000);

      // Only use video URL if we don't have photos
      const videoDataUrl =
        photoUrls.length > 0
          ? null
          : backgroundVideoData || backgroundUrl || null;
      const scriptForRenderer = {
        fullScript: fullScript,
        script: fullScript,
        title: title,
      };

      // Get video ID for cache lookup
      const bgVideoId =
        selectedPreinstalled?.id || librarySelectedVideo?.id || null;

      const videoBlob = await createVideoWithLibrary(
        scriptForRenderer,
        videoDataUrl,
        audioBlob,
        (msg) => {
          // Update progress message from renderer
          updateProgress(Math.round(currentProgress), msg);
        },
        bgVideoId,
        photoUrls,
      );

      stopSlowProgress();

      if (!videoBlob || videoBlob.size < 1000) {
        throw new Error("El video generado está vacío o corrupto");
      }

      await smoothProgress(96, "💾 Guardando video...", 800);

      // Create playback URL
      const videoUrl = URL.createObjectURL(videoBlob);

      // Save to store (IndexedDB + localStorage)
      await completeGeneration(
        {
          title,
          description,
          script: fullScript,
          tags,
          hashtags,
          topic: idea,
          template: selectedTemplate,
          language: videoLanguage,
          blob: videoBlob,
          videoUrl,
          duration: Math.round(fullScript.split(" ").length / 2.5), // estimate
        },
        user?.id,
      );
      incrementVideoCount();

      await smoothProgress(100, "🎉 ¡Video completado!", 1000);
      clearInterval(tipsTimer);
    } catch (error) {
      stopSlowProgress();
      clearInterval(tipsTimer);
      console.error("Generation error:", error);
      let userMessage = error.message;
      if (error.name === "TimeoutError" || error.message.includes("timeout")) {
        userMessage = "Hubo un problema con la conexión. Intenta de nuevo.";
      } else if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        userMessage =
          "No se puede conectar al servidor\nFailed to fetch\n\nVerifica tu conexión a internet.";
      }
      const errorDetail = `${userMessage}\n\n[Debug: provider=backend, lang=${videoLanguage}]`;
      setError(errorDetail);
    }
  };

  // Upload to YouTube
  const handleUpload = async () => {
    if (!isYouTubeConnected()) {
      setError("Conecta tu canal de YouTube primero");
      return;
    }

    const blob = currentVideo?.blob;
    if (!blob) {
      setError("No hay video para subir. Genera uno primero.");
      return;
    }

    try {
      const result = await uploadVideo(
        blob instanceof Blob ? blob : await fetch(blob).then((r) => r.blob()),
        {
          title: currentVideo.title,
          description: currentVideo.description,
          tags: currentVideo.tags || [],
          privacyStatus: "private",
        },
        () => {},
      );
      console.log("Upload success:", result);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "Error al subir el video");
    }
  };

  // Download / Share video
  const handleDownload = async () => {
    const blob = currentVideo?.blob;
    if (!blob) {
      setError("No hay video para descargar");
      return;
    }

    try {
      // Ensure we have a real Blob
      const videoBlob =
        blob instanceof Blob ? blob : await fetch(blob).then((r) => r.blob());

      const fileName = `${currentVideo.title || "FacelessTube_video"}.webm`;
      const file = new File([videoBlob], fileName, { type: "video/webm" });

      // Try Share API first (mobile-friendly — save to gallery, share to apps)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: currentVideo.title || "Mi Video",
            text: "Video creado con FacelessTube",
            files: [file],
          });
          return; // Share successful
        } catch (shareErr) {
          // User cancelled or share failed — fall through to download
          if (shareErr.name === "AbortError") return;
          console.warn("Share API failed, falling back to download:", shareErr);
        }
      }

      // Fallback: direct download (desktop or older mobile)
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) {
      console.error("Download/Share error:", e);
      setError("Error al descargar el video. Intenta de nuevo.");
    }
  };

  // Reset form
  const handleReset = () => {
    setIdea("");
    clearCurrentVideo();
    setError(null);
    setApiTestResult(null);
  };

  // API diagnostic test
  const [apiTestResult, setApiTestResult] = useState(null);
  const handleTestApi = async () => {
    const backendUrl =
      import.meta.env.VITE_API_URL ||
      "https://facelesstube-backend.onrender.com";
    setApiTestResult("⏳ Conectando con servidor...");

    // Test backend health
    try {
      const healthRes = await fetch(`${backendUrl}/health`);
      const health = await healthRes.json();
      const results = [
        `🖥️ Backend: ${health.status}`,
        `🔵 Gemini: ${health.gemini}`,
        `🟣 Perplexity: ${health.perplexity}`,
      ];

      setApiTestResult(results.join("\n") + "\n⏳ Probando generación...");

      // Test actual AI generation
      const aiRes = await fetch(`${backendUrl}/api/ai/generate-script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: "Test connection", language: "es" }),
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        results.push(
          `✅ AI funciona: "${(data.title || "").substring(0, 30)}"`,
        );
        setApiTestResult(
          results.join("\n") + "\n\n🎉 ¡Todo funciona! Genera tu video.",
        );
      } else {
        const err = await aiRes.json().catch(() => ({}));
        results.push(`❌ AI error: ${err.detail || aiRes.status}`);
        setApiTestResult(
          results.join("\n") +
            "\n\n⚠️ El servidor tiene problemas temporales. Intenta de nuevo en unos minutos.",
        );
      }
    } catch (e) {
      setApiTestResult(
        `❌ No se puede conectar al servidor\n${e.message}\n\nVerifica tu conexión a internet.`,
      );
    }
  };

  // Show onboarding on first visit
  if (showOnboarding && !isGenerating) {
    return (
      <div className="max-w-4xl mx-auto py-4">
        <WelcomeOnboarding
          onComplete={() => setShowOnboarding(false)}
          userName={user?.name}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-0 overflow-x-hidden w-full box-border">
      {/* API Tutorial Modal */}
      <ApiTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={() => setShowTutorial(false)}
      />

      {/* Header */}
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-3xl font-display font-bold mb-1">
          {t("dashboard.title")}
        </h1>
        <p className="text-white/60 text-sm md:text-base">
          {typeof videosRemaining === "number" && videosRemaining > 0
            ? t("dashboard.videosLeft", { count: videosRemaining })
            : videosRemaining === "∞"
              ? t("dashboard.videosLeft", { count: "∞" })
              : t("dashboard.noVideosLeft")}
        </p>
      </div>

      {/* API Setup Banner - show when APIs not configured */}
      {!apisConfigured && !isGenerating && !currentVideo && (
        <div className="mb-4 md:mb-6 p-3 md:p-5 rounded-xl bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-neon-cyan/20 flex items-center justify-center flex-shrink-0">
              <Sparkles size={24} className="text-neon-cyan" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">
                ¡Configura tus APIs gratuitas!
              </h3>
              <p className="text-white/60 text-sm mb-3">
                Solo necesitas 2 minutos para configurar las APIs y empezar a
                crear videos increíbles.
              </p>
              <button
                onClick={() => setShowTutorial(true)}
                className="btn-neon py-2 px-4 text-sm"
              >
                Iniciar Tutorial →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="glass-card p-4 md:p-8">
        {/* IDLE state - Input form */}
        {!isGenerating && !currentVideo && (
          <>
            {/* Template / Niche Selector */}
            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium mb-2">
                🎯 Estilo de video
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                {VIDEO_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-all text-xs flex items-center gap-1.5 ${
                      selectedTemplate === tmpl.id
                        ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-sm shadow-neon-cyan/20"
                        : "border-white/10 text-white/60 hover:border-white/30"
                    }`}
                  >
                    <span>{tmpl.icon}</span>
                    <span>{tmpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Idea input */}
            <div className="mb-4 md:mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  {t("dashboard.ideaLabel")}
                </label>
                <button
                  onClick={handleRandomIdea}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neon-purple/20 border border-neon-purple/30 text-neon-purple hover:bg-neon-purple/30 transition-all"
                >
                  <Shuffle size={14} />
                  Dame una idea
                </button>
              </div>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder={t("dashboard.ideaPlaceholder")}
                className="input-glass min-h-[80px] md:min-h-[120px] resize-none text-sm md:text-base"
                disabled={!canGenerate}
              />
            </div>

            {/* Video Language */}
            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium mb-3">
                {t("dashboard.language")}
              </label>
              <div className="flex gap-3">
                {Object.values(LANGUAGES).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setVideoLanguage(lang.code)}
                    className={`
                                            flex-1 p-3 rounded-xl border transition-all flex items-center justify-center gap-2
                                            ${
                                              videoLanguage === lang.code
                                                ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                                                : "border-white/10 text-white/60 hover:border-white/30"
                                            }
                                        `}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm">{lang.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice selector */}
            <div className="mb-4 md:mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">🎙️ Tipo de voz</label>
                <button
                  onClick={handlePreviewVoice}
                  className="flex items-center gap-2 text-sm text-neon-cyan hover:underline"
                >
                  {isPreviewing ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  {isPreviewing ? "Detener" : "Probar"}
                </button>
              </div>

              {/* Toggle Voz Básica / Voz IA */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setVoiceMode("basic")}
                  className={`flex-1 p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                    voiceMode === "basic"
                      ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                      : "border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  <Mic size={18} />
                  <span className="text-sm">Voz Navegador</span>
                </button>
                <button
                  onClick={async () => {
                    setVoiceMode("ai");
                    setAiVoiceLoading(true);
                    try {
                      // Mapear idioma de la app a código de idioma del modelo
                      const langMap = {
                        es: "es",
                        en: "en",
                        pt: "pt",
                        fr: "fr",
                        de: "de",
                      };
                      const aiLang = langMap[videoLanguage] || "es";
                      await loadAIVoiceModel((msg) => console.log(msg), aiLang);
                      setAiVoiceAvailable(true);
                    } catch (e) {
                      console.error("Error cargando voz IA:", e);
                    }
                    setAiVoiceLoading(false);
                  }}
                  className={`flex-1 p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                    voiceMode === "ai"
                      ? "border-neon-purple bg-neon-purple/10 text-neon-purple"
                      : "border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  {aiVoiceLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Bot size={18} />
                  )}
                  <span className="text-sm">Voz IA</span>
                  <span className="text-xs px-1.5 py-0.5 bg-neon-green/20 text-neon-green rounded">
                    NEW
                  </span>
                </button>
              </div>

              {/* Info sobre voz IA */}
              {voiceMode === "ai" && (
                <div className="mb-4 p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/30">
                  <p className="text-xs text-white/70">
                    <Bot size={14} className="inline mr-1" />
                    🇪🇸 Voz IA en español (MMS-TTS). Primera vez descarga ~30MB
                    del modelo. Funciona 100% offline después.
                  </p>
                </div>
              )}

              {/* Género de voz - solo para voz básica */}
              {voiceMode === "basic" && (
                <div className="flex gap-4">
                  <button
                    onClick={() => setVoiceType("female")}
                    className={`
                                            flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-3
                                            ${
                                              voiceType === "female"
                                                ? "border-neon-pink bg-neon-pink/10 text-neon-pink"
                                                : "border-white/10 text-white/60 hover:border-white/30"
                                            }
                                        `}
                  >
                    <span>👩</span>
                    <span>{t("dashboard.voiceFemale")}</span>
                  </button>
                  <button
                    onClick={() => setVoiceType("male")}
                    className={`
                                            flex-1 p-4 rounded-xl border transition-all flex items-center justify-center gap-3
                                            ${
                                              voiceType === "male"
                                                ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                                                : "border-white/10 text-white/60 hover:border-white/30"
                                            }
                                        `}
                  >
                    <span>👨</span>
                    <span>{t("dashboard.voiceMale")}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Video de fondo - Selector simplificado */}
            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium mb-2">
                🎬 Video de fondo
              </label>

              {/* Toggle simple */}
              <div className="flex gap-1.5 mb-3 p-1 bg-dark-600/50 rounded-xl">
                <button
                  onClick={() => {
                    setVideoSource("preinstalled");
                    selectLibraryVideo(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                    videoSource === "preinstalled"
                      ? "bg-neon-cyan/20 text-neon-cyan shadow-sm"
                      : "text-white/50 hover:text-white/70"
                  }`}
                >
                  <Library size={14} />
                  📦 Incluidos
                </button>
                <button
                  onClick={() => {
                    setVideoSource("user");
                    setSelectedPreinstalled(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                    videoSource === "user"
                      ? "bg-neon-purple/20 text-neon-purple shadow-sm"
                      : "text-white/50 hover:text-white/70"
                  }`}
                >
                  <User size={14} />
                  📱 Mis Videos
                </button>
              </div>

              {/* Biblioteca preinstalada */}
              {videoSource === "preinstalled" && (
                <>
                  {/* Categorías */}
                  <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                    {PREINSTALLED_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setPreinstalledCategory(cat.id)}
                        className={`px-2.5 py-1.5 rounded-lg border whitespace-nowrap transition-all text-xs ${
                          preinstalledCategory === cat.id
                            ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                            : "border-white/10 text-white/60 hover:border-white/30"
                        }`}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Grid de videos preinstalados */}
                  <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                    {filteredPreinstalled.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => setSelectedPreinstalled(video)}
                        className={`relative aspect-[9/16] rounded-lg overflow-hidden border-2 transition-all ${
                          selectedPreinstalled?.id === video.id
                            ? "border-neon-cyan ring-2 ring-neon-cyan/30"
                            : "border-transparent hover:border-white/20"
                        }`}
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23333" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%23666" font-size="30">🎬</text></svg>';
                          }}
                        />
                        {selectedPreinstalled?.id === video.id && (
                          <div className="absolute inset-0 bg-neon-cyan/20 flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
                          <p className="text-[10px] text-white truncate">
                            {video.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Seleccionado */}
                  {selectedPreinstalled && (
                    <div className="mt-2 p-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center gap-2">
                      <Film
                        size={14}
                        className="text-neon-cyan flex-shrink-0"
                      />
                      <span className="text-xs text-white flex-1 truncate">
                        ✓ {selectedPreinstalled.name}
                      </span>
                      <button
                        onClick={() => setSelectedPreinstalled(null)}
                        className="text-white/60 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Video Download Prompt */}
                  {showDownloadPrompt && (
                    <VideoDownloadPrompt
                      onDismiss={() => setShowDownloadPrompt(false)}
                    />
                  )}
                </>
              )}

              {/* Mis Videos (usuario) */}
              {videoSource === "user" && (
                <>
                  {libraryVideos.length === 0 ? (
                    <div className="p-4 rounded-lg bg-white/5 border border-dashed border-white/20 text-center">
                      <p className="text-white/50 text-xs mb-2">
                        Aún no tienes videos
                      </p>
                      <a
                        href="/app/library"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neon-purple/20 border border-neon-purple/50 rounded-lg text-neon-purple text-xs hover:bg-neon-purple/30 transition-all"
                      >
                        <Film size={14} />
                        Ir a subir uno
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                      {libraryVideos.slice(0, 6).map((video) => (
                        <button
                          key={video.id}
                          onClick={() => selectLibraryVideo(video)}
                          className={`relative aspect-[9/16] rounded-lg overflow-hidden border-2 transition-all ${
                            librarySelectedVideo?.id === video.id
                              ? "border-neon-purple ring-2 ring-neon-purple/30"
                              : "border-transparent hover:border-white/20"
                          }`}
                        >
                          {video.thumbnail ? (
                            <img
                              src={video.thumbnail}
                              alt={video.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                              <Film size={20} className="text-white/40" />
                            </div>
                          )}
                          {librarySelectedVideo?.id === video.id && (
                            <div className="absolute inset-0 bg-neon-purple/20 flex items-center justify-center">
                              <CheckCircle2 size={20} className="text-white" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
                            <p className="text-[10px] text-white truncate">
                              {video.name}
                            </p>
                          </div>
                        </button>
                      ))}
                      {libraryVideos.length > 6 && (
                        <a
                          href="/app/library"
                          className="aspect-[9/16] rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center text-white/40 hover:text-white/60 hover:border-white/40 transition-all"
                        >
                          <span className="text-lg">
                            +{libraryVideos.length - 6}
                          </span>
                          <span className="text-[10px]">Ver más</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Seleccionado */}
                  {librarySelectedVideo && (
                    <div className="mt-2 p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30 flex items-center gap-2">
                      <Film
                        size={14}
                        className="text-neon-purple flex-shrink-0"
                      />
                      <span className="text-xs text-white flex-1 truncate">
                        ✓ {librarySelectedVideo.name}
                      </span>
                      <button
                        onClick={() => selectLibraryVideo(null)}
                        className="text-white/60 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 🎵 Music Section */}
            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium mb-2">
                🎵 Música de fondo
              </label>
              <div className="p-3 rounded-xl bg-dark-600/50 border border-white/10">
                {customTracks.length === 0 ? (
                  <div className="text-center py-4">
                    <Music size={24} className="text-white/30 mx-auto mb-2" />
                    <p className="text-white/40 text-xs mb-3">
                      Sube tu música IA (Suno, Udio, etc.)
                    </p>
                    <button
                      onClick={() => musicInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-neon-purple/20 border border-neon-purple/40 rounded-lg text-neon-purple text-xs hover:bg-neon-purple/30 transition-all"
                    >
                      <Plus size={14} />
                      Subir track
                    </button>
                    <input
                      ref={musicInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleMusicUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto mb-2">
                      {customTracks.map((track) => (
                        <div
                          key={track.id}
                          onClick={() =>
                            setSelectedMusic(
                              selectedMusic?.id === track.id ? null : track,
                            )
                          }
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                            selectedMusic?.id === track.id
                              ? "bg-neon-purple/20 border border-neon-purple/40"
                              : "bg-white/5 border border-transparent hover:border-white/10"
                          }`}
                        >
                          <Music
                            size={14}
                            className={
                              selectedMusic?.id === track.id
                                ? "text-neon-purple"
                                : "text-white/40"
                            }
                          />
                          <span className="text-xs text-white/80 flex-1 truncate">
                            {track.name}
                          </span>
                          <span className="text-[10px] text-white/30">
                            {(track.size / 1024 / 1024).toFixed(1)}MB
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTrack(track.id);
                            }}
                            className="text-white/30 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30">
                        {selectedMusic
                          ? `✓ ${selectedMusic.name}`
                          : "Sin música (solo voz)"}
                      </span>
                      <button
                        onClick={() => musicInputRef.current?.click()}
                        className="text-xs text-neon-purple hover:underline flex items-center gap-1"
                      >
                        <Plus size={12} /> Agregar
                      </button>
                    </div>
                    <input
                      ref={musicInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleMusicUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Error message */}
            {generationError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                <span className="text-red-300">{generationError}</span>
              </div>
            )}

            {/* Tier warning */}
            {tierInfo.watermark && (
              <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="text-yellow-400 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-yellow-300 text-sm font-medium">
                    Plan Free
                  </p>
                  <p className="text-white/60 text-sm">
                    Los videos tendrán marca de agua y duración máxima de 1
                    minuto.
                    <a
                      href="/app/premium"
                      className="text-neon-cyan hover:underline ml-1"
                    >
                      Mejora tu plan
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || !idea.trim()}
              className="btn-neon w-full flex items-center justify-center gap-2 py-3 md:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 size={20} />
              {t("dashboard.generate")}
            </button>
          </>
        )}

        {/* Processing state */}
        {isGenerating && (
          <div className="text-center py-6 md:py-12">
            <Loader2
              size={48}
              className="animate-spin text-neon-cyan mx-auto mb-6"
            />

            {/* Status message — above bar */}
            <p className="text-lg font-semibold mb-1 text-white">
              {progressMessage || "Procesando..."}
            </p>
            <p className="text-sm text-white/50 mb-5">
              {Math.round(generationProgress)}% completado
            </p>

            {/* Progress bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="h-2.5 rounded-full bg-dark-500 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>

            {/* Creator tip — below bar, different visual style */}
            {tipMessage && (
              <div className="max-w-sm mx-auto p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-white/60 italic">{tipMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Ready state - preview */}
        {!isGenerating && currentVideo && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 size={24} className="text-neon-green" />
              <h2 className="text-xl font-semibold">{t("dashboard.ready")}</h2>
            </div>

            {/* Video preview */}
            {(currentVideo.videoUrl || currentVideo.blob) && (
              <div className="relative aspect-[9/16] max-h-[350px] md:max-h-[400px] rounded-xl overflow-hidden bg-dark-600 mb-4 md:mb-6 mx-auto">
                <video
                  src={
                    currentVideo.videoUrl ||
                    (currentVideo.blob instanceof Blob
                      ? URL.createObjectURL(currentVideo.blob)
                      : currentVideo.blob)
                  }
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Title & description */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                {t("dashboard.title_label")}
              </label>
              <input
                type="text"
                value={currentVideo.title || ""}
                className="input-glass"
                readOnly
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                {t("dashboard.description_label")}
              </label>
              <textarea
                value={currentVideo.description || ""}
                className="input-glass min-h-[100px] resize-none"
                readOnly
              />
            </div>

            {/* Script preview */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                {t("dashboard.script_label")}
              </label>
              <div className="p-4 rounded-xl bg-dark-600/50 border border-white/5 max-h-[200px] overflow-y-auto">
                <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans">
                  {currentVideo.script}
                </pre>
              </div>
            </div>

            {/* Viral Hashtags */}
            {(currentVideo.hashtags?.length > 0 ||
              currentVideo.tags?.length > 0) && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    🏷️ Hashtags virales
                  </label>
                  <button
                    onClick={handleCopyHashtags}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/30 transition-all"
                  >
                    {hashtagsCopied ? <Check size={14} /> : <Copy size={14} />}
                    {hashtagsCopied ? "¡Copiados!" : "Copiar todos"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(currentVideo.hashtags || currentVideo.tags)?.map(
                    (tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-full bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 text-sm text-neon-cyan font-medium cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            tag.startsWith("#") ? tag : `#${tag}`,
                          );
                        }}
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Tags SEO */}
            {currentVideo.tags?.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">
                  🔍 Tags SEO
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentVideo.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-dark-600 text-sm text-white/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {/* YouTube Upload - PROMINENT */}
              <button
                onClick={handleUpload}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 transition-all"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
                </svg>
                {t("dashboard.upload")}
              </button>

              <div className="flex gap-2">
                <button onClick={handleReset} className="btn-secondary flex-1">
                  {t("dashboard.newVideo")}
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-secondary flex items-center justify-center gap-2 px-4 flex-1"
                  title="Guardar o Compartir video"
                >
                  {navigator.share ? (
                    <Share2 size={18} />
                  ) : (
                    <Download size={18} />
                  )}
                  {navigator.share ? "Compartir" : "Descargar"}
                </button>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="btn-secondary flex items-center justify-center gap-2 px-4"
                  title="Enviar por Email"
                >
                  <Mail size={18} />
                </button>
              </div>
            </div>

            {/* Email Modal */}
            <EmailModal
              isOpen={showEmailModal}
              onClose={() => setShowEmailModal(false)}
              videoData={currentVideo}
            />
          </div>
        )}

        {/* Error state */}
        {!isGenerating && !currentVideo && generationError && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={40} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Error</h2>
            <p className="text-white/60 mb-4 whitespace-pre-wrap text-sm max-w-md mx-auto">
              {generationError || "Algo salió mal"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4">
              <button onClick={handleReset} className="btn-neon">
                Intentar de nuevo
              </button>
              <button
                onClick={handleTestApi}
                className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors text-sm"
              >
                🔍 Diagnosticar API
              </button>
            </div>
            {apiTestResult && (
              <div className="mt-4 p-4 rounded-xl bg-dark-600/80 border border-white/10 text-left max-w-md mx-auto">
                <p className="text-xs font-mono text-white/80 whitespace-pre-wrap">
                  {apiTestResult}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
