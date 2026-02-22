// ============ VIDEO GENERATOR SERVICE ============
// Client-side video rendering with Canvas + MediaRecorder
// AI scripts & TTS are handled by the backend (geminiService.js)

import {
  generateAIVoice,
  loadAIVoiceModel,
  isAIVoiceReady,
  checkTransformersAvailable,
} from "./aiVoiceService";

// Helper: delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============ VOZ IA LOCAL (Transformers.js) ============
export async function generateLocalAIVoice(text, onProgress) {
  try {
    // Verificar si Transformers.js está disponible
    const available = await checkTransformersAvailable();
    if (!available) {
      console.warn("Transformers.js no disponible, usando Web Speech API");
      return null;
    }

    // Cargar modelo si no está listo
    if (!isAIVoiceReady()) {
      await loadAIVoiceModel(onProgress);
    }

    // Generar audio
    const audioBlob = await generateAIVoice(text, onProgress);
    console.log("✅ Voz IA local generada:", audioBlob.size, "bytes");
    return audioBlob;
  } catch (error) {
    console.error("Error generando voz IA local:", error);
    return null;
  }
}

// NOTE: Script generation is now handled by geminiService.js (backend proxy)
// The legacy generateScript/expandScript/createFallbackScript functions have been removed.

// ============ PEXELS IMÁGENES (VIA BACKEND PROXY) ============
const API_BASE =
  import.meta.env.VITE_API_URL || "https://facelesstube-backend.onrender.com";

const CATEGORY_KEYWORDS = {
  gaming: [
    "gaming setup",
    "esports",
    "video games",
    "neon lights gaming",
    "gaming controller",
    "streamer",
  ],
  satisfying: [
    "satisfying texture",
    "colorful abstract",
    "smooth gradient",
    "liquid art",
    "geometric pattern",
    "zen",
  ],
  nature: [
    "nature landscape",
    "ocean sunset",
    "forest",
    "mountains",
    "wildlife",
    "aurora",
  ],
  cooking: [
    "food photography",
    "restaurant kitchen",
    "chef cooking",
    "ingredients",
    "gourmet dish",
    "baking",
  ],
  abstract: [
    "abstract art",
    "neon lights",
    "technology",
    "futuristic",
    "particles",
    "space",
  ],
  general: [
    "modern city",
    "technology",
    "creative",
    "business",
    "lifestyle",
    "trending",
  ],
};

export async function fetchPexelsImages(videoType, _pexelsKey, count = 6) {
  const images = [];
  const keywords = CATEGORY_KEYWORDS[videoType] || CATEGORY_KEYWORDS.general;

  console.log("🖼️ Buscando IMÁGENES para:", videoType);

  for (let i = 0; i < count; i++) {
    const keyword = keywords[i % keywords.length];

    try {
      // Usar backend proxy (no requiere API key del usuario)
      const params = new URLSearchParams({
        query: keyword,
        per_page: 15,
        orientation: "portrait",
        type: "photos",
      });
      const response = await fetch(`${API_BASE}/api/pexels/search?${params}`);

      if (response.ok) {
        const data = await response.json();
        if (data.photos?.length > 0) {
          const randomIdx = Math.floor(
            Math.random() * Math.min(data.photos.length, 10),
          );
          const photo = data.photos[randomIdx];

          // Usar tamaño large para buena calidad
          const imageUrl =
            photo.src?.large2x || photo.src?.large || photo.src?.medium;

          if (imageUrl) {
            console.log(`✅ Imagen ${i + 1}: ${keyword}`);
            images.push(imageUrl);
            continue;
          }
        }
      }
    } catch (e) {
      console.warn(`Error buscando "${keyword}":`, e);
    }
    images.push(null);
  }

  console.log(
    `📷 Imágenes cargadas: ${images.filter((i) => i).length}/${count}`,
  );
  return images;
}

// Cargar imagen
async function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn("Error cargando imagen:", url?.substring(0, 50));
      resolve(null);
    };
    setTimeout(() => resolve(null), 10000);
    img.src = url;
  });
}

