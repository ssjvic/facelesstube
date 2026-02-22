// AdModal - Modal de anuncios de video
import { useState, useEffect, useCallback } from 'react'
import { X, Play, Clock, Sparkles, Crown, ExternalLink } from 'lucide-react'
import { useAdStore, AD_CONFIG } from '../../store/adStore'

export default function AdModal() {
    const {
        isShowingAd,
        currentAd,
        remainingTime,
        updateRemainingTime,
        completeAd
    } = useAdStore()

    const [canSkip, setCanSkip] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)

    // Countdown timer
    useEffect(() => {
        if (!isShowingAd || remainingTime <= 0) return

        const timer = setInterval(() => {
            updateRemainingTime(remainingTime - 1)

            if (remainingTime <= 1) {
                setCanSkip(true)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [isShowingAd, remainingTime, updateRemainingTime])

    // Auto-start cuando se muestra
    useEffect(() => {
        if (isShowingAd) {
            setIsPlaying(true)
            setCanSkip(false)
        }
    }, [isShowingAd])

    const handleSkip = useCallback(() => {
        if (canSkip) {
            completeAd()
        }
    }, [canSkip, completeAd])

    const handleCtaClick = useCallback(() => {
        if (currentAd?.ctaUrl) {
            // Navegar al CTA
            window.location.href = currentAd.ctaUrl
        }
        completeAd()
    }, [currentAd, completeAd])

    if (!isShowingAd || !currentAd) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop oscuro */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 animate-scale-in">
                {/* Header con timer */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Play size={14} className="text-neon-cyan" />
                        <span>Anuncio</span>
                    </div>

                    {/* Timer / Skip button */}
                    <div className="flex items-center gap-2">
                        {!canSkip ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/80 text-sm">
                                <Clock size={14} />
                                <span>Espera {remainingTime}s</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleSkip}
                                className="flex items-center gap-2 px-4 py-1.5 bg-neon-cyan/20 border border-neon-cyan/50 rounded-full text-neon-cyan text-sm hover:bg-neon-cyan/30 transition-all"
                            >
                                <span>Saltar</span>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Contenido del anuncio */}
                <div className="relative bg-gradient-to-br from-dark-700 to-dark-800 rounded-2xl overflow-hidden border border-white/10">
                    {/* Video o Imagen promocional */}
                    {currentAd.type === 'youtube' && currentAd.videoUrl ? (
                        <div className="aspect-video">
                            <iframe
                                src={`${currentAd.videoUrl}?autoplay=1&mute=0`}
                                className="w-full h-full"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            />
                        </div>
                    ) : currentAd.type === 'external' && currentAd.videoUrl ? (
                        <div className="aspect-video">
                            <video
                                src={currentAd.videoUrl}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted={false}
                                playsInline
                            />
                        </div>
                    ) : (
                        /* Anuncio interno (promoción de la app) */
                        <div className="aspect-video bg-gradient-to-br from-neon-purple/20 via-dark-700 to-neon-cyan/20 flex flex-col items-center justify-center p-8 text-center">
                            {/* Icono grande */}
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center mb-6 animate-pulse-glow">
                                <Crown size={40} className="text-white" />
                            </div>

                            {/* Título */}
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {currentAd.title}
                            </h3>

                            {/* Descripción */}
                            <p className="text-white/70 mb-6 max-w-sm">
                                {currentAd.description}
                            </p>

                            {/* Beneficios */}
                            <div className="flex flex-wrap justify-center gap-3 mb-6">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-green/20 rounded-full text-neon-green text-sm">
                                    <Sparkles size={14} />
                                    <span>Sin anuncios</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-cyan/20 rounded-full text-neon-cyan text-sm">
                                    <Sparkles size={14} />
                                    <span>Videos ilimitados</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-purple/20 rounded-full text-neon-purple text-sm">
                                    <Sparkles size={14} />
                                    <span>Sin marca de agua</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer con CTA */}
                    <div className="p-4 bg-dark-800/80">
                        <button
                            onClick={handleCtaClick}
                            className="w-full py-3 px-6 bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                            {currentAd.ctaText || 'Más información'}
                            <ExternalLink size={16} />
                        </button>
                    </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan transition-all duration-1000"
                        style={{
                            width: `${((currentAd.duration - remainingTime) / currentAd.duration) * 100}%`
                        }}
                    />
                </div>

                {/* Texto pequeño */}
                <p className="text-center text-white/40 text-xs mt-3">
                    Apoya nuestra app viendo este anuncio • Los usuarios Premium no ven anuncios
                </p>
            </div>
        </div>
    )
}
