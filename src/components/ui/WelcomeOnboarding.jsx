import { useState } from 'react'
import {
    Sparkles,
    ChevronRight,
    ChevronLeft,
    Rocket,
    Lightbulb,
    TrendingUp,
    Crown,
    Zap,
    Check,
    Video,
    Mic,
    Wand2,
    Upload,
    BookOpen,
    Target,
    Clock,
    Film,
    Star
} from 'lucide-react'

const PLAN_DATA = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        icon: Zap,
        color: 'white/60',
        gradient: 'from-white/10 to-white/5',
        border: 'border-white/20',
        videos: '5 videos/mes',
        duration: '1 minuto max',
        extras: ['Marca de agua', 'Voces básicas'],
        badge: '🆓'
    },
    {
        id: 'starter',
        name: 'Starter',
        price: 9,
        icon: Sparkles,
        color: 'neon-blue',
        gradient: 'from-neon-blue/20 to-neon-blue/5',
        border: 'border-neon-blue/40',
        videos: '30 videos/mes',
        duration: 'Hasta 10 min',
        extras: ['Sin marca de agua', 'Soporte email'],
        badge: '⭐'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 19,
        icon: Crown,
        color: 'neon-purple',
        gradient: 'from-neon-purple/20 to-neon-purple/5',
        border: 'border-neon-purple/40',
        videos: '100 videos/mes',
        duration: 'Hasta 15 min',
        extras: ['Voces premium', 'Soporte prioritario'],
        popular: true,
        badge: '👑'
    },
    {
        id: 'unlimited',
        name: 'Unlimited',
        price: 29,
        icon: Star,
        color: 'neon-cyan',
        gradient: 'from-neon-cyan/20 to-neon-pink/10',
        border: 'border-neon-cyan/40',
        videos: 'Videos ilimitados',
        duration: 'Hasta 20 min',
        extras: ['Todas las voces', 'Soporte 24/7', 'API access'],
        badge: '🚀'
    }
]

