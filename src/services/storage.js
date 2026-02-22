// Persistent storage service using Capacitor Preferences
// This survives app reinstalls on Android

import { Preferences } from '@capacitor/preferences'

// Keys for storage
const KEYS = {
    YOUTUBE_CLIENT_ID: 'youtube_client_id',
    YOUTUBE_ACCESS_TOKEN: 'youtube_access_token',
    VIDEOS: 'facelesstube_videos',
    THEME: 'facelesstube_theme',
}

// Save to both localStorage and Capacitor Preferences
export const saveKey = async (key, value) => {
    try {
        // Save to localStorage for web
        localStorage.setItem(key, value)

        // Save to Capacitor Preferences for native (persists across reinstalls)
        await Preferences.set({ key, value })

        console.log(`✅ Saved ${key}`)
        return true
    } catch (error) {
        console.error(`Error saving ${key}:`, error)
        return false
    }
}

// Load from Capacitor Preferences first, then localStorage
export const loadKey = async (key) => {
    try {
        // Try Capacitor Preferences first (more persistent on native)
        const { value } = await Preferences.get({ key })

        if (value) {
            // Also update localStorage to keep in sync
            localStorage.setItem(key, value)
            return value
        }

        // Fallback to localStorage
        return localStorage.getItem(key)
    } catch (error) {
        // If Capacitor fails (web), use localStorage
        console.log('Using localStorage fallback for:', key)
        return localStorage.getItem(key)
    }
}

// Load all API keys
export const loadAllKeys = async () => {
    const youtubeClientId = await loadKey(KEYS.YOUTUBE_CLIENT_ID)
    const youtubeAccessToken = await loadKey(KEYS.YOUTUBE_ACCESS_TOKEN)

    return {
        youtubeClientId,
        youtubeAccessToken,
    }
}

// Save API keys
export const saveYoutubeClientId = (id) => saveKey(KEYS.YOUTUBE_CLIENT_ID, id)
export const saveYoutubeAccessToken = (token) => saveKey(KEYS.YOUTUBE_ACCESS_TOKEN, token)

// ============ VIDEO STORAGE ============
// Save videos list (metadata only, no blobs)
export const saveVideos = async (videos) => {
    try {
        // Strip blobs before saving (can't serialize)
        const videosToSave = videos.map(v => ({
            ...v,
            blob: undefined,
            videoUrl: undefined // blob URLs don't persist
        }))
        const jsonStr = JSON.stringify(videosToSave)
        await saveKey(KEYS.VIDEOS, jsonStr)
        console.log(`✅ Saved ${videos.length} videos`)
        return true
    } catch (error) {
        console.error('Error saving videos:', error)
        return false
    }
}

// Load videos list
export const loadVideos = async () => {
    try {
        const jsonStr = await loadKey(KEYS.VIDEOS)
        if (jsonStr) {
            const videos = JSON.parse(jsonStr)
            console.log(`✅ Loaded ${videos.length} videos`)
            return videos
        }
        return []
    } catch (error) {
        console.error('Error loading videos:', error)
        return []
    }
}

// ============ THEME STORAGE ============
export const saveTheme = (theme) => saveKey(KEYS.THEME, theme)
export const loadTheme = () => loadKey(KEYS.THEME)

// ============ VIDEO FILE STORAGE ============
// Save video blob to device filesystem
export const saveVideoToDevice = async (videoId, blob) => {
    try {
        // Dynamic import to avoid issues on web
        const { Filesystem, Directory } = await import('@capacitor/filesystem')

        // Convert blob to base64
        const base64 = await blobToBase64(blob)

        // Save to app's documents directory
        const fileName = `video_${videoId}.webm`
        await Filesystem.writeFile({
            path: fileName,
            data: base64,
            directory: Directory.Documents,
        })

        console.log(`✅ Video saved to device: ${fileName}`)
        return { success: true, fileName }
    } catch (error) {
        console.error('Error saving video to device:', error)
        // Fallback: try to save smaller version or just metadata
        return { success: false, error: error.message }
    }
}

// Load video blob from device filesystem
export const loadVideoFromDevice = async (videoId) => {
    try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem')

        const fileName = `video_${videoId}.webm`
        const result = await Filesystem.readFile({
            path: fileName,
            directory: Directory.Documents,
        })

        // Convert base64 back to blob
        const blob = base64ToBlob(result.data, 'video/webm')
        const videoUrl = URL.createObjectURL(blob)

        console.log(`✅ Video loaded from device: ${fileName}`)
        return { success: true, blob, videoUrl }
    } catch (error) {
        console.log('Video not found on device:', videoId)
        return { success: false, error: error.message }
    }
}

// Delete video file from device
export const deleteVideoFromDevice = async (videoId) => {
    try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem')

        const fileName = `video_${videoId}.webm`
        await Filesystem.deleteFile({
            path: fileName,
            directory: Directory.Documents,
        })

        console.log(`✅ Video deleted from device: ${fileName}`)
        return true
    } catch (error) {
        console.log('Could not delete video:', error)
        return false
    }
}

// Share/Save video to device's Downloads folder (visible to user)
export const shareVideoToGallery = async (videoId, topic, blob) => {
    try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem')

        // Get the blob - either from parameter or load from storage
        let videoBlob = blob
        if (!videoBlob) {
            const loadResult = await loadVideoFromDevice(videoId)
            if (loadResult.success) {
                videoBlob = loadResult.blob
            } else {
                return { success: false, error: 'Video no encontrado en el dispositivo' }
            }
        }

        // Convert blob to base64
        const base64 = await blobToBase64Internal(videoBlob)

        // Create a clean filename
        const cleanTopic = topic ? topic.replace(/[^a-zA-Z0-9áéíóúñ\s]/gi, '').replace(/\s+/g, '_') : 'FacelessTube_Video'
        const fileName = `${cleanTopic}_${Date.now()}.webm`

        // Try to save to Downloads folder (visible to user)
        try {
            await Filesystem.writeFile({
                path: fileName,
                data: base64,
                directory: Directory.Documents, // Use Documents which is more accessible
            })

            // Get the file URI to share
            const fileInfo = await Filesystem.getUri({
                path: fileName,
                directory: Directory.Documents,
            })

            console.log(`✅ Video saved to: ${fileInfo.uri}`)
            return {
                success: true,
                message: `Video guardado en Documentos como:\n${fileName}`,
                uri: fileInfo.uri
            }
        } catch (writeError) {
            console.error('Write error:', writeError)
            return { success: false, error: writeError.message }
        }
    } catch (error) {
        console.error('Error sharing video:', error)
        return { success: false, error: error.message }
    }
}

// Helper function for base64 conversion (internal use)
const blobToBase64Internal = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]
            resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

// Helper: Convert blob to base64
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            // Remove the data URL prefix to get pure base64
            const base64 = reader.result.split(',')[1]
            resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

// Helper: Convert base64 to blob
const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
}

// Clear all keys (for logout)
export const clearAllKeys = async () => {
    try {
        localStorage.clear()
        await Preferences.clear()
        console.log('✅ Cleared all stored keys')
    } catch (error) {
        console.error('Error clearing keys:', error)
    }
}

export default {
    saveKey,
    loadKey,
    loadAllKeys,
    saveYoutubeClientId,
    saveYoutubeAccessToken,
    saveVideos,
    loadVideos,
    saveVideoToDevice,
    loadVideoFromDevice,
    deleteVideoFromDevice,
    shareVideoToGallery,
    saveTheme,
    loadTheme,
    clearAllKeys,
    KEYS,
}


