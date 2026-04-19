// Google Sign-In service for YouTube integration
// Uses @capacitor-firebase/authentication plugin with proper scope handling
// Token exchange happens server-side via backend /api/youtube/exchange-token

import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { Capacitor } from '@capacitor/core'
import * as storage from './storage'

const YOUTUBE_SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly'
]

// Web Client ID from google-services.json (client_type: 3)
const WEB_CLIENT_ID = '1034702874964-tvoigpg67rdhd5vmniknkluo1md3bh26.apps.googleusercontent.com'

// Backend URL for token exchange
const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://facelesstube-backend.onrender.com'

// Initialize Firebase Auth (call this on app start)
export const initGoogleAuth = async () => {
    try {
        const platform = Capacitor.getPlatform()
        console.log('🔄 Platform detected:', platform)
        console.log('✅ Firebase Auth ready')
        return true
    } catch (error) {
        console.error('❌ Error initializing Firebase Auth:', error)
        return false
    }
}

// Exchange serverAuthCode for a real YouTube access_token via backend
async function exchangeServerAuthCode(serverAuthCode) {
    try {
        console.log('🔄 Exchanging serverAuthCode via backend...')
        const response = await fetch(`${BACKEND_URL}/api/youtube/exchange-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ server_auth_code: serverAuthCode }),
            signal: AbortSignal.timeout(30000),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('❌ Token exchange failed:', response.status, errorData)
            return null
        }

        const data = await response.json()
        if (data.success && data.access_token) {
            console.log('✅ Token exchange success! scope:', data.scope)
            return {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: data.expires_in,
            }
        }
        return null
    } catch (error) {
        console.error('❌ Token exchange error:', error)
        return null
    }
}

// Refresh an expired access_token using the stored refresh_token
async function refreshAccessToken(refreshToken) {
    try {
        console.log('🔄 Refreshing YouTube access token...')
        const response = await fetch(`${BACKEND_URL}/api/youtube/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
            signal: AbortSignal.timeout(15000),
        })

        if (!response.ok) {
            console.error('❌ Token refresh failed:', response.status)
            return null
        }

        const data = await response.json()
        if (data.success && data.access_token) {
            console.log('✅ Token refresh success, expires_in:', data.expires_in)

            // Save the new access token
            const expiresAt = Date.now() + (data.expires_in * 1000)
            await storage.saveKey('youtube_access_token', data.access_token)
            await storage.saveKey('youtube_token_expires_at', String(expiresAt))
            localStorage.setItem('youtube_access_token', data.access_token)
            localStorage.setItem('youtube_token_expires_at', String(expiresAt))

            return data.access_token
        }
        return null
    } catch (error) {
        console.error('❌ Token refresh error:', error)
        return null
    }
}

