// YouTube Service - OAuth and Upload
// Unified YouTube service that works with both native (Firebase) and web OAuth flows
// For native: uses tokens from googleAuth.js (which exchanges serverAuthCode via backend)
// For web: uses implicit OAuth flow (legacy)

import { getAccessToken as getGoogleAuthToken } from './googleAuth'

// Check if YouTube is connected
export const isYoutubeConnected = () => {
  // Check native Google Sign-In connection (preferred)
  const nativeConnected = localStorage.getItem("youtube_connected");
  if (nativeConnected === "true") {
    // Also verify we have an access token (or refresh token to get one)
    const token = localStorage.getItem("youtube_access_token");
    const refreshToken = localStorage.getItem("youtube_refresh_token");
    if (token || refreshToken) return true;
    // We're "connected" but have no usable tokens — still return true
    // so the UI says "connected" but upload will trigger re-auth if needed
    return true;
  }

  // Legacy: Check old token method
  const token = localStorage.getItem("youtube_access_token");
  const expiry = localStorage.getItem("youtube_token_expiry");
  if (!token || !expiry) return false;
  return Date.now() < parseInt(expiry);
};

// Get stored channel info
export const getYoutubeChannel = () => {
  const channel = localStorage.getItem("youtube_channel");
  return channel ? JSON.parse(channel) : null;
};

