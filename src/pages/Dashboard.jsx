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
  Mic,
  Bot,
  Shuffle,
  Copy,
  Check,
  Camera,
  Image,
  Zap,
  Clock,
  Lock,
} from "lucide-react";
import {
  PREINSTALLED_VIDEOS,
  PREINSTALLED_CATEGORIES,
  getPreinstalledByCategory,
} from "../services/preinstalledVideos";
import { useAuthStore } from "../store/authStore";
import { useTranslation, LANGUAGES } from "../store/i18nStore";
import { useVideoStore } from "../store/videoStore";

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

import { isYoutubeConnected, uploadToYoutube } from "../services/youtube";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { isServiceConfigured } from "../config/apiConfig";
import { VIDEO_TEMPLATES, getRandomIdea } from "../services/videoTemplates";

import ApiTutorial from "../components/ui/ApiTutorial";
import EmailModal from "../components/ui/EmailModal";
import WelcomeOnboarding from "../components/ui/WelcomeOnboarding";

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
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'uploading' | 'success' | 'error'
  const [uploadError, setUploadError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("facelesstube_onboarding_done");
  });

  // Video duration — in minutes, capped by tier
  const [videoDuration, setVideoDuration] = useState(1);

  // Visual style — photos (Pexels auto), gradient, or clips (preinstalled)
  const [visualStyle, setVisualStyle] = useState("photos"); // 'photos' | 'gradient' | 'clips'
  const [selectedClip, setSelectedClip] = useState(null);
  const [clipCategory, setClipCategory] = useState("all");

  // AI Voice state
  const [voiceMode, setVoiceMode] = useState("basic"); // 'basic' | 'ai'
  const [aiVoiceAvailable, setAiVoiceAvailable] = useState(false);
  const [aiVoiceLoading, setAiVoiceLoading] = useState(false);

  // Template / Niche state
  const [selectedTemplate, setSelectedTemplate] = useState("general");

  // Hashtag copy state
  const [hashtagsCopied, setHashtagsCopied] = useState(false);

  // Custom hashtags input
  const [customHashtags, setCustomHashtags] = useState("");

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

    // Visual style is always ready (Pexels auto-search or gradient)
    const selectedVideo = { id: visualStyle, category: idea, name: idea };

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
      const durationSec = videoDuration * 60; // Convert minutes to seconds
      try {
        scriptData = await generateScript(
          idea,
          videoLanguage,
          selectedTemplate,
          user?.id,
          durationSec,
        );
      } catch (firstErr) {
        // If 429 rate limit, don't retry
        if (
          firstErr.message.includes("límite") ||
          firstErr.message.includes("limit")
        ) {
          throw firstErr;
        }
        // Retry once if AI fails (intermittent issues)
        console.warn("First AI attempt failed, retrying...", firstErr);
        await new Promise((r) => setTimeout(r, 2000));
        scriptData = await generateScript(
          idea,
          videoLanguage,
          selectedTemplate,
          user?.id,
          durationSec,
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
      // Use custom hashtags if provided, otherwise try AI-generated, then fallback
      let hashtags;
      if (customHashtags.trim()) {
        hashtags = customHashtags
          .split(/[,\s]+/)
          .map((h) => h.trim())
          .filter((h) => h.length > 0)
          .map((h) => (h.startsWith("#") ? h : `#${h}`));
        console.log("📌 Using custom hashtags:", hashtags);
      } else {
        const rawHashtags = scriptData.hashtags || [];
        hashtags = Array.isArray(rawHashtags) ? rawHashtags : [];
        if (hashtags.length === 0) {
          // Smart fallback: generate relevant hashtags from template + idea
          const templateHashtags = {
            general: ["#datos", "#curiosidades", "#sabíasque"],
            horror: ["#terror", "#miedo", "#creepypasta", "#historia"],
            curiosidades: ["#curiosidades", "#datos", "#increíble"],
            narracion: ["#narración", "#historia", "#relato"],
            primera_persona: ["#historia", "#experiencia", "#realidad"],
            tercera_persona: ["#relato", "#ficción", "#historia"],
            documental: ["#documental", "#investigación", "#verdad"],
            motivational: ["#motivación", "#éxito", "#emprendimiento"],
            conspiración: ["#conspiración", "#misterio", "#oculto"],
          };
          const base = templateHashtags[selectedTemplate] || ["#viral"];
          const ideaWords = idea
            .toLowerCase()
            .replace(/[^a-záéíóúñü\s]/gi, "")
            .split(/\s+/)
            .filter((w) => w.length >= 4)
            .slice(0, 3);
          hashtags = [
            ...base,
            ...ideaWords.map((w) => `#${w}`),
            "#facelesstube",
            "#viral",
            "#shorts",
          ];
          // Remove duplicates
          hashtags = [...new Set(hashtags)];
          console.log("📌 Generated smart hashtags:", hashtags);
        }
      }
      const title = String(scriptData.title || scriptData.titulo || idea);
      const description = String(
        scriptData.description || scriptData.descripcion || "",
      );

      await smoothProgress(25, "✅ Guión generado", 800);

      // === Phase 3: Get background photos/video (25% → 35%) ===
      startSlowProgress(25, 34, "📸 Buscando fondos para tu video...", 10000);

      // For user library videos, use the stored data URL
      let backgroundVideoData = null;

      // Fetch photos from Pexels API (preferred over videos — faster, more reliable)
      let photoUrls = [];
      let backgroundUrl = null;

      // If using preinstalled clips, set the background URL directly
      if (visualStyle === "clips" && selectedClip) {
        backgroundUrl = selectedClip.url;
        console.log(`🎬 Using preinstalled clip: ${selectedClip.name}`);
      }

      if (visualStyle === "photos") {
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
            ? "✅ Estilo visual listo"
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
      const bgVideoId = null;

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
        tierInfo.watermark, // Only show watermark for free tier
      );

      stopSlowProgress();

      if (!videoBlob || videoBlob.size < 1000) {
        throw new Error("El video generado está vacío o corrupto");
      }

      await smoothProgress(96, "💾 Guardando video...", 800);

      // Create playback URL
      const videoUrl = URL.createObjectURL(videoBlob);

      // Save to store (IndexedDB + localStorage)
      const thumbnailUrl = photoUrls.length > 0 ? photoUrls[0] : null;
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
          thumbnailUrl,
          duration: Math.round(fullScript.split(" ").length / 2.2), // estimate (~2.2 words/sec TTS)
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
    // Clear previous status
    setUploadStatus(null);
    setUploadError("");

    if (!isYoutubeConnected()) {
      setUploadStatus("error");
      setUploadError(
        "⚠️ Conecta tu canal de YouTube primero.\nVe a Mi Cuenta → Conectar Canal.",
      );
      return;
    }

    const blob = currentVideo?.blob;
    if (!blob) {
      setUploadStatus("error");
      setUploadError("No hay video para subir. Genera uno primero.");
      return;
    }

    try {
      setUploadStatus("uploading");
      const videoBlob =
        blob instanceof Blob ? blob : await fetch(blob).then((r) => r.blob());
      const result = await uploadToYoutube(videoBlob, {
        title: currentVideo.title,
        description: currentVideo.description,
        tags: currentVideo.tags || [],
        privacyStatus: "private",
      });
      if (result.success) {
        console.log("Upload success:", result.videoId);
        setUploadStatus("success");
      } else {
        throw new Error(result.error || "Error al subir el video");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setUploadError(error.message || "Error al subir el video");
    }
  };

  // Download / Share video
  const handleDownload = async () => {
    let blob = currentVideo?.blob;

    // If blob is missing, try to get it from videoUrl or storage
    if (!blob && currentVideo?.videoUrl) {
      try {
        blob = await fetch(currentVideo.videoUrl).then((r) => r.blob());
      } catch (e) {
        console.warn("Failed to fetch from videoUrl:", e);
      }
    }

    if (!blob) {
      setUploadStatus("error");
      setUploadError("No hay video para descargar. Genera uno primero.");
      return;
    }

    try {
      // Ensure we have a real Blob
      const videoBlob =
        blob instanceof Blob ? blob : await fetch(blob).then((r) => r.blob());

      // Clean filename (remove special chars)
      const safeTitle =
        (currentVideo.title || "FacelessTube_video")
          .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ _-]/g, "")
          .trim() || "FacelessTube_video";
      const fileName = `${safeTitle}.webm`;

      // Option 1: Capacitor Filesystem (Android native save)
      if (Capacitor.isNativePlatform()) {
        try {
          // Convert blob to base64
          const reader = new FileReader();
          const base64Data = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(videoBlob);
          });

          setIsDownloading(true);
          setUploadStatus("downloading");
          await Filesystem.writeFile({
            path: `Download/${fileName}`,
            data: base64Data,
            directory: Directory.ExternalStorage,
            recursive: true,
          });

          setIsDownloading(false);
          setUploadStatus("success");
          setUploadError("✅ Video guardado en Descargas");
          // Show success toast-like feedback
          setTimeout(() => {
            setUploadStatus(null);
            setUploadError("");
          }, 3000);
          return;
        } catch (fsErr) {
          console.warn(
            "Capacitor Filesystem save failed, trying Share API:",
            fsErr,
          );
        }
      }

      // Option 2: Share API (mobile-friendly — save to gallery, share to apps)
      const file = new File([videoBlob], fileName, { type: "video/webm" });
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

      // Option 3: Fallback direct download (desktop or older mobile)
      setIsDownloading(true);
      setUploadStatus("downloading");
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setIsDownloading(false);
      setUploadStatus("success");
      setUploadError("✅ Video descargado");
      setTimeout(() => {
        setUploadStatus(null);
        setUploadError("");
      }, 3000);
    } catch (e) {
      console.error("Download/Share error:", e);
      setUploadStatus("error");
      setUploadError("Error al descargar el video. Intenta de nuevo.");
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

            {/* Custom Hashtags */}
            <div className="mb-4 md:mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  🏷️ Hashtags personalizados
                </label>
                <span className="text-xs text-white/40">Opcional</span>
              </div>
              <input
                type="text"
                value={customHashtags}
                onChange={(e) => setCustomHashtags(e.target.value)}
                placeholder="#viral #shorts #youtube (separados por espacio o coma)"
                className="input-glass text-sm w-full"
                disabled={!canGenerate}
              />
              {customHashtags.trim() && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {customHashtags
                    .split(/[,\s]+/)
                    .filter((h) => h.trim().length > 0)
                    .map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-xs text-neon-cyan"
                      >
                        {h.startsWith("#") ? h : `#${h}`}
                      </span>
                    ))}
                </div>
              )}
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
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm font-bold">
                      {lang.code.toUpperCase()}
                    </span>
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

            {/* 🎨 Estilo Visual — Pro card showing auto Pexels */}
            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium mb-2">
                🎨 Estilo Visual
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* Photos option */}
                <button
                  onClick={() => setVisualStyle("photos")}
                  className={`relative p-2.5 rounded-xl border-2 transition-all text-left ${
                    visualStyle === "photos"
                      ? "border-neon-cyan bg-neon-cyan/10 ring-1 ring-neon-cyan/30"
                      : "border-white/10 bg-dark-600/50 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Camera
                      size={14}
                      className={
                        visualStyle === "photos"
                          ? "text-neon-cyan"
                          : "text-white/50"
                      }
                    />
                    <span
                      className={`text-[11px] font-semibold ${
                        visualStyle === "photos"
                          ? "text-neon-cyan"
                          : "text-white/70"
                      }`}
                    >
                      Fotos HD
                    </span>
                  </div>
                  <p className="text-[9px] text-white/40 leading-snug">
                    Pexels auto + Ken Burns
                  </p>
                  {visualStyle === "photos" && (
                    <div className="absolute top-1.5 right-1.5">
                      <span className="px-1 py-0.5 bg-neon-cyan/20 text-neon-cyan text-[8px] font-bold rounded-full border border-neon-cyan/30">
                        ✓
                      </span>
                    </div>
                  )}
                </button>

                {/* Video Clips option */}
                <button
                  onClick={() => setVisualStyle("clips")}
                  className={`relative p-2.5 rounded-xl border-2 transition-all text-left ${
                    visualStyle === "clips"
                      ? "border-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/30"
                      : "border-white/10 bg-dark-600/50 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Film
                      size={14}
                      className={
                        visualStyle === "clips"
                          ? "text-emerald-400"
                          : "text-white/50"
                      }
                    />
                    <span
                      className={`text-[11px] font-semibold ${
                        visualStyle === "clips"
                          ? "text-emerald-400"
                          : "text-white/70"
                      }`}
                    >
                      Clips
                    </span>
                  </div>
                  <p className="text-[9px] text-white/40 leading-snug">
                    Videos de fondo en bucle
                  </p>
                  {visualStyle === "clips" && (
                    <div className="absolute top-1.5 right-1.5">
                      <span className="px-1 py-0.5 bg-emerald-400/20 text-emerald-400 text-[8px] font-bold rounded-full border border-emerald-400/30">
                        ✓
                      </span>
                    </div>
                  )}
                </button>

                {/* Gradient option */}
                <button
                  onClick={() => setVisualStyle("gradient")}
                  className={`relative p-2.5 rounded-xl border-2 transition-all text-left ${
                    visualStyle === "gradient"
                      ? "border-neon-purple bg-neon-purple/10 ring-1 ring-neon-purple/30"
                      : "border-white/10 bg-dark-600/50 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Zap
                      size={14}
                      className={
                        visualStyle === "gradient"
                          ? "text-neon-purple"
                          : "text-white/50"
                      }
                    />
                    <span
                      className={`text-[11px] font-semibold ${
                        visualStyle === "gradient"
                          ? "text-neon-purple"
                          : "text-white/70"
                      }`}
                    >
                      Gradiente
                    </span>
                  </div>
                  <p className="text-[9px] text-white/40 leading-snug">
                    Fondo animado dinámico
                  </p>
                  {visualStyle === "gradient" && (
                    <div className="absolute top-1.5 right-1.5">
                      <span className="px-1 py-0.5 bg-neon-purple/20 text-neon-purple text-[8px] font-bold rounded-full border border-neon-purple/30">
                        ✓
                      </span>
                    </div>
                  )}
                </button>
              </div>

              {/* Clip selector — shown when clips style is active */}
              {visualStyle === "clips" && (
                <div className="mt-3">
                  {/* Category filter */}
                  <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-hide">
                    {PREINSTALLED_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setClipCategory(cat.id)}
                        className={`px-2 py-1 rounded-lg border whitespace-nowrap transition-all text-[10px] ${
                          clipCategory === cat.id
                            ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                            : "border-white/10 text-white/50 hover:border-white/30"
                        }`}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Clips grid — lightweight tiles, no heavy video elements */}
                  {(() => {
                    const allClips = getPreinstalledByCategory(clipCategory);
                    const INITIAL_COUNT = 6;
                    const showAll = clipCategory + "_expanded";
                    const isExpanded = localStorage.getItem(showAll) === "true";
                    const visibleClips = isExpanded
                      ? allClips
                      : allClips.slice(0, INITIAL_COUNT);
                    const categoryEmojis = {
                      cinematic: "🎬",
                      luxury: "💎",
                      aesthetic: "🌸",
                      gaming: "🎮",
                    };
                    return (
                      <>
                        <div className="grid grid-cols-3 gap-1.5">
                          {visibleClips.map((clip) => (
                            <button
                              key={clip.id}
                              onClick={() => setSelectedClip(clip)}
                              className={`relative aspect-[9/16] rounded-lg overflow-hidden border-2 transition-all flex flex-col items-center justify-center ${
                                selectedClip?.id === clip.id
                                  ? "border-emerald-400 ring-2 ring-emerald-400/30 bg-emerald-400/10"
                                  : "border-transparent hover:border-white/20 bg-dark-800/80"
                              }`}
                            >
                              <span className="text-2xl mb-1">
                                {categoryEmojis[clip.category] || "🎬"}
                              </span>
                              <p className="text-[9px] text-white/70 text-center px-1 leading-tight truncate w-full">
                                {clip.name}
                              </p>
                              {selectedClip?.id === clip.id && (
                                <div className="absolute inset-0 bg-emerald-400/20 flex items-center justify-center">
                                  <CheckCircle2
                                    size={16}
                                    className="text-white"
                                  />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        {allClips.length > INITIAL_COUNT && !isExpanded && (
                          <button
                            onClick={() => {
                              localStorage.setItem(showAll, "true");
                              setClipCategory((prev) => prev); // force re-render
                              window.dispatchEvent(new Event("storage"));
                            }}
                            className="w-full mt-2 p-2 rounded-lg border border-white/10 text-white/50 text-xs hover:border-emerald-400/30 hover:text-emerald-400 transition-all"
                          >
                            Ver más clips ({allClips.length - INITIAL_COUNT}{" "}
                            más) →
                          </button>
                        )}
                        {isExpanded && allClips.length > INITIAL_COUNT && (
                          <button
                            onClick={() => {
                              localStorage.removeItem(showAll);
                              setClipCategory((prev) => prev);
                              window.dispatchEvent(new Event("storage"));
                            }}
                            className="w-full mt-2 p-2 rounded-lg border border-white/10 text-white/40 text-xs hover:border-white/20 transition-all"
                          >
                            Mostrar menos ↑
                          </button>
                        )}
                      </>
                    );
                  })()}

                  {/* Selected clip indicator */}
                  {selectedClip && (
                    <div className="mt-2 p-2 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center gap-2">
                      <Film
                        size={12}
                        className="text-emerald-400 flex-shrink-0"
                      />
                      <span className="text-[10px] text-white flex-1 truncate">
                        ✓ {selectedClip.name}
                      </span>
                      <button
                        onClick={() => setSelectedClip(null)}
                        className="text-white/60 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Info banner */}
              <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <Zap size={12} className="text-neon-cyan flex-shrink-0" />
                <span className="text-[10px] text-white/50">
                  {visualStyle === "photos"
                    ? "La IA busca fotos automáticamente según el tema de tu video"
                    : visualStyle === "clips"
                      ? selectedClip
                        ? `Se usará "${selectedClip.name}" como fondo en bucle`
                        : "Elige un clip de arriba para usarlo como fondo"
                      : "Se generará un fondo gradiente animado que combina con tu contenido"}
                </span>
              </div>
            </div>

            {/* ⏱️ Duration Selector */}
            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium mb-2">
                ⏱️ Duración del video
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 3, 5, 10, 15, 20].map((mins) => {
                  const maxMins = Math.floor((tierInfo.maxDuration || 60) / 60);
                  const isAllowed = mins <= maxMins;
                  const isSelected = videoDuration === mins;
                  return (
                    <button
                      key={mins}
                      onClick={() => {
                        if (isAllowed) setVideoDuration(mins);
                      }}
                      className={`relative px-3 py-2.5 rounded-xl border whitespace-nowrap transition-all text-xs flex items-center gap-1.5 ${
                        isSelected
                          ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-sm shadow-neon-cyan/20"
                          : isAllowed
                            ? "border-white/10 text-white/60 hover:border-white/30"
                            : "border-white/5 text-white/20 cursor-not-allowed"
                      }`}
                      disabled={!isAllowed}
                    >
                      {isAllowed ? (
                        <Clock size={13} />
                      ) : (
                        <Lock size={13} />
                      )}
                      <span>{mins} min</span>
                    </button>
                  );
                })}
              </div>
              {/* Upgrade prompt if max tier duration is limited */}
              {(tierInfo.maxDuration || 60) < 1200 && (
                <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                  <Lock size={12} className="text-neon-purple flex-shrink-0" />
                  <span className="text-[10px] text-white/50">
                    Tu plan permite hasta {Math.floor((tierInfo.maxDuration || 60) / 60)} min.
                    <a
                      href="/app/premium"
                      className="text-neon-cyan hover:underline ml-1"
                    >
                      Mejora tu plan →
                    </a>
                  </span>
                </div>
              )}
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

            {/* Title & description — EDITABLE */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                ✏️ {t("dashboard.title_label")}
              </label>
              <input
                type="text"
                value={currentVideo.title || ""}
                className="input-glass"
                onChange={(e) =>
                  updateVideo(
                    currentVideo.id,
                    { title: e.target.value },
                    user?.id,
                  )
                }
                placeholder="Escribe el título de tu video..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                ✏️ {t("dashboard.description_label")}
              </label>
              <textarea
                value={currentVideo.description || ""}
                className="input-glass min-h-[100px] resize-none"
                onChange={(e) =>
                  updateVideo(
                    currentVideo.id,
                    { description: e.target.value },
                    user?.id,
                  )
                }
                placeholder="Escribe la descripción de tu video..."
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

            {/* Upload/Download Status Banner */}
            {uploadStatus && (
              <div
                className={`mb-3 p-3 rounded-xl border text-sm flex items-center gap-2 ${
                  uploadStatus === "uploading"
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                    : uploadStatus === "success"
                      ? "bg-green-500/10 border-green-500/30 text-green-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                }`}
              >
                {uploadStatus === "uploading" && (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Subiendo
                    video a YouTube...
                  </>
                )}
                {uploadStatus === "success" && (
                  <>
                    <CheckCircle2 size={16} /> ¡Video subido a YouTube como
                    borrador!
                  </>
                )}
                {uploadStatus === "error" && (
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span className="whitespace-pre-wrap">{uploadError}</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    setUploadStatus(null);
                    setUploadError("");
                  }}
                  className="ml-auto text-white/40 hover:text-white/80 p-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {/* YouTube Upload - PROMINENT */}
              <button
                onClick={handleUpload}
                disabled={uploadStatus === "uploading"}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg transition-all ${
                  uploadStatus === "uploading"
                    ? "bg-gray-600 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-600/30"
                }`}
              >
                {uploadStatus === "uploading" ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
                  </svg>
                )}
                {uploadStatus === "uploading"
                  ? "Subiendo..."
                  : t("dashboard.upload")}
              </button>

              <div className="flex gap-2">
                <button onClick={handleReset} className="btn-secondary flex-1">
                  {t("dashboard.newVideo")}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`btn-secondary flex items-center justify-center gap-2 px-4 flex-1 ${isDownloading ? "opacity-70 cursor-wait" : ""}`}
                  title="Guardar o Compartir video"
                >
                  {isDownloading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : navigator.share ? (
                    <Share2 size={18} />
                  ) : (
                    <Download size={18} />
                  )}
                  {isDownloading
                    ? "Descargando..."
                    : navigator.share
                      ? "Compartir"
                      : t("dashboard.download")}
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
