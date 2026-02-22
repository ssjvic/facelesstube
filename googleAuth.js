// Google Sign-In service for YouTube integration
// Uses @codetrix-studio/capacitor-google-auth plugin

import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'
import * as storage from './storage'

// Initialize Google Auth (call this on app start)
export const initGoogleAuth = async () => {
    try {
        await GoogleAuth.initialize({
            clientId: localStorage.getItem('google_web_client_id') || '',
            scopes: [
                'profile',
                'email',
                'https://www.googleapis.com/auth/youtube.upload',
                'https://www.googleapis.com/auth/youtube.readonly'
            ],
            grantOfflineAccess: true
        })
        console.log('✅ Google Auth initialized')
    } catch (error) {
        console.error('Error initializing Google Auth:', error)
    }
}

// Sign in with Google - shows native popup
export const signInWithGoogle = async () => {
    try {
        const user = await GoogleAuth.signIn()

        console.log('✅ Google Sign-In success:', user.email)

        // Save tokens
        if (user.authentication?.accessToken) {
            await storage.saveKey('youtube_access_token', user.authentication.accessToken)
            localStorage.setItem('youtube_access_token', user.authentication.accessToken)
        }

        if (user.authentication?.refreshToken) {
            await storage.saveKey('youtube_refresh_token', user.authentication.refreshToken)
        }

        // Save user info for display
        await storage.saveKey('youtube_email', user.email)
        await storage.saveKey('youtube_name', user.name || user.givenName || 'Canal')
        await storage.saveKey('youtube_photo', user.imageUrl || '')
        await storage.saveKey('youtube_connected', 'true')
        localStorage.setItem('youtube_connected', 'true')

        return {
            success: true,
            user: {
                email: user.email,
                name: user.name || user.givenName,
                photo: user.imageUrl,
                accessToken: user.authentication?.accessToken
            }
        }
    } catch (error) {
        console.error('Google Sign-In error:', error)
        return {
            success: false,
            error: error.message || 'Error al conectar con Google'
        }
    }
}

// Sign out
export const signOutGoogle = async () => {
    try {
        await GoogleAuth.signOut()

        // Clear stored tokens
        await storage.saveKey('youtube_access_token', '')
        await storage.saveKey('youtube_refresh_token', '')
        await storage.saveKey('youtube_connected', 'false')
        localStorage.setItem('youtube_connected', 'false')
        localStorage.removeItem('youtube_access_token')

        console.log('✅ Google Sign-Out success')
        return true
    } catch (error) {
        console.error('Sign out error:', error)
        return false
    }
}

// Check if user is connected
export const isConnected = async () => {
    const connected = await storage.loadKey('youtube_connected')
    return connected === 'true'
}

// Get connected user info
export const getConnectedUser = async () => {
    const connected = await isConnected()
    if (!connected) return null

    return {
        email: await storage.loadKey('youtube_email'),
        name: await storage.loadKey('youtube_name'),
        photo: await storage.loadKey('youtube_photo')
    }
}

// Get access token
export const getAccessToken = async () => {
    // Try to refresh if needed
    try {
        const result = await GoogleAuth.refresh()
        if (result.accessToken) {
            await storage.saveKey('youtube_access_token', result.accessToken)
            return result.accessToken
        }
    } catch (error) {
        console.log('Token refresh not available, using stored token')
    }

    return await storage.loadKey('youtube_access_token')
}

// Upload video to YouTube using access token
export const uploadVideoToYouTube = async (videoBlob, metadata) => {
    const accessToken = await getAccessToken()

    if (!accessToken) {
        return {
            success: false,
            error: 'No hay token de acceso. Conecta tu cuenta de YouTube primero.'
        }
    }

    try {
        // Create video metadata
        const videoMetadata = {
            snippet: {
                title: metadata.title || 'Video de FacelessTube',
                description: metadata.description || 'Creado con FacelessTube',
                tags: metadata.tags || ['FacelessTube'],
                categoryId: '22' // People & Blogs
            },
            status: {
                privacyStatus: metadata.privacyStatus || 'private',
                selfDeclaredMadeForKids: false
            }
        }

        // Create form data for upload
        const formData = new FormData()
        formData.append('metadata', new Blob([JSON.stringify(videoMetadata)], { type: 'application/json' }))
        formData.append('video', videoBlob, 'video.webm')

        // Upload to YouTube
        const response = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        })

        const result = await response.json()

        if (response.ok) {
            return {
                success: true,
                videoId: result.id,
                videoUrl: `https://youtube.com/watch?v=${result.id}`
            }
        } else {
            return {
                success: false,
                error: result.error?.message || 'Error al subir video'
            }
        }
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error de conexión'
        }
    }
}

export default {
    initGoogleAuth,
    signInWithGoogle,
    signOutGoogle,
    isConnected,
    getConnectedUser,
    getAccessToken,
    uploadVideoToYouTube
}