// Sign in with Google - shows native popup and gets YouTube access token
export const signInWithGoogle = async () => {
    try {
        console.log('🔄 Starting Google Sign-In with Firebase...')
        console.log('📝 Requesting scopes:', YOUTUBE_SCOPES)

        // Sign in with Google using Firebase
        // IMPORTANT: useCredentialManager: false forces legacy GoogleSignInClient
        // which is more reliable on devices like Honor 200 with Android 15
        const nativeSignInPromise = FirebaseAuthentication.signInWithGoogle({
            scopes: YOUTUBE_SCOPES,
            webClientId: WEB_CLIENT_ID,
            useCredentialManager: false,  // Force legacy Google Sign-In API
        })

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT: Google Sign-In native UI did not respond after 30s.')), 30000)
        )

        // Race against timeout
        const result = await Promise.race([nativeSignInPromise, timeoutPromise])

        console.log('✅ Firebase Sign-In result received')

        const user = result.user
        const credential = result.credential

        if (!user && !credential) {
            throw new Error('No se recibió información del usuario ni credenciales')
        }

        // === TOKEN ACQUISITION STRATEGY ===
        // Priority: serverAuthCode (exchange) > credential.accessToken > fallback
        let accessToken = null
        let refreshToken = null
        let serverAuthCode = credential?.serverAuthCode || null

        // 1. If we have serverAuthCode, exchange it for a REAL YouTube access_token
        //    This is the correct flow — the backend uses GOOGLE_CLIENT_SECRET to get
        //    an access_token with youtube.upload scope
        if (serverAuthCode) {
            console.log('✅ Got serverAuthCode — exchanging for YouTube access_token...')
            const exchangeResult = await exchangeServerAuthCode(serverAuthCode)
            if (exchangeResult) {
                accessToken = exchangeResult.access_token
                refreshToken = exchangeResult.refresh_token
                console.log('✅ Got real YouTube access_token via exchange!')
            } else {
                console.warn('⚠️ Server auth code exchange failed')
            }
        }

        // 2. If exchange didn't work, try credential.accessToken (may have limited scopes)
        if (!accessToken && credential?.accessToken) {
            accessToken = credential.accessToken
            console.log('⚠️ Using credential.accessToken (may not have YouTube scopes)')
        }

        // 3. Last resort: Firebase ID token (very limited, won't upload to YouTube)
        if (!accessToken) {
            try {
                const tokenResult = await FirebaseAuthentication.getIdToken()
                if (tokenResult.token) {
                    accessToken = tokenResult.token
                    console.log('⚠️ Using Firebase ID token as last resort — YouTube upload will NOT work')
                }
            } catch (tokenError) {
                console.log('⚠️ Could not get ID token:', tokenError)
            }
        }

        // Extract user info
        let userEmail = user?.email || ''
        let userName = user?.displayName || 'Canal YouTube'
        let userPhoto = user?.photoUrl || ''

        // Try to decode idToken to get email if user is null
        if (!userEmail && credential?.idToken) {
            try {
                const payload = credential.idToken.split('.')[1]
                const decoded = JSON.parse(atob(payload))
                userEmail = decoded.email || ''
                userName = decoded.name || userName
                userPhoto = decoded.picture || userPhoto
            } catch (e) {
                console.log('⚠️ Could not decode idToken:', e)
            }
        }

        // Save tokens and user info
        if (accessToken) {
            const expiresAt = Date.now() + (3600 * 1000) // Default 1 hour
            await storage.saveKey('youtube_access_token', accessToken)
            await storage.saveKey('youtube_token_expires_at', String(expiresAt))
            localStorage.setItem('youtube_access_token', accessToken)
            localStorage.setItem('youtube_token_expires_at', String(expiresAt))
        }

        if (refreshToken) {
            await storage.saveKey('youtube_refresh_token', refreshToken)
            localStorage.setItem('youtube_refresh_token', refreshToken)
        }

        if (credential?.idToken) {
            await storage.saveKey('youtube_id_token', credential.idToken)
            localStorage.setItem('youtube_id_token', credential.idToken)
        }

        await storage.saveKey('youtube_email', userEmail)
        await storage.saveKey('youtube_name', userName)
        await storage.saveKey('youtube_photo', userPhoto)
        await storage.saveKey('youtube_connected', 'true')
        localStorage.setItem('youtube_connected', 'true')

        console.log('✅ Google Sign-In success:', userEmail || 'connected')
        console.log('📋 Token info:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            hasServerAuthCode: !!serverAuthCode,
            tokenExchanged: !!serverAuthCode && !!refreshToken,
        })

        return {
            success: true,
            user: {
                email: userEmail,
                name: userName,
                photo: userPhoto,
                accessToken: accessToken,
                idToken: credential?.idToken
            }
        }
    } catch (error) {
        console.error('❌ Google Sign-In FULL ERROR:', error)

        let errorDetails = 'Error desconocido'
        let errorHelp = ''

        if (error) {
            const errorCode = error.code || ''
            const errorMessage = error.message || ''

            if (errorCode === '10' || errorMessage.includes('10')) {
                errorDetails = 'Error de configuración (Código 10)'
                errorHelp = 'Verifica que el SHA-1 de tu app esté registrado en Firebase Console'
            } else if (errorCode === '12501' || errorMessage.includes('12501')) {
                errorDetails = 'Inicio de sesión cancelado'
                errorHelp = ''
            } else if (errorCode === '12500' || errorMessage.includes('12500')) {
                errorDetails = 'Error de inicio de sesión (Código 12500)'
                errorHelp = 'Intenta de nuevo. Si persiste, verifica tu conexión a internet.'
            } else if (errorCode === '7' || errorMessage.includes('NETWORK_ERROR')) {
                errorDetails = 'Error de red'
                errorHelp = 'Verifica tu conexión a internet'
            } else if (typeof error === 'string') {
                errorDetails = error
            } else if (error.message) {
                errorDetails = error.message
                if (error.code) {
                    errorDetails += ` (Código: ${error.code})`
                }
            } else if (error.code) {
                errorDetails = `Código de error: ${error.code}`
            } else {
                errorDetails = JSON.stringify(error)
            }
        }

        return {
            success: false,
            error: errorDetails,
            errorHelp: errorHelp,
            fullError: JSON.stringify(error)
        }
    }
}

