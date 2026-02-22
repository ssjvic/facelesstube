import { create } from 'zustand'
import { supabase, isSupabaseConfigured, db } from '../config/supabase'

// Video states for UI
export const VIDEO_STATES = {
    IDLE: 'idle',
    GENERATING_SCRIPT: 'generating_script',
    GENERATING_AUDIO: 'generating_audio',
    FETCHING_VIDEOS: 'fetching_videos',
    COMPOSING: 'composing',
    COMPLETED: 'completed',
    ERROR: 'error'
}

export const useVideoStore = create((set, get) => ({
    videos: [],
    currentVideo: null,
    isGenerating: false,
    progress: 0,
    progressMessage: '',
    error: null,

    // Load videos from Supabase or localStorage
    loadVideos: async (userId) => {
        if (!userId) return

        if (isSupabaseConfigured()) {
            try {
                const videos = await db.getVideos(userId)
                set({
                    videos: videos.map(v => ({
                        id: v.id,
                        title: v.title,
                        description: v.description,
                        script: v.metadata?.script || '',
                        topic: v.topic,
                        language: v.language,
                        duration: v.duration,
                        fileSize: v.file_size,
                        storageUrl: v.storage_url,
                        youtubeUrl: v.youtube_url,
                        youtubeVideoId: v.youtube_video_id,
                        status: v.status,
                        tags: v.metadata?.tags || [],
                        metadata: v.metadata,
                        createdAt: v.created_at,
                        blob: null,
                        videoUrl: v.storage_url || null
                    }))
                })
            } catch (error) {
                console.error('Error loading videos:', error)
            }
        } else {
            // Load from localStorage for demo mode
            const saved = localStorage.getItem('facelesstube_videos')
            if (saved) {
                try {
                    let videos = JSON.parse(saved)

                    // Restore blobs from IndexedDB
                    try {
                        const idbVideos = await new Promise((resolve, reject) => {
                            const req = indexedDB.open('facelesstube_blobs', 1)
                            req.onupgradeneeded = (e) => {
                                const idb = e.target.result
                                if (!idb.objectStoreNames.contains('videos')) {
                                    idb.createObjectStore('videos', { keyPath: 'id' })
                                }
                            }
                            req.onsuccess = (e) => {
                                const idb = e.target.result
                                const tx = idb.transaction('videos', 'readonly')
                                const store = tx.objectStore('videos')
                                const getAll = store.getAll()
                                getAll.onsuccess = () => resolve(getAll.result || [])
                                getAll.onerror = () => resolve([])
                            }
                            req.onerror = () => resolve([])
                        })

                        const blobMap = new Map(idbVideos.map(v => [v.id, v.blob]))
                        videos = videos.map(v => {
                            const blob = blobMap.get(v.id)
                            return {
                                ...v,
                                blob: blob || null,
                                videoUrl: blob ? URL.createObjectURL(blob) : null
                            }
                        })
                    } catch (e) {
                        console.warn('IndexedDB restore error:', e)
                    }

                    set({ videos })
                } catch (e) {
                    console.error('Error parsing saved videos:', e)
                }
            }
        }
    },

    // Start generation
    startGeneration: () => {
        set({
            isGenerating: true,
            progress: 0,
            progressMessage: 'Iniciando...',
            error: null
        })
    },

    // Update progress
    updateProgress: (progress, message) => {
        set({ progress, progressMessage: message })
    },

    // Complete generation
    completeGeneration: async (videoData, userId) => {
        const newVideo = {
            id: crypto.randomUUID(),
            title: videoData.title || 'Video sin título',
            description: videoData.description || '',
            script: videoData.script || '',
            topic: videoData.topic || '',
            language: videoData.language || 'es',
            duration: videoData.duration || 0,
            fileSize: videoData.blob?.size || 0,
            status: 'completed',
            tags: videoData.tags || [],
            metadata: {
                script: videoData.script,
                keywords: videoData.keywords
            },
            createdAt: new Date().toISOString(),
            blob: videoData.blob,
            videoUrl: videoData.videoUrl || (videoData.blob ? URL.createObjectURL(videoData.blob) : null)
        }

        // Save to Supabase
        if (isSupabaseConfigured() && userId) {
            try {
                // Upload video to Supabase Storage
                if (videoData.blob) {
                    const fileName = `${userId}/${newVideo.id}.webm`
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('videos')
                        .upload(fileName, videoData.blob, {
                            contentType: 'video/webm'
                        })

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage
                            .from('videos')
                            .getPublicUrl(fileName)

                        newVideo.storageUrl = publicUrl
                    }
                }

                // Save metadata to database
                await db.saveVideo({
                    id: newVideo.id,
                    user_id: userId,
                    title: newVideo.title,
                    description: newVideo.description,
                    topic: newVideo.topic,
                    language: newVideo.language,
                    duration: newVideo.duration,
                    file_size: newVideo.fileSize,
                    storage_url: newVideo.storageUrl,
                    status: newVideo.status,
                    metadata: newVideo.metadata
                })
            } catch (error) {
                console.error('Error saving to Supabase:', error)
            }
        }

        // Always save to localStorage (metadata) + IndexedDB (blob)
        try {
            const videos = get().videos
            const updatedVideos = [newVideo, ...videos]
            localStorage.setItem('facelesstube_videos', JSON.stringify(
                updatedVideos.map(v => ({ ...v, blob: null, videoUrl: null }))
            ))

            // Save blob to IndexedDB for persistence
            if (videoData.blob) {
                try {
                    const idbReq = indexedDB.open('facelesstube_blobs', 1)
                    idbReq.onupgradeneeded = (e) => {
                        const idb = e.target.result
                        if (!idb.objectStoreNames.contains('videos')) {
                            idb.createObjectStore('videos', { keyPath: 'id' })
                        }
                    }
                    idbReq.onsuccess = (e) => {
                        const idb = e.target.result
                        const tx = idb.transaction('videos', 'readwrite')
                        tx.objectStore('videos').put({ id: newVideo.id, blob: videoData.blob })
                    }
                } catch (e) {
                    console.warn('IndexedDB save error:', e)
                }
            }
        } catch (e) {
            console.warn('Storage error:', e)
        }

        set(state => ({
            videos: [newVideo, ...state.videos],
            currentVideo: newVideo,
            isGenerating: false,
            progress: 100,
            progressMessage: '¡Video completado!'
        }))

        return newVideo
    },

    // Set error
    setError: (error) => {
        set({
            isGenerating: false,
            error,
            progress: 0,
            progressMessage: ''
        })
    },

    // Clear current video
    clearCurrentVideo: () => {
        set({ currentVideo: null })
    },

    // Delete video
    deleteVideo: async (videoId, userId) => {
        if (isSupabaseConfigured() && userId) {
            try {
                // Delete from storage
                const video = get().videos.find(v => v.id === videoId)
                if (video?.storageUrl) {
                    const fileName = `${userId}/${videoId}.webm`
                    await supabase.storage.from('videos').remove([fileName])
                }

                // Delete from database
                await db.deleteVideo(videoId)
            } catch (error) {
                console.error('Error deleting from Supabase:', error)
            }
        } else {
            // Update localStorage for demo mode
            const videos = get().videos.filter(v => v.id !== videoId)
            localStorage.setItem('facelesstube_videos', JSON.stringify(
                videos.map(v => ({ ...v, blob: null }))
            ))
        }

        set(state => ({
            videos: state.videos.filter(v => v.id !== videoId)
        }))
    },

    // Update video (e.g., after YouTube upload or after rendering blob)
    updateVideo: async (videoId, updates, userId) => {
        if (isSupabaseConfigured() && userId) {
            try {
                const dbUpdates = {}
                if (updates.youtubeUrl) dbUpdates.youtube_url = updates.youtubeUrl
                if (updates.youtubeVideoId) dbUpdates.youtube_video_id = updates.youtubeVideoId
                if (updates.status) dbUpdates.status = updates.status

                await supabase
                    .from('videos')
                    .update(dbUpdates)
                    .eq('id', videoId)
            } catch (error) {
                console.error('Error updating video:', error)
            }
        }

        // Save blob to IndexedDB if provided
        if (updates.blob && updates.blob instanceof Blob) {
            try {
                const idbReq = indexedDB.open('facelesstube_blobs', 1)
                idbReq.onupgradeneeded = (e) => {
                    const idb = e.target.result
                    if (!idb.objectStoreNames.contains('videos')) {
                        idb.createObjectStore('videos', { keyPath: 'id' })
                    }
                }
                idbReq.onsuccess = (e) => {
                    const idb = e.target.result
                    const tx = idb.transaction('videos', 'readwrite')
                    tx.objectStore('videos').put({ id: videoId, blob: updates.blob })
                }
            } catch (e) {
                console.warn('IndexedDB update error:', e)
            }
        }

        set(state => ({
            videos: state.videos.map(v =>
                v.id === videoId ? { ...v, ...updates } : v
            )
        }))

        // Update localStorage metadata
        try {
            const allVideos = get().videos
            localStorage.setItem('facelesstube_videos', JSON.stringify(
                allVideos.map(v => ({ ...v, blob: null, videoUrl: null }))
            ))
        } catch (e) {
            console.warn('localStorage update error:', e)
        }
    },

    // Get video blob for download
    getVideoBlob: async (videoId, userId) => {
        const video = get().videos.find(v => v.id === videoId)

        // Return cached blob if available
        if (video?.blob) return video.blob

        // Try to fetch from Supabase Storage
        if (isSupabaseConfigured() && video?.storageUrl) {
            try {
                const response = await fetch(video.storageUrl)
                if (response.ok) {
                    return await response.blob()
                }
            } catch (error) {
                console.error('Error fetching video blob:', error)
            }
        }

        return null
    },

    // Clear all videos
    clearAllVideos: async (userId) => {
        if (isSupabaseConfigured() && userId) {
            // Delete all videos from storage and database
            const videos = get().videos
            for (const video of videos) {
                try {
                    const fileName = `${userId}/${video.id}.webm`
                    await supabase.storage.from('videos').remove([fileName])
                    await db.deleteVideo(video.id)
                } catch (e) {
                    console.error('Error deleting video:', e)
                }
            }
        } else {
            localStorage.removeItem('facelesstube_videos')
        }

        set({ videos: [] })
    }
}))
