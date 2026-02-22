import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Play,
    Sparkles,
    Zap,
    Youtube,
    CheckCircle2,
    ArrowRight,
    Star,
    Wand2,
    Video,
    Upload,
    Mail,
    Plus,
    Minus,
    ChevronDown,
    X,
    Users,
    TrendingUp,
    ShieldCheck,
    Smartphone
} from 'lucide-react'
import { useTranslation, LANGUAGES } from '../store/i18nStore'

// Particle component for background effect
function Particles() {
    return (
        <div className="particles-container">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="particle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 20}s`,
                        animationDuration: `${15 + Math.random() * 15}s`,
                    }}
                />
            ))}
        </div>
    )
}

// Countdown Timer Component
function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState({ days: 6, hours: 14, minutes: 23, seconds: 59 })

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
                if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
                return prev
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="countdown-container">
            <div className="countdown-box">
                <span className="countdown-value">{timeLeft.days}</span>
                <span className="countdown-label">Días</span>
            </div>
            <div className="countdown-box">
                <span className="countdown-value">{timeLeft.hours}</span>
                <span className="countdown-label">Hrs</span>
            </div>
            <div className="countdown-box">
                <span className="countdown-value">{timeLeft.minutes}</span>
                <span className="countdown-label">Min</span>
            </div>
            <div className="countdown-box">
                <span className="countdown-value">{timeLeft.seconds}</span>
                <span className="countdown-label">Seg</span>
            </div>
        </div>
    )
}

