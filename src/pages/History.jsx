import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Video, Play, Download, Trash2, Upload, Calendar, Clock } from 'lucide-react'
import { useVideoStore, VIDEO_STATES } from '../store/videoStore'
import { useTranslation } from '../store/i18nStore'
import { useAuthStore } from '../store/authStore'

export default function History() {
    const { t } = useTranslation()
    const { videos, deleteVideo, loadVideos } = useVideoStore()
    const { user } = useAuthStore()

    // Load videos from storage on mount
    useEffect(() => {
        loadVideos(user?.id || '__local__')
    }, [user?.id])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case VIDEO_STATES.UPLOADED:
                return <span className="badge-pro">Subido</span>
            case VIDEO_STATES.READY:
                return <span className="badge-starter">Listo</span>
            default:
                return <span className="badge-free">Borrador</span>
        }
    }

    const handleDownload = (video) => {
        const blob = video.blob
        if (blob && blob instanceof Blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${video.title || 'video'}.mp4`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            setTimeout(() => URL.revokeObjectURL(url), 5000)
        } else if (video.storageUrl) {
            window.open(video.storageUrl, '_blank')
        } else if (video.script) {
            // Export script as text file
            const textBlob = new Blob([`${video.title}\n\n${video.description}\n\n---\n\n${video.script}`], { type: 'text/plain' })
            const url = URL.createObjectURL(textBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${video.title || 'guion'}.txt`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            setTimeout(() => URL.revokeObjectURL(url), 5000)
        }
    }

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este video?')) {
            deleteVideo(id)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-4 md:mb-8">
                <h1 className="text-xl md:text-3xl font-display font-bold mb-1">
                    {t('history.title')}
                </h1>
                <p className="text-white/60 text-sm md:text-base">
                    {t('history.subtitle')}
                </p>
            </div>

            {/* Video list */}
            {videos.length > 0 ? (
                <div className="space-y-4">
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className="glass-card p-3 md:p-6 flex flex-col md:flex-row gap-3 md:gap-4"
                        >
                            {/* Thumbnail / Preview */}
                            <div className="relative w-full md:w-48 aspect-video md:aspect-[9/16] rounded-xl overflow-hidden bg-dark-600 flex-shrink-0">
                                {(video.videoUrl || video.blob) ? (
                                    <video
                                        src={video.videoUrl || (video.blob instanceof Blob ? URL.createObjectURL(video.blob) : '')}
                                        className="w-full h-full object-cover"
                                        playsInline
                                        muted
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-3">
                                        <Video size={24} className="text-white/30 mb-2" />
                                        <p className="text-white/40 text-xs text-center line-clamp-3">
                                            {video.script ? video.script.substring(0, 80) + '...' : 'Sin preview'}
                                        </p>
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Play size={20} className="text-white ml-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <h3 className="text-lg font-semibold line-clamp-2">
                                        {video.title || video.idea}
                                    </h3>
                                    {getStatusBadge(video.status)}
                                </div>

                                <p className="text-white/60 text-sm mb-4 line-clamp-2">
                                    {video.description || video.idea}
                                </p>

                                {/* Meta info */}
                                <div className="flex items-center gap-4 text-sm text-white/40 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {formatDate(video.createdAt)}
                                    </span>
                                    {video.duration > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                                        </span>
                                    )}
                                </div>

                                {/* Tags */}
                                {video.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {video.tags.slice(0, 4).map((tag, i) => (
                                            <span key={i} className="px-2 py-0.5 rounded-full bg-dark-600 text-xs text-white/50">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDownload(video)}
                                        className="btn-secondary py-2 px-3 text-sm flex items-center gap-2"
                                    >
                                        <Download size={16} />
                                        {video.blob ? 'Descargar' : 'Exportar guión'}
                                    </button>
                                    {video.youtubeId && (
                                        <a
                                            href={`https://youtube.com/watch?v=${video.youtubeId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-secondary py-2 px-3 text-sm flex items-center gap-2"
                                        >
                                            <Upload size={16} />
                                            Ver en YouTube
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDelete(video.id)}
                                        className="py-2 px-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty state */
                <div className="glass-card p-8 md:p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-dark-600 flex items-center justify-center mx-auto mb-6">
                        <Video size={32} className="text-white/30" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t('history.empty')}</h3>
                    <p className="text-white/60 mb-6">
                        Comienza a generar videos con IA para verlos aquí
                    </p>
                    <Link to="/app" className="btn-neon inline-flex items-center gap-2">
                        <Play size={18} />
                        {t('history.createFirst')}
                    </Link>
                </div>
            )}
        </div>
    )
}
