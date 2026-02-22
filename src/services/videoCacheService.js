/**
 * Video Cache Service — Pre-downloads and caches background videos in IndexedDB
 * Solves CORS issues on Android WebView and speeds up video generation
 */

const DB_NAME = 'FacelessTubeVideoCache'
const DB_VERSION = 1
const STORE_NAME = 'videos'

// ============ IndexedDB Helpers ============

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' })
            }
        }
    })
}

// ============ Cache Operations ============

/**
 * Get a cached video blob by ID
 * @returns {Blob|null}
 */
export async function getCachedVideo(videoId) {
    try {
        const db = await openDB()
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly')
            const store = tx.objectStore(STORE_NAME)
            const request = store.get(videoId)
            request.onsuccess = () => {
                const result = request.result
                resolve(result?.blob || null)
            }
            request.onerror = () => resolve(null)
        })
    } catch (e) {
        console.warn('Cache read error:', e)
        return null
    }
}

/**
 * Save a video blob to cache
 */
export async function cacheVideo(videoId, blob, metadata = {}) {
    try {
        const db = await openDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite')
            const store = tx.objectStore(STORE_NAME)
            store.put({
                id: videoId,
                blob,
                size: blob.size,
                cachedAt: Date.now(),
                ...metadata
            })
            tx.oncomplete = () => resolve(true)
            tx.onerror = () => reject(tx.error)
        })
    } catch (e) {
        console.warn('Cache write error:', e)
        return false
    }
}

/**
 * Check which videos are cached
 * @returns {Set<string>} Set of cached video IDs
 */
export async function getCachedVideoIds() {
    try {
        const db = await openDB()
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly')
            const store = tx.objectStore(STORE_NAME)
            const request = store.getAllKeys()
            request.onsuccess = () => resolve(new Set(request.result))
            request.onerror = () => resolve(new Set())
        })
    } catch (e) {
        return new Set()
    }
}

/**
 * Get total cache size in bytes
 */
export async function getCacheSize() {
    try {
        const db = await openDB()
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly')
            const store = tx.objectStore(STORE_NAME)
            const request = store.getAll()
            request.onsuccess = () => {
                const total = (request.result || []).reduce((sum, item) => sum + (item.size || 0), 0)
                resolve(total)
            }
            request.onerror = () => resolve(0)
        })
    } catch (e) {
        return 0
    }
}

/**
 * Clear all cached videos
 */
export async function clearVideoCache() {
    try {
        const db = await openDB()
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readwrite')
            const store = tx.objectStore(STORE_NAME)
            store.clear()
            tx.oncomplete = () => resolve(true)
            tx.onerror = () => resolve(false)
        })
    } catch (e) {
        return false
    }
}

// ============ Download Manager ============

/**
 * Download and cache a single video
 * @param {Object} video - Video object with id and url
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {boolean} success
 */
export async function downloadAndCacheVideo(video, onProgress) {
    try {
        // Check if already cached
        const existing = await getCachedVideo(video.id)
        if (existing) {
            onProgress?.(100)
            return true
        }

        // Use backend proxy for external URLs (fixes CORS on Android WebView)
        const API_BASE = import.meta.env?.VITE_API_URL || 'https://facelesstube-backend.onrender.com'
        const isExternalUrl = video.url.startsWith('http://') || video.url.startsWith('https://')
        const fetchUrl = isExternalUrl
            ? `${API_BASE}/api/proxy-video?url=${encodeURIComponent(video.url)}`
            : video.url

        console.log(`📥 Downloading ${video.name} via ${isExternalUrl ? 'proxy' : 'direct'}...`)

        let response
        try {
            response = await fetch(fetchUrl, {
                signal: AbortSignal.timeout(120000) // 2 minute timeout per video
            })
        } catch (proxyErr) {
            // If proxy fails, try direct as fallback
            if (isExternalUrl) {
                console.warn('Proxy failed, trying direct:', proxyErr)
                response = await fetch(video.url, {
                    signal: AbortSignal.timeout(120000)
                })
            } else {
                throw proxyErr
            }
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        // Try to track download progress
        const contentLength = response.headers.get('content-length')
        const totalSize = contentLength ? parseInt(contentLength) : 0

        if (totalSize && response.body) {
            const reader = response.body.getReader()
            const chunks = []
            let received = 0

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                chunks.push(value)
                received += value.length
                onProgress?.(Math.round((received / totalSize) * 100))
            }

            const blob = new Blob(chunks, { type: 'video/mp4' })
            await cacheVideo(video.id, blob, { name: video.name, url: video.url })
            return true
        } else {
            // No content-length, can't track progress
            onProgress?.(50)
            const blob = await response.blob()
            onProgress?.(90)
            await cacheVideo(video.id, blob, { name: video.name, url: video.url })
            onProgress?.(100)
            return true
        }
    } catch (e) {
        console.error(`Failed to cache video ${video.id}:`, e)
        return false
    }
}

/**
 * Download and cache multiple videos with overall progress tracking
 * @param {Array} videos - Array of video objects {id, url, name}
 * @param {Function} onProgress - Callback({completed, total, currentName, overallPercent})
 * @returns {{success: number, failed: number}}
 */
export async function downloadAllVideos(videos, onProgress) {
    let completed = 0
    let failed = 0

    for (const video of videos) {
        onProgress?.({
            completed,
            total: videos.length,
            currentName: video.name,
            overallPercent: Math.round((completed / videos.length) * 100)
        })

        const success = await downloadAndCacheVideo(video, (pct) => {
            onProgress?.({
                completed,
                total: videos.length,
                currentName: video.name,
                overallPercent: Math.round(((completed + pct / 100) / videos.length) * 100)
            })
        })

        if (success) {
            completed++
        } else {
            failed++
        }
    }

    onProgress?.({
        completed,
        total: videos.length,
        currentName: '',
        overallPercent: 100
    })

    return { success: completed, failed }
}

// ============ User Preferences ============

const PREF_KEY = 'facelesstube_video_cache_pref'

export function getUserCachePref() {
    try {
        return JSON.parse(localStorage.getItem(PREF_KEY) || 'null')
    } catch {
        return null
    }
}

export function setUserCachePref(pref) {
    localStorage.setItem(PREF_KEY, JSON.stringify({
        enabled: pref.enabled,
        askedAt: Date.now(),
        ...pref
    }))
}

export function hasAskedCachePref() {
    return getUserCachePref() !== null
}
