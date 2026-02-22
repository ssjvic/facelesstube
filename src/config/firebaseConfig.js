// Firebase and Google OAuth Configuration
// Auto-generated for FacelessTube project

export const FIREBASE_CONFIG = {
    projectId: 'facelesstube-db635',
    projectNumber: '1034702874964',
    storageBucket: 'facelesstube-db635.appspot.com'
}

export const GOOGLE_OAUTH_CONFIG = {
    // Web Client ID - use this for OAuth flows
    webClientId: '1034702874964-tvoigpg67rdhd5vmniknkluo1md3bh26.apps.googleusercontent.com',

    // Android package info
    androidPackage: 'com.facelesstube.app',

    // OAuth scopes required for YouTube
    scopes: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly'
    ]
}

// Initialize config in localStorage on first load
export const initializeConfig = () => {
    // Set Web Client ID if not already set
    if (!localStorage.getItem('facelesstube_youtube_client_id')) {
        localStorage.setItem('facelesstube_youtube_client_id', GOOGLE_OAUTH_CONFIG.webClientId)
    }
    if (!localStorage.getItem('google_web_client_id')) {
        localStorage.setItem('google_web_client_id', GOOGLE_OAUTH_CONFIG.webClientId)
    }
    console.log('✅ FacelessTube config initialized')
}

export default {
    FIREBASE_CONFIG,
    GOOGLE_OAUTH_CONFIG,
    initializeConfig
}
