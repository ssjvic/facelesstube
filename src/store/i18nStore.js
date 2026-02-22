// Internationalization (i18n) Store
// Multi-language support for the app

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Available languages
export const LANGUAGES = {
    es: {
        code: 'es',
        name: 'Español',
        flag: '🇪🇸'
    },
    en: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸'
    },
    pt: {
        code: 'pt',
        name: 'Português',
        flag: '🇧🇷'
    },
    fr: {
        code: 'fr',
        name: 'Français',
        flag: '🇫🇷'
    },
    de: {
        code: 'de',
        name: 'Deutsch',
        flag: '🇩🇪'
    },
    zh: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳'
    }
}

// Translations
const translations = {
    es: {
        // Navigation
        'nav.dashboard': 'Crear Video',
        'nav.history': 'Historial',
        'nav.account': 'Mi Cuenta',
        'nav.premium': 'Premium',
        'nav.tutorials': 'Tutoriales',
        'nav.logout': 'Cerrar Sesión',

        // Landing
        'landing.title': 'Crea Videos de YouTube Sin Mostrar tu Rostro',
        'landing.subtitle': 'Genera videos completos con IA: guion, voz, y clips de video. Todo automático.',
        'landing.cta': 'Comenzar Gratis',
        'landing.features': 'Características',

        // Dashboard
        'dashboard.title': 'Crear Nuevo Video',
        'dashboard.videosLeft': 'Te quedan {count} videos este mes',
        'dashboard.noVideosLeft': 'Has alcanzado tu límite mensual',
        'dashboard.ideaLabel': '¿De qué trata tu video?',
        'dashboard.ideaPlaceholder': 'Ej: traición familiar, una madre descubre que su hija...',
        'dashboard.voiceType': 'Tipo de voz',
        'dashboard.voiceFemale': 'Femenina',
        'dashboard.voiceMale': 'Masculina',
        'dashboard.backgroundCategory': 'Fondo del video',
        'dashboard.language': 'Idioma del video',
        'dashboard.costTitle': 'Costo estimado',
        'dashboard.generate': 'Generar Video',
        'dashboard.generating.script': 'Generando guion con IA...',
        'dashboard.generating.voice': 'Creando voiceover...',
        'dashboard.generating.videos': 'Buscando clips de video...',
        'dashboard.generating.render': 'Renderizando video...',
        'dashboard.generating.upload': 'Subiendo a YouTube...',
        'dashboard.ready': '¡Video listo!',
        'dashboard.done': '¡Subido exitosamente!',
        'dashboard.doneDesc': 'Tu video está en YouTube como borrador.',
        'dashboard.newVideo': 'Nuevo Video',
        'dashboard.upload': 'Subir a YouTube',
        'dashboard.download': 'Descargar',
        'dashboard.title_label': 'Título',
        'dashboard.description_label': 'Descripción',
        'dashboard.script_label': 'Guion generado',
        'dashboard.tags_label': 'Tags',

        // History
        'history.title': 'Historial de Videos',
        'history.subtitle': 'Todos tus videos generados',
        'history.empty': 'No tienes videos generados aún',
        'history.createFirst': 'Crear mi primer video',

        // Account
        'account.title': 'Mi Cuenta',
        'account.subtitle': 'Gestiona tu perfil, suscripción y créditos',
        'account.currentPlan': 'Plan actual',
        'account.changePlan': 'Cambiar plan',
        'account.videosThisMonth': 'Videos este mes',
        'account.creditsBalance': 'Balance de créditos',
        'account.buyCredits': 'Comprar créditos',
        'account.creditsTip': 'Los créditos se usan solo para herramientas premium.',
        'account.youtube': 'YouTube',
        'account.channelConnected': 'Canal conectado',
        'account.connectChannel': 'Conectar Canal',
        'account.connectDesc': 'Conecta tu canal de YouTube para subir videos directamente.',
        'account.transactions': 'Historial de transacciones',

        // Premium
        'premium.title': 'Mejora tu Plan',
        'premium.subtitle': 'Desbloquea más videos y funciones premium',
        'premium.monthly': 'Mensual',
        'premium.annual': 'Anual',
        'premium.save': 'Ahorra 2 meses',
        'premium.current': 'Tu Plan',
        'premium.select': 'Seleccionar',
        'premium.perMonth': '/mes',

        // Auth
        'auth.welcome': 'Bienvenido a FacelessTube',
        'auth.subtitle': 'Crea videos de YouTube sin mostrar tu rostro',
        'auth.google': 'Continuar con Google',

        // Settings modal
        'settings.title': 'Configuración',
        'settings.gemini': 'API Key de IA',
        'settings.geminiDesc': 'Obtén tu key gratis en',
        'settings.pexels': 'API Key de Videos',
        'settings.pexelsDesc': 'Obtén tu key gratis en',
        'settings.youtube': 'YouTube Client ID',
        'settings.youtubeDesc': 'Crea un proyecto en',
        'settings.save': 'Guardar',
        'settings.saved': '¡Guardado!',

        // Tutorials
        'tutorials.title': 'Centro de Aprendizaje',
        'tutorials.subtitle': 'Aprende a dominar YouTube y maximizar tus ganancias',
        'tutorials.category.videos': 'Videotutoriales',
        'tutorials.category.niches': 'Ideas de Nichos',
        'tutorials.category.tips': 'Consejos de Usuarios',
        'tutorials.category.checklist': 'Checklist de Éxito',
        'tutorials.niche.stories': 'Historias de Reddit / Terror',
        'tutorials.niche.facts': 'Curiosidades y Datos',
        'tutorials.niche.motivation': 'Motivación y Finanzas',
        'tutorials.niche.news': 'Noticias de Famosos',

        // Common
        'common.loading': 'Cargando...',
        'common.error': 'Error',
        'common.success': 'Éxito',
        'common.cancel': 'Cancelar',
        'common.save': 'Guardar',
        'common.free': 'Gratis',
        'common.credits': 'créditos'
    },

    en: {
        // Navigation
        'nav.dashboard': 'Create Video',
        'nav.history': 'History',
        'nav.account': 'Account',
        'nav.premium': 'Premium',
        'nav.tutorials': 'Tutorials',
        'nav.logout': 'Logout',

        // Landing
        'landing.title': 'Create YouTube Videos Without Showing Your Face',
        'landing.subtitle': 'Generate complete videos with AI: script, voice, and video clips. All automatic.',
        'landing.cta': 'Start Free',
        'landing.features': 'Features',

        // Dashboard
        'dashboard.title': 'Create New Video',
        'dashboard.videosLeft': 'You have {count} videos left this month',
        'dashboard.noVideosLeft': 'You have reached your monthly limit',
        'dashboard.ideaLabel': 'What is your video about?',
        'dashboard.ideaPlaceholder': 'Ex: family betrayal, a mother discovers that her daughter...',
        'dashboard.voiceType': 'Voice type',
        'dashboard.voiceFemale': 'Female',
        'dashboard.voiceMale': 'Male',
        'dashboard.backgroundCategory': 'Background video',
        'dashboard.language': 'Video language',
        'dashboard.costTitle': 'Estimated cost',
        'dashboard.generate': 'Generate Video',
        'dashboard.generating.script': 'Generating script with AI...',
        'dashboard.generating.voice': 'Creating voiceover...',
        'dashboard.generating.videos': 'Searching video clips...',
        'dashboard.generating.render': 'Rendering video...',
        'dashboard.generating.upload': 'Uploading to YouTube...',
        'dashboard.ready': 'Video ready!',
        'dashboard.done': 'Successfully uploaded!',
        'dashboard.doneDesc': 'Your video is on YouTube as a draft.',
        'dashboard.newVideo': 'New Video',
        'dashboard.upload': 'Upload to YouTube',
        'dashboard.download': 'Download',
        'dashboard.title_label': 'Title',
        'dashboard.description_label': 'Description',
        'dashboard.script_label': 'Generated script',
        'dashboard.tags_label': 'Tags',

        // History
        'history.title': 'Video History',
        'history.subtitle': 'All your generated videos',
        'history.empty': 'No generated videos yet',
        'history.createFirst': 'Create my first video',

        // Account
        'account.title': 'My Account',
        'account.subtitle': 'Manage your profile, subscription, and credits',
        'account.currentPlan': 'Current plan',
        'account.changePlan': 'Change plan',
        'account.videosThisMonth': 'Videos this month',
        'account.creditsBalance': 'Credits balance',
        'account.buyCredits': 'Buy credits',
        'account.creditsTip': 'Credits are only used for premium tools.',
        'account.youtube': 'YouTube',
        'account.channelConnected': 'Channel connected',
        'account.connectChannel': 'Connect Channel',
        'account.connectDesc': 'Connect your YouTube channel to upload videos directly.',
        'account.transactions': 'Transaction history',

        // Premium
        'premium.title': 'Upgrade Your Plan',
        'premium.subtitle': 'Unlock more videos and premium features',
        'premium.monthly': 'Monthly',
        'premium.annual': 'Annual',
        'premium.save': 'Save 2 months',
        'premium.current': 'Your Plan',
        'premium.select': 'Select',
        'premium.perMonth': '/month',

        // Auth
        'auth.welcome': 'Welcome to FacelessTube',
        'auth.subtitle': 'Create YouTube videos without showing your face',
        'auth.google': 'Continue with Google',

        // Settings modal
        'settings.title': 'Settings',
        'settings.gemini': 'AI API Key',
        'settings.geminiDesc': 'Get your free key at',
        'settings.pexels': 'Video API Key',
        'settings.pexelsDesc': 'Get your free key at',
        'settings.youtube': 'YouTube Client ID',
        'settings.youtubeDesc': 'Create a project at',
        'settings.save': 'Save',
        'settings.saved': 'Saved!',

        // Tutorials
        'tutorials.title': 'Learning Center',
        'tutorials.subtitle': 'Learn to master YouTube and maximize your earnings',
        'tutorials.category.videos': 'Video Tutorials',
        'tutorials.category.niches': 'Niche Ideas',
        'tutorials.category.tips': 'User Tips',
        'tutorials.category.checklist': 'Success Checklist',
        'tutorials.niche.stories': 'Reddit Stories / Horror',
        'tutorials.niche.facts': 'Facts & Curiosities',
        'tutorials.niche.motivation': 'Motivation & Finance',
        'tutorials.niche.news': 'Celebrity News',

        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.free': 'Free',
        'common.credits': 'credits'
    },

    pt: {
        // Navigation
        'nav.dashboard': 'Criar Vídeo',
        'nav.history': 'Histórico',
        'nav.account': 'Conta',
        'nav.premium': 'Premium',
        'nav.logout': 'Sair',

        // Landing
        'landing.title': 'Crie Vídeos do YouTube Sem Mostrar o Rosto',
        'landing.subtitle': 'Gere vídeos completos com IA: roteiro, voz e clipes de vídeo. Tudo automático.',
        'landing.cta': 'Começar Grátis',
        'landing.features': 'Recursos',

        // Dashboard
        'dashboard.title': 'Criar Novo Vídeo',
        'dashboard.videosLeft': 'Você tem {count} vídeos restantes este mês',
        'dashboard.noVideosLeft': 'Você atingiu seu limite mensal',
        'dashboard.ideaLabel': 'Sobre o que é seu vídeo?',
        'dashboard.ideaPlaceholder': 'Ex: traição familiar, uma mãe descobre que sua filha...',
        'dashboard.voiceType': 'Tipo de voz',
        'dashboard.voiceFemale': 'Feminina',
        'dashboard.voiceMale': 'Masculina',
        'dashboard.backgroundCategory': 'Vídeo de fundo',
        'dashboard.language': 'Idioma do vídeo',
        'dashboard.costTitle': 'Custo estimado',
        'dashboard.generate': 'Gerar Vídeo',
        'dashboard.generating.script': 'Gerando roteiro com IA...',
        'dashboard.generating.voice': 'Criando narração...',
        'dashboard.generating.videos': 'Buscando clipes de vídeo...',
        'dashboard.generating.render': 'Renderizando vídeo...',
        'dashboard.generating.upload': 'Enviando para o YouTube...',
        'dashboard.ready': 'Vídeo pronto!',
        'dashboard.done': 'Enviado com sucesso!',
        'dashboard.doneDesc': 'Seu vídeo está no YouTube como rascunho.',
        'dashboard.newVideo': 'Novo Vídeo',
        'dashboard.upload': 'Enviar para YouTube',
        'dashboard.download': 'Baixar',
        'dashboard.title_label': 'Título',
        'dashboard.description_label': 'Descrição',
        'dashboard.script_label': 'Roteiro gerado',
        'dashboard.tags_label': 'Tags',

        // History
        'history.title': 'Histórico de Vídeos',
        'history.subtitle': 'Todos os seus vídeos gerados',
        'history.empty': 'Nenhum vídeo gerado ainda',
        'history.createFirst': 'Criar meu primeiro vídeo',

        // Account
        'account.title': 'Minha Conta',
        'account.subtitle': 'Gerencie seu perfil, assinatura e créditos',
        'account.currentPlan': 'Plano atual',
        'account.changePlan': 'Mudar plano',
        'account.videosThisMonth': 'Vídeos este mês',
        'account.creditsBalance': 'Saldo de créditos',
        'account.buyCredits': 'Comprar créditos',
        'account.creditsTip': 'Créditos são usados apenas para ferramentas premium.',
        'account.youtube': 'YouTube',
        'account.channelConnected': 'Canal conectado',
        'account.connectChannel': 'Conectar Canal',
        'account.connectDesc': 'Conecte seu canal do YouTube para enviar vídeos diretamente.',
        'account.transactions': 'Histórico de transações',

        // Premium
        'premium.title': 'Melhore Seu Plano',
        'premium.subtitle': 'Desbloqueie mais vídeos e recursos premium',
        'premium.monthly': 'Mensal',
        'premium.annual': 'Anual',
        'premium.save': 'Economize 2 meses',
        'premium.current': 'Seu Plano',
        'premium.select': 'Selecionar',
        'premium.perMonth': '/mês',

        // Auth
        'auth.welcome': 'Bem-vindo ao FacelessTube',
        'auth.subtitle': 'Crie vídeos do YouTube sem mostrar o rosto',
        'auth.google': 'Continuar com Google',

        // Settings modal
        'settings.title': 'Configurações',
        'settings.gemini': 'Chave API de IA',
        'settings.geminiDesc': 'Obtenha sua chave grátis em',
        'settings.pexels': 'Chave API de Vídeos',
        'settings.pexelsDesc': 'Obtenha sua chave grátis em',
        'settings.youtube': 'YouTube Client ID',
        'settings.youtubeDesc': 'Crie um projeto em',
        'settings.save': 'Salvar',
        'settings.saved': 'Salvo!',

        // Common
        'common.loading': 'Carregando...',
        'common.error': 'Erro',
        'common.success': 'Sucesso',
        'common.cancel': 'Cancelar',
        'common.save': 'Salvar',
        'common.free': 'Grátis',
        'common.credits': 'créditos'
    },

    fr: {
        // Navigation
        'nav.dashboard': 'Créer Vidéo',
        'nav.history': 'Historique',
        'nav.account': 'Compte',
        'nav.premium': 'Premium',
        'nav.logout': 'Déconnexion',

        // Landing
        'landing.title': 'Créez des Vidéos YouTube Sans Montrer Votre Visage',
        'landing.subtitle': 'Générez des vidéos complètes avec l\'IA : script, voix et clips vidéo. Tout automatique.',
        'landing.cta': 'Commencer Gratuitement',
        'landing.features': 'Fonctionnalités',

        // Dashboard
        'dashboard.title': 'Créer Nouvelle Vidéo',
        'dashboard.videosLeft': 'Il vous reste {count} vidéos ce mois',
        'dashboard.noVideosLeft': 'Vous avez atteint votre limite mensuelle',
        'dashboard.ideaLabel': 'De quoi parle votre vidéo ?',
        'dashboard.ideaPlaceholder': 'Ex: trahison familiale, une mère découvre que sa fille...',
        'dashboard.voiceType': 'Type de voix',
        'dashboard.voiceFemale': 'Féminine',
        'dashboard.voiceMale': 'Masculine',
        'dashboard.backgroundCategory': 'Vidéo de fond',
        'dashboard.language': 'Langue de la vidéo',
        'dashboard.costTitle': 'Coût estimé',
        'dashboard.generate': 'Générer Vidéo',
        'dashboard.generating.script': 'Génération du script avec l\'IA...',
        'dashboard.generating.voice': 'Création de la narration...',
        'dashboard.generating.videos': 'Recherche de clips vidéo...',
        'dashboard.generating.render': 'Rendu de la vidéo...',
        'dashboard.generating.upload': 'Téléchargement sur YouTube...',
        'dashboard.ready': 'Vidéo prête !',
        'dashboard.done': 'Téléchargé avec succès !',
        'dashboard.doneDesc': 'Votre vidéo est sur YouTube en brouillon.',
        'dashboard.newVideo': 'Nouvelle Vidéo',
        'dashboard.upload': 'Envoyer sur YouTube',
        'dashboard.download': 'Télécharger',
        'dashboard.title_label': 'Titre',
        'dashboard.description_label': 'Description',
        'dashboard.script_label': 'Script généré',
        'dashboard.tags_label': 'Tags',

        // History
        'history.title': 'Historique des Vidéos',
        'history.subtitle': 'Toutes vos vidéos générées',
        'history.empty': 'Aucune vidéo générée pour le moment',
        'history.createFirst': 'Créer ma première vidéo',

        // Account
        'account.title': 'Mon Compte',
        'account.subtitle': 'Gérez votre profil, abonnement et crédits',
        'account.currentPlan': 'Plan actuel',
        'account.changePlan': 'Changer de plan',
        'account.videosThisMonth': 'Vidéos ce mois',
        'account.creditsBalance': 'Solde de crédits',
        'account.buyCredits': 'Acheter des crédits',
        'account.creditsTip': 'Les crédits sont utilisés uniquement pour les outils premium.',
        'account.youtube': 'YouTube',
        'account.channelConnected': 'Chaîne connectée',
        'account.connectChannel': 'Connecter Chaîne',
        'account.connectDesc': 'Connectez votre chaîne YouTube pour télécharger des vidéos directement.',
        'account.transactions': 'Historique des transactions',

        // Premium
        'premium.title': 'Améliorez Votre Plan',
        'premium.subtitle': 'Débloquez plus de vidéos et fonctionnalités premium',
        'premium.monthly': 'Mensuel',
        'premium.annual': 'Annuel',
        'premium.save': 'Économisez 2 mois',
        'premium.current': 'Votre Plan',
        'premium.select': 'Sélectionner',
        'premium.perMonth': '/mois',

        // Auth
        'auth.welcome': 'Bienvenue sur FacelessTube',
        'auth.subtitle': 'Créez des vidéos YouTube sans montrer votre visage',
        'auth.google': 'Continuer avec Google',

        // Settings modal
        'settings.title': 'Paramètres',
        'settings.gemini': 'Clé API IA',
        'settings.geminiDesc': 'Obtenez votre clé gratuite sur',
        'settings.pexels': 'Clé API Vidéos',
        'settings.pexelsDesc': 'Obtenez votre clé gratuite sur',
        'settings.youtube': 'YouTube Client ID',
        'settings.youtubeDesc': 'Créez un projet sur',
        'settings.save': 'Enregistrer',
        'settings.saved': 'Enregistré !',

        // Common
        'common.loading': 'Chargement...',
        'common.error': 'Erreur',
        'common.success': 'Succès',
        'common.cancel': 'Annuler',
        'common.save': 'Enregistrer',
        'common.free': 'Gratuit',
        'common.credits': 'crédits'
    },

    de: {
        // Navigation
        'nav.dashboard': 'Video Erstellen',
        'nav.history': 'Verlauf',
        'nav.account': 'Konto',
        'nav.premium': 'Premium',
        'nav.logout': 'Abmelden',

        // Landing
        'landing.title': 'Erstellen Sie YouTube-Videos Ohne Ihr Gesicht zu Zeigen',
        'landing.subtitle': 'Generieren Sie komplette Videos mit KI: Skript, Stimme und Videoclips. Alles automatisch.',
        'landing.cta': 'Kostenlos Starten',
        'landing.features': 'Funktionen',

        // Dashboard
        'dashboard.title': 'Neues Video Erstellen',
        'dashboard.videosLeft': 'Sie haben noch {count} Videos diesen Monat',
        'dashboard.noVideosLeft': 'Sie haben Ihr monatliches Limit erreicht',
        'dashboard.ideaLabel': 'Worum geht es in Ihrem Video?',
        'dashboard.ideaPlaceholder': 'Z.B.: Familienverrat, eine Mutter entdeckt, dass ihre Tochter...',
        'dashboard.voiceType': 'Stimmtyp',
        'dashboard.voiceFemale': 'Weiblich',
        'dashboard.voiceMale': 'Männlich',
        'dashboard.backgroundCategory': 'Hintergrundvideo',
        'dashboard.language': 'Videosprache',
        'dashboard.costTitle': 'Geschätzte Kosten',
        'dashboard.generate': 'Video Generieren',
        'dashboard.generating.script': 'Skript mit KI generieren...',
        'dashboard.generating.voice': 'Sprachausgabe erstellen...',
        'dashboard.generating.videos': 'Videoclips suchen...',
        'dashboard.generating.render': 'Video rendern...',
        'dashboard.generating.upload': 'Auf YouTube hochladen...',
        'dashboard.ready': 'Video fertig!',
        'dashboard.done': 'Erfolgreich hochgeladen!',
        'dashboard.doneDesc': 'Ihr Video ist als Entwurf auf YouTube.',
        'dashboard.newVideo': 'Neues Video',
        'dashboard.upload': 'Auf YouTube hochladen',
        'dashboard.download': 'Herunterladen',
        'dashboard.title_label': 'Titel',
        'dashboard.description_label': 'Beschreibung',
        'dashboard.script_label': 'Generiertes Skript',
        'dashboard.tags_label': 'Tags',

        // History
        'history.title': 'Videoverlauf',
        'history.subtitle': 'Alle Ihre generierten Videos',
        'history.empty': 'Noch keine Videos generiert',
        'history.createFirst': 'Mein erstes Video erstellen',

        // Account
        'account.title': 'Mein Konto',
        'account.subtitle': 'Verwalten Sie Ihr Profil, Abonnement und Guthaben',
        'account.currentPlan': 'Aktueller Plan',
        'account.changePlan': 'Plan ändern',
        'account.videosThisMonth': 'Videos diesen Monat',
        'account.creditsBalance': 'Guthaben',
        'account.buyCredits': 'Guthaben kaufen',
        'account.creditsTip': 'Guthaben wird nur für Premium-Tools verwendet.',
        'account.youtube': 'YouTube',
        'account.channelConnected': 'Kanal verbunden',
        'account.connectChannel': 'Kanal Verbinden',
        'account.connectDesc': 'Verbinden Sie Ihren YouTube-Kanal, um Videos direkt hochzuladen.',
        'account.transactions': 'Transaktionsverlauf',

        // Premium
        'premium.title': 'Plan Upgraden',
        'premium.subtitle': 'Mehr Videos und Premium-Funktionen freischalten',
        'premium.monthly': 'Monatlich',
        'premium.annual': 'Jährlich',
        'premium.save': '2 Monate sparen',
        'premium.current': 'Ihr Plan',
        'premium.select': 'Auswählen',
        'premium.perMonth': '/Monat',

        // Auth
        'auth.welcome': 'Willkommen bei FacelessTube',
        'auth.subtitle': 'Erstellen Sie YouTube-Videos ohne Ihr Gesicht zu zeigen',
        'auth.google': 'Mit Google fortfahren',

        // Settings modal
        'settings.title': 'Einstellungen',
        'settings.gemini': 'KI API-Schlüssel',
        'settings.geminiDesc': 'Holen Sie sich Ihren kostenlosen Schlüssel bei',
        'settings.pexels': 'Video API-Schlüssel',
        'settings.pexelsDesc': 'Holen Sie sich Ihren kostenlosen Schlüssel bei',
        'settings.youtube': 'YouTube Client ID',
        'settings.youtubeDesc': 'Erstellen Sie ein Projekt bei',
        'settings.save': 'Speichern',
        'settings.saved': 'Gespeichert!',

        // Common
        'common.loading': 'Laden...',
        'common.error': 'Fehler',
        'common.success': 'Erfolg',
        'common.cancel': 'Abbrechen',
        'common.save': 'Speichern',
        'common.free': 'Kostenlos',
        'common.credits': 'Guthaben'
    },

    zh: {
        // Navigation
        'nav.dashboard': '创建视频',
        'nav.history': '历史记录',
        'nav.account': '账户',
        'nav.premium': '高级版',
        'nav.logout': '退出',

        // Landing
        'landing.title': '创建 YouTube 视频，无需露脸',
        'landing.subtitle': '用AI生成完整视频：脚本、配音和视频片段。全自动化。',
        'landing.cta': '免费开始',
        'landing.features': '功能特点',

        // Dashboard
        'dashboard.title': '创建新视频',
        'dashboard.videosLeft': '本月还剩 {count} 个视频',
        'dashboard.noVideosLeft': '您已达到月度限额',
        'dashboard.ideaLabel': '您的视频是关于什么的？',
        'dashboard.ideaPlaceholder': '例如：家庭背叛，一位母亲发现她的女儿...',
        'dashboard.voiceType': '声音类型',
        'dashboard.voiceFemale': '女声',
        'dashboard.voiceMale': '男声',
        'dashboard.backgroundCategory': '背景视频',
        'dashboard.language': '视频语言',
        'dashboard.costTitle': '预估费用',
        'dashboard.generate': '生成视频',
        'dashboard.generating.script': '正在用AI生成脚本...',
        'dashboard.generating.voice': '正在创建配音...',
        'dashboard.generating.videos': '正在搜索视频片段...',
        'dashboard.generating.render': '正在渲染视频...',
        'dashboard.generating.upload': '正在上传到YouTube...',
        'dashboard.ready': '视频已完成！',
        'dashboard.done': '上传成功！',
        'dashboard.doneDesc': '您的视频已作为草稿保存在YouTube上。',
        'dashboard.newVideo': '新视频',
        'dashboard.upload': '上传到YouTube',
        'dashboard.download': '下载',
        'dashboard.title_label': '标题',
        'dashboard.description_label': '描述',
        'dashboard.script_label': '生成的脚本',
        'dashboard.tags_label': '标签',

        // History
        'history.title': '视频历史',
        'history.subtitle': '您所有生成的视频',
        'history.empty': '还没有生成的视频',
        'history.createFirst': '创建我的第一个视频',

        // Account
        'account.title': '我的账户',
        'account.subtitle': '管理您的个人资料、订阅和积分',
        'account.currentPlan': '当前计划',
        'account.changePlan': '更换计划',
        'account.videosThisMonth': '本月视频',
        'account.creditsBalance': '积分余额',
        'account.buyCredits': '购买积分',
        'account.creditsTip': '积分仅用于高级工具。',
        'account.youtube': 'YouTube',
        'account.channelConnected': '频道已连接',
        'account.connectChannel': '连接频道',
        'account.connectDesc': '连接您的YouTube频道以直接上传视频。',
        'account.transactions': '交易记录',

        // Premium
        'premium.title': '升级您的计划',
        'premium.subtitle': '解锁更多视频和高级功能',
        'premium.monthly': '月付',
        'premium.annual': '年付',
        'premium.save': '节省2个月',
        'premium.current': '您的计划',
        'premium.select': '选择',
        'premium.perMonth': '/月',

        // Auth
        'auth.welcome': '欢迎来到 FacelessTube',
        'auth.subtitle': '创建 YouTube 视频，无需露脸',
        'auth.google': '用Google继续',

        // Settings modal
        'settings.title': '设置',
        'settings.gemini': 'AI API密钥',
        'settings.geminiDesc': '在此获取免费密钥',
        'settings.pexels': '视频 API密钥',
        'settings.pexelsDesc': '在此获取免费密钥',
        'settings.youtube': 'YouTube Client ID',
        'settings.youtubeDesc': '在此创建项目',
        'settings.save': '保存',
        'settings.saved': '已保存！',

        // Common
        'common.loading': '加载中...',
        'common.error': '错误',
        'common.success': '成功',
        'common.cancel': '取消',
        'common.save': '保存',
        'common.free': '免费',
        'common.credits': '积分'
    }
}

// i18n Store
export const useI18nStore = create(
    persist(
        (set, get) => ({
            language: 'es', // Default Spanish

            // Set language
            setLanguage: (lang) => {
                if (LANGUAGES[lang]) {
                    set({ language: lang })
                }
            },

            // Get translation
            t: (key, params = {}) => {
                const lang = get().language
                let text = translations[lang]?.[key] || translations['es']?.[key] || key

                // Replace params
                Object.entries(params).forEach(([k, v]) => {
                    text = text.replace(`{${k}}`, v)
                })

                return text
            },

            // Get current language info
            getCurrentLanguage: () => {
                return LANGUAGES[get().language]
            },

            // Get all languages
            getAllLanguages: () => LANGUAGES
        }),
        {
            name: 'facelesstube-i18n'
        }
    )
)

// Hook for translations
export const useTranslation = () => {
    const { t, language, setLanguage, getCurrentLanguage, getAllLanguages } = useI18nStore()
    return { t, language, setLanguage, getCurrentLanguage, getAllLanguages }
}