// Cargar video de biblioteca y extraer frames
async function loadLibraryVideo(videoDataUrl, videoId) {
  // Helper: load a video element from a URL/blob URL
  const tryLoad = (src, useCors) =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      if (useCors) video.crossOrigin = "anonymous";

      video.onloadeddata = () => {
        console.log(
          "📹 Video de biblioteca cargado:",
          video.duration?.toFixed(1),
          "seg",
        );
        resolve(video);
      };

      video.onerror = (e) => {
        console.warn("Error cargando video de biblioteca:", e);
        resolve(null);
      };

      setTimeout(() => resolve(null), 30000);
      video.src = src;
    });

  // Strategy 0: Check IndexedDB cache first (instant!)
  if (videoId) {
    try {
      const { getCachedVideo } = await import("./videoCacheService");
      const cachedBlob = await getCachedVideo(videoId);
      if (cachedBlob) {
        console.log("⚡ Using cached video:", videoId);
        const blobUrl = URL.createObjectURL(cachedBlob);
        const video = await tryLoad(blobUrl, false);
        if (video) {
          video._blobUrl = blobUrl;
          return video;
        }
        URL.revokeObjectURL(blobUrl);
      }
    } catch (e) {
      console.warn("Cache lookup failed:", e);
    }
  }

  // Strategy 1: If it's already a data URL or blob URL, load directly
  if (videoDataUrl.startsWith("data:") || videoDataUrl.startsWith("blob:")) {
    const video = await tryLoad(videoDataUrl, false);
    if (video) return video;
  }

  // Strategy 2: For external URLs (Pexels CDN), proxy through backend to bypass CORS
  const isExternalUrl =
    videoDataUrl.startsWith("http://") || videoDataUrl.startsWith("https://");
  if (isExternalUrl) {
    try {
      const proxyUrl = `${API_BASE}/api/proxy-video?url=${encodeURIComponent(videoDataUrl)}`;
      console.log("🔄 Proxying video through backend (CORS bypass)...");
      const response = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(120000), // 2 min timeout for large videos
      });
      if (response.ok) {
        const blob = await response.blob();
        console.log(
          "📦 Video via proxy:",
          (blob.size / 1024 / 1024).toFixed(1),
          "MB",
        );
        const blobUrl = URL.createObjectURL(blob);

        // Cache it for next time
        if (videoId) {
          try {
            const { cacheVideo } = await import("./videoCacheService");
            await cacheVideo(videoId, blob, { url: videoDataUrl });
            console.log("💾 Video cached for future use:", videoId);
          } catch (e) {
            console.warn("Auto-cache failed:", e);
          }
        }

        const video = await tryLoad(blobUrl, false);
        if (video) {
          video._blobUrl = blobUrl;
          return video;
        }
        URL.revokeObjectURL(blobUrl);
      } else {
        console.warn("Proxy fetch returned:", response.status);
      }
    } catch (e) {
      console.warn("Proxy fetch failed:", e);
    }
  }

  // Strategy 3: Try direct blob fetch (works on desktop / non-Capacitor)
  try {
    console.log("📥 Fetching video as blob directly...");
    const response = await fetch(videoDataUrl, {
      signal: AbortSignal.timeout(45000),
    });
    if (response.ok) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log("📦 Video blob:", (blob.size / 1024 / 1024).toFixed(1), "MB");

      // Also cache it for next time
      if (videoId) {
        try {
          const { cacheVideo } = await import("./videoCacheService");
          await cacheVideo(videoId, blob, { url: videoDataUrl });
          console.log("💾 Video cached for future use:", videoId);
        } catch (e) {
          console.warn("Auto-cache failed:", e);
        }
      }

      const video = await tryLoad(blobUrl, false);
      if (video) {
        video._blobUrl = blobUrl;
        return video;
      }
      URL.revokeObjectURL(blobUrl);
    }
  } catch (e) {
    console.warn("Direct blob fetch failed:", e);
  }

  // Strategy 4: Try with CORS (required for canvas drawImage)
  let video = await tryLoad(videoDataUrl, true);
  if (video) return video;

  // Strategy 5: Retry without CORS
  console.log("🔄 Retrying video load without CORS...");
  video = await tryLoad(videoDataUrl, false);
  return video;
}

