import { useState, useEffect } from 'react'
import { Download, Check, X, Loader2, HardDrive, Trash2 } from 'lucide-react'
import {
    downloadAllVideos,
    getCachedVideoIds,
    getCacheSize,
    clearVideoCache,
    hasAskedCachePref,
    setUserCachePref,
    getUserCachePref
} from '../../services/videoCacheService'
import { PREINSTALLED_VIDEOS } from '../../services/preinstalledVideos'

export default function VideoDownloadPrompt({ onDismiss }) {
    const [status, setStatus] = useState('prompt') // prompt | downloading | done | error
    const [progress, setProgress] = useState({ completed: 0, total: 0, currentName: '', overallPercent: 0 })
    const [cachedIds, setCachedIds] = useState(new Set())
    const [cacheSize, setCacheSize] = useState(0)
    const [result, setResult] = useState(null)

    useEffect(() => {
        loadCacheStatus()
    }, [])

    const loadCacheStatus = async () => {
        const ids = await getCachedVideoIds()
        const size = await getCacheSize()
        setCachedIds(ids)
        setCacheSize(size)
    }

    const handleDownload = async () => {
        setStatus('downloading')
        setUserCachePref({ enabled: true })

        // Only download videos not yet cached
        const videosToDownload = PREINSTALLED_VIDEOS.filter(v => !cachedIds.has(v.id))

        if (videosToDownload.length === 0) {
            setStatus('done')
            setResult({ success: PREINSTALLED_VIDEOS.length, failed: 0 })
            return
        }

        try {
            const res = await downloadAllVideos(videosToDownload, setProgress)
            setResult(res)
            setStatus('done')
            await loadCacheStatus()
        } catch (e) {
            console.error('Download error:', e)
            setStatus('error')
        }
    }

    const handleDismiss = () => {
        setUserCachePref({ enabled: false })
        onDismiss?.()
    }

    const handleClearCache = async () => {
        await clearVideoCache()
        await loadCacheStatus()
        setStatus('prompt')
        setResult(null)
    }

    const formatSize = (bytes) => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    }

    const allCached = cachedIds.size >= PREINSTALLED_VIDEOS.length

    // === DOWNLOADING STATE ===
    if (status === 'downloading') {
        return (
            <div style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15))',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: '16px',
                padding: '16px',
                margin: '12px 0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Loader2 size={18} style={{ color: '#a78bfa', animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '14px' }}>
                        Descargando videos de fondo...
                    </span>
                </div>

                <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                    📥 {progress.currentName} ({progress.completed}/{progress.total})
                </div>

                {/* Progress bar */}
                <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress.overallPercent}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                    }} />
                </div>

                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textAlign: 'right' }}>
                    {progress.overallPercent}%
                </div>
            </div>
        )
    }

    // === DONE STATE ===
    if (status === 'done') {
        return (
            <div style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(59,130,246,0.15))',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: '16px',
                padding: '16px',
                margin: '12px 0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Check size={18} style={{ color: '#22c55e' }} />
                        <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '14px' }}>
                            ✅ {result?.success || cachedIds.size} videos listos
                        </span>
                    </div>
                    <button
                        onClick={onDismiss}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                    <HardDrive size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    {formatSize(cacheSize)} en caché • Videos se cargarán al instante
                </div>
            </div>
        )
    }

    // === ERROR STATE ===
    if (status === 'error') {
        return (
            <div style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '16px',
                padding: '16px',
                margin: '12px 0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#fca5a5', fontSize: '14px' }}>
                        ⚠️ Error descargando algunos videos
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleDownload} style={{
                            background: 'rgba(239,68,68,0.2)',
                            border: '1px solid rgba(239,68,68,0.4)',
                            borderRadius: '8px',
                            color: '#fca5a5',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}>Reintentar</button>
                        <button onClick={handleDismiss} style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer'
                        }}>
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // === PROMPT STATE (already cached) ===
    if (allCached) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(59,130,246,0.1))',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: '16px',
                padding: '14px 16px',
                margin: '12px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                    <Check size={14} style={{ display: 'inline', verticalAlign: 'middle', color: '#22c55e', marginRight: '6px' }} />
                    {cachedIds.size} videos en caché ({formatSize(cacheSize)})
                </div>
                <button onClick={handleClearCache} style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px'
                }}>
                    <Trash2 size={12} /> Limpiar
                </button>
            </div>
        )
    }

    // === PROMPT STATE (default) ===
    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: '16px',
            padding: '16px',
            margin: '12px 0'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Download size={22} style={{ color: '#a78bfa', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                    <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                        📥 ¿Descargar videos de fondo?
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.4, marginBottom: '12px' }}>
                        Descarga {PREINSTALLED_VIDEOS.length} videos (~{PREINSTALLED_VIDEOS.length * 3} MB) para
                        generación más rápida y sin problemas de conexión.
                    </div>
                    {cachedIds.size > 0 && (
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                            Ya tienes {cachedIds.size}/{PREINSTALLED_VIDEOS.length} videos en caché
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleDownload}
                            style={{
                                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                padding: '8px 18px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Download size={14} />
                            Descargar ahora
                        </button>
                        <button
                            onClick={handleDismiss}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                color: '#94a3b8',
                                padding: '8px 14px',
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}
                        >
                            Ahora no
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
