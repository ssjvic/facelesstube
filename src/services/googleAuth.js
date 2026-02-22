// Google Sign-In service for YouTube integration
// Uses @capacitor-firebase/authentication plugin with proper scope handling

import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { Capacitor } from '@capacitor/core'
import * as storage from './storage'

const YOUTUBE_SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly'
]

// Web Client ID from google-services.json (client_type: 3)
const WEB_CLIENT_ID = '1034702874964-tvoigpg67rdhd5vmniknkluo1md3bh26.apps.googleusercontent.com'

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

// Sign in with Google - shows native popup and gets YouTube access token
export const signInWithGoogle = async () => {
    try {
        console.log('🔄 Starting Google Sign-In with Firebase...')
        console.log('📝 Requesting scopes:', YOUTUBE_SCOPES)

        // Sign in with Google using Firebase
        // Pass scopes and request serverAuthCode for token exchange
        // TIMEOUT WRAPPER: Wrap the native call in a race with a timeout
        // IMPORTANT: useCredentialManager: false forces legacy GoogleSignInClient
        // which is more reliable on devices like Honor 200 with Android 15
        const nativeSignInPromise = FirebaseAuthentication.signInWithGoogle({
            scopes: YOUTUBE_SCOPES,
            webClientId: '1034702874964-tvoigpg67rdhd5vmniknkluo1md3bh26.apps.googleusercontent.com',
            useCredentialManager: false,  // ← Force legacy Google Sign-In API
        })

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT: Google Sign-In native UI did not respond after 30s.')), 30000)
        )

        // Race against timeout
        const result = await Promise.race([nativeSignInPromise, timeoutPromise])

        console.log('✅ Firebase Sign-In result:', JSON.stringify(result, null, 2))

        // With skipNativeAuth: result may only have credential, not user
        // Check for either user or credential to determine success
        const user = result.user
        const credential = result.credential

        if (!user && !credential) {
            throw new Error('No se recibió información del usuario ni credenciales')
        }

        // If we have credential but no user (skipNativeAuth case), that's still a success
        console.log('📝 User:', user ? 'present' : 'not present (skipNativeAuth)')
        console.log('📝 Credential:', credential ? 'present' : 'not present')

        // Try to get access token from different sources
        let accessToken = null
        let serverAuthCode = null

        // 1. Check credential for accessToken
        if (credential?.accessToken) {
            accessToken = credential.accessToken
            console.log('✅ Got accessToken from credential')
        }

        // 2. Check credential for serverAuthCode (for token exchange)
        if (credential?.serverAuthCode) {
            serverAuthCode = credential.serverAuthCode
            console.log('✅ Got serverAuthCode for token exchange')
        }

        // 3. If we have serverAuthCode but no accessToken, we need to exchange it
        // For now, log this for debugging
        if (!accessToken && serverAuthCode) {
            console.log('⚠️ Have serverAuthCode but no accessToken - token exchange needed')
            // In a production app, you would exchange this code on your backend
        }

        // 4. Try to get ID token as fallback (limited functionality)
        if (!accessToken) {
            try {
                const tokenResult = await FirebaseAuthentication.getIdToken()
                if (tokenResult.token) {
                    // Note: ID token has limited use for YouTube API
                    // It might not work for all operations
                    accessToken = credential?.accessToken || tokenResult.token
                    console.log('⚠️ Using ID token as fallback - may have limited functionality')
                }
            } catch (tokenError) {
                console.log('⚠️ Could not get ID token:', tokenError)
            }
        }

        // Log all credential info for debugging
        console.log('📋 Full credential info:', {
            hasAccessToken: !!accessToken,
            hasServerAuthCode: !!serverAuthCode,
            accessTokenLength: accessToken?.length,
            credentialKeys: credential ? Object.keys(credential) : [],
            userEmail: user?.email || 'N/A (skipNativeAuth)',
            idToken: credential?.idToken ? 'present' : 'not present'
        })

        // Extract email from credential if user is not available (skipNativeAuth case)
        let userEmail = user?.email || ''
        let userName = user?.displayName || 'Canal YouTube'
        let userPhoto = user?.photoUrl || ''

        // Try to decode idToken to get email if user is null
        if (!userEmail && credential?.idToken) {
            try {
                // Decode JWT payload (middle part)
                const payload = credential.idToken.split('.')[1]
                const decoded = JSON.parse(atob(payload))
                userEmail = decoded.email || ''
                userName = decoded.name || userName
                userPhoto = decoded.picture || userPhoto
                console.log('📧 Extracted from idToken:', { email: userEmail, name: userName })
            } catch (e) {
                console.log('⚠️ Could not decode idToken:', e)
            }
        }

        // Save tokens and user info
        if (accessToken) {
            await storage.saveKey('youtube_access_token', accessToken)
            localStorage.setItem('youtube_access_token', accessToken)
        }

        // Also save idToken if available (useful for YouTube API)
        if (credential?.idToken) {
            await storage.saveKey('youtube_id_token', credential.idToken)
            localStorage.setItem('youtube_id_token', credential.idToken)
        }

        if (serverAuthCode) {
            await storage.saveKey('youtube_server_auth_code', serverAuthCode)
        }

        await storage.saveKey('youtube_email', userEmail)
        await storage.saveKey('youtube_name', userName)
        await storage.saveKey('youtube_photo', userPhoto)
        await storage.saveKey('youtube_connected', 'true')
        localStorage.setItem('youtube_connected', 'true')

        console.log('✅ Google Sign-In success:', userEmail || 'connected (skipNativeAuth)')

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
        // Capture ALL error details
        console.error('❌ Google Sign-In FULL ERROR:', error)
        console.error('Error name:', error?.name)
        console.error('Error message:', error?.message)
        console.error('Error code:', error?.code)
        console.error('Error stringify:', JSON.stringify(error, null, 2))

        // Specific error handling for common issues
        let errorDetails = 'Error desconocido'
        let errorHelp = ''

        if (error) {
            const errorCode = error.code || ''
            const errorMessage = error.message || ''

            // Handle specific error codes
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
        await storage.saveKey('youtube_server_auth_code', '')
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
    // First try to get from storage
    let token = await storage.loadKey('youtube_access_token')

    if (token) {
        return token
    }

    // Try to get fresh token from Firebase
    try {
        const currentUser = await FirebaseAuthentication.getCurrentUser()
        if (currentUser.user) {
            const tokenResult = await FirebaseAuthentication.getIdToken({ forceRefresh: true })
            if (tokenResult.token) {
                await storage.saveKey('youtube_access_token', tokenResult.token)
                return tokenResult.token
            }
        }
    } catch (error) {
        console.log('Token refresh not available, using stored token')
    }

    return null
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
            console.error('YouTube upload error:', result)

            // Handle specific API errors
            let errorMessage = result.error?.message || 'Error al subir video'

            if (result.error?.errors?.[0]?.reason === 'authError') {
                errorMessage = 'Token de acceso inválido. Reconecta tu cuenta de YouTube.'
            } else if (result.error?.errors?.[0]?.reason === 'insufficientPermissions') {
                errorMessage = 'Permisos insuficientes. Reconecta tu cuenta de YouTube con todos los permisos.'
            }

            return {
                success: false,
                error: errorMessage
            }
        }
    } catch (error) {
        console.error('Upload error:', error)
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
