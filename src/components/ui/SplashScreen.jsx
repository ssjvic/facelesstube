import { useState, useEffect, useRef } from 'react'

// Simple CSS-based SplashScreen without framer-motion for better compatibility
const SplashScreen = ({ onComplete }) => {
    const [phase, setPhase] = useState('video') // 'video' -> 'animation' -> 'done'
    const [showSplash, setShowSplash] = useState(true)
    const [videoLoaded, setVideoLoaded] = useState(false)
    const [fadeOut, setFadeOut] = useState(false)
    const videoRef = useRef(null)

    // Quick fallback - if video doesn't start in 2 seconds, skip to animation
    useEffect(() => {
        const quickFallback = setTimeout(() => {
            if (!videoLoaded && phase === 'video') {
                console.log('Video timeout, skipping to animation')
                setPhase('animation')
            }
        }, 8000)

        return () => clearTimeout(quickFallback)
    }, [videoLoaded, phase])

    // Animation phase timer
    useEffect(() => {
        if (phase === 'animation') {
            const animTimer = setTimeout(() => {
                setFadeOut(true)
                setTimeout(() => {
                    setShowSplash(false)
                    onComplete?.()
                }, 500)
            }, 5000)
            return () => clearTimeout(animTimer)
        }
    }, [phase, onComplete])

    // Max fallback
    useEffect(() => {
        const maxTimer = setTimeout(() => {
            setShowSplash(false)
            onComplete?.()
        }, 15000)
        return () => clearTimeout(maxTimer)
    }, [onComplete])

    const handleVideoEnd = () => {
        setPhase('animation')
    }

    const handleVideoError = () => {
        console.log('Video error, using fallback')
        setPhase('animation')
    }

    const handleVideoLoadedData = () => {
        setVideoLoaded(true)
        if (videoRef.current) {
            videoRef.current.play().catch(() => {
                setPhase('animation')
            })
        }
    }

    const handleSkip = () => {
        setFadeOut(true)
        setTimeout(() => {
            setShowSplash(false)
            onComplete?.()
        }, 300)
    }

    if (!showSplash) return null

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0a0a12',
                overflow: 'hidden',
                opacity: fadeOut ? 0 : 1,
                transition: 'opacity 0.5s ease'
            }}
        >
            {/* Phase 1: Video Splash */}
            {phase === 'video' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <video
                        ref={videoRef}
                        src="./splash.mp4"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#0a0a12' }}
                        muted
                        playsInline
                        onLoadedData={handleVideoLoadedData}
                        onEnded={handleVideoEnd}
                        onError={handleVideoError}
                    />

                    {/* Loading indicator while video loads */}
                    {!videoLoaded && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                                src="./logo.png"
                                alt="FacelessTube"
                                style={{ width: 80, height: 80, objectFit: 'contain', animation: 'pulse 1.5s infinite' }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Phase 2: FacelessTube Animation */}
            {phase === 'animation' && (
                <div style={{ position: 'absolute', inset: 0 }}>
                    {/* Background glow */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(circle at center, rgba(0,245,255,0.15) 0%, #0a0a12 70%)'
                        }}
                        className="animate-pulse"
                    />

                    {/* Logo and text container */}
                    <div style={{
                        position: 'relative',
                        zIndex: 10,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Logo with glow */}
                        <div style={{ position: 'relative' }} className="animate-scale-in">
                            {/* Glow effect */}
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: -30,
                                    background: 'rgba(0,245,255,0.3)',
                                    borderRadius: '50%',
                                    filter: 'blur(30px)'
                                }}
                            />

                            <img
                                src="./logo.png"
                                alt="FacelessTube"
                                style={{
                                    width: 112,
                                    height: 112,
                                    objectFit: 'contain',
                                    position: 'relative',
                                    zIndex: 10,
                                    filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.5))'
                                }}
                            />
                        </div>

                        {/* App Name */}
                        <div style={{ marginTop: 24, textAlign: 'center' }} className="animate-slide-up">
                            <h1 style={{ fontSize: 30, fontWeight: 'bold', margin: 0 }}>
                                <span style={{ color: '#ffffff' }}>Faceless</span>
                                <span style={{ color: '#00f5ff' }}>Tube</span>
                            </h1>
                            <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 8 }}>
                                Crea videos virales con IA
                            </p>
                        </div>

                        {/* Loading dots */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        background: '#00f5ff',
                                        animation: `bounce 0.6s ease-in-out ${i * 0.1}s infinite`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Skip button */}
            <button
                onClick={handleSkip}
                style={{
                    position: 'absolute',
                    bottom: 24,
                    right: 24,
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.6)',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 50
                }}
            >
                Saltar →
            </button>

            {/* Keyframe animations */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); opacity: 0.5; }
                    50% { transform: translateY(-10px); opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0) rotate(-180deg); }
                    to { transform: scale(1) rotate(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-scale-in {
                    animation: scaleIn 0.6s ease-out;
                }
                .animate-slide-up {
                    animation: slideUp 0.5s ease-out 0.3s both;
                }
            `}</style>
        </div>
    )
}

export default SplashScreen
