/**
 * Background Music Library — Manages royalty-free music tracks
 * Users can add their own AI-generated music (Suno, Udio, etc.)
 */

const DB_NAME = 'FacelessTubeMusicLib'
const DB_VERSION = 1
const STORE_NAME = 'tracks'

// ============ Built-in tracks (placeholder URLs — user will add their own) ============

export const MUSIC_CATEGORIES = [
    { id: 'all', label: 'Todas', icon: '🎵' },
    { id: 'epic', label: 'Épica', icon: '⚔️' },
    { id: 'chill', label: 'Chill', icon: '🌊' },
    { id: 'dark', label: 'Oscura', icon: '🌑' },
    { id: 'upbeat', label: 'Energía', icon: '⚡' },
    { id: 'emotional', label: 'Emocional', icon: '💫' },
    { id: 'custom', label: 'Mis tracks', icon: '🎤' }
]

// ============ IndexedDB for custom tracks ============

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
                store.createIndex('category', 'category', { unique: false })
            }
        }
    })
}

/**
 * Save a custom music track (from file upload)
 */
export async function saveCustomTrack(file, metadata = {}) {
    try {
        const db = await openDB()
        const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite')
            const store = tx.objectStore(STORE_NAME)
            store.put({
                id,
                name: metadata.name || file.name.replace(/\.\w+$/, ''),
                category: metadata.category || 'custom',
                blob: file,
                size: file.size,
                type: file.type,
                addedAt: Date.now()
            })
            tx.oncomplete = () => resolve(id)
            tx.onerror = () => reject(tx.error)
        })
    } catch (e) {
        console.error('Error saving track:', e)
        return null
    }
}

/**
 * Get all custom tracks
 */
export async function getCustomTracks() {
    try {
        const db = await openDB()
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly')
            const store = tx.objectStore(STORE_NAME)
            const request = store.getAll()
            request.onsuccess = () => resolve(request.result || [])
            request.onerror = () => resolve([])
        })
    } catch (e) {
        return []
    }
}

/**
 * Get a custom track blob by ID
 */
export async function getTrackBlob(trackId) {
    try {
        const db = await openDB()
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly')
            const store = tx.objectStore(STORE_NAME)
            const request = store.get(trackId)
            request.onsuccess = () => resolve(request.result?.blob || null)
            request.onerror = () => resolve(null)
        })
    } catch (e) {
        return null
    }
}

/**
 * Delete a custom track
 */
export async function deleteCustomTrack(trackId) {
    try {
        const db = await openDB()
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readwrite')
            const store = tx.objectStore(STORE_NAME)
            store.delete(trackId)
            tx.oncomplete = () => resolve(true)
            tx.onerror = () => resolve(false)
        })
    } catch (e) {
        return false
    }
}

/**
 * Get total number of custom tracks
 */
export async function getCustomTrackCount() {
    try {
        const db = await openDB()
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly')
            const store = tx.objectStore(STORE_NAME)
            const request = store.count()
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => resolve(0)
        })
    } catch (e) {
        return 0
    }
}
