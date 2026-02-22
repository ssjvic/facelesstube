// Video Library Service - IndexedDB storage for custom background videos
// Allows users to upload their own videos to use as backgrounds

const DB_NAME = 'FacelessTubeVideos'
const DB_VERSION = 1
const STORE_NAME = 'videos'

let db = null

// Initialize IndexedDB
async function initDB() {
    if (db) return db

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => {
            console.error('❌ Error opening IndexedDB:', request.error)
            reject(request.error)
        }

        request.onsuccess = () => {
            db = request.result
            console.log('✅ IndexedDB initialized')
            resolve(db)
        }

        request.onupgradeneeded = (event) => {
            const database = event.target.result

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
                store.createIndex('category', 'category', { unique: false })
                store.createIndex('createdAt', 'createdAt', { unique: false })
                console.log('📦 Created video store')
            }
        }
    })
}

// Generate unique ID
function generateId() {
    return `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Video categories
export const VIDEO_CATEGORIES = [
    { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#8b5cf6' },
    { id: 'motivational', name: 'Motivacional', icon: '💪', color: '#f59e0b' },
    { id: 'tech', name: 'Tecnología', icon: '💻', color: '#3b82f6' },
    { id: 'nature', name: 'Naturaleza', icon: '🌿', color: '#10b981' },
    { id: 'abstract', name: 'Abstracto', icon: '🎨', color: '#ec4899' },
    { id: 'cooking', name: 'Cocina', icon: '🍳', color: '#ef4444' },
    { id: 'fitness', name: 'Fitness', icon: '🏋️', color: '#14b8a6' },
    { id: 'other', name: 'Otros', icon: '📁', color: '#6b7280' }
]

// Save video to IndexedDB
export async function saveVideo(file, category, name = null) {
    await initDB()

    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = async () => {
            const videoData = {
                id: generateId(),
                name: name || file.name.replace(/\.[^/.]+$/, ''),
                category: category || 'other',
                mimeType: file.type,
                size: file.size,
                data: reader.result, // Base64 data URL
                duration: null, // Will be set when loaded
                thumbnail: null, // Will be generated
                createdAt: Date.now()
            }

            // Get video duration and thumbnail
            try {
                const metadata = await getVideoMetadata(reader.result)
                videoData.duration = metadata.duration
                videoData.thumbnail = metadata.thumbnail
            } catch (e) {
                console.warn('Could not get video metadata:', e)
            }

            const transaction = db.transaction([STORE_NAME], 'readwrite')
            const store = transaction.objectStore(STORE_NAME)
            const request = store.add(videoData)

            request.onsuccess = () => {
                console.log('✅ Video saved:', videoData.name)
                resolve(videoData)
            }

            request.onerror = () => {
                console.error('❌ Error saving video:', request.error)
                reject(request.error)
            }
        }

        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
    })
}

// Get video metadata (duration and thumbnail)
async function getVideoMetadata(dataUrl) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.preload = 'metadata'

        video.onloadedmetadata = () => {
            video.currentTime = Math.min(1, video.duration / 2)
        }

        video.onseeked = () => {
            // Create thumbnail
            const canvas = document.createElement('canvas')
            canvas.width = 320
            canvas.height = 180
            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            resolve({
                duration: video.duration,
                thumbnail: canvas.toDataURL('image/jpeg', 0.7)
            })
        }

        video.onerror = () => reject(new Error('Could not load video'))

        setTimeout(() => reject(new Error('Video load timeout')), 10000)

        video.src = dataUrl
    })
}

// Get all videos
export async function getAllVideos() {
    await initDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.getAll()

        request.onsuccess = () => {
            const videos = request.result.sort((a, b) => b.createdAt - a.createdAt)
            resolve(videos)
        }

        request.onerror = () => reject(request.error)
    })
}

// Get videos by category
export async function getVideosByCategory(category) {
    await initDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const index = store.index('category')
        const request = index.getAll(category)

        request.onsuccess = () => {
            const videos = request.result.sort((a, b) => b.createdAt - a.createdAt)
            resolve(videos)
        }

        request.onerror = () => reject(request.error)
    })
}

// Get single video by ID
export async function getVideo(id) {
    await initDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.get(id)

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

// Delete video
export async function deleteVideo(id) {
    await initDB()

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.delete(id)

        request.onsuccess = () => {
            console.log('🗑️ Video deleted:', id)
            resolve(true)
        }

        request.onerror = () => reject(request.error)
    })
}

// Update video (name, category)
export async function updateVideo(id, updates) {
    await initDB()

    const video = await getVideo(id)
    if (!video) throw new Error('Video not found')

    const updatedVideo = { ...video, ...updates }

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.put(updatedVideo)

        request.onsuccess = () => resolve(updatedVideo)
        request.onerror = () => reject(request.error)
    })
}

// Get storage usage
export async function getStorageUsage() {
    const videos = await getAllVideos()
    const totalSize = videos.reduce((sum, v) => sum + (v.size || 0), 0)

    return {
        count: videos.length,
        totalBytes: totalSize,
        totalMB: (totalSize / 1024 / 1024).toFixed(2)
    }
}

// Convert video data URL to Blob
export function dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(',')
    const mime = parts[0].match(/:(.*?);/)[1]
    const bstr = atob(parts[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
}

export default {
    initDB,
    saveVideo,
    getAllVideos,
    getVideosByCategory,
    getVideo,
    deleteVideo,
    updateVideo,
    getStorageUsage,
    dataUrlToBlob,
    VIDEO_CATEGORIES
}
