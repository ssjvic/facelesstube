import { useState } from 'react'
import {
    User,
    Coins,
    CreditCard,
    Calendar,
    Youtube,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    History,
    Zap,
    Gift,
    Loader2
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from '../store/i18nStore'
import { toast } from '../store/toastStore'
import { signInWithGoogle } from '../services/googleAuth'
import { Capacitor } from '@capacitor/core'

// Mock transactions
const mockTransactions = [
    { id: '1', type: 'video', description: 'Video: Traición Familiar', credits: 0, date: '2025-01-04' },
    { id: '2', type: 'video', description: 'Video: El Secreto', credits: 0, date: '2025-01-03' },
    { id: '3', type: 'signup', description: 'Welcome credits', credits: 100, date: '2025-01-01' },
]

// Valid promo codes (add your codes here or verify server-side via Supabase)
// Format: 'CODE': { credits: 50, type: 'credits', message: 'Message' }
// Or for upgrades: 'CODE': { tier: 'pro', type: 'upgrade', message: 'Message' }
const PROMO_CODES = {
    // Add your promo codes here
}

export default function Account() {
    const { user, getTierInfo, getAllTiers, addCredits, updateUser } = useAuthStore()
    const { language } = useTranslation()
    const tierInfo = getTierInfo()
    const allTiers = getAllTiers()
    const [transactions] = useState(mockTransactions)
    const [promoCode, setPromoCode] = useState('')
    const [isRedeeming, setIsRedeeming] = useState(false)
    const [isConnectingYouTube, setIsConnectingYouTube] = useState(false)

    // Handle YouTube connection
    const handleConnectYouTube = async () => {
        setIsConnectingYouTube(true)

        try {
            const result = await signInWithGoogle()

            if (result.success) {
                await updateUser({ youtubeConnected: true })
                toast.success('¡Canal de YouTube conectado!')
            } else {
                const errorMsg = result.error || 'Error al conectar YouTube'
                toast.error(errorMsg)
            }
        } catch (error) {
            console.error('YouTube auth error:', error)
            toast.error(error.message || 'Error al conectar')
        } finally {
            setIsConnectingYouTube(false)
        }
    }

    const videosUsed = user?.videosThisMonth || 0
    const videosLimit = tierInfo.videosPerMonth
    const videosPercent = videosLimit === Infinity ? 0 : (videosUsed / videosLimit) * 100

    // Handle promo code redemption
    const handleRedeemCode = async () => {
        if (!promoCode.trim()) return

        setIsRedeeming(true)

        // Simulate API delay
        await new Promise(r => setTimeout(r, 1000))

        const code = promoCode.toUpperCase().trim()
        const promo = PROMO_CODES[code]

        if (promo) {
            if (promo.type === 'credits') {
                await addCredits(promo.credits)
                toast.success(promo.message)
            } else if (promo.type === 'upgrade') {
                await updateUser({ tier: promo.tier })
                toast.success(promo.message)
            }
            setPromoCode('')
        } else {
            toast.error(getText('invalidCode'))
        }

        setIsRedeeming(false)
    }

    // Translations
    const t = {
        myAccount: { es: 'Mi Cuenta', en: 'My Account', pt: 'Minha Conta', fr: 'Mon Compte', de: 'Mein Konto', zh: '我的账户' },
        manageProfile: { es: 'Gestiona tu perfil, suscripción y créditos', en: 'Manage your profile, subscription and credits', pt: 'Gerencie seu perfil, assinatura e créditos', fr: 'Gérez votre profil, abonnement et crédits', de: 'Verwalte dein Profil, Abonnement und Guthaben', zh: '管理您的个人资料、订阅和积分' },
        currentPlan: { es: 'Plan actual', en: 'Current plan', pt: 'Plano atual', fr: 'Plan actuel', de: 'Aktueller Plan', zh: '当前计划' },
        changePlan: { es: 'Cambiar plan', en: 'Change plan', pt: 'Mudar plano', fr: 'Changer de plan', de: 'Plan ändern', zh: '更改计划' },
        videosThisMonth: { es: 'Videos este mes', en: 'Videos this month', pt: 'Vídeos este mês', fr: 'Vidéos ce mois', de: 'Videos diesen Monat', zh: '本月视频' },
        watermarkWarning: { es: 'Videos con marca de agua (max 1 min)', en: 'Videos with watermark (max 1 min)', pt: 'Vídeos com marca d\'água (max 1 min)', fr: 'Vidéos avec filigrane (max 1 min)', de: 'Videos mit Wasserzeichen (max 1 min)', zh: '带水印视频（最长1分钟）' },
        creditBalance: { es: 'Balance de créditos', en: 'Credit balance', pt: 'Saldo de créditos', fr: 'Solde de crédits', de: 'Guthaben', zh: '积分余额' },
        buyCredits: { es: 'Comprar créditos', en: 'Buy credits', pt: 'Comprar créditos', fr: 'Acheter des crédits', de: 'Guthaben kaufen', zh: '购买积分' },
        creditsTip: { es: 'Los créditos se usan solo para herramientas premium (ElevenLabs, D-ID, etc). La generación básica es', en: 'Credits are only used for premium tools (ElevenLabs, D-ID, etc). Basic generation is', pt: 'Os créditos são usados apenas para ferramentas premium (ElevenLabs, D-ID, etc). A geração básica é', fr: 'Les crédits sont utilisés uniquement pour les outils premium (ElevenLabs, D-ID, etc). La génération de base est', de: 'Guthaben werden nur für Premium-Tools verwendet (ElevenLabs, D-ID, etc). Die Basisgenerierung ist', zh: '积分仅用于高级工具（ElevenLabs、D-ID等）。基础生成是' },
        free: { es: 'gratis', en: 'free', pt: 'grátis', fr: 'gratuite', de: 'kostenlos', zh: '免费的' },
        channelConnected: { es: 'Canal conectado', en: 'Channel connected', pt: 'Canal conectado', fr: 'Chaîne connectée', de: 'Kanal verbunden', zh: '已连接频道' },
        connectYouTubeDesc: { es: 'Conecta tu canal de YouTube para subir videos directamente.', en: 'Connect your YouTube channel to upload videos directly.', pt: 'Conecte seu canal do YouTube para enviar vídeos diretamente.', fr: 'Connectez votre chaîne YouTube pour télécharger des vidéos directement.', de: 'Verbinde deinen YouTube-Kanal, um Videos direkt hochzuladen.', zh: '连接您的YouTube频道以直接上传视频。' },
        connectChannel: { es: 'Conectar Canal', en: 'Connect Channel', pt: 'Conectar Canal', fr: 'Connecter la chaîne', de: 'Kanal verbinden', zh: '连接频道' },
        transactionHistory: { es: 'Historial de transacciones', en: 'Transaction history', pt: 'Histórico de transações', fr: 'Historique des transactions', de: 'Transaktionsverlauf', zh: '交易记录' },
        credits: { es: 'créditos', en: 'credits', pt: 'créditos', fr: 'crédits', de: 'Guthaben', zh: '积分' },
        promoCode: { es: 'Código promocional', en: 'Promo code', pt: 'Código promocional', fr: 'Code promo', de: 'Promo-Code', zh: '促销代码' },
        enterCode: { es: 'Ingresa tu código', en: 'Enter your code', pt: 'Digite seu código', fr: 'Entrez votre code', de: 'Code eingeben', zh: '输入您的代码' },
        redeem: { es: 'Canjear', en: 'Redeem', pt: 'Resgatar', fr: 'Échanger', de: 'Einlösen', zh: '兑换' },
        invalidCode: { es: 'Código inválido o ya usado', en: 'Invalid or already used code', pt: 'Código inválido ou já usado', fr: 'Code invalide ou déjà utilisé', de: 'Ungültiger oder bereits verwendeter Code', zh: '无效或已使用的代码' },
        promoDesc: { es: 'Obtén créditos gratis o upgrades con códigos de promoción', en: 'Get free credits or upgrades with promo codes', pt: 'Obtenha créditos grátis ou upgrades com códigos promocionais', fr: 'Obtenez des crédits gratuits ou des mises à niveau avec des codes promo', de: 'Erhalte kostenlose Guthaben oder Upgrades mit Promo-Codes', zh: '使用促销代码获取免费积分或升级' }
    }

    const getText = (key) => t[key]?.[language] || t[key]?.en || key

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-4 md:mb-8">
                <h1 className="text-xl md:text-3xl font-display font-bold mb-1">
                    {getText('myAccount')}
                </h1>
                <p className="text-white/60 text-sm md:text-base">
                    {getText('manageProfile')}
                </p>
            </div>

            {/* Profile card */}
            <div className="glass-card p-4 md:p-6 mb-4 md:mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-2xl font-bold">
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{user?.name || 'Usuario'}</h2>
                        <p className="text-white/60">{user?.email}</p>
                    </div>
                </div>

                {/* Current plan */}
                <div className="p-4 rounded-xl bg-dark-600/50 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-white/60 mb-1">{getText('currentPlan')}</p>
                            <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${user?.tier === 'free' ? 'badge-free' : ''}
                ${user?.tier === 'starter' ? 'badge-starter' : ''}
                ${user?.tier === 'pro' ? 'badge-pro' : ''}
                ${user?.tier === 'unlimited' ? 'badge-unlimited' : ''}
              `}>
                                {tierInfo.name}
                            </span>
                        </div>
                        <a
                            href="/app/premium"
                            className="flex items-center gap-1 text-neon-cyan hover:underline text-sm"
                        >
                            {getText('changePlan')}
                            <ChevronRight size={16} />
                        </a>
                    </div>

                    {/* Usage bar */}
                    <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/60">{getText('videosThisMonth')}</span>
                            <span>
                                {videosUsed} / {videosLimit === Infinity ? '∞' : videosLimit}
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-dark-500 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all"
                                style={{ width: `${Math.min(videosPercent, 100)}%` }}
                            />
                        </div>
                    </div>

                    {tierInfo.watermark && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-yellow-400">
                            <AlertCircle size={14} />
                            <span>{getText('watermarkWarning')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Promo Code Section */}
            <div className="glass-card p-4 md:p-6 mb-4 md:mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 flex items-center justify-center">
                        <Gift size={20} className="text-neon-pink" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">{getText('promoCode')}</h3>
                        <p className="text-sm text-white/50">{getText('promoDesc')}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder={getText('enterCode')}
                        className="input-glass flex-1 uppercase tracking-wider"
                        maxLength={20}
                    />
                    <button
                        onClick={handleRedeemCode}
                        disabled={isRedeeming || !promoCode.trim()}
                        className="btn-neon px-6 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isRedeeming ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Gift size={18} />
                        )}
                        {getText('redeem')}
                    </button>
                </div>
            </div>

            {/* YouTube connection */}
            <div className="glass-card p-4 md:p-6 mb-4 md:mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Youtube size={24} className="text-red-500" />
                    <h3 className="text-lg font-semibold">YouTube</h3>
                </div>

                {user?.youtubeConnected ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-neon-green/10 border border-neon-green/30">
                        <CheckCircle2 size={20} className="text-neon-green" />
                        <span>{getText('channelConnected')}</span>
                    </div>
                ) : (
                    <div>
                        <p className="text-white/60 mb-4">
                            {getText('connectYouTubeDesc')}
                        </p>
                        <button
                            onClick={handleConnectYouTube}
                            disabled={isConnectingYouTube}
                            className="btn-neon flex items-center gap-2 disabled:opacity-50"
                        >
                            {isConnectingYouTube ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Youtube size={18} />
                            )}
                            {isConnectingYouTube ? 'Conectando...' : getText('connectChannel')}
                        </button>
                    </div>
                )}
            </div>

            {/* Version */}
            <div className="text-center mt-12 pb-6 text-white/40 text-xs">
                FacelessTube v2.0.0 (Server Rendering)
            </div>
        </div>
    )
}

function Play(props) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    )
}
