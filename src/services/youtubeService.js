// YouTube API Service
// OAuth2 authentication and video upload

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'
const YOUTUBE_UPLOAD_URL = 'https://www.googleapis.com/upload/youtube/v3/videos'

// OAuth config - user needs to set these
const getOAuthConfig = () => ({
    clientId: localStorage.getItem('facelesstube_youtube_client_id') || '',
    redirectUri: window.location.origin + '/auth/youtube/callback'
})

export const setYouTubeClientId = (clientId) => {
    localStorage.setItem('facelesstube_youtube_client_id', clientId)
}

export const hasYouTubeConfig = () => {
    return !!localStorage.getItem('facelesstube_youtube_client_id')
}

// Get stored tokens
const getTokens = () => {
    const stored = localStorage.getItem('facelesstube_youtube_tokens')
    return stored ? JSON.parse(stored) : null
}

const setTokens = (tokens) => {
    localStorage.setItem('facelesstube_youtube_tokens', JSON.stringify(tokens))
}

export const clearTokens = () => {
    localStorage.removeItem('facelesstube_youtube_tokens')
}

// Check if connected
export const isYouTubeConnected = () => {
    const tokens = getTokens()
    if (!tokens) return false

    // Check if token is expired
    if (tokens.expiresAt && Date.now() > tokens.expiresAt) {
        return false
    }

    return true
}

// Start OAuth flow
export const startOAuthFlow = () => {
    const { clientId, redirectUri } = getOAuthConfig()

    if (!clientId) {
        throw new Error('YouTube Client ID not configured')
    }

    const scope = [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly'
    ].join(' ')

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'token',
        scope,
        include_granted_scopes: 'true',
        state: crypto.randomUUID()
    })

    // Open OAuth popup
    const width = 600
    const height = 700
    const left = (window.innerWidth - width) / 2
    const top = (window.innerHeight - height) / 2

    const popup = window.open(
        `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
        'YouTube OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
    )

    return new Promise((resolve, reject) => {
        // Listen for callback
        const handleMessage = (event) => {
            if (event.origin !== window.location.origin) return

            if (event.data.type === 'youtube_oauth_success') {
                window.removeEventListener('message', handleMessage)
                setTokens(event.data.tokens)
                resolve(event.data.tokens)
            } else if (event.data.type === 'youtube_oauth_error') {
                window.removeEventListener('message', handleMessage)
                reject(new Error(event.data.error))
            }
        }

        window.addEventListener('message', handleMessage)

        // Check if popup was closed
        const checkClosed = setInterval(() => {
            if (popup?.closed) {
                clearInterval(checkClosed)
                window.removeEventListener('message', handleMessage)
                reject(new Error('OAuth cancelled'))
            }
        }, 500)
    })
}

// Handle OAuth callback (call this on callback page)
export const handleOAuthCallback = () => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    const accessToken = params.get('access_token')
    const expiresIn = params.get('expires_in')

    if (accessToken) {
        const tokens = {
            accessToken,
            expiresAt: Date.now() + (parseInt(expiresIn) * 1000)
        }

        // Send to parent window
        if (window.opener) {
            window.opener.postMessage({
                type: 'youtube_oauth_success',
                tokens
            }, window.location.origin)
            window.close()
        }
    } else {
        const error = params.get('error') || 'Unknown error'
        if (window.opener) {
            window.opener.postMessage({
                type: 'youtube_oauth_error',
                error
            }, window.location.origin)
            window.close()
        }
    }
}

// Get channel info
export const getChannelInfo = async () => {
    const tokens = getTokens()
    if (!tokens) throw new Error('Not authenticated')

    const response = await fetch(
        `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&mine=true`,
        {
            headers: {
                'Authorization': `Bearer ${tokens.accessToken}`
            }
        }
    )

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to get channel info')
    }

    const data = await response.json()
    return data.items?.[0] || null
}

// Upload video
export const uploadVideo = async (videoBlob, metadata, onProgress) => {
    const tokens = getTokens()
    if (!tokens) throw new Error('Not authenticated')

    const {
        title,
        description,
        tags = [],
        categoryId = '22', // People & Blogs
        privacyStatus = 'private'
    } = metadata

    // Create video metadata
    const videoMetadata = {
        snippet: {
            title: title.substring(0, 100),
            description: description.substring(0, 5000),
            tags: tags.slice(0, 500),
            categoryId
        },
        status: {
            privacyStatus,
            selfDeclaredMadeForKids: false
        }
    }

    // Resumable upload
    const initResponse = await fetch(
        `${YOUTUBE_UPLOAD_URL}?uploadType=resumable&part=snippet,status`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokens.accessToken}`,
                'Content-Type': 'application/json',
                'X-Upload-Content-Length': videoBlob.size,
                'X-Upload-Content-Type': videoBlob.type || 'video/webm'
            },
            body: JSON.stringify(videoMetadata)
        }
    )

    if (!initResponse.ok) {
        const error = await initResponse.json()
        throw new Error(error.error?.message || 'Failed to initialize upload')
    }

    const uploadUrl = initResponse.headers.get('Location')

    // Upload video content
    const xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                const percent = (e.loaded / e.total) * 100
                onProgress(percent)
            }
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText)
                resolve(response)
            } else {
                reject(new Error('Upload failed'))
            }
        }

        xhr.onerror = () => reject(new Error('Upload error'))

        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Authorization', `Bearer ${tokens.accessToken}`)
        xhr.setRequestHeader('Content-Type', videoBlob.type || 'video/webm')
        xhr.send(videoBlob)
    })
}

// Set thumbnail
export const setThumbnail = async (videoId, thumbnailBlob) => {
    const tokens = getTokens()
    if (!tokens) throw new Error('Not authenticated')

    const response = await fetch(
        `${YOUTUBE_API_BASE}/thumbnails/set?videoId=${videoId}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokens.accessToken}`,
                'Content-Type': thumbnailBlob.type || 'image/png'
            },
            body: thumbnailBlob
        }
    )

    if (!response.ok) {
        console.warn('Thumbnail upload failed - may need verified account')
    }

    return response.ok
}
