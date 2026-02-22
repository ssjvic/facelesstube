// Web Speech API Service for Text-to-Speech
// 100% free, works in browser

// Available voices cache
let cachedVoices = []

// Get available voices
export const getVoices = () => {
    return new Promise((resolve) => {
        const voices = speechSynthesis.getVoices()
        if (voices.length > 0) {
            cachedVoices = voices
            resolve(voices)
            return
        }

        speechSynthesis.onvoiceschanged = () => {
            cachedVoices = speechSynthesis.getVoices()
            resolve(cachedVoices)
        }

        // Fallback timeout
        setTimeout(() => resolve(cachedVoices), 1000)
    })
}

// Filter voices by language
export const getVoicesByLanguage = async (langCode) => {
    const voices = await getVoices()
    const langMap = {
        'es': ['es-ES', 'es-MX', 'es-US', 'es-AR', 'es'],
        'en': ['en-US', 'en-GB', 'en-AU', 'en'],
        'pt': ['pt-BR', 'pt-PT', 'pt']
    }

    const patterns = langMap[langCode] || [langCode]
    return voices.filter(v =>
        patterns.some(p => v.lang.startsWith(p) || v.lang.includes(p))
    )
}

// Get recommended voices for video narration
export const getRecommendedVoices = async (langCode) => {
    const voices = await getVoicesByLanguage(langCode)

    // Prioritize Google/Microsoft voices for quality
    const sorted = voices.sort((a, b) => {
        const aScore = (a.name.includes('Google') ? 10 : 0) +
            (a.name.includes('Microsoft') ? 8 : 0) +
            (a.name.includes('Premium') ? 5 : 0)
        const bScore = (b.name.includes('Google') ? 10 : 0) +
            (b.name.includes('Microsoft') ? 8 : 0) +
            (b.name.includes('Premium') ? 5 : 0)
        return bScore - aScore
    })

    // Separate male/female voices
    const female = sorted.filter(v =>
        v.name.toLowerCase().includes('female') ||
        v.name.includes('Paulina') ||
        v.name.includes('Sabina') ||
        v.name.includes('Helena') ||
        v.name.includes('Laura') ||
        v.name.includes('Maria') ||
        v.name.includes('Zira')
    )

    const male = sorted.filter(v =>
        v.name.toLowerCase().includes('male') ||
        v.name.includes('Pablo') ||
        v.name.includes('Jorge') ||
        v.name.includes('Daniel') ||
        v.name.includes('David') ||
        v.name.includes('Mark')
    )

    return {
        female: female.length > 0 ? female : sorted.slice(0, 2),
        male: male.length > 0 ? male : sorted.slice(2, 4),
        all: sorted
    }
}

// Speak text (for preview)
export const speak = (text, voice = null, rate = 1.0, pitch = 1.0) => {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error('Speech synthesis not supported'))
            return
        }

        // Cancel any ongoing speech
        speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)

        if (voice) {
            utterance.voice = voice
        }

        utterance.rate = rate
        utterance.pitch = pitch
        utterance.volume = 1.0

        utterance.onend = () => resolve()
        utterance.onerror = (e) => reject(e)

        speechSynthesis.speak(utterance)
    })
}

// Generate audio blob from text (for video composition)
export const generateAudioBlob = async (text, voice = null, rate = 0.9) => {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error('Speech synthesis not supported'))
            return
        }

        // For now, we'll use MediaRecorder to capture system audio
        // This is a workaround since Web Speech API doesn't provide audio data directly

        const utterance = new SpeechSynthesisUtterance(text)

        if (voice) {
            utterance.voice = voice
        }

        utterance.rate = rate
        utterance.pitch = 1.0

        // Calculate approximate duration
        const wordCount = text.split(/\s+/).length
        const duration = (wordCount / 150) * 60 * 1000 / rate // ~150 words per minute

        utterance.onend = () => {
            resolve({
                duration: duration,
                text: text,
                // Audio will be captured during video composition
                captureRequired: true
            })
        }

        utterance.onerror = (e) => reject(e)

        speechSynthesis.speak(utterance)
    })
}

// Stop speaking
export const stopSpeaking = () => {
    speechSynthesis.cancel()
}

// Check if speaking
export const isSpeaking = () => {
    return speechSynthesis.speaking
}