// Sign out
export const signOutGoogle = async () => {
    try {
        await FirebaseAuthentication.signOut()

        // Clear stored tokens
        await storage.saveKey('youtube_access_token', '')
        await storage.saveKey('youtube_refresh_token', '')
        await storage.saveKey('youtube_token_expires_at', '')
        await storage.saveKey('youtube_server_auth_code', '')
        await storage.saveKey('youtube_connected', 'false')
        localStorage.setItem('youtube_connected', 'false')
        localStorage.removeItem('youtube_access_token')
        localStorage.removeItem('youtube_refresh_token')
        localStorage.removeItem('youtube_token_expires_at')

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

// Get access token — auto-refreshes if expired
export const getAccessToken = async () => {
    // First try to get from storage
    let token = await storage.loadKey('youtube_access_token')
    if (!token) token = localStorage.getItem('youtube_access_token')

    if (!token) return null

    // Check expiration
    let expiresAt = await storage.loadKey('youtube_token_expires_at')
    if (!expiresAt) expiresAt = localStorage.getItem('youtube_token_expires_at')

    if (expiresAt && Date.now() >= parseInt(expiresAt)) {
        console.log('⚠️ YouTube access token expired, attempting refresh...')

        // Try refresh token
        let rToken = await storage.loadKey('youtube_refresh_token')
        if (!rToken) rToken = localStorage.getItem('youtube_refresh_token')

        if (rToken) {
            const newToken = await refreshAccessToken(rToken)
            if (newToken) return newToken
        }

        // If refresh failed, try Firebase getIdToken as last resort
        try {
            const currentUser = await FirebaseAuthentication.getCurrentUser()
            if (currentUser.user) {
                const tokenResult = await FirebaseAuthentication.getIdToken({ forceRefresh: true })
                if (tokenResult.token) {
                    await storage.saveKey('youtube_access_token', tokenResult.token)
                    console.log('⚠️ Using refreshed Firebase ID token (limited YouTube functionality)')
                    return tokenResult.token
                }
            }
        } catch (error) {
            console.log('Token refresh not available, token expired')
        }

        return null // Token expired and couldn't refresh
    }

    return token
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

        console.log('📤 Uploading to YouTube...', {
            title: videoMetadata.snippet.title,
            blobSize: videoBlob.size,
        })

        // Step 1: Initialize resumable upload
        const initResponse = await fetch(
            'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Upload-Content-Type': videoBlob.type || 'video/mp4',
                },
                body: JSON.stringify(videoMetadata),
                signal: AbortSignal.timeout(30000),
            }
        )

        if (!initResponse.ok) {
            const errorData = await initResponse.json().catch(() => ({}))
            console.error('❌ YouTube init upload error:', initResponse.status, errorData)

            if (initResponse.status === 401) {
                // Token invalid/expired — clear it
                localStorage.removeItem('youtube_access_token')
                return {
                    success: false,
                    error: 'Tu sesión de YouTube expiró. Reconecta tu cuenta en Mi Cuenta.'
                }
            }
            if (initResponse.status === 403) {
                return {
                    success: false,
                    error: 'No tienes permisos para subir. Desconecta y reconecta tu canal de YouTube.'
                }
            }

            return {
                success: false,
                error: errorData.error?.message || 'Error al iniciar la subida a YouTube'
            }
        }

        const uploadUrl = initResponse.headers.get('Location')
        if (!uploadUrl) {
            return {
                success: false,
                error: 'No se pudo obtener la URL de subida de YouTube'
            }
        }

        // Step 2: Upload video content via XHR (for progress tracking on Android)
        console.log('📤 Uploading video content...', { size: videoBlob.size })

        const uploadResult = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100)
                    console.log(`📤 Upload progress: ${percent}%`)
                }
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText)
                        resolve(response)
                    } catch (e) {
                        reject(new Error('Invalid response from YouTube'))
                    }
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`))
                }
            }

            xhr.onerror = () => reject(new Error('Upload network error'))
            xhr.ontimeout = () => reject(new Error('Upload timeout'))
            xhr.timeout = 300000 // 5 min timeout

            xhr.open('PUT', uploadUrl)
            xhr.setRequestHeader('Content-Type', videoBlob.type || 'video/mp4')
            xhr.send(videoBlob)
        })

        console.log('✅ Video uploaded:', uploadResult.id)
        return {
            success: true,
            videoId: uploadResult.id,
            videoUrl: `https://youtube.com/watch?v=${uploadResult.id}`
        }

    } catch (error) {
        console.error('❌ Upload error:', error)

        if (error.message?.includes('Failed to fetch')) {
            return {
                success: false,
                error: 'No se pudo conectar con YouTube. Verifica tu conexión a internet.'
            }
        }

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
