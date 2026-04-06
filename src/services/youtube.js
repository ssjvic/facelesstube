// YouTube Service - OAuth and Upload
// This handles YouTube authentication and video uploads

const YOUTUBE_CLIENT_ID = localStorage.getItem("youtube_client_id") || "";
const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
].join(" ");

// Check if YouTube is connected (supports both native and legacy auth)
export const isYoutubeConnected = () => {
  // Check native Google Sign-In connection
  const nativeConnected = localStorage.getItem("youtube_connected");
  if (nativeConnected === "true") return true;

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

// Initiate YouTube OAuth flow
export const connectYoutube = async (clientId) => {
  if (clientId) {
    localStorage.setItem("youtube_client_id", clientId);
  }

  const storedClientId = clientId || localStorage.getItem("youtube_client_id");
  if (!storedClientId) {
    throw new Error("Se necesita un Client ID de YouTube");
  }

  // For mobile apps, we use the implicit grant flow
  const redirectUri = window.location.origin + "/youtube-callback";
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(storedClientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent(YOUTUBE_SCOPES)}` +
    `&include_granted_scopes=true` +
    `&prompt=consent`;

  // Open auth window
  window.location.href = authUrl;
};

// Handle OAuth callback (call this from the callback route)
export const handleYoutubeCallback = async () => {
  const hash = window.location.hash;
  if (!hash.includes("access_token")) {
    return { success: false, error: "No access token found" };
  }

  // Parse the token from URL hash
  const params = new URLSearchParams(hash.replace("#", ""));
  const accessToken = params.get("access_token");
  const expiresIn = params.get("expires_in");

  if (!accessToken) {
    return { success: false, error: "Invalid access token" };
  }

  // Store the token
  const expiryTime = Date.now() + parseInt(expiresIn) * 1000;
  localStorage.setItem("youtube_access_token", accessToken);
  localStorage.setItem("youtube_token_expiry", expiryTime.toString());

  // Fetch channel info
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

// Upload video to YouTube
export const uploadToYoutube = async (videoBlob, metadata) => {
  try {
    const accessToken = localStorage.getItem("youtube_access_token");
    if (!accessToken) {
      return {
        success: false,
        error: "No estás conectado a YouTube. Ve a Cuenta y conecta tu canal.",
      };
    }

    // Check if token is expired (only for legacy flow)
    const expiry = localStorage.getItem("youtube_token_expiry");
    if (expiry && Date.now() >= parseInt(expiry)) {
      return {
        success: false,
        error:
          "Tu sesión de YouTube expiró. Reconecta tu cuenta en Configuración.",
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
        privacyStatus: privacyStatus, // 'private', 'public', 'unlisted'
        selfDeclaredMadeForKids: false,
      },
    };

    console.log("📤 Iniciando subida a YouTube...", { title, privacyStatus });

    // Step 1: Initialize resumable upload
    // Note: Content-Length is a forbidden header in fetch API — do NOT include it
    const initResponse = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": videoBlob.type || "video/mp4",
          // X-Upload-Content-Length is optional and can cause issues on some clients
        },
        body: JSON.stringify(videoMetadata),
        signal: AbortSignal.timeout(30000),
      },
    );

    if (!initResponse.ok) {
      const errorData = await initResponse.json().catch(() => ({}));
      console.error("❌ Error iniciando subida:", errorData);

      // Handle specific errors
      if (initResponse.status === 401) {
        return {
          success: false,
          error: "Tu sesión de YouTube expiró. Reconecta tu cuenta.",
        };
      }
      if (initResponse.status === 403) {
        return {
          success: false,
          error:
            "No tienes permisos para subir. Reconecta YouTube con los permisos correctos.",
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

    // Step 2: Upload the video content
    // Note: Content-Length is a FORBIDDEN header in fetch API — causes "Failed to fetch" on Android
    // The browser sets it automatically from the body
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": videoBlob.type || "video/mp4",
        // DO NOT set Content-Length here — forbidden header, causes fetch to fail
      },
      body: videoBlob,
      signal: AbortSignal.timeout(300000), // 5 min timeout for large video uploads
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      console.error("❌ Error subiendo video:", errorData);
      return {
        success: false,
        error: errorData.error?.message || "Error al subir el video a YouTube",
      };
    }

    const videoData = await uploadResponse.json();
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
        error: "La subida tardo demasiado. Intenta con un video mas corto o verifica tu conexion.",
      };
    }
    if (error.message?.includes("Failed to fetch")) {
      return {
        success: false,
        error: "No se pudo conectar con YouTube. Verifica tu conexion a internet e intenta de nuevo.",
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
  localStorage.removeItem("youtube_channel");
  localStorage.removeItem("youtube_client_id");
};

export default {
  isYoutubeConnected,
  getYoutubeChannel,
  connectYoutube,
  handleYoutubeCallback,
  uploadToYoutube,
  disconnectYoutube,
};
