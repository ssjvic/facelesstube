// Pexels API Service for stock videos
// Routes through backend (Render USA) — users don't need their own API key

const API_BASE = import.meta.env.VITE_API_URL || 'https://facelesstube-backend.onrender.com'

// No longer needed — backend handles the key
export const setPexelsApiKey = () => { }
export const hasPexelsApiKey = () => true // Always available via backend

// Search for videos via backend proxy
export const searchVideos = async (query, options = {}) => {
    const {
        perPage = 15,
        page = 1,
        orientation = 'portrait', // portrait for YouTube Shorts / vertical
    } = options

    const params = new URLSearchParams({
        query,
        per_page: perPage,
        orientation,
        type: 'videos'
    })

    try {
        const response = await fetch(`${API_BASE}/api/pexels/search?${params}`)

        if (!response.ok) {
            const err = await response.json().catch(() => ({}))
            throw new Error(err.detail || 'Error en la API de Videos')
        }

        const data = await response.json()
        return data.videos || []
    } catch (error) {
        console.error('Pexels error:', error)
        throw error
    }
}

// Get random videos for a topic (with variety)
export const getRandomVideos = async (searchTerms, count = 5) => {
    const allVideos = []

    for (const term of searchTerms) {
        try {
            const videos = await searchVideos(term, { perPage: 10 })
            allVideos.push(...videos)
        } catch (e) {
            console.warn(`Failed to search for "${term}":`, e)
        }
    }

    // Shuffle and pick random videos
    const shuffled = allVideos.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}

// Get best video file for our needs
export const getBestVideoFile = (video, targetWidth = 1080) => {
    if (!video?.video_files?.length) return null

    // Sort by quality (prefer HD)
    const sorted = video.video_files.sort((a, b) => {
        const aScore = Math.abs(a.width - targetWidth)
        const bScore = Math.abs(b.width - targetWidth)
        return aScore - bScore
    })

    // Prefer mp4
    const mp4 = sorted.find(f => f.file_type === 'video/mp4')
    return mp4 || sorted[0]
}

// Download video file as blob
export const downloadVideo = async (videoUrl) => {
    try {
        const response = await fetch(videoUrl)
        if (!response.ok) throw new Error('Failed to download video')
        return await response.blob()
    } catch (error) {
        console.error('Download error:', error)
        throw error
    }
}

// Get curated background video categories
export const getBackgroundCategories = () => [
    { id: 'gameplay', label: 'Gameplay', terms: ['minecraft gameplay', 'gta gameplay', 'subway surfers'] },
    { id: 'satisfying', label: 'Satisfying', terms: ['satisfying', 'asmr', 'slime', 'hydraulic press'] },
    { id: 'motivation', label: 'Motivación', terms: ['dark cinematic', 'lion', 'gym motivation', 'man thinking'] },
    { id: 'scary', label: 'Terror/Misterio', terms: ['dark forest', 'foggy night', 'abandoned house', 'creepy'] },
    { id: 'money', label: 'Dinero/Éxito', terms: ['luxury cars', 'stacks of money', 'trading charts', 'luxury house'] },
    { id: 'tech', label: 'Tecnología', terms: ['cyberpunk city', 'hacker', 'digital code', 'artificial intelligence'] },
    { id: 'nature', label: 'Naturaleza', terms: ['forest aurora', 'beach waves', 'mountain aesthetic', 'rainy window'] },
    { id: 'cooking', label: 'Cocina', terms: ['food preparation', 'cooking steak', 'chef at work'] },
    { id: 'custom', label: 'Personalizado', terms: [] }
]

// Get videos by category or custom query
export const getVideosByCategory = async (categoryId, count = 5, customQuery = '') => {
    if (categoryId === 'custom' && customQuery) {
        return getRandomVideos([customQuery], count)
    }

    const categories = getBackgroundCategories()
    const category = categories.find(c => c.id === categoryId)

    if (!category) {
        throw new Error('Invalid category')
    }

    return getRandomVideos(category.terms, count)
}
