// Settings Modal - Simplified (all APIs are server-side now)
import { useState } from 'react'
import { X, Key, CheckCircle2, Sparkles, Video } from 'lucide-react'
import { useTranslation } from '../../store/i18nStore'

export default function SettingsModal({ isOpen, onClose }) {
    const { t, language } = useTranslation()

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-lg glass-card p-4 sm:p-6 animate-scale-in rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                            <Key size={20} className="text-neon-purple" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{t('settings.title')}</h2>
                            <p className="text-xs text-white/50">
                                {language === 'es' ? '✓ Todo configurado automáticamente' :
                                    language === 'en' ? '✓ Everything configured automatically' :
                                        '✓ Tudo configurado automaticamente'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>

                {/* Status */}
                <div className="space-y-3">
                    {/* AI */}
                    <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center flex-shrink-0">
                                <Sparkles size={18} className="text-neon-cyan" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">
                                        {language === 'es' ? 'Inteligencia Artificial' :
                                            language === 'en' ? 'Artificial Intelligence' : 'Inteligência Artificial'}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-neon-green/20 text-neon-green flex items-center gap-1">
                                        <CheckCircle2 size={12} />
                                        {language === 'es' ? 'Activa' : language === 'en' ? 'Active' : 'Ativa'}
                                    </span>
                                </div>
                                <p className="text-xs text-white/50 mt-0.5">
                                    {language === 'es' ? 'Genera guiones automáticamente — sin configuración' :
                                        language === 'en' ? 'Generates scripts automatically — no setup needed' :
                                            'Gera roteiros automaticamente — sem configuração'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Videos */}
                    <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center flex-shrink-0">
                                <Video size={18} className="text-neon-purple" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">
                                        {language === 'es' ? 'Videos de Fondo' :
                                            language === 'en' ? 'Background Videos' : 'Vídeos de Fundo'}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-neon-green/20 text-neon-green flex items-center gap-1">
                                        <CheckCircle2 size={12} />
                                        {language === 'es' ? 'Activa' : language === 'en' ? 'Active' : 'Ativa'}
                                    </span>
                                </div>
                                <p className="text-xs text-white/50 mt-0.5">
                                    {language === 'es' ? 'Videos HD de Pexels — sin configuración' :
                                        language === 'en' ? 'HD videos from Pexels — no setup needed' :
                                            'Vídeos HD do Pexels — sem configuração'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-white/40 mt-4 text-center">
                    {language === 'es' ? '100% gratuito — todo incluido' :
                        language === 'en' ? '100% free — everything included' :
                            '100% gratuito — tudo incluído'}
                </p>

                {/* Close button */}
                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl font-medium btn-neon"
                    >
                        {language === 'es' ? 'Cerrar' : language === 'en' ? 'Close' : 'Fechar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
