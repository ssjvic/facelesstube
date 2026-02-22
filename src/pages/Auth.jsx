import { useNavigate, Link } from 'react-router-dom'
import { Chrome, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useState, useEffect } from 'react'
import { useTranslation } from '../store/i18nStore'

export default function Auth() {
    const { user, loginWithGoogle, loginWithEmail, signUpWithEmail, loading, error, isDemo } = useAuthStore()
    const { language } = useTranslation()
    const [isLoggingIn, setIsLoggingIn] = useState(false)
    const [mode, setMode] = useState('login') // 'login' | 'signup'
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    })
    const [formError, setFormError] = useState('')
    const navigate = useNavigate()

    // Auto-redirect if user is already authenticated
    // This is the ONLY place that navigates to /app after login.
    // The login handlers below do NOT call navigate — they let this 
    // useEffect react to the user state change, which avoids the race
    // condition where navigate fires before Zustand propagates to App.jsx.
    useEffect(() => {
        if (user) {
            console.log('🔄 Auth: user detected, redirecting to /app')
            navigate('/app', { replace: true })
        }
    }, [user, navigate])

    const texts = {
        welcome: { es: 'Bienvenido a', en: 'Welcome to', pt: 'Bem-vindo ao', fr: 'Bienvenue à', de: 'Willkommen bei', zh: '欢迎使用' },
        loginSubtitle: { es: 'Inicia sesión para empezar a crear videos con IA', en: 'Sign in to start creating videos with AI', pt: 'Faça login para começar a criar vídeos com IA', fr: 'Connectez-vous pour créer des vidéos avec l\'IA', de: 'Melden Sie sich an, um Videos mit KI zu erstellen', zh: '登录以开始使用AI创建视频' },
        signupSubtitle: { es: 'Crea tu cuenta gratis', en: 'Create your free account', pt: 'Crie sua conta gratuita', fr: 'Créez votre compte gratuit', de: 'Erstellen Sie Ihr kostenloses Konto', zh: '创建您的免费账户' },
        continueGoogle: { es: 'Continuar con Google', en: 'Continue with Google', pt: 'Continuar com Google', fr: 'Continuer avec Google', de: 'Mit Google fortfahren', zh: '使用Google继续' },
        orEmail: { es: 'O con email', en: 'Or with email', pt: 'Ou com email', fr: 'Ou avec email', de: 'Oder mit E-Mail', zh: '或使用邮箱' },
        email: { es: 'Email', en: 'Email', pt: 'Email', fr: 'Email', de: 'E-Mail', zh: '邮箱' },
        password: { es: 'Contraseña', en: 'Password', pt: 'Senha', fr: 'Mot de passe', de: 'Passwort', zh: '密码' },
        name: { es: 'Nombre', en: 'Name', pt: 'Nome', fr: 'Nom', de: 'Name', zh: '姓名' },
        login: { es: 'Iniciar Sesión', en: 'Sign In', pt: 'Entrar', fr: 'Se connecter', de: 'Anmelden', zh: '登录' },
        signup: { es: 'Crear Cuenta', en: 'Sign Up', pt: 'Cadastrar', fr: 'S\'inscrire', de: 'Registrieren', zh: '注册' },
        noAccount: { es: '¿No tienes cuenta?', en: "Don't have an account?", pt: 'Não tem conta?', fr: "Vous n'avez pas de compte?", de: 'Kein Konto?', zh: '没有账户？' },
        hasAccount: { es: '¿Ya tienes cuenta?', en: 'Already have an account?', pt: 'Já tem conta?', fr: 'Vous avez déjà un compte?', de: 'Bereits ein Konto?', zh: '已有账户？' },
        demoMode: { es: 'Modo Demo', en: 'Demo Mode', pt: 'Modo Demo', fr: 'Mode Démo', de: 'Demo-Modus', zh: '演示模式' },
        demoNote: { es: 'En modo demo, se creará una cuenta de prueba automáticamente.\nPara producción, configura Supabase.', en: 'In demo mode, a test account will be created automatically.\nFor production, configure Supabase.', pt: 'No modo demo, uma conta de teste será criada automaticamente.\nPara produção, configure o Supabase.', fr: 'En mode démo, un compte de test sera créé automatiquement.\nPour la production, configurez Supabase.', de: 'Im Demo-Modus wird automatisch ein Testkonto erstellt.\nFür die Produktion konfigurieren Sie Supabase.', zh: '在演示模式下，将自动创建测试账户。\n对于生产环境，请配置Supabase。' },
        freeIncludes: { es: 'Incluye gratis:', en: 'Free includes:', pt: 'Inclui grátis:', fr: 'Inclus gratuitement:', de: 'Kostenlos enthalten:', zh: '免费包含：' },
        feature1: { es: '3-5 videos por mes', en: '3-5 videos per month', pt: '3-5 vídeos por mês', fr: '3-5 vidéos par mois', de: '3-5 Videos pro Monat', zh: '每月3-5个视频' },
        feature2: { es: '100 créditos iniciales', en: '100 initial credits', pt: '100 créditos iniciais', fr: '100 crédits initiaux', de: '100 Startguthaben', zh: '100个初始积分' },
        feature3: { es: 'Todas las funciones básicas', en: 'All basic features', pt: 'Todas as funções básicas', fr: 'Toutes les fonctions de base', de: 'Alle Grundfunktionen', zh: '所有基本功能' }
    }

    const t = (key) => texts[key]?.[language] || texts[key]?.en || key

    const handleGoogleLogin = async () => {
        setIsLoggingIn(true)
        setFormError('')
        const result = await loginWithGoogle()
        // For web OAuth: loginWithGoogle triggers a full page redirect,
        // so this line only runs on native or if login failed.
        // Only reset spinner if login explicitly failed (returned false).
        if (result === false) {
            setIsLoggingIn(false)
        }
        // If result === true (native success), navigation happens via useEffect
        // If redirect happened (web), this code never actually runs
    }

    const handleEmailSubmit = async (e) => {
        e.preventDefault()
        setFormError('')
        setIsLoggingIn(true)

        if (mode === 'signup' && !formData.name.trim()) {
            setFormError('Por favor ingresa tu nombre')
            setIsLoggingIn(false)
            return
        }

        if (!formData.email.trim() || !formData.password.trim()) {
            setFormError('Por favor completa todos los campos')
            setIsLoggingIn(false)
            return
        }

        if (formData.password.length < 6) {
            setFormError('La contraseña debe tener al menos 6 caracteres')
            setIsLoggingIn(false)
            return
        }

        try {
            let success
            if (mode === 'login') {
                success = await loginWithEmail(formData.email, formData.password)
            } else {
                success = await signUpWithEmail(formData.email, formData.password, formData.name)
            }

            if (success === true) {
                // Navigation happens automatically via useEffect when user state updates
            } else if (success?.confirmationNeeded) {
                setFormError('Revisa tu email para confirmar tu cuenta')
            } else if (success?.error) {
                setFormError(success.error)
            } else if (success === false) {
                // Error was already set in the store, show it
                const storeError = useAuthStore.getState().error
                if (storeError && !formError) {
                    setFormError(storeError)
                }
            }
        } catch (err) {
            console.error('❌ Auth form error:', err)
            setFormError(err.message || 'Error al iniciar sesión')
        }

        setIsLoggingIn(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="glass-card p-8 md:p-10 max-w-md w-full">
                {/* Back button */}
                <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 text-sm">
                    <ArrowLeft size={16} />
                    <span>Volver</span>
                </Link>

                {/* Logo */}
                <img
                    src="./logo.png"
                    alt="FacelessTube"
                    className="h-12 w-auto mx-auto mb-6"
                />

                <h1 className="text-2xl font-display font-bold mb-2 text-center">
                    {t('welcome')} <span className="text-gradient">FacelessTube</span>
                </h1>

                <p className="text-white/60 mb-6 text-center text-sm">
                    {mode === 'login' ? t('loginSubtitle') : t('signupSubtitle')}
                </p>

                {/* Error messages */}
                {(error || formError) && (
                    <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
                        {formError || error}
                    </div>
                )}

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading || isLoggingIn}
                    className="
                        w-full py-3 px-6 rounded-xl
                        bg-white text-dark-900 font-semibold
                        flex items-center justify-center gap-3
                        hover:bg-white/90 transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    {isLoggingIn ? (
                        <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                    ) : (
                        <>
                            <Chrome size={20} />
                            {t('continueGoogle')}
                        </>
                    )}
                </button>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/40 text-sm">{t('orEmail')}</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                    {mode === 'signup' && (
                        <div>
                            <label className="block text-sm text-white/60 mb-1">{t('name')}</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-glass"
                                placeholder="Tu nombre"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-white/60 mb-1">{t('email')}</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input-glass"
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-white/60 mb-1">{t('password')}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input-glass pr-10"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || isLoggingIn}
                        className="w-full btn-neon py-3 flex items-center justify-center gap-2"
                    >
                        {isLoggingIn ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Mail size={18} />
                                {mode === 'login' ? t('login') : t('signup')}
                            </>
                        )}
                    </button>
                </form>

                {/* Toggle mode */}
                <p className="mt-6 text-center text-sm text-white/60">
                    {mode === 'login' ? t('noAccount') : t('hasAccount')}{' '}
                    <button
                        onClick={() => {
                            setMode(mode === 'login' ? 'signup' : 'login')
                            setFormError('')
                        }}
                        className="text-neon-cyan hover:underline"
                    >
                        {mode === 'login' ? t('signup') : t('login')}
                    </button>
                </p>

                {/* Demo mode notice */}
                {isDemo && (
                    <>
                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-white/40 text-sm">{t('demoMode')}</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        <p className="mt-4 text-white/40 text-xs text-center whitespace-pre-line">
                            {t('demoNote')}
                        </p>
                    </>
                )}

                {/* Features list */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-sm font-medium mb-3">{t('freeIncludes')}</p>
                    <ul className="space-y-2 text-sm text-white/60">
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                            {t('feature1')}
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                            {t('feature2')}
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                            {t('feature3')}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
