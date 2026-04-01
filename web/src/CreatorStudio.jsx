/**
 * CreatorStudio - Componente principal para crear videos faceless
 */

import React, { useState, useEffect } from 'react';
import {
    Wand2, Play, Download, RefreshCw, Volume2, VolumeX,
    Image, FileText, Hash, Clock, Sparkles, AlertCircle,
    Check, Loader2, ChevronDown, Copy, CreditCard
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { generateScript, checkHealth, textToSpeechWeb, generateThumbnail, getPacksList, downloadPack, isPackDownloaded, getVoices, renderVideo, getDownloadUrl } from './api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Estilos de video disponibles
const VIDEO_STYLES = [
    { id: 'informativo', label: 'Informativo', emoji: '📚' },
    { id: 'humor', label: 'Humor', emoji: '😂' },
    { id: 'misterio', label: 'Misterio', emoji: '🔮' },
    { id: 'motivacional', label: 'Motivacional', emoji: '💪' },
];

// Duraciones disponibles (valor en segundos, label en minutos)
const DURATIONS = [
    { value: 60, label: '1 min' },
    { value: 120, label: '2 min' },
    { value: 180, label: '3 min' },
    { value: 300, label: '5 min' },
    { value: 600, label: '10 min' },
];

// Packs de gameplay predeterminados (se actualizan desde el servidor)
const DEFAULT_PACKS = [
    { id: 'minecraft', name: 'Minecraft Parkour', size_mb: 45, clips: 10 },
    { id: 'satisfying', name: 'Satisfying', size_mb: 62, clips: 15 },
    { id: 'subway', name: 'Subway Surfers', size_mb: 38, clips: 8 },
    { id: 'gta', name: 'GTA Driving', size_mb: 55, clips: 12 },
];

export default function CreatorStudio({ t, lang = 'es' }) {
    // Estados del formulario
    const [tema, setTema] = useState('');
    const [estilo, setEstilo] = useState('informativo');
    const [duracion, setDuracion] = useState(60);
    const [selectedPack, setSelectedPack] = useState('minecraft');

    // Estados de generación
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState('');

    // Resultados
    const [result, setResult] = useState(null);
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Estado del servidor
    const [serverStatus, setServerStatus] = useState('checking');

    // Estados de packs
    const [gameplayPacks, setGameplayPacks] = useState(DEFAULT_PACKS);
    const [packDownloadStatus, setPackDownloadStatus] = useState({});
    const [downloadingPack, setDownloadingPack] = useState(null);

    // Estados de voz y video
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('es-MX-DaliaNeural');
    const [isRenderingVideo, setIsRenderingVideo] = useState(false);
    const [renderProgress, setRenderProgress] = useState('');
    const [videoUrl, setVideoUrl] = useState(null);

    // Estado de pago de prueba
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Verificar servidor y cargar packs al inicio
    useEffect(() => {
        checkServerStatus();
        loadPacks();
        loadVoices();

        // Check if payment was successful (redirected back from Stripe)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
            setPaymentSuccess(true);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Cargar voces disponibles
    const loadVoices = async () => {
        try {
            const data = await getVoices(lang);
            if (data.voices && data.voices.length > 0) {
                setVoices(data.voices);
                setSelectedVoice(data.voices[0].id);
            }
        } catch (error) {
            console.error('Error cargando voces:', error);
        }
    };

    // Cargar packs desde el servidor
    const loadPacks = async () => {
        try {
            const data = await getPacksList();
            if (data.packs) {
                setGameplayPacks(data.packs);
                // Verificar cuáles ya están descargados
                const status = {};
                for (const pack of data.packs) {
                    const downloaded = await isPackDownloaded(pack.id);
                    status[pack.id] = downloaded ? 'downloaded' : 'ready';
                }
                setPackDownloadStatus(status);
            }
        } catch (error) {
            console.error('Error cargando packs:', error);
        }
    };

    // Descargar un pack
    const handleDownloadPack = async (packId) => {
        if (downloadingPack) return; // Solo una descarga a la vez

        setDownloadingPack(packId);
        setPackDownloadStatus(prev => ({ ...prev, [packId]: 0 }));

        try {
            await downloadPack(packId, (progress) => {
                setPackDownloadStatus(prev => ({ ...prev, [packId]: progress }));
            });
            setPackDownloadStatus(prev => ({ ...prev, [packId]: 'downloaded' }));
        } catch (error) {
            console.error('Error descargando pack:', error);
            setPackDownloadStatus(prev => ({ ...prev, [packId]: 'ready' }));
            setError(lang === 'es' ? 'Error descargando pack' : 'Error downloading pack');
        } finally {
            setDownloadingPack(null);
        }
    };

    // Renderizar video completo
    const handleRenderVideo = async () => {
        if (!result?.guion) {
            setError(lang === 'es' ? 'Primero genera un guión' : 'Generate a script first');
            return;
        }

        setIsRenderingVideo(true);
        setRenderProgress(lang === 'es' ? 'Generando audio...' : 'Generating audio...');
        setVideoUrl(null);

        try {
            const videoResult = await renderVideo(result.guion, selectedPack, selectedVoice);

            if (videoResult.success) {
                setVideoUrl(getDownloadUrl(videoResult.filename));
                setRenderProgress(lang === 'es' ? '¡Video listo!' : 'Video ready!');
            } else {
                throw new Error('Error rendering video');
            }
        } catch (error) {
            console.error('Error renderizando video:', error);
            setError(lang === 'es' ? 'Error creando video' : 'Error creating video');
            setRenderProgress('');
        } finally {
            setIsRenderingVideo(false);
        }
    };

    const checkServerStatus = async () => {
        setServerStatus('checking');
        const health = await checkHealth();
        if (health.ollama_status === 'connected') {
            setServerStatus('connected');
        } else {
            setServerStatus('disconnected');
        }
    };

    // Generar contenido
    const handleGenerate = async () => {
        if (!tema.trim()) {
            setError(t?.creator?.errorNoTopic || 'Por favor ingresa un tema');
            return;
        }

        setError('');
        setIsGenerating(true);
        setCurrentStep(1);
        setResult(null);
        setThumbnailUrl(null);

        try {
            // Paso 1: Generar guión
            setCurrentStep(1);
            const scriptResult = await generateScript({
                tema: tema.trim(),
                duracion,
                idioma: lang,
                estilo,
            });

            setResult(scriptResult);

            // Paso 2: Generar thumbnail
            setCurrentStep(2);
            const thumbnail = await generateThumbnail(scriptResult.titulo || tema);
            setThumbnailUrl(thumbnail);

            // Completado
            setCurrentStep(3);

        } catch (err) {
            setError(err.message || 'Error al generar contenido');
        } finally {
            setIsGenerating(false);
        }
    };

    // Preview de audio
    const handlePlayAudio = async () => {
        if (!result?.guion) return;

        if (isPlaying) {
            speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        setIsPlaying(true);
        try {
            await textToSpeechWeb(result.guion, lang === 'es' ? 'es-MX' : 'en-US');
        } catch (err) {
            console.error('Error TTS:', err);
        }
        setIsPlaying(false);
    };

    // Copiar al portapapeles
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const steps = [
        { id: 1, label: lang === 'es' ? 'Generando guión...' : 'Generating script...' },
        { id: 2, label: lang === 'es' ? 'Creando miniatura...' : 'Creating thumbnail...' },
        { id: 3, label: lang === 'es' ? '¡Listo!' : 'Ready!' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">
                        {lang === 'es' ? 'Crear Video' : 'Create Video'}
                    </h2>
                    <p className="text-white/40 text-sm mt-1">
                        {lang === 'es'
                            ? 'Genera contenido viral con IA en segundos'
                            : 'Generate viral content with AI in seconds'}
                    </p>
                </div>

                {/* Server Status */}
                <div
                    onClick={checkServerStatus}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${serverStatus === 'connected'
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                        : serverStatus === 'checking'
                            ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}
                >
                    <div className={`w-2 h-2 rounded-full ${serverStatus === 'connected' ? 'bg-green-500' :
                        serverStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                        }`} />
                    <span className="text-[10px] font-bold uppercase">
                        {serverStatus === 'connected' ? 'AI Online' :
                            serverStatus === 'checking' ? 'Checking...' : 'AI Offline'}
                    </span>
                </div>
            </div>

            {/* Error de servidor */}
            {serverStatus === 'disconnected' && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-400 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-red-400">
                            {lang === 'es' ? 'Servidor no disponible' : 'Server unavailable'}
                        </p>
                        <p className="text-xs text-red-400/60 mt-1">
                            {lang === 'es'
                                ? 'Ejecuta start.bat en la carpeta facelesstube_backend'
                                : 'Run start.bat in facelesstube_backend folder'}
                        </p>
                    </div>
                </div>
            )}

            {/* Formulario de creación */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Panel Izquierdo - Inputs */}
                <div className="space-y-6">
                    {/* Tema */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            {lang === 'es' ? 'Tema del Video' : 'Video Topic'}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={tema}
                                onChange={(e) => setTema(e.target.value)}
                                placeholder={lang === 'es'
                                    ? 'Ej: Dato curioso sobre el espacio'
                                    : 'Ex: Curious fact about space'}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-base outline-none focus:border-primary/40 transition-all"
                            />
                            <Sparkles size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40" />
                        </div>
                    </div>

                    {/* Estilo y Duración */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Estilo */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                {lang === 'es' ? 'Estilo' : 'Style'}
                            </label>
                            <div className="relative">
                                <select
                                    value={estilo}
                                    onChange={(e) => setEstilo(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none appearance-none cursor-pointer focus:border-primary/40"
                                >
                                    {VIDEO_STYLES.map(style => (
                                        <option key={style.id} value={style.id}>
                                            {style.emoji} {style.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                            </div>
                        </div>

                        {/* Duración */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                {lang === 'es' ? 'Duración' : 'Duration'}
                            </label>
                            <div className="relative">
                                <select
                                    value={duracion}
                                    onChange={(e) => setDuracion(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none appearance-none cursor-pointer focus:border-primary/40"
                                >
                                    {DURATIONS.map(d => (
                                        <option key={d.value} value={d.value}>
                                            {d.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Gameplay Pack */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            {lang === 'es' ? 'Video de Fondo' : 'Background Video'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {gameplayPacks.map(pack => {
                                const status = packDownloadStatus[pack.id];
                                const isDownloading = typeof status === 'number';
                                const isDownloaded = status === 'downloaded';

                                return (
                                    <div
                                        key={pack.id}
                                        className={`p-3 rounded-xl border text-left transition-all relative ${selectedPack === pack.id
                                            ? 'bg-primary/10 border-primary/40'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <div
                                            onClick={() => setSelectedPack(pack.id)}
                                            className="cursor-pointer"
                                        >
                                            <span className="block text-sm font-bold">{pack.name}</span>
                                            <span className="text-[10px] text-white/40">
                                                {pack.clips} clips • {pack.size_mb || pack.size} MB
                                            </span>
                                        </div>

                                        {/* Download button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isDownloaded && !isDownloading) {
                                                    handleDownloadPack(pack.id);
                                                }
                                            }}
                                            disabled={isDownloading}
                                            className={`mt-2 w-full py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-1 transition-all ${isDownloaded
                                                ? 'bg-green-500/20 text-green-400 cursor-default'
                                                : isDownloading
                                                    ? 'bg-primary/20 text-primary cursor-wait'
                                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                                                }`}
                                        >
                                            {isDownloaded ? (
                                                <><Check size={10} /> {lang === 'es' ? 'Listo' : 'Ready'}</>
                                            ) : isDownloading ? (
                                                <><Loader2 size={10} className="animate-spin" /> {status}%</>
                                            ) : (
                                                <><Download size={10} /> {lang === 'es' ? 'Descargar' : 'Download'}</>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Voice Selector */}
                    {voices.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                {lang === 'es' ? 'Voz de Narración' : 'Narration Voice'}
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedVoice}
                                    onChange={(e) => setSelectedVoice(e.target.value)}
                                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary/50 focus:outline-none transition-all"
                                >
                                    {voices.map(voice => (
                                        <option key={voice.id} value={voice.id}>
                                            {voice.name} ({voice.accent}) - {voice.gender === 'Female' ? '👩' : '👨'}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Pago de prueba $0.01 */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 space-y-3">
                        <div className="flex items-center gap-2">
                            <CreditCard size={18} className="text-amber-400" />
                            <span className="text-sm font-black uppercase tracking-wider text-amber-400">
                                {lang === 'es' ? 'Prueba de Pago' : 'Payment Test'}
                            </span>
                        </div>
                        <p className="text-xs text-white/40">
                            {lang === 'es'
                                ? `Paga $0.01 USD para probar el sistema. Duración seleccionada: ${DURATIONS.find(d => d.value === duracion)?.label || '1 min'}`
                                : `Pay $0.01 USD to test the system. Selected duration: ${DURATIONS.find(d => d.value === duracion)?.label || '1 min'}`}
                        </p>
                        {paymentSuccess ? (
                            <div className="flex items-center gap-2 py-3 text-green-400 text-sm font-bold">
                                <Check size={18} />
                                {lang === 'es' ? '¡Pago exitoso! Sistema verificado.' : 'Payment successful! System verified.'}
                            </div>
                        ) : (
                            <button
                                onClick={async () => {
                                    setIsProcessingPayment(true);
                                    try {
                                        const res = await fetch('/api/create-checkout-session', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                amount: 1, // 1 centavo
                                                videoDuration: Math.round(duracion / 60), // En minutos
                                            }),
                                        });
                                        const data = await res.json();
                                        const stripe = await stripePromise;
                                        await stripe.redirectToCheckout({ sessionId: data.id });
                                    } catch (err) {
                                        console.error('Error en pago:', err);
                                        setError(lang === 'es' ? 'Error al procesar pago' : 'Error processing payment');
                                    } finally {
                                        setIsProcessingPayment(false);
                                    }
                                }}
                                disabled={isProcessingPayment}
                                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                                    isProcessingPayment
                                        ? 'bg-white/10 text-white/40 cursor-wait'
                                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/20'
                                }`}
                            >
                                {isProcessingPayment ? (
                                    <><Loader2 size={18} className="animate-spin" /> {lang === 'es' ? 'Procesando...' : 'Processing...'}</>
                                ) : (
                                    <><CreditCard size={18} /> {lang === 'es' ? 'Pagar $0.01 USD - Prueba' : 'Pay $0.01 USD - Test'}</>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Botón Generar */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || serverStatus !== 'connected'}
                        className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isGenerating || serverStatus !== 'connected'
                            ? 'bg-white/10 text-white/40 cursor-not-allowed'
                            : 'bg-primary text-white neon-glow hover:scale-[1.02] active:scale-95'
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                {steps.find(s => s.id === currentStep)?.label}
                            </>
                        ) : (
                            <>
                                <Wand2 size={24} />
                                {lang === 'es' ? 'Generar Guión' : 'Generate Script'}
                            </>
                        )}
                    </button>

                    {/* Botón Crear Video */}
                    {result && (
                        <button
                            onClick={handleRenderVideo}
                            disabled={isRenderingVideo || !result?.guion}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isRenderingVideo
                                ? 'bg-green-500/20 text-green-400 cursor-wait'
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-[1.02] active:scale-95'
                                }`}
                        >
                            {isRenderingVideo ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    {renderProgress}
                                </>
                            ) : (
                                <>
                                    <Play size={20} />
                                    {lang === 'es' ? '🎬 Crear Video' : '🎬 Create Video'}
                                </>
                            )}
                        </button>
                    )}

                    {/* Video Download */}
                    {videoUrl && (
                        <a
                            href={videoUrl}
                            download
                            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-purple-600 text-white hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <Download size={20} />
                            {lang === 'es' ? 'Descargar Video MP4' : 'Download MP4 Video'}
                        </a>
                    )}                    {/* Error */}
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Progress Steps */}
                    {isGenerating && (
                        <div className="flex items-center justify-center gap-2">
                            {steps.map((step, i) => (
                                <div key={step.id} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep > step.id
                                        ? 'bg-green-500 text-white'
                                        : currentStep === step.id
                                            ? 'bg-primary text-white animate-pulse'
                                            : 'bg-white/10 text-white/40'
                                        }`}>
                                        {currentStep > step.id ? <Check size={14} /> : step.id}
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className={`w-8 h-0.5 ${currentStep > step.id ? 'bg-green-500' : 'bg-white/10'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Panel Derecho - Resultados */}
                <div className="space-y-6">
                    {result ? (
                        <>
                            {/* Thumbnail Preview */}
                            {thumbnailUrl && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                        <Image size={12} />
                                        {lang === 'es' ? 'Miniatura' : 'Thumbnail'}
                                    </label>
                                    <div className="relative rounded-2xl overflow-hidden border border-white/10">
                                        <img src={thumbnailUrl} alt="Thumbnail" className="w-full aspect-video object-cover" />
                                        <a
                                            href={thumbnailUrl}
                                            download="thumbnail.jpg"
                                            className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/60 backdrop-blur-md hover:bg-black/80 transition-all"
                                        >
                                            <Download size={16} />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Título */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                    <FileText size={12} />
                                    {lang === 'es' ? 'Título' : 'Title'}
                                </label>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                                    <span className="text-sm font-bold">{result.titulo}</span>
                                    <button
                                        onClick={() => copyToClipboard(result.titulo)}
                                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Guión con Audio */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <FileText size={12} />
                                        {lang === 'es' ? 'Guión' : 'Script'}
                                    </span>
                                    <span className="flex items-center gap-1 text-primary">
                                        <Clock size={10} />
                                        ~{result.duracion_estimada}s
                                    </span>
                                </label>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                    <p className="text-sm text-white/80 leading-relaxed">
                                        {result.guion}
                                    </p>
                                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                        <button
                                            onClick={handlePlayAudio}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${isPlaying
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-primary/20 text-primary hover:bg-primary/30'
                                                }`}
                                        >
                                            {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                            {isPlaying
                                                ? (lang === 'es' ? 'Detener' : 'Stop')
                                                : (lang === 'es' ? 'Escuchar' : 'Listen')}
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(result.guion)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-xs font-bold uppercase hover:bg-white/20 transition-all"
                                        >
                                            <Copy size={14} />
                                            {lang === 'es' ? 'Copiar' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                    <FileText size={12} />
                                    {lang === 'es' ? 'Descripción YouTube' : 'YouTube Description'}
                                </label>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                                        {result.descripcion}
                                    </p>
                                    <button
                                        onClick={() => copyToClipboard(result.descripcion)}
                                        className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold uppercase hover:bg-white/20 transition-all"
                                    >
                                        <Copy size={12} />
                                        {lang === 'es' ? 'Copiar' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            {/* Hashtags */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                    <Hash size={12} />
                                    Hashtags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {result.hashtags?.map((tag, i) => (
                                        <span
                                            key={i}
                                            onClick={() => copyToClipboard(`#${tag}`)}
                                            className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold cursor-pointer hover:bg-primary/20 transition-all"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Botón Regenerar */}
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 font-bold text-sm uppercase flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                            >
                                <RefreshCw size={16} />
                                {lang === 'es' ? 'Regenerar' : 'Regenerate'}
                            </button>
                        </>
                    ) : (
                        /* Estado vacío */
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-white/10 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                <Wand2 size={32} className="text-white/20" />
                            </div>
                            <h3 className="text-lg font-bold text-white/40">
                                {lang === 'es' ? 'Tu contenido aparecerá aquí' : 'Your content will appear here'}
                            </h3>
                            <p className="text-sm text-white/20 mt-2 max-w-xs">
                                {lang === 'es'
                                    ? 'Ingresa un tema y haz clic en "Generar con IA"'
                                    : 'Enter a topic and click "Generate with AI"'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