// Initiate YouTube OAuth flow (web only — native uses googleAuth.js)
export const connectYoutube = async (clientId) => {
  if (clientId) {
    localStorage.setItem("youtube_client_id", clientId);
  }

  const storedClientId = clientId || localStorage.getItem("youtube_client_id");
  if (!storedClientId) {
    throw new Error("Se necesita un Client ID de YouTube");
  }

  const YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
  ].join(" ");

  const redirectUri = window.location.origin + "/youtube-callback";
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(storedClientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent(YOUTUBE_SCOPES)}` +
    `&include_granted_scopes=true` +
    `&prompt=consent`;

  window.location.href = authUrl;
};

// Handle OAuth callback (call this from the callback route)
export const handleYoutubeCallback = async () => {
  const hash = window.location.hash;
  if (!hash.includes("access_token")) {
    return { success: false, error: "No access token found" };
  }

  const params = new URLSearchParams(hash.replace("#", ""));
  const accessToken = params.get("access_token");
  const expiresIn = params.get("expires_in");

  if (!accessToken) {
    return { success: false, error: "Invalid access token" };
  }

  const expiryTime = Date.now() + parseInt(expiresIn) * 1000;
  localStorage.setItem("youtube_access_token", accessToken);
  localStorage.setItem("youtube_token_expiry", expiryTime.toString());
  localStorage.setItem("youtube_token_expires_at", expiryTime.toString());

  try {
    const channelInfo = await fetchChannelInfo(accessToken);
    localStorage.setItem("youtube_channel", JSON.stringify(channelInfo));
    return { success: true, channel: channelInfo };
  } catch (error) {
    return {
      success: true,
      channel: null,
      warning: "Could not fetch channel info",
    };
  }
};

// Fetch YouTube channel info
const fetchChannelInfo = async (accessToken) => {
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch channel info");
  }

  const data = await response.json();
  if (data.items && data.items.length > 0) {
    const channel = data.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      thumbnail: channel.snippet.thumbnails?.default?.url,
    };
  }
  return null;
};

// Get a valid access token — tries googleAuth first, then legacy localStorage
const getValidAccessToken = async () => {
  // 1. Try googleAuth.js (handles auto-refresh via backend)
  try {
    const token = await getGoogleAuthToken();
    if (token) return token;
  } catch (e) {
    console.warn("googleAuth.getAccessToken failed:", e);
  }

  // 2. Fallback: legacy localStorage token
  const token = localStorage.getItem("youtube_access_token");
  if (!token) return null;

  // Check legacy expiry
  const expiry = localStorage.getItem("youtube_token_expiry") ||
                 localStorage.getItem("youtube_token_expires_at");
  if (expiry && Date.now() >= parseInt(expiry)) {
    console.warn("⚠️ YouTube access token expired");
    return null;
  }

  return token;
};

// Upload video to YouTube
export const uploadToYoutube = async (videoBlob, metadata) => {
  try {
    const accessToken = await getValidAccessToken();

    if (!accessToken) {
      return {
        success: false,
        error: "No estás conectado a YouTube. Ve a Mi Cuenta y conecta tu canal.",
      };
    }

    const {
      title,
      description,
      tags = [],
      privacyStatus = "private",
    } = metadata;

    // Create video metadata
    const videoMetadata = {
      snippet: {
        title: title || "Video de FacelessTube",
        description: description || "Video generado con FacelessTube",
        tags: tags,
        categoryId: "22", // People & Blogs
      },
      status: {
        privacyStatus: privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    };

    console.log("📤 Iniciando subida a YouTube...", { title, privacyStatus, blobSize: videoBlob.size });

    // Step 1: Initialize resumable upload
    const initResponse = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": videoBlob.type || "video/mp4",
        },
        body: JSON.stringify(videoMetadata),
        signal: AbortSignal.timeout(30000),
      },
    );

    if (!initResponse.ok) {
      const errorData = await initResponse.json().catch(() => ({}));
      console.error("❌ Error iniciando subida:", initResponse.status, errorData);

      if (initResponse.status === 401) {
        // Clear expired/invalid token
        localStorage.removeItem("youtube_access_token");
        return {
          success: false,
          error: "Tu sesión de YouTube expiró. Ve a Mi Cuenta y reconecta tu canal.",
        };
      }
      if (initResponse.status === 403) {
        return {
          success: false,
          error:
            "No tienes permisos para subir. Desconecta y reconecta tu canal de YouTube en Mi Cuenta.",
        };
      }

      return {
        success: false,
        error:
          errorData.error?.message || "Error al iniciar la subida a YouTube",
      };
    }

    const uploadUrl = initResponse.headers.get("Location");
    if (!uploadUrl) {
      return {
        success: false,
        error: "No se pudo obtener la URL de subida de YouTube",
      };
    }

    console.log("📤 Subiendo video...", { size: videoBlob.size });

    // Step 2: Upload the video content using XHR for better Android compatibility
    const videoData = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          console.log(`📤 Upload progress: ${percent}%`);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(new Error("Invalid response from YouTube"));
          }
        } else {
          let errorMsg = "Error al subir el video a YouTube";
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMsg = errorData.error?.message || errorMsg;
          } catch (e) { /* ignore */ }
          reject(new Error(errorMsg));
        }
      };

      xhr.onerror = () => reject(new Error("Error de red al subir el video"));
      xhr.ontimeout = () => reject(new Error("La subida tardó demasiado. Intenta con un video más corto."));
      xhr.timeout = 300000; // 5 min timeout

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", videoBlob.type || "video/mp4");
      xhr.send(videoBlob);
    });

    console.log("✅ Video subido exitosamente:", videoData.id);

    return {
      success: true,
      videoId: videoData.id,
      url: `https://www.youtube.com/watch?v=${videoData.id}`,
      title: videoData.snippet?.title,
    };
  } catch (error) {
    console.error("❌ Excepcion en uploadToYoutube:", error);

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return {
        success: false,
        error: "La subida tardó demasiado. Intenta con un video más corto o verifica tu conexión.",
      };
    }
    if (error.message?.includes("Failed to fetch")) {
      return {
        success: false,
        error: "No se pudo conectar con YouTube. Verifica tu conexión a internet e intenta de nuevo.",
      };
    }
    return {
      success: false,
      error: error.message || "Error desconocido al subir",
    };
  }
};

// Disconnect YouTube
export const disconnectYoutube = () => {
  localStorage.removeItem("youtube_access_token");
  localStorage.removeItem("youtube_token_expiry");
  localStorage.removeItem("youtube_token_expires_at");
  localStorage.removeItem("youtube_refresh_token");
  localStorage.removeItem("youtube_channel");
  localStorage.removeItem("youtube_client_id");
  localStorage.removeItem("youtube_connected");
};

export default {
  isYoutubeConnected,
  getYoutubeChannel,
  connectYoutube,
  handleYoutubeCallback,
  uploadToYoutube,
  disconnectYoutube,
};
