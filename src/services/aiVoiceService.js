// AI Voice Service - Usa Edge-TTS via Backend
// Genera voces de alta calidad usando el servidor backend
// Soporta múltiples idiomas y voces

const API_BASE = import.meta.env.VITE_API_URL || 'https://facelesstube-backend.onrender.com'

let isLoading = false
let loadProgress = 0
let currentLanguage = 'es'
let currentVoice = 'es-MX-DaliaNeural'
let availableVoices = []
let backendAvailable = null

// Voces predefinidas (se actualizan desde el backend)
const DEFAULT_VOICES = {
    es: [
        { id: 'es-MX-DaliaNeural', name: 'Dalia', gender: 'Female', accent: 'Mexico' },
        { id: 'es-MX-JorgeNeural', name: 'Jorge', gender: 'Male', accent: 'Mexico' },
        { id: 'es-ES-ElviraNeural', name: 'Elvira', gender: 'Female', accent: 'Spain' },
        { id: 'es-ES-AlvaroNeural', name: 'Alvaro', gender: 'Male', accent: 'Spain' },
    ],
    en: [
        { id: 'en-US-JennyNeural', name: 'Jenny', gender: 'Female', accent: 'US' },
        { id: 'en-US-GuyNeural', name: 'Guy', gender: 'Male', accent: 'US' },
        { id: 'en-GB-SoniaNeural', name: 'Sonia', gender: 'Female', accent: 'UK' },
        { id: 'en-GB-RyanNeural', name: 'Ryan', gender: 'Male', accent: 'UK' },
    ]
}

// Estado del servicio
export const AI_VOICE_STATUS = {
    NOT_LOADED: 'not_loaded',
    LOADING: 'loading',
    READY: 'ready',
    ERROR: 'error'
}

let status = AI_VOICE_STATUS.NOT_LOADED
let statusCallbacks = []

// Suscribirse a cambios de estado
export function subscribeToStatus(callback) {
    statusCallbacks.push(callback)
    return () => {
        statusCallbacks = statusCallbacks.filter(cb => cb !== callback)
    }
}

function notifyStatus(newStatus, progress = 0) {
    status = newStatus
    loadProgress = progress
    statusCallbacks.forEach(cb => cb({ status, progress }))
}

// Obtener idiomas disponibles
export function getAvailableLanguages() {
    return [
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' }
    ]
}

// Obtener voces disponibles para un idioma
export function getVoicesForLanguage(language = 'es') {
    return DEFAULT_VOICES[language] || DEFAULT_VOICES.es
}

// Verificar si el backend TTS está disponible
export async function checkTransformersAvailable() {
    if (backendAvailable !== null) {
        return backendAvailable
    }

    try {
        const response = await fetch(`${API_BASE}/health`, {
            method: 'GET',
            timeout: 5000
        })
        backendAvailable = response.ok
        return backendAvailable
    } catch (e) {
        console.warn('Backend TTS no disponible:', e.message)
        backendAvailable = false
        return false
    }
}

// Cargar el servicio de voz (verificar conexión al backend)
export async function loadAIVoiceModel(onProgress, language = 'es') {
    currentLanguage = language

    if (status === AI_VOICE_STATUS.READY) {
        return true
    }

    if (isLoading) {
        console.log('Ya verificando backend...')
        return false
    }

    try {
        isLoading = true
        notifyStatus(AI_VOICE_STATUS.LOADING, 0)
        onProgress?.('🔌 Conectando al servidor de voz...')

        // Verificar que el backend esté disponible
        const available = await checkTransformersAvailable()

        if (!available) {
            throw new Error('Servidor de voz no disponible')
        }

        notifyStatus(AI_VOICE_STATUS.LOADING, 50)
        onProgress?.('📥 Cargando voces disponibles...')

        // Obtener voces del backend
        try {
            const response = await fetch(`${API_BASE}/api/voices?language=${language}`)
            if (response.ok) {
                const data = await response.json()
                availableVoices = data.voices || []
            }
        } catch (e) {
            // Usar voces predefinidas si falla
            availableVoices = DEFAULT_VOICES[language] || DEFAULT_VOICES.es
        }

        // Establecer voz por defecto
        if (availableVoices.length > 0) {
            currentVoice = availableVoices[0].id
        }

        notifyStatus(AI_VOICE_STATUS.READY, 100)
        onProgress?.('✅ Servicio de voz listo!')
        isLoading = false

        console.log(`✅ Servicio de voz conectado. Voces: ${availableVoices.length}`)
        return true

    } catch (error) {
        console.error('Error conectando al servicio de voz:', error)
        notifyStatus(AI_VOICE_STATUS.ERROR, 0)
        onProgress?.('❌ Error conectando al servidor de voz')
        isLoading = false
        return false
    }
}

// Generar audio con el backend Edge-TTS
export async function generateAIVoice(text, onProgress, language = 'es', voiceId = null) {
    const voice = voiceId || currentVoice

    try {
        onProgress?.('🎙️ Generando voz...')

        const response = await fetch(`${API_BASE}/api/generate-audio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                voice_id: voice
            })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Error generando audio')
        }

        const result = await response.json()
        onProgress?.('📥 Descargando audio...')

        // Descargar el archivo de audio
        const audioResponse = await fetch(`${API_BASE}${result.audio_url}`)
        if (!audioResponse.ok) {
            throw new Error('Error descargando audio')
        }

        const audioBlob = await audioResponse.blob()
        onProgress?.('✅ Voz generada!')

        return audioBlob

    } catch (error) {
        console.error('Error generando voz:', error)
        throw error
    }
}

// Renderizar video completo con el backend
export async function renderVideoWithBackend(script, packId, voiceId, onProgress) {
    try {
        onProgress?.('🎬 Iniciando renderizado...')

        const response = await fetch(`${API_BASE}/api/render-video`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                script: script,
                pack_id: packId,
                voice_id: voiceId || currentVoice
            })
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'Error renderizando video')
        }

        const result = await response.json()
        onProgress?.('📥 Descargando video...')

        // Descargar el video
        const videoResponse = await fetch(`${API_BASE}${result.video_url}`)
        if (!videoResponse.ok) {
            throw new Error('Error descargando video')
        }

        const videoBlob = await videoResponse.blob()
        onProgress?.('✅ Video generado!')

        return {
            videoBlob,
            duration: result.duration,
            filename: result.filename
        }

    } catch (error) {
        console.error('Error renderizando video:', error)
        throw error
    }
}

// Obtener estado actual
export function getAIVoiceStatus() {
    return { status, progress: loadProgress, language: currentLanguage, voice: currentVoice }
}

// Verificar si está listo
export function isAIVoiceReady(language = 'es') {
    return status === AI_VOICE_STATUS.READY
}

// Establecer voz actual
export function setCurrentVoice(voiceId) {
    currentVoice = voiceId
}

// Obtener voz actual
export function getCurrentVoice() {
    return currentVoice
}

// Limpiar recursos
export function disposeAIVoice() {
    status = AI_VOICE_STATUS.NOT_LOADED
    loadProgress = 0
    backendAvailable = null
    notifyStatus(AI_VOICE_STATUS.NOT_LOADED, 0)
}

export default {
    loadAIVoiceModel,
    generateAIVoice,
    renderVideoWithBackend,
    getAIVoiceStatus,
    isAIVoiceReady,
    disposeAIVoice,
    checkTransformersAvailable,
    subscribeToStatus,
    getAvailableLanguages,
    getVoicesForLanguage,
    setCurrentVoice,
    getCurrentVoice,
    AI_VOICE_STATUS
}
