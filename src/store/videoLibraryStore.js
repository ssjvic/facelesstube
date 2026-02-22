// Video Library Store - Zustand state management for video library
import { create } from 'zustand'
import videoLibraryService from '../services/videoLibraryService'

export const useVideoLibraryStore = create((set, get) => ({
    // State
    videos: [],
    selectedVideo: null,
    selectedCategory: 'all',
    isLoading: false,
    isUploading: false,
    uploadProgress: 0,
    error: null,

    // Load all videos
    loadVideos: async () => {
        set({ isLoading: true, error: null })
        try {
            const videos = await videoLibraryService.getAllVideos()
            set({ videos, isLoading: false })
            return videos
        } catch (error) {
            console.error('Error loading videos:', error)
            set({ error: error.message, isLoading: false })
            return []
        }
    },

    // Load videos by category
    loadByCategory: async (category) => {
        set({ isLoading: true, selectedCategory: category })
        try {
            let videos
            if (category === 'all') {
                videos = await videoLibraryService.getAllVideos()
            } else {
                videos = await videoLibraryService.getVideosByCategory(category)
            }
            set({ videos, isLoading: false })
            return videos
        } catch (error) {
            console.error('Error loading videos by category:', error)
            set({ error: error.message, isLoading: false })
            return []
        }
    },

    // Upload video
    uploadVideo: async (file, category, name) => {
        set({ isUploading: true, uploadProgress: 0, error: null })

        try {
            // Validate file
            if (!file.type.startsWith('video/')) {
                throw new Error('El archivo debe ser un video')
            }

            // Max 100MB
            const maxSize = 100 * 1024 * 1024
            if (file.size > maxSize) {
                throw new Error('El video no puede ser mayor a 100MB')
            }

            set({ uploadProgress: 30 })

            const video = await videoLibraryService.saveVideo(file, category, name)

            set({ uploadProgress: 100 })

            // Add to current list
            const currentVideos = get().videos
            set({
                videos: [video, ...currentVideos],
                isUploading: false,
                uploadProgress: 0
            })

            return video
        } catch (error) {
            console.error('Error uploading video:', error)
            set({ error: error.message, isUploading: false, uploadProgress: 0 })
            throw error
        }
    },

    // Delete video
    deleteVideo: async (id) => {
        try {
            await videoLibraryService.deleteVideo(id)
            const currentVideos = get().videos
            set({ videos: currentVideos.filter(v => v.id !== id) })

            // Clear selection if deleted
            if (get().selectedVideo?.id === id) {
                set({ selectedVideo: null })
            }

            return true
        } catch (error) {
            console.error('Error deleting video:', error)
            set({ error: error.message })
            return false
        }
    },

    // Update video
    updateVideo: async (id, updates) => {
        try {
            const updated = await videoLibraryService.updateVideo(id, updates)
            const currentVideos = get().videos
            set({
                videos: currentVideos.map(v => v.id === id ? updated : v)
            })
            return updated
        } catch (error) {
            console.error('Error updating video:', error)
            set({ error: error.message })
            throw error
        }
    },

    // Select video for use
    selectVideo: (video) => {
        set({ selectedVideo: video })
    },

    // Clear selection
    clearSelection: () => {
        set({ selectedVideo: null })
    },

    // Get storage info
    getStorageInfo: async () => {
        return await videoLibraryService.getStorageUsage()
    },

    // Clear error
    clearError: () => {
        set({ error: null })
    }
}))