export default function WelcomeOnboarding({ onComplete, userName }) {
    const [currentSlide, setCurrentSlide] = useState(0)

    const slides = [
        // Slide 0 - Welcome
        {
            content: (
                <div className="text-center px-2">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-cyan/30 to-neon-purple/30 flex items-center justify-center animate-pulse">
                        <Rocket size={40} className="text-neon-cyan" />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-display font-bold mb-3">
                        ¡Bienvenido, <span className="text-gradient">Creador</span>!
                    </h1>

                    <p className="text-white/70 text-base md:text-lg mb-6 leading-relaxed">
                        Estás a punto de convertirte en un <strong className="text-white">creador de contenido profesional</strong> sin necesidad de mostrar tu cara.
                    </p>

                    <div className="glass-card p-4 text-left max-w-sm mx-auto">
                        <p className="text-white/60 text-sm flex items-start gap-3">
                            <Lightbulb size={20} className="text-neon-yellow flex-shrink-0 mt-0.5" />
                            <span>
                                Miles de creadores ya ganan dinero en YouTube con videos faceless. <strong className="text-white">Tú puedes ser el siguiente.</strong>
                            </span>
                        </p>
                    </div>
                </div>
            )
        },

        // Slide 1 - How it works
        {
            content: (
                <div className="px-2">
                    <h2 className="text-xl md:text-2xl font-display font-bold mb-6 text-center">
                        ¿Cómo <span className="text-gradient">funciona</span>?
                    </h2>

                    <div className="space-y-4 max-w-sm mx-auto">
                        {[
                            { icon: Wand2, color: 'neon-cyan', step: '1', title: 'Escribe tu idea', desc: 'Solo necesitas una idea y la IA hace el resto' },
                            { icon: Mic, color: 'neon-purple', step: '2', title: 'Se crea el guión y voz', desc: 'IA genera el guión, narración y edita el video' },
                            { icon: Upload, color: 'neon-green', step: '3', title: 'Descarga y sube', desc: 'Tu video listo para YouTube en minutos' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 glass-card p-4" style={{ animationDelay: `${i * 150}ms` }}>
                                <div className={`w-12 h-12 rounded-xl bg-${item.color}/20 flex items-center justify-center flex-shrink-0`}>
                                    <item.icon size={24} className={`text-${item.color}`} />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm mb-0.5">{item.title}</p>
                                    <p className="text-white/60 text-xs">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 p-3 rounded-xl bg-neon-green/10 border border-neon-green/30 text-center max-w-sm mx-auto">
                        <p className="text-neon-green text-sm font-medium">
                            ✨ Todo funciona con APIs gratuitas — ¡No pagas por crear!
                        </p>
                    </div>
                </div>
            )
        },

        // Slide 2 - Tips & motivation
        {
            content: (
                <div className="px-2">
                    <h2 className="text-xl md:text-2xl font-display font-bold mb-6 text-center">
                        <span className="text-gradient">Tips</span> para triunfar
                    </h2>

                    <div className="space-y-3 max-w-sm mx-auto">
                        {[
                            { icon: Target, emoji: '🎯', text: 'Elige un nicho que te apasione: misterio, finanzas, curiosidades…' },
                            { icon: TrendingUp, emoji: '📈', text: 'La constancia es la clave. Sube 1 video diario y verás resultados en semanas.' },
                            { icon: BookOpen, emoji: '📚', text: 'Usa nuestros tutoriales para aprender las mejores estrategias de YouTube.' },
                            { icon: Clock, emoji: '💰', text: 'Creadores consistentes ganan de $500 a $5,000+ USD al mes con YouTube AdSense.' }
                        ].map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-lg flex-shrink-0">{tip.emoji}</span>
                                <p className="text-white/80 text-sm">{tip.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 border border-neon-purple/30 text-center max-w-sm mx-auto">
                        <p className="text-white/80 text-sm">
                            🔥 <strong className="text-white">Esto puede volverse tu trabajo.</strong> Muchos creadores faceless viven 100% de YouTube.
                        </p>
                    </div>
                </div>
            )
        },

        // Slide 3 - Plans & subscription
        {
            content: (
                <div className="px-2">
                    <h2 className="text-xl md:text-2xl font-display font-bold mb-2 text-center">
                        Elige tu <span className="text-gradient">plan</span>
                    </h2>
                    <p className="text-white/60 text-sm mb-5 text-center">
                        Empieza gratis y crece cuando estés listo
                    </p>

                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                        {PLAN_DATA.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative rounded-xl p-3 border bg-gradient-to-b ${plan.gradient} ${plan.border} ${plan.popular ? 'ring-2 ring-neon-purple' : ''}`}
                            >
                                {plan.popular && (
                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-neon-purple text-dark-900 text-[10px] font-bold rounded-full whitespace-nowrap">
                                        POPULAR
                                    </span>
                                )}
                                <div className="text-center mb-2">
                                    <span className="text-lg">{plan.badge}</span>
                                    <p className="font-bold text-sm">{plan.name}</p>
                                    <p className="text-lg font-display font-bold">
                                        ${plan.price}
                                        <span className="text-white/40 text-xs">/mes</span>
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Video size={12} className="text-neon-cyan flex-shrink-0" />
                                        <span className="text-xs text-white/80">{plan.videos}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Film size={12} className="text-neon-cyan flex-shrink-0" />
                                        <span className="text-xs text-white/80">{plan.duration}</span>
                                    </div>
                                    {plan.extras.map((extra, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <Check size={12} className="text-neon-green flex-shrink-0" />
                                            <span className="text-xs text-white/60">{extra}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-white/40 text-xs text-center mt-4">
                        Puedes cambiar o cancelar tu plan en cualquier momento
                    </p>
                </div>
            )
        }
    ]

    const totalSlides = slides.length
    const isLastSlide = currentSlide === totalSlides - 1

    const handleNext = () => {
        if (isLastSlide) {
            localStorage.setItem('facelesstube_onboarding_done', 'true')
            onComplete()
        } else {
            setCurrentSlide(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1)
        }
    }

    const handleSkip = () => {
        localStorage.setItem('facelesstube_onboarding_done', 'true')
        onComplete()
    }

    return (
        <div className="max-w-lg mx-auto">
            <div className="glass-card p-6 md:p-8 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink" />

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide
                                ? 'w-8 bg-neon-cyan'
                                : i < currentSlide
                                    ? 'w-2 bg-neon-cyan/50'
                                    : 'w-2 bg-white/20'
                                }`}
                        />
                    ))}
                </div>

                {/* Slide content */}
                <div className="min-h-[380px] md:min-h-[420px] flex items-center justify-center">
                    <div className="w-full" key={currentSlide}>
                        {slides[currentSlide].content}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                    <div>
                        {currentSlide > 0 ? (
                            <button
                                onClick={handlePrev}
                                className="flex items-center gap-1 text-white/60 hover:text-white transition-colors text-sm"
                            >
                                <ChevronLeft size={16} />
                                Atrás
                            </button>
                        ) : (
                            <button
                                onClick={handleSkip}
                                className="text-white/40 hover:text-white/60 transition-colors text-sm"
                            >
                                Saltar
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleNext}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all text-sm ${isLastSlide
                            ? 'btn-neon'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                    >
                        {isLastSlide ? (
                            <>
                                ¡Empezar a crear!
                                <Rocket size={16} />
                            </>
                        ) : (
                            <>
                                Siguiente
                                <ChevronRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
