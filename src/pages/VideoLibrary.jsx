// Video Library Page - Manage custom background videos
import { useState, useEffect, useRef } from 'react'
import { useVideoLibraryStore } from '../store/videoLibraryStore'
import { VIDEO_CATEGORIES } from '../services/videoLibraryService'
import { toast } from '../store/toastStore'
import { useAuthStore } from '../store/authStore'

function VideoLibrary() {
    const { user } = useAuthStore()
    const {
        videos,
        isLoading,
        isUploading,
        uploadProgress,
        selectedCategory,
        loadVideos,
        loadByCategory,
        uploadVideo,
        deleteVideo,
        selectVideo,
        selectedVideo
    } = useVideoLibraryStore()

    const [showUploadModal, setShowUploadModal] = useState(false)
    const [uploadCategory, setUploadCategory] = useState('other')
    const [uploadName, setUploadName] = useState('')
    const [previewVideo, setPreviewVideo] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        loadVideos()
    }, [])

    const handleFileSelect = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('video/')) {
            toast.error('Por favor selecciona un archivo de video')
            return
        }

        // Preview
        const url = URL.createObjectURL(file)
        setPreviewVideo({ file, url })
        setUploadName(file.name.replace(/\.[^/.]+$/, ''))
        setShowUploadModal(true)
    }

    const handleUpload = async () => {
        if (!previewVideo?.file) return

        try {
            await uploadVideo(previewVideo.file, uploadCategory, uploadName)
            toast.success('¡Video subido correctamente!')
            setShowUploadModal(false)
            setPreviewVideo(null)
            setUploadName('')
        } catch (error) {
            toast.error(error.message || 'Error al subir el video')
        }
    }

    const handleDelete = async (video) => {
        if (!confirm(`¿Eliminar "${video.name}"?`)) return

        const success = await deleteVideo(video.id)
        if (success) {
            toast.success('Video eliminado')
        } else {
            toast.error('Error al eliminar')
        }
    }

    const handleCategoryFilter = (category) => {
        loadByCategory(category)
    }

    const formatDuration = (seconds) => {
        if (!seconds) return '--:--'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatSize = (bytes) => {
        if (!bytes) return '--'
        const mb = bytes / 1024 / 1024
        return `${mb.toFixed(1)} MB`
    }

    return (
        <div className="pb-16 md:pb-24 overflow-x-hidden w-full max-w-full box-border">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-cosmic-950/80 backdrop-blur-md border-b border-white/5 px-3 py-2 md:px-4 md:py-3">
                <div className="flex items-center justify-between mb-2 gap-2">
                    <h1 className="text-base md:text-xl font-bold text-white truncate">📚 Mi Biblioteca</h1>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg text-white font-medium text-xs flex-shrink-0"
                    >
                        <span>➕</span>
                        <span>Subir</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>

                {/* Category filters */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar -mx-3 px-3 md:mx-0 md:px-0">
                    <button
                        onClick={() => handleCategoryFilter('all')}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === 'all'
                            ? 'bg-violet-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        Todos
                    </button>
                    {VIDEO_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryFilter(cat.id)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id
                                ? 'text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-3 py-2 md:px-4 md:py-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="spinner" />
                    </div>
                ) : videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 w-full">
                        <div className="text-5xl mb-3">🎬</div>
                        <h3 className="text-base font-semibold text-white mb-1 text-center">
                            Sin videos aún
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 text-center max-w-[200px]">
                            Sube videos para usarlos de fondo
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-medium text-sm"
                        >
                            ➕ Subir primer video
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                        {videos.map(video => (
                            <div
                                key={video.id}
                                className={`relative rounded-xl overflow-hidden bg-white/5 border-2 transition-all ${selectedVideo?.id === video.id
                                    ? 'border-violet-500 ring-2 ring-violet-500/30'
                                    : 'border-transparent hover:border-white/10'
                                    }`}
                            >
                                {/* Thumbnail */}
                                <div
                                    className="aspect-[9/16] bg-cosmic-900 cursor-pointer"
                                    onClick={() => selectVideo(video)}
                                >
                                    {video.thumbnail ? (
                                        <img
                                            src={video.thumbnail}
                                            alt={video.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">
                                            🎬
                                        </div>
                                    )}

                                    {/* Duration badge */}
                                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] text-white">
                                        {formatDuration(video.duration)}
                                    </div>

                                    {/* Selected indicator */}
                                    {selectedVideo?.id === video.id && (
                                        <div className="absolute top-1 right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center text-xs">
                                            ✓
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-2">
                                    <h4 className="text-xs font-medium text-white truncate">
                                        {video.name}
                                    </h4>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <span className="text-[10px] text-gray-500">
                                            {formatSize(video.size)}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(video)
                                            }}
                                            className="text-red-400 hover:text-red-300 text-xs"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80">
                    <div className="bg-cosmic-900 rounded-t-2xl md:rounded-2xl p-4 md:p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-white">
                                📤 Subir Video
                            </h2>
                            <button
                                onClick={() => {
                                    setShowUploadModal(false)
                                    setPreviewVideo(null)
                                    setUploadName('')
                                }}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Preview */}
                        {previewVideo?.url && (
                            <div className="aspect-video rounded-lg overflow-hidden bg-black mb-3">
                                <video
                                    src={previewVideo.url}
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay
                                    muted
                                    loop
                                />
                            </div>
                        )}

                        {/* Name input */}
                        <div className="mb-3">
                            <label className="block text-xs text-gray-400 mb-1">
                                Nombre
                            </label>
                            <input
                                type="text"
                                value={uploadName}
                                onChange={(e) => setUploadName(e.target.value)}
                                placeholder="Mi video de fondo"
                                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500"
                            />
                        </div>

                        {/* Category select */}
                        <div className="mb-4">
                            <label className="block text-xs text-gray-400 mb-1">
                                Categoría
                            </label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {VIDEO_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setUploadCategory(cat.id)}
                                        className={`p-1.5 rounded-lg text-center transition-all ${uploadCategory === cat.id
                                            ? 'text-white ring-2 ring-offset-1 ring-offset-cosmic-900'
                                            : 'bg-white/5 text-gray-400'
                                            }`}
                                        style={uploadCategory === cat.id ? {
                                            backgroundColor: cat.color,
                                            ringColor: cat.color
                                        } : {}}
                                    >
                                        <div className="text-lg">{cat.icon}</div>
                                        <div className="text-[10px] truncate">{cat.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Upload progress */}
                        {isUploading && (
                            <div className="mb-3">
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-violet-500 transition-all"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1 text-center">
                                    Subiendo... {uploadProgress}%
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setShowUploadModal(false)
                                    setPreviewVideo(null)
                                    setUploadName('')
                                }}
                                disabled={isUploading}
                                className="flex-1 py-2.5 bg-white/5 text-gray-400 rounded-lg font-medium text-sm disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={isUploading || !uploadName.trim()}
                                className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium text-sm disabled:opacity-50"
                            >
                                {isUploading ? 'Subiendo...' : '📤 Subir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Selected video info bar */}
            {selectedVideo && (
                <div className="fixed bottom-16 left-2 right-2 md:bottom-20 md:left-4 md:right-4 bg-violet-600 rounded-xl p-2.5 md:p-3 flex items-center gap-2 md:gap-3 shadow-lg">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0">
                        {selectedVideo.thumbnail ? (
                            <img
                                src={selectedVideo.thumbnail}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm">🎬</div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate text-sm">
                            {selectedVideo.name}
                        </p>
                        <p className="text-violet-200 text-xs">
                            Seleccionado ✓
                        </p>
                    </div>
                    <button
                        onClick={() => selectVideo(null)}
                        className="text-white/70 hover:text-white text-sm"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    )
}

export default VideoLibrary
