// AI Service for script generation
// Routes through backend (Render USA) to bypass regional restrictions
// Backend handles: Gemini (free) → Perplexity (paid fallback)

const API_BASE =
  import.meta.env.VITE_API_URL || "https://facelesstube-backend.onrender.com";

// Helper: fetch with timeout
const fetchWithTimeout = async (url, options, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') throw new Error("La solicitud ha excedido el tiempo de espera (timeout).");
    throw error;
  }
};

// Helper: delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Call backend AI endpoint (primary method)
async function callBackendAI(
  idea,
  language,
  template = "general",
  userId = null,
  durationSeconds = 60,
  retries = 2
) {
  console.log("🖥️ Calling backend AI...", {
    template,
    durationSeconds,
    userId: userId?.substring(0, 8),
  });

  for (let i = 0; i <= retries; i++) {
    try {
      // 150s timeout — AI generation (research + script writing) can take up to 2 min
      const response = await fetchWithTimeout(`${API_BASE}/api/ai/generate-script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, language, template, user_id: userId, duration_seconds: durationSeconds }),
      }, 150000);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const msg = err.detail || `Backend error: ${response.status}`;
        throw new Error(msg);
      }

      const data = await response.json();
      console.log(`✅ Backend AI succeeded: "${data.title}"`);
      return data;
    } catch (error) {
      console.error(`❌ Backend AI attempt ${i + 1} failed: ${error.message}`);
      if (i === retries) throw error;
      const waitMs = 3000 * (i + 1); // 3s, 6s between retries
      console.log(`⏳ Retrying in ${waitMs}ms...`);
      await delay(waitMs);
    }
  }
}

// Generate video script — always uses backend
export const generateScript = async (
  idea,
  language = "es",
  template = "general",
  userId = null,
  durationSeconds = 60,
) => {
  if (!idea || idea.trim().length < 3) {
    throw new Error("Escribe una idea para tu video");
  }

  try {
    return await callBackendAI(idea, language, template, userId, durationSeconds);
  } catch (error) {
    console.error("AI script error:", error);

    // Network/timeout errors — friendly message
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("timeout") ||
      error.name === "TimeoutError" ||
      error.name === "AbortError"
    ) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifica tu conexion a internet e intenta de nuevo.",
      );
    }

    // Fix UTF-8 double-encoding corruption (shows as "fallÃ³" → "falló")
    let cleanMsg = error.message || "Error generando el guion";
    try {
      // Attempt to decode if it looks like double-encoded UTF-8
      if (/[\xc0-\xff][\x80-\xbf]/.test(cleanMsg)) {
        cleanMsg = decodeURIComponent(escape(cleanMsg));
      }
    } catch {
      // keep original if decode fails
    }
    // Strip technical debug info ("[Debug: provider=...") from the error shown to user
    cleanMsg = cleanMsg.replace(/\s*\[Debug:[^\]]*\]/g, "").trim();

    throw new Error(cleanMsg);
  }
};

// Generate thumbnail concept — uses backend
export const generateThumbnailConcept = async (title, language = "es") => {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/api/ai/generate-thumbnail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }, 15000);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
};

// Legacy exports for backward compatibility
export const setGeminiApiKey = () => {}; // No longer needed
export const hasGeminiApiKey = () => true; // Always available via backend
