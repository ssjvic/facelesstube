// API Setup Tutorial - No longer needed since everything is server-side
// Kept as a simple welcome/info screen for backward compatibility
import { useState } from 'react'
import {
    X,
    ChevronRight,
    Sparkles,
    Video,
    Play,
    CheckCircle2
} from 'lucide-react'
import { useTranslation } from '../../store/i18nStore'

export default function ApiTutorial({ isOpen, onClose, onComplete }) {
    const { language } = useTranslation()

    if (!isOpen) return null

    const handleStart = () => {
        onComplete?.()
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl glass-card overflow-hidden animate-scale-in max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl">
                {/* Progress bar - full */}
                <div className="h-1 bg-dark-600 flex-shrink-0">
                    <div className="h-full w-full bg-gradient-to-r from-neon-cyan to-neon-purple" />
                </div>

                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                                <CheckCircle2 size={22} style={{ color: '#10b981' }} />
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold">
                                    {language === 'es' ? '🎉 ¡Todo listo!' :
                                        language === 'en' ? '🎉 All set!' :
                                            language === 'pt' ? '🎉 Tudo pronto!' :
                                                '🎉 All set!'}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                    <p className="text-white/70 mb-4 sm:mb-6 text-sm sm:text-base">
                        {language === 'es' ? 'Todo funciona automáticamente. No necesitas configurar nada.' :
                            language === 'en' ? 'Everything works automatically. No setup needed.' :
                                language === 'pt' ? 'Tudo funciona automaticamente. Sem configuração necessária.' :
                                    'Everything works automatically. No setup needed.'}
                    </p>

                    <div className="space-y-3 sm:space-y-4">
                        {/* AI - Automatic */}
                        <div className="p-3 sm:p-4 rounded-xl bg-neon-green/10 border border-neon-green/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neon-cyan/20 flex items-center justify-center flex-shrink-0">
                                    <Sparkles size={20} className="text-neon-cyan" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm sm:text-base">
                                        {language === 'es' ? '🤖 IA — Automática' :
                                            language === 'en' ? '🤖 AI — Automatic' :
                                                '🤖 IA — Automática'}
                                    </p>
                                    <p className="text-xs text-white/50">
                                        {language === 'es' ? 'Los guiones se generan automáticamente con IA.' :
                                            language === 'en' ? 'Scripts are generated automatically with AI.' :
                                                'Os roteiros são gerados automaticamente com IA.'}
                                    </p>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green text-xs">
                                        ✓ {language === 'es' ? 'Incluido gratis' : language === 'en' ? 'Included free' : 'Incluído grátis'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Videos - Automatic */}
                        <div className="p-3 sm:p-4 rounded-xl bg-neon-green/10 border border-neon-green/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neon-purple/20 flex items-center justify-center flex-shrink-0">
                                    <Video size={20} className="text-neon-purple" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm sm:text-base">
                                        {language === 'es' ? '🎬 Videos de Fondo — Automático' :
                                            language === 'en' ? '🎬 Background Videos — Automatic' :
                                                '🎬 Vídeos de Fundo — Automático'}
                                    </p>
                                    <p className="text-xs text-white/50">
                                        {language === 'es' ? 'Los videos de fondo se buscan automáticamente.' :
                                            language === 'en' ? 'Background videos are fetched automatically.' :
                                                'Os vídeos de fundo são buscados automaticamente.'}
                                    </p>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green text-xs">
                                        ✓ {language === 'es' ? 'Incluido gratis' : language === 'en' ? 'Included free' : 'Incluído grátis'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 border-t border-white/10 flex items-center justify-end flex-shrink-0" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
                    <button
                        onClick={handleStart}
                        className="btn-neon flex items-center gap-1.5 text-sm px-6 py-2.5"
                    >
                        {language === 'es' ? '¡Empezar!' :
                            language === 'en' ? 'Start!' :
                                language === 'pt' ? 'Começar!' : 'Start!'}
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}
