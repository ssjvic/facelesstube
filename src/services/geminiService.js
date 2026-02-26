// AI Service for script generation
// Routes through backend (Render USA) to bypass regional restrictions
// Backend handles: Gemini (free) → Perplexity (paid fallback)

const API_BASE =
  import.meta.env.VITE_API_URL || "https://facelesstube-backend.onrender.com";

// Helper: delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Call backend AI endpoint (primary method)
async function callBackendAI(
  idea,
  language,
  template = "general",
  userId = null,
) {
  console.log("🖥️ Calling backend AI...", {
    template,
    userId: userId?.substring(0, 8),
  });
  const response = await fetch(`${API_BASE}/api/ai/generate-script`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, language, template, user_id: userId }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.detail || `Backend error: ${response.status}`;
    console.error(`❌ Backend AI failed: ${msg}`);
    throw new Error(msg);
  }

  const data = await response.json();
  console.log(`✅ Backend AI succeeded: "${data.title}"`);
  return data;
}

// Generate video script — always uses backend
export const generateScript = async (
  idea,
  language = "es",
  template = "general",
  userId = null,
) => {
  if (!idea || idea.trim().length < 3) {
    throw new Error("Escribe una idea para tu video");
  }

  try {
    return await callBackendAI(idea, language, template, userId);
  } catch (error) {
    console.error("AI script error:", error);
    // Provide user-friendly error messages
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError")
    ) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
      );
    }
    throw error;
  }
};

// Generate thumbnail concept — uses backend
export const generateThumbnailConcept = async (title, language = "es") => {
  try {
    const response = await fetch(`${API_BASE}/api/ai/generate-thumbnail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
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
