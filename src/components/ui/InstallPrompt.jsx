// PWA Install Prompt Component
import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        // Listen for install prompt
        const handleBeforeInstall = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)

            // Show prompt after delay if not dismissed
            const dismissed = localStorage.getItem('pwa_install_dismissed')
            if (!dismissed) {
                setTimeout(() => setShowPrompt(true), 3000)
            }
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true)
            setShowPrompt(false)
            setDeferredPrompt(null)
        })

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setIsInstalled(true)
        }

        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('pwa_install_dismissed', 'true')
    }

    if (isInstalled || !showPrompt) return null

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 animate-slide-up">
            <div className="glass-card p-4 border border-neon-cyan/30">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/10"
                >
                    <X size={16} />
                </button>

                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center flex-shrink-0">
                        <Download size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold mb-1">Instala FacelessTube</h3>
                        <p className="text-sm text-white/60 mb-3">
                            Acceso rápido desde tu pantalla de inicio
                        </p>
                        <button
                            onClick={handleInstall}
                            className="btn-neon w-full py-2 text-sm"
                        >
                            Instalar App
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