export default function Landing() {
    const { t, language, setLanguage } = useTranslation()
    const [activeFaq, setActiveFaq] = useState(null)
    const [showExitPopup, setShowExitPopup] = useState(false)
    const [liveUsers, setLiveUsers] = useState(247)

    useEffect(() => {
        const handleMouseLeave = (e) => {
            if (e.clientY <= 0 && !localStorage.getItem('exit_popup_shown')) {
                setShowExitPopup(true)
                localStorage.setItem('exit_popup_shown', 'true')
            }
        }
        document.addEventListener('mouseleave', handleMouseLeave)

        const interval = setInterval(() => {
            setLiveUsers(prev => prev + (Math.random() > 0.5 ? 1 : -1))
        }, 5000)

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave)
            clearInterval(interval)
        }
    }, [])

    const faq = [
        {
            q: "¿YouTube me baneará por usar esto?",
            a: "No. FacelessTube genera contenido original y único. La IA crea scripts y ediciones personalizadas que cumplen con las políticas de monetización. Miles de canales operan así exitosamente."
        },
        {
            q: "¿Necesito mostrarme en cámara?",
            a: "No, en absoluto. Precisamente esa es la esencia de FacelessTube. Puedes ser un creador exitoso manteniendo total privacidad."
        },
        {
            q: "¿Cuánto puedo ganar?",
            a: "El potencial de ingresos depende de tu nicho y consistencia. Un canal promedio con 10,000 vistas mensuales puede generar entre $20 y $50 USD solo en AdSense, sin contar afiliados o patrocinios."
        },
        {
            q: "¿Funciona en mi celular?",
            a: "Sí. FacelessTube está optimizado para funcionar directamente en tu navegador móvil, iOS y Android. Crea videos desde cualquier lugar."
        },
        {
            q: "¿Y si no funciona para mí?",
            a: "Ofrecemos tus primeros 5 videos totalmente gratis para que pruebes el sistema sin compromiso. Cero riesgo, puedes cancelar cuando quieras."
        }
    ]

    const tiers = [
        {
            name: 'Free',
            price: 0,
            features: ['5 videos mensuales', 'Marca de agua', 'Solo YouTube', 'Baja prioridad'],
            highlight: false
        },
        {
            name: 'Starter',
            price: 9,
            features: ['30 videos mensuales', 'Sin marca de agua', 'Solo YouTube', 'Soporte prioritario'],
            highlight: false
        },
        {
            name: 'Creator',
            price: 19,
            features: ['100 videos mensuales', 'Sin marca de agua', 'Multi-platform*', 'Analytics básicos'],
            highlight: true,
            comingSoon: true
        },
        {
            name: 'Pro',
            price: 39,
            features: ['Videos Ilimitados', 'Sin marca de agua', 'Multi-platform', 'Analytics Avanzados'],
            highlight: false
        }
    ]

    const steps = [
        {
            icon: Wand2,
            title: "1. Escribe tu idea",
            desc: "Solo describe de qué quieres que trate el video."
        },
        {
            icon: Sparkles,
            title: "2. Genera el video",
            desc: "La IA crea el script, la voz y la edición en segundos."
        },
        {
            icon: Upload,
            title: "3. Sube y gana",
            desc: "Publica directamente a YouTube y empieza a monetizar."
        }
    ]

    return (
        <div className="relative bg-cosmic-950 min-h-screen">
            {/* Background Effects */}
            <div className="bg-glow-top" />
            <Particles />

            {/* Aurora Orbs */}
            <div className="aurora-orb aurora-orb-1" />
            <div className="aurora-orb aurora-orb-2" />
            <div className="aurora-orb aurora-orb-3" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="./logo.png" alt="FacelessTube" className="h-10 w-auto" />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex live-counter">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span>{liveUsers} personas probando ahora</span>
                        </div>
                        <Link to="/auth" className="btn-aurora py-2.5 px-6">
                            Entrar
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center pt-28 pb-10 px-6 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass mb-8 border border-aurora-teal/30">
                        <Star size={16} className="text-aurora-gold" />
                        <span className="text-sm font-medium">Early Access: $6.99 para siempre (Solo 500 plazas)</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
                        Tu primer video de YouTube listo en <span className="text-aurora">140 segundos</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-10 font-medium">
                        Sin cámara. Sin edición. Solo ideas &rarr; dinero.
                    </p>

                    <div className="flex flex-col items-center gap-6 mb-16">
                        <Link to="/auth" className="btn-aurora text-xl px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold transform hover:scale-105 transition-all shadow-xl shadow-green-500/20">
                            Empieza Gratis - 5 videos
                        </Link>

                        <div className="mt-4">
                            <p className="text-sm text-aurora-teal mb-4 font-bold uppercase tracking-widest">La oferta de lanzamiento termina en:</p>
                            <CountdownTimer />
                        </div>
                    </div>

                    {/* Visual Proof */}
                    <div className="mt-12 max-w-4xl mx-auto rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl">
                        <video
                            src="./splash.mp4"
                            autoPlay
                            muted
                            loop
                            playsInline
                            controls
                            className="w-full h-auto aspect-video object-cover"
                            poster="./logo.png"
                        />
                    </div>
                </div>
            </section>

            {/* Section 2: Problem -> Solution */}
            <section className="py-24 px-6 relative z-10 bg-cosmic-900/50">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-rose-400">
                                YouTube es la clave... pero es difícil.
                            </h2>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <X className="text-rose-500 flex-shrink-0" />
                                    <p className="text-white/60">Editar videos toma horas (o días) de trabajo manual.</p>
                                </li>
                                <li className="flex gap-4">
                                    <X className="text-rose-500 flex-shrink-0" />
                                    <p className="text-white/60">Comprar equipos cuesta miles de dólares.</p>
                                </li>
                                <li className="flex gap-4">
                                    <X className="text-rose-500 flex-shrink-0" />
                                    <p className="text-white/60">Mostrarte en cámara da pena o simplemente no quieres.</p>
                                </li>
                            </ul>
                        </div>
                        <div className="glass-card p-8 border-aurora-teal/30">
                            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-aurora-teal">
                                FacelessTube elimina TODO eso.
                            </h2>
                            <div className="space-y-8">
                                {steps.map((step, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-aurora-teal/10 flex items-center justify-center border border-aurora-teal/20 flex-shrink-0">
                                            <step.icon className="text-aurora-teal" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                                            <p className="text-white/50">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Social Proof */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-16">Los resultados hablan por sí solos</h2>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="glass-card p-8">
                            <TrendingUp className="text-aurora-teal mx-auto mb-4" size={40} />
                            <div className="text-4xl font-bold mb-2">+2,347</div>
                            <div className="text-white/40">Vistas en la primera semana</div>
                        </div>
                        <div className="glass-card p-8">
                            <Youtube className="text-red-500 mx-auto mb-4" size={40} />
                            <div className="text-4xl font-bold mb-2">∞</div>
                            <div className="text-white/40">Crea todos los videos que quieras en un día</div>
                        </div>
                        <div className="glass-card p-8">
                            <Star className="text-aurora-gold mx-auto mb-4" size={40} />
                            <div className="text-4xl font-bold mb-2">$127 USD</div>
                            <div className="text-white/40">Promedio ganado al mes</div>
                        </div>
                    </div>

                    {/* Testimonials */}
                    <div className="grid md:grid-cols-2 gap-8 text-left">
                        <div className="glass-card p-8">
                            <div className="flex gap-1 text-aurora-gold mb-4">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <p className="text-lg italic mb-6">"Empecé sin saber nada de YouTube. FacelessTube me ayudó a crear mi canal y ahora gano dinero extra cada mes sin aparecer en cámara."</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-aurora-teal to-aurora-violet" />
                                <div>
                                    <div className="font-bold">María, 22</div>
                                    <div className="text-white/40 text-sm">Estudiante</div>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-8">
                            <div className="flex gap-1 text-aurora-gold mb-4">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <p className="text-lg italic mb-6">"Subo videos mientras duermo, gano al despertar. FacelessTube es como tener un equipo de edición 24/7."</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-aurora-magenta to-aurora-rose" />
                                <div>
                                    <div className="font-bold">Carlos, 19</div>
                                    <div className="text-white/40 text-sm">Gamer & Creador</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-6 relative z-10 bg-cosmic-900/50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16">Acceso flexible para todos</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {tiers.map((tier, i) => (
                            <div key={i} className={`glass-card p-8 flex flex-col ${tier.highlight ? 'border-aurora-violet ring-2 ring-aurora-violet/30 scale-105 z-10' : ''}`}>
                                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">${tier.price}</span>
                                    <span className="text-white/40">/mes</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-grow">
                                    {tier.features.map((f, j) => (
                                        <li key={j} className="flex gap-3 text-sm text-white/70">
                                            <CheckCircle2 size={16} className="text-aurora-teal flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/auth" className={`w-full py-4 rounded-xl font-bold text-center transition-all ${tier.highlight ? 'btn-aurora' : 'btn-secondary'}`}>
                                    {tier.price === 0 ? 'Empieza Gratis' : 'Elegir Plan'}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-16">Preguntas frecuentes</h2>
                    <div className="space-y-4">
                        {faq.map((item, i) => (
                            <div key={i} className={`faq-item ${activeFaq === i ? 'active' : ''}`}>
                                <button
                                    className="faq-question font-bold text-lg"
                                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                >
                                    {item.q}
                                    <ChevronDown className={`faq-icon ${activeFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                <div className="faq-answer">
                                    {item.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Exit Intent Popup */}
            <div className={`exit-popup-overlay ${showExitPopup ? 'show' : ''}`}>
                <div className="exit-popup-content">
                    <button
                        className="absolute top-6 right-6 text-white/20 hover:text-white"
                        onClick={() => setShowExitPopup(false)}
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-3xl font-bold mb-4 text-aurora-teal">¡Espera!</h2>
                    <p className="text-xl text-white/60 mb-8">
                        Prueba FacelessTube GRATIS ahora. <br />
                        Solo email, sin tarjeta de crédito.
                    </p>
                    <Link to="/auth" className="btn-aurora text-lg px-12 py-4 w-full block">
                        Obtener mis 5 videos gratis
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/10 relative z-10">
                <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
                    <div className="flex items-center gap-8 text-sm text-white/40">
                        <Link to="/privacy">Privacidad</Link>
                        <Link to="/terms">Términos</Link>
                        <a href="mailto:contacto@facelesstube.mx">Contacto</a>
                    </div>
                    <div className="text-center">
                        <p className="text-white/30 text-sm">© 2026 FacelessTube. All rights reserved.</p>
                        <p className="text-white/20 text-xs mt-1">A product by Kawas Holding Group Apps</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