// ============ CREAR VIDEO CON BIBLIOTECA ============
export async function createVideoWithLibrary(
  script,
  libraryVideoDataUrl,
  audioBlob,
  onProgress,
  videoId,
  photoUrls = [],
) {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext("2d");

      // Dividir guión en segmentos — ensure fullText is a string
      const rawText = script.fullScript || script.guion || script.script || "";
      const fullText = typeof rawText === "string" ? rawText : String(rawText);
      const paragraphs = fullText.split(/\n\n+/).filter((p) => p.trim());

      let scenes = [];
      if (paragraphs.length >= 6) {
        scenes = paragraphs.slice(0, 6);
      } else {
        const words = fullText.split(/\s+/);
        const wordsPerScene = Math.ceil(words.length / 6);
        for (let i = 0; i < 6; i++) {
          const start = i * wordsPerScene;
          const end = Math.min(start + wordsPerScene, words.length);
          scenes.push(words.slice(start, end).join(" "));
        }
      }

      console.log("📜 Escenas:", scenes.length);

      // === BACKGROUND STRATEGY: Photos > Video > Gradient ===
      let bgPhotos = []; // Array of loaded Image objects
      let bgVideo = null;
      let useGradientFallback = false;

      // Strategy 1: Load photos (preferred — fast, reliable, Ken Burns)
      if (photoUrls && photoUrls.length > 0) {
        onProgress?.("📸 Cargando fotos de fondo...");
        console.log(`📸 Loading ${photoUrls.length} background photos...`);

        const loadImage = (url) =>
          new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => {
              console.warn("Failed to load photo:", url);
              resolve(null);
            };
            img.src = url;
          });

        const loaded = await Promise.all(
          photoUrls.map((url) => loadImage(url)),
        );
        bgPhotos = loaded.filter((img) => img !== null);
        console.log(`✅ Loaded ${bgPhotos.length}/${photoUrls.length} photos`);
      }

      // Strategy 2: Load video (fallback)
      if (bgPhotos.length === 0 && libraryVideoDataUrl) {
        onProgress?.("📹 Cargando video de fondo...");
        try {
          bgVideo = await loadLibraryVideo(libraryVideoDataUrl, videoId);
        } catch (e) {
          console.warn("Video load error:", e);
        }
      }

      // Strategy 3: Gradient (final fallback)
      useGradientFallback = bgPhotos.length === 0 && !bgVideo;
      if (useGradientFallback) {
        console.log("🎨 Using animated gradient fallback");
        onProgress?.("🎨 Usando fondo animado...");
      } else if (bgPhotos.length > 0) {
        onProgress?.(`✅ ${bgPhotos.length} fotos cargadas`);
      }

      // Configurar audio
      let audioContext = null;
      let audioBuffer = null;
      let audioDestination = null;
      let combinedStream = null;

      const videoStream = canvas.captureStream(30);

      if (audioBlob) {
        try {
          audioContext = new (
            window.AudioContext || window.webkitAudioContext
          )();
          const arrayBuffer = await audioBlob.arrayBuffer();
          audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          audioDestination = audioContext.createMediaStreamDestination();

          const audioTrack = audioDestination.stream.getAudioTracks()[0];
          const videoTrack = videoStream.getVideoTracks()[0];
          combinedStream = new MediaStream([videoTrack, audioTrack]);

          console.log("🔊 Audio:", audioBuffer.duration.toFixed(1), "seg");
        } catch (e) {
          console.warn("Error audio:", e);
          combinedStream = videoStream;
        }
      } else {
        combinedStream = videoStream;
      }

      // MediaRecorder — try codecs in order of compatibility
      let mimeType = "video/webm;codecs=vp8,opus";
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
        mimeType = "video/webm;codecs=vp9,opus";
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
        mimeType = "video/webm;codecs=vp8,opus";
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        mimeType = "video/webm";
      }
      console.log("🎥 MediaRecorder mimeType:", mimeType);

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        console.log("✅ Video:", (blob.size / 1024 / 1024).toFixed(2), "MB");
        resolve(blob);
      };

      mediaRecorder.start(100);

      // Iniciar audio
      if (audioContext && audioBuffer && audioDestination) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioDestination);
        source.start(0);
      }

      // Iniciar reproducción del video de fondo
      if (bgVideo) {
        bgVideo.currentTime = 0;
        bgVideo.play().catch(console.warn);
      }

      // Gradient color palettes for fallback background
      const gradientPalettes = [
        ["#0f0c29", "#302b63", "#24243e"], // Deep purple
        ["#000428", "#004e92", "#000428"], // Deep blue
        ["#1a1a2e", "#16213e", "#0f3460"], // Midnight
        ["#0d0d0d", "#1a1a2e", "#e94560"], // Dark red accent
        ["#000000", "#130f40", "#000000"], // Pure dark
        ["#0c0c1d", "#1b1b3a", "#2d2d5e"], // Space
      ];

      // Renderizar 6 escenas x 3 seg = 18 seg total (mucho más rápido)
      const fps = 15;
      const sceneDuration = 3000; // 3 seconds per scene
      const framesPerScene = (sceneDuration / 1000) * fps;

      for (let sceneIdx = 0; sceneIdx < 6; sceneIdx++) {
        const sceneText = scenes[sceneIdx] || "";
        onProgress?.(`🎬 Escena ${sceneIdx + 1}/6...`);

        for (let frame = 0; frame < framesPerScene; frame++) {
          const time = (sceneIdx * framesPerScene + frame) / fps;

          // ============ FONDO ============
          if (bgPhotos.length > 0) {
            // PHOTO BACKGROUND with Ken Burns effect
            const photo = bgPhotos[sceneIdx % bgPhotos.length];
            const progress = frame / framesPerScene;

            // Ken Burns: different pan direction per scene
            const directions = [
              { startZoom: 1.0, endZoom: 1.15, panX: -0.05, panY: -0.02 }, // Zoom in, pan left-up
              { startZoom: 1.15, endZoom: 1.0, panX: 0.05, panY: 0.02 }, // Zoom out, pan right-down
              { startZoom: 1.0, endZoom: 1.12, panX: 0.04, panY: -0.03 }, // Zoom in, pan right-up
              { startZoom: 1.12, endZoom: 1.0, panX: -0.03, panY: 0.03 }, // Zoom out, pan left-down
              { startZoom: 1.0, endZoom: 1.18, panX: 0.0, panY: -0.04 }, // Zoom in, pan up
              { startZoom: 1.18, endZoom: 1.0, panX: 0.0, panY: 0.04 }, // Zoom out, pan down
            ];
            const dir = directions[sceneIdx % directions.length];

            // Smooth easing
            const t = progress * progress * (3 - 2 * progress); // smoothstep
            const zoom = dir.startZoom + (dir.endZoom - dir.startZoom) * t;
            const offsetX = dir.panX * t * canvas.width;
            const offsetY = dir.panY * t * canvas.height;

            // Scale image to cover canvas
            const imgRatio = photo.naturalWidth / photo.naturalHeight;
            const canvasRatio = canvas.width / canvas.height;
            let drawW, drawH;
            if (imgRatio < canvasRatio) {
              drawW = canvas.width * zoom;
              drawH = drawW / imgRatio;
            } else {
              drawH = canvas.height * zoom;
              drawW = drawH * imgRatio;
            }
            const drawX = (canvas.width - drawW) / 2 + offsetX;
            const drawY = (canvas.height - drawH) / 2 + offsetY;

            ctx.drawImage(photo, drawX, drawY, drawW, drawH);

            // Dark overlay for text readability
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (bgVideo && !useGradientFallback) {
            // Dibujar frame actual del video
            const scale = Math.max(
              canvas.width / bgVideo.videoWidth,
              canvas.height / bgVideo.videoHeight,
            );
            const w = bgVideo.videoWidth * scale;
            const h = bgVideo.videoHeight * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;

            // Efecto Ken Burns suave
            const zoom = 1 + (frame / framesPerScene) * 0.03;
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(zoom, zoom);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            ctx.drawImage(bgVideo, x, y, w, h);
            ctx.restore();

            // Overlay oscuro para legibilidad
            ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Loop del video si termina
            if (bgVideo.currentTime >= bgVideo.duration - 0.5) {
              bgVideo.currentTime = 0;
            }
          } else {
            // Animated gradient fallback
            const palette =
              gradientPalettes[sceneIdx % gradientPalettes.length];
            const gradProgress = frame / framesPerScene;

            // Shifting gradient
            const gradY1 = Math.sin(gradProgress * Math.PI) * 200;
            const grad = ctx.createLinearGradient(
              0,
              gradY1,
              canvas.width,
              canvas.height - gradY1,
            );
            grad.addColorStop(0, palette[0]);
            grad.addColorStop(0.5, palette[1]);
            grad.addColorStop(1, palette[2]);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Floating particles effect
            for (let p = 0; p < 15; p++) {
              const px = (p * 137 + time * 30) % canvas.width;
              const py =
                (p * 97 + time * 20 + Math.sin(p + time) * 50) % canvas.height;
              const pSize = 2 + Math.sin(p * 0.5 + time) * 1.5;
              const pAlpha = 0.1 + Math.sin(p * 0.3 + time * 2) * 0.08;
              ctx.beginPath();
              ctx.arc(px, py, pSize, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${pAlpha})`;
              ctx.fill();
            }

            // Subtle vignette
            const vignette = ctx.createRadialGradient(
              canvas.width / 2,
              canvas.height / 2,
              canvas.height * 0.3,
              canvas.width / 2,
              canvas.height / 2,
              canvas.height * 0.8,
            );
            vignette.addColorStop(0, "rgba(0,0,0,0)");
            vignette.addColorStop(1, "rgba(0,0,0,0.5)");
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // ============ SUBTÍTULOS ESTILO VIRAL ============
          // (Usar la misma lógica de subtítulos mejorada)
          drawViralSubtitles(ctx, canvas, sceneText, time);

          // Barra de progreso
          const progress =
            (sceneIdx * framesPerScene + frame) / (6 * framesPerScene);
          ctx.fillStyle = "rgba(168, 85, 247, 0.9)";
          ctx.fillRect(0, 0, canvas.width * progress, 4);

          await new Promise((r) => setTimeout(r, 1000 / fps));
        }
      }

      bgVideo?.pause();
      await new Promise((r) => setTimeout(r, 300));
      mediaRecorder.stop();
      if (audioContext) audioContext.close();
    } catch (error) {
      console.error("Error video:", error);
      reject(error);
    }
  });
}

// Función de subtítulos virales reutilizable — word-by-word reveal animation
function drawViralSubtitles(ctx, canvas, sceneText, time) {
  const subtitleY = canvas.height - 320;

  // Fondo gradient
  const subGrad = ctx.createLinearGradient(0, subtitleY - 50, 0, canvas.height);
  subGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
  subGrad.addColorStop(0.2, "rgba(0, 0, 0, 0.85)");
  subGrad.addColorStop(0.9, "rgba(0, 0, 0, 0.85)");
  subGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = subGrad;
  ctx.fillRect(0, subtitleY - 50, canvas.width, 350);

  // Patrones para destacar
  const highlightPatterns = [
    /\d+%/g,
    /\d+/g,
    /\b(INCREÍBLE|IMPACTANTE|SECRETO|VERDAD|NUNCA|SIEMPRE|TODOS|NADIE|MEJOR|PEOR)\b/gi,
    /\b(millones|billones|mil|cientos)\b/gi,
    /\$[\d,]+/g,
  ];
  const highlightColors = [
    "#FFD700",
    "#00FF88",
    "#FF6B6B",
    "#00D4FF",
    "#FF6FFF",
  ];

  ctx.font = 'bold 48px "Inter", "Segoe UI", system-ui, sans-serif';
  const words = sceneText.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const testLine = line + (line ? " " : "") + word;
    if (ctx.measureText(testLine).width > canvas.width - 80) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);

  const displayLines = lines.slice(0, 3);
  const lineHeight = 65;
  const startY = subtitleY + 80;

  // Calculate which word is currently "active" based on time
  const totalWords = words.length;
  const sceneLocalTime = time % 3; // 3 seconds per scene
  const wordsPerSecond = Math.max(totalWords / 2.5, 4); // reveal all words over ~2.5s
  const activeWordIndex = Math.floor(sceneLocalTime * wordsPerSecond);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  let globalWordIdx = 0;
  displayLines.forEach((lineText, lineIdx) => {
    const y = startY + lineIdx * lineHeight;
    const lineWords = lineText.split(" ");
    const totalWidth = ctx.measureText(lineText).width;
    let x = (canvas.width - totalWidth) / 2;

    lineWords.forEach((word) => {
      const wordWidth = ctx.measureText(word + " ").width;
      const wordX = x + wordWidth / 2 - ctx.measureText(" ").width / 2;

      // Word-by-word reveal: only show words up to activeWordIndex
      const isVisible = globalWordIdx <= activeWordIndex;
      const isCurrentWord = globalWordIdx === activeWordIndex;
      const wordAge =
        (activeWordIndex - globalWordIdx) / Math.max(wordsPerSecond, 1); // how long ago this word appeared

      if (!isVisible) {
        x += wordWidth;
        globalWordIdx++;
        return;
      }

      let isHighlighted = false;
      let highlightColor = "#FFD700";
      for (let i = 0; i < highlightPatterns.length; i++) {
        highlightPatterns[i].lastIndex = 0; // reset regex
        if (highlightPatterns[i].test(word)) {
          isHighlighted = true;
          highlightColor = highlightColors[i % highlightColors.length];
          break;
        }
      }

      ctx.save();

      // Scale-up animation for newly appearing words
      if (isCurrentWord) {
        const appearProgress = Math.min(
          (sceneLocalTime * wordsPerSecond) % 1,
          1,
        );
        const scale = 0.7 + 0.3 * Math.min(appearProgress * 3, 1); // quick scale from 0.7 to 1.0
        const alpha = Math.min(appearProgress * 4, 1);
        ctx.globalAlpha = alpha;
        ctx.translate(wordX, y);
        ctx.scale(scale, scale);
        ctx.translate(-wordX, -y);
      }

      // Active word gets extra glow
      if (isCurrentWord || isHighlighted) {
        ctx.shadowColor = isHighlighted ? highlightColor : "#00D4FF";
        ctx.shadowBlur = isCurrentWord ? 25 : 20;
        ctx.shadowOffsetY = 2;
      } else {
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
      }

      ctx.strokeStyle = "#000";
      ctx.lineWidth = isHighlighted || isCurrentWord ? 8 : 6;
      ctx.lineJoin = "round";
      ctx.strokeText(word, wordX, y);

      // Active word: cyan highlight, otherwise white
      ctx.fillStyle = isCurrentWord
        ? "#00D4FF"
        : isHighlighted
          ? highlightColor
          : "#FFFFFF";
      ctx.fillText(word, wordX, y);

      ctx.restore();
      x += wordWidth;
      globalWordIdx++;
    });
  });
}

// ============ CREAR VIDEO ============
export async function createVideo(script, images, audioBlob, onProgress) {
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext("2d");

      // Dividir guión en 6 partes IGUALES
      const fullText = script.fullScript || "";
      const paragraphs = fullText.split(/\n\n+/).filter((p) => p.trim());

      // Si hay menos de 6 párrafos, dividir el texto en 6 partes
      let scenes = [];
      if (paragraphs.length >= 6) {
        scenes = paragraphs.slice(0, 6);
      } else {
        // Dividir todo el texto en 6 partes iguales
        const words = fullText.split(/\s+/);
        const wordsPerScene = Math.ceil(words.length / 6);
        for (let i = 0; i < 6; i++) {
          const start = i * wordsPerScene;
          const end = Math.min(start + wordsPerScene, words.length);
          scenes.push(words.slice(start, end).join(" "));
        }
      }

      console.log(
        "📜 Escenas:",
        scenes.map((s) => s.substring(0, 30) + "..."),
      );

      // Pre-cargar imágenes
      const loadedImages = [];
      for (let i = 0; i < 6; i++) {
        if (images?.[i]) {
          onProgress?.(`📥 Cargando imagen ${i + 1}/6...`);
          loadedImages.push(await loadImage(images[i]));
        } else {
          loadedImages.push(null);
        }
      }

      console.log(
        "🖼️ Imágenes cargadas:",
        loadedImages.filter((i) => i).length,
      );

      // Configurar audio
      let audioContext = null;
      let audioBuffer = null;
      let audioDestination = null;
      let combinedStream = null;

      const videoStream = canvas.captureStream(30);

      if (audioBlob) {
        try {
          audioContext = new (
            window.AudioContext || window.webkitAudioContext
          )();
          const arrayBuffer = await audioBlob.arrayBuffer();
          audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          audioDestination = audioContext.createMediaStreamDestination();

          const audioTrack = audioDestination.stream.getAudioTracks()[0];
          const videoTrack = videoStream.getVideoTracks()[0];
          combinedStream = new MediaStream([videoTrack, audioTrack]);

          console.log("🔊 Audio:", audioBuffer.duration.toFixed(1), "seg");
        } catch (e) {
          console.warn("Error audio:", e);
          combinedStream = videoStream;
        }
      } else {
        combinedStream = videoStream;
      }

      // MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp9,opus",
        videoBitsPerSecond: 4000000,
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        console.log("✅ Video:", (blob.size / 1024 / 1024).toFixed(2), "MB");
        resolve(blob);
      };

      mediaRecorder.start(100);

      // Iniciar audio
      if (audioContext && audioBuffer && audioDestination) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioDestination);
        source.start(0);
      }

      // Colores fallback con animación
      const bgColors = [
        ["#1a0533", "#4a1c77", "#8b5cf6"],
        ["#0a1628", "#1e4a6f", "#3b82f6"],
        ["#1a0a2a", "#3a2a5a", "#a855f7"],
        ["#0a2a2a", "#2a4a4a", "#14b8a6"],
        ["#2a1a0a", "#4a3a2a", "#f59e0b"],
        ["#0f1929", "#2c3e50", "#6366f1"],
      ];

      // Renderizar 6 escenas x 10 seg = 60 seg
      const fps = 30;
      const sceneDuration = 10000;
      const framesPerScene = (sceneDuration / 1000) * fps;

      for (let sceneIdx = 0; sceneIdx < 6; sceneIdx++) {
        const sceneText = scenes[sceneIdx] || "";
        const img = loadedImages[sceneIdx];

        onProgress?.(`🎬 Escena ${sceneIdx + 1}/6...`);

        for (let frame = 0; frame < framesPerScene; frame++) {
          const time = (sceneIdx * framesPerScene + frame) / fps;

          // ============ FONDO ============
          if (img) {
            // IMAGEN DE PEXELS
            const scale = Math.max(
              canvas.width / img.width,
              canvas.height / img.height,
            );
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;

            // Efecto Ken Burns (zoom lento)
            const zoom = 1 + (frame / framesPerScene) * 0.05;
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(zoom, zoom);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            ctx.drawImage(img, x, y, w, h);
            ctx.restore();

            // Overlay oscuro
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else {
            // GRADIENT ANIMADO FALLBACK
            const colors = bgColors[sceneIdx % bgColors.length];
            const gradient = ctx.createLinearGradient(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(0.5, colors[1]);
            gradient.addColorStop(1, colors[2]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Partículas animadas
            ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            for (let p = 0; p < 40; p++) {
              const px =
                (Math.sin(time * 0.5 + p * 0.7) * 0.5 + 0.5) * canvas.width;
              const py =
                (Math.cos(time * 0.3 + p * 0.5) * 0.5 + 0.5) * canvas.height;
              const size = 2 + Math.sin(time + p) * 2;
              ctx.beginPath();
              ctx.arc(px, py, size, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // ============ SUBTÍTULOS ESTILO VIRAL ============
          const subtitleY = canvas.height - 320;

          // Fondo gradient más suave
          const subGrad = ctx.createLinearGradient(
            0,
            subtitleY - 50,
            0,
            canvas.height,
          );
          subGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
          subGrad.addColorStop(0.2, "rgba(0, 0, 0, 0.85)");
          subGrad.addColorStop(0.9, "rgba(0, 0, 0, 0.85)");
          subGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = subGrad;
          ctx.fillRect(0, subtitleY - 50, canvas.width, 350);

          // Palabras a destacar en color (detectar automáticamente números, % y palabras clave)
          const highlightPatterns = [
            /\d+%/g, // Porcentajes
            /\d+/g, // Números
            /\b(INCREÍBLE|IMPACTANTE|SECRETO|VERDAD|NUNCA|SIEMPRE|TODOS|NADIE|MEJOR|PEOR)\b/gi,
            /\b(millones|billones|mil|cientos)\b/gi,
            /\$[\d,]+/g, // Dinero
          ];
          const highlightColors = [
            "#FFD700",
            "#00FF88",
            "#FF6B6B",
            "#00D4FF",
            "#FF6FFF",
          ];

          // Dividir texto en líneas con fuente más grande
          ctx.font = 'bold 48px "Inter", "Segoe UI", system-ui, sans-serif';
          const words = sceneText.split(" ");
          const lines = [];
          let line = "";
          for (const word of words) {
            const testLine = line + (line ? " " : "") + word;
            if (ctx.measureText(testLine).width > canvas.width - 80) {
              if (line) lines.push(line);
              line = word;
            } else {
              line = testLine;
            }
          }
          if (line) lines.push(line);

          // Máximo 3 líneas para mejor legibilidad
          const displayLines = lines.slice(0, 3);
          const lineHeight = 65;
          const startY = subtitleY + 80;

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          displayLines.forEach((lineText, lineIdx) => {
            const y = startY + lineIdx * lineHeight;
            const lineWords = lineText.split(" ");

            // Calcular posición inicial para centrar
            const totalWidth = ctx.measureText(lineText).width;
            let x = (canvas.width - totalWidth) / 2;

            lineWords.forEach((word, wordIdx) => {
              const wordWidth = ctx.measureText(word + " ").width;
              const wordX = x + wordWidth / 2 - ctx.measureText(" ").width / 2;

              // Verificar si esta palabra debe destacarse
              let isHighlighted = false;
              let highlightColor = "#FFD700";
              for (let i = 0; i < highlightPatterns.length; i++) {
                if (highlightPatterns[i].test(word)) {
                  isHighlighted = true;
                  highlightColor = highlightColors[i % highlightColors.length];
                  break;
                }
              }

              // Sombra/glow para todas las palabras
              ctx.save();

              // Sombra exterior
              ctx.shadowColor = isHighlighted
                ? highlightColor
                : "rgba(0, 0, 0, 0.9)";
              ctx.shadowBlur = isHighlighted ? 20 : 8;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 2;

              // Borde grueso
              ctx.strokeStyle = "#000";
              ctx.lineWidth = isHighlighted ? 8 : 6;
              ctx.lineJoin = "round";
              ctx.strokeText(word, wordX, y);

              // Texto con color
              if (isHighlighted) {
                // Gradiente para palabras destacadas
                const wordGrad = ctx.createLinearGradient(
                  wordX - wordWidth / 2,
                  y - 20,
                  wordX + wordWidth / 2,
                  y + 20,
                );
                wordGrad.addColorStop(0, highlightColor);
                wordGrad.addColorStop(0.5, "#FFFFFF");
                wordGrad.addColorStop(1, highlightColor);
                ctx.fillStyle = wordGrad;

                // Efecto de escala para destacar
                ctx.save();
                ctx.translate(wordX, y);
                const pulse = 1 + Math.sin(time * 3 + wordIdx) * 0.03;
                ctx.scale(pulse, pulse);
                ctx.translate(-wordX, -y);
                ctx.fillText(word, wordX, y);
                ctx.restore();
              } else {
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(word, wordX, y);
              }

              ctx.restore();
              x += wordWidth;
            });
          });

          // Barra de progreso
          const progress =
            (sceneIdx * framesPerScene + frame) / (6 * framesPerScene);
          ctx.fillStyle = "rgba(168, 85, 247, 0.9)";
          ctx.fillRect(0, 0, canvas.width * progress, 4);

          await new Promise((r) => setTimeout(r, 1000 / fps));
        }
      }

      await new Promise((r) => setTimeout(r, 300));
      mediaRecorder.stop();
      if (audioContext) audioContext.close();
    } catch (error) {
      console.error("Error video:", error);
      reject(error);
    }
  });
}

export default {
  fetchPexelsImages,
  createVideo,
  createVideoWithLibrary,
  generateLocalAIVoice,
};
