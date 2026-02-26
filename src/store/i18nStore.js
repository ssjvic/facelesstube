// Internationalization (i18n) Store
// Multi-language support for the app

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Available languages
export const LANGUAGES = {
  es: {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
  },
  en: {
    code: "en",
    name: "English",
    flag: "🇺🇸",
  },
  pt: {
    code: "pt",
    name: "Português",
    flag: "🇵🇹",
  },
};

// Translations
const translations = {
  es: {
    // Navigation
    "nav.dashboard": "Crear Video",
    "nav.history": "Historial",
    "nav.account": "Mi Cuenta",
    "nav.premium": "Premium",
    "nav.tutorials": "Tutoriales",
    "nav.logout": "Cerrar Sesión",

    // Landing
    "landing.title": "Crea Videos de YouTube Sin Mostrar tu Rostro",
    "landing.subtitle":
      "Genera videos completos con IA: guion, voz, y clips de video. Todo automático.",
    "landing.cta": "Comenzar Gratis",
    "landing.features": "Características",

    // Dashboard
    "dashboard.title": "Crear Nuevo Video",
    "dashboard.videosLeft": "Te quedan {count} videos este mes",
    "dashboard.noVideosLeft": "Has alcanzado tu límite mensual",
    "dashboard.ideaLabel": "¿De qué trata tu video?",
    "dashboard.ideaPlaceholder":
      "Ej: traición familiar, una madre descubre que su hija...",
    "dashboard.voiceType": "Tipo de voz",
    "dashboard.voiceFemale": "Femenina",
    "dashboard.voiceMale": "Masculina",
    "dashboard.backgroundCategory": "Fondo del video",
    "dashboard.language": "Idioma del video",
    "dashboard.costTitle": "Costo estimado",
    "dashboard.generate": "Generar Video",
    "dashboard.generating.script": "Generando guion con IA...",
    "dashboard.generating.voice": "Creando voiceover...",
    "dashboard.generating.videos": "Buscando clips de video...",
    "dashboard.generating.render": "Renderizando video...",
    "dashboard.generating.upload": "Subiendo a YouTube...",
    "dashboard.ready": "¡Video listo!",
    "dashboard.done": "¡Subido exitosamente!",
    "dashboard.doneDesc": "Tu video está en YouTube como borrador.",
    "dashboard.newVideo": "Nuevo Video",
    "dashboard.upload": "Subir a YouTube",
    "dashboard.download": "Descargar",
    "dashboard.title_label": "Título",
    "dashboard.description_label": "Descripción",
    "dashboard.script_label": "Guion generado",
    "dashboard.tags_label": "Tags",

    // History
    "history.title": "Historial de Videos",
    "history.subtitle": "Todos tus videos generados",
    "history.empty": "No tienes videos generados aún",
    "history.createFirst": "Crear mi primer video",

    // Account
    "account.title": "Mi Cuenta",
    "account.subtitle": "Gestiona tu perfil, suscripción y créditos",
    "account.currentPlan": "Plan actual",
    "account.changePlan": "Cambiar plan",
    "account.videosThisMonth": "Videos este mes",
    "account.creditsBalance": "Balance de créditos",
    "account.buyCredits": "Comprar créditos",
    "account.creditsTip":
      "Los créditos se usan solo para herramientas premium.",
    "account.youtube": "YouTube",
    "account.channelConnected": "Canal conectado",
    "account.connectChannel": "Conectar Canal",
    "account.connectDesc":
      "Conecta tu canal de YouTube para subir videos directamente.",
    "account.transactions": "Historial de transacciones",

    // Premium
    "premium.title": "Mejora tu Plan",
    "premium.subtitle": "Desbloquea más videos y funciones premium",
    "premium.monthly": "Mensual",
    "premium.annual": "Anual",
    "premium.save": "Ahorra 2 meses",
    "premium.current": "Tu Plan",
    "premium.select": "Seleccionar",
    "premium.perMonth": "/mes",

    // Auth
    "auth.welcome": "Bienvenido a FacelessTube",
    "auth.subtitle": "Crea videos de YouTube sin mostrar tu rostro",
    "auth.google": "Continuar con Google",

    // Settings modal
    "settings.title": "Configuración",
    "settings.gemini": "API Key de IA",
    "settings.geminiDesc": "Obtén tu key gratis en",
    "settings.pexels": "API Key de Videos",
    "settings.pexelsDesc": "Obtén tu key gratis en",
    "settings.youtube": "YouTube Client ID",
    "settings.youtubeDesc": "Crea un proyecto en",
    "settings.save": "Guardar",
    "settings.saved": "¡Guardado!",

    // Tutorials
    "tutorials.title": "Centro de Aprendizaje",
    "tutorials.subtitle": "Aprende a dominar YouTube y maximizar tus ganancias",
    "tutorials.category.videos": "Videotutoriales",
    "tutorials.category.niches": "Ideas de Nichos",
    "tutorials.category.tips": "Consejos de Usuarios",
    "tutorials.category.checklist": "Checklist de Éxito",
    "tutorials.niche.stories": "Historias de Reddit / Terror",
    "tutorials.niche.facts": "Curiosidades y Datos",
    "tutorials.niche.motivation": "Motivación y Finanzas",
    "tutorials.niche.news": "Noticias de Famosos",

    // Common
    "common.loading": "Cargando...",
    "common.error": "Error",
    "common.success": "Éxito",
    "common.cancel": "Cancelar",
    "common.save": "Guardar",
    "common.free": "Gratis",
    "common.credits": "créditos",
  },

  en: {
    // Navigation
    "nav.dashboard": "Create Video",
    "nav.history": "History",
    "nav.account": "Account",
    "nav.premium": "Premium",
    "nav.tutorials": "Tutorials",
    "nav.logout": "Logout",

    // Landing
    "landing.title": "Create YouTube Videos Without Showing Your Face",
    "landing.subtitle":
      "Generate complete videos with AI: script, voice, and video clips. All automatic.",
    "landing.cta": "Start Free",
    "landing.features": "Features",

    // Dashboard
    "dashboard.title": "Create New Video",
    "dashboard.videosLeft": "You have {count} videos left this month",
    "dashboard.noVideosLeft": "You have reached your monthly limit",
    "dashboard.ideaLabel": "What is your video about?",
    "dashboard.ideaPlaceholder":
      "Ex: family betrayal, a mother discovers that her daughter...",
    "dashboard.voiceType": "Voice type",
    "dashboard.voiceFemale": "Female",
    "dashboard.voiceMale": "Male",
    "dashboard.backgroundCategory": "Background video",
    "dashboard.language": "Video language",
    "dashboard.costTitle": "Estimated cost",
    "dashboard.generate": "Generate Video",
    "dashboard.generating.script": "Generating script with AI...",
    "dashboard.generating.voice": "Creating voiceover...",
    "dashboard.generating.videos": "Searching video clips...",
    "dashboard.generating.render": "Rendering video...",
    "dashboard.generating.upload": "Uploading to YouTube...",
    "dashboard.ready": "Video ready!",
    "dashboard.done": "Successfully uploaded!",
    "dashboard.doneDesc": "Your video is on YouTube as a draft.",
    "dashboard.newVideo": "New Video",
    "dashboard.upload": "Upload to YouTube",
    "dashboard.download": "Download",
    "dashboard.title_label": "Title",
    "dashboard.description_label": "Description",
    "dashboard.script_label": "Generated script",
    "dashboard.tags_label": "Tags",

    // History
    "history.title": "Video History",
    "history.subtitle": "All your generated videos",
    "history.empty": "No generated videos yet",
    "history.createFirst": "Create my first video",

    // Account
    "account.title": "My Account",
    "account.subtitle": "Manage your profile, subscription, and credits",
    "account.currentPlan": "Current plan",
    "account.changePlan": "Change plan",
    "account.videosThisMonth": "Videos this month",
    "account.creditsBalance": "Credits balance",
    "account.buyCredits": "Buy credits",
    "account.creditsTip": "Credits are only used for premium tools.",
    "account.youtube": "YouTube",
    "account.channelConnected": "Channel connected",
    "account.connectChannel": "Connect Channel",
    "account.connectDesc":
      "Connect your YouTube channel to upload videos directly.",
    "account.transactions": "Transaction history",

    // Premium
    "premium.title": "Upgrade Your Plan",
    "premium.subtitle": "Unlock more videos and premium features",
    "premium.monthly": "Monthly",
    "premium.annual": "Annual",
    "premium.save": "Save 2 months",
    "premium.current": "Your Plan",
    "premium.select": "Select",
    "premium.perMonth": "/month",

    // Auth
    "auth.welcome": "Welcome to FacelessTube",
    "auth.subtitle": "Create YouTube videos without showing your face",
    "auth.google": "Continue with Google",

    // Settings modal
    "settings.title": "Settings",
    "settings.gemini": "AI API Key",
    "settings.geminiDesc": "Get your free key at",
    "settings.pexels": "Video API Key",
    "settings.pexelsDesc": "Get your free key at",
    "settings.youtube": "YouTube Client ID",
    "settings.youtubeDesc": "Create a project at",
    "settings.save": "Save",
    "settings.saved": "Saved!",

    // Tutorials
    "tutorials.title": "Learning Center",
    "tutorials.subtitle": "Learn to master YouTube and maximize your earnings",
    "tutorials.category.videos": "Video Tutorials",
    "tutorials.category.niches": "Niche Ideas",
    "tutorials.category.tips": "User Tips",
    "tutorials.category.checklist": "Success Checklist",
    "tutorials.niche.stories": "Reddit Stories / Horror",
    "tutorials.niche.facts": "Facts & Curiosities",
    "tutorials.niche.motivation": "Motivation & Finance",
    "tutorials.niche.news": "Celebrity News",

    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.free": "Free",
    "common.credits": "credits",
  },

  pt: {
    // Navigation
    "nav.dashboard": "Criar Vídeo",
    "nav.history": "Histórico",
    "nav.account": "Conta",
    "nav.premium": "Premium",
    "nav.logout": "Sair",

    // Landing
    "landing.title": "Crie Vídeos do YouTube Sem Mostrar o Rosto",
    "landing.subtitle":
      "Gere vídeos completos com IA: roteiro, voz e clipes de vídeo. Tudo automático.",
    "landing.cta": "Começar Grátis",
    "landing.features": "Recursos",

    // Dashboard
    "dashboard.title": "Criar Novo Vídeo",
    "dashboard.videosLeft": "Você tem {count} vídeos restantes este mês",
    "dashboard.noVideosLeft": "Você atingiu seu limite mensal",
    "dashboard.ideaLabel": "Sobre o que é seu vídeo?",
    "dashboard.ideaPlaceholder":
      "Ex: traição familiar, uma mãe descobre que sua filha...",
    "dashboard.voiceType": "Tipo de voz",
    "dashboard.voiceFemale": "Feminina",
    "dashboard.voiceMale": "Masculina",
    "dashboard.backgroundCategory": "Vídeo de fundo",
    "dashboard.language": "Idioma do vídeo",
    "dashboard.costTitle": "Custo estimado",
    "dashboard.generate": "Gerar Vídeo",
    "dashboard.generating.script": "Gerando roteiro com IA...",
    "dashboard.generating.voice": "Criando narração...",
    "dashboard.generating.videos": "Buscando clipes de vídeo...",
    "dashboard.generating.render": "Renderizando vídeo...",
    "dashboard.generating.upload": "Enviando para o YouTube...",
    "dashboard.ready": "Vídeo pronto!",
    "dashboard.done": "Enviado com sucesso!",
    "dashboard.doneDesc": "Seu vídeo está no YouTube como rascunho.",
    "dashboard.newVideo": "Novo Vídeo",
    "dashboard.upload": "Enviar para YouTube",
    "dashboard.download": "Baixar",
    "dashboard.title_label": "Título",
    "dashboard.description_label": "Descrição",
    "dashboard.script_label": "Roteiro gerado",
    "dashboard.tags_label": "Tags",

    // History
    "history.title": "Histórico de Vídeos",
    "history.subtitle": "Todos os seus vídeos gerados",
    "history.empty": "Nenhum vídeo gerado ainda",
    "history.createFirst": "Criar meu primeiro vídeo",

    // Account
    "account.title": "Minha Conta",
    "account.subtitle": "Gerencie seu perfil, assinatura e créditos",
    "account.currentPlan": "Plano atual",
    "account.changePlan": "Mudar plano",
    "account.videosThisMonth": "Vídeos este mês",
    "account.creditsBalance": "Saldo de créditos",
    "account.buyCredits": "Comprar créditos",
    "account.creditsTip":
      "Créditos são usados apenas para ferramentas premium.",
    "account.youtube": "YouTube",
    "account.channelConnected": "Canal conectado",
    "account.connectChannel": "Conectar Canal",
    "account.connectDesc":
      "Conecte seu canal do YouTube para enviar vídeos diretamente.",
    "account.transactions": "Histórico de transações",

    // Premium
    "premium.title": "Melhore Seu Plano",
    "premium.subtitle": "Desbloqueie mais vídeos e recursos premium",
    "premium.monthly": "Mensal",
    "premium.annual": "Anual",
    "premium.save": "Economize 2 meses",
    "premium.current": "Seu Plano",
    "premium.select": "Selecionar",
    "premium.perMonth": "/mês",

    // Auth
    "auth.welcome": "Bem-vindo ao FacelessTube",
    "auth.subtitle": "Crie vídeos do YouTube sem mostrar o rosto",
    "auth.google": "Continuar com Google",

    // Settings modal
    "settings.title": "Configurações",
    "settings.gemini": "Chave API de IA",
    "settings.geminiDesc": "Obtenha sua chave grátis em",
    "settings.pexels": "Chave API de Vídeos",
    "settings.pexelsDesc": "Obtenha sua chave grátis em",
    "settings.youtube": "YouTube Client ID",
    "settings.youtubeDesc": "Crie um projeto em",
    "settings.save": "Salvar",
    "settings.saved": "Salvo!",

    // Common
    "common.loading": "Carregando...",
    "common.error": "Erro",
    "common.success": "Sucesso",
    "common.cancel": "Cancelar",
    "common.save": "Salvar",
    "common.free": "Grátis",
    "common.credits": "créditos",
  },
};

// i18n Store
export const useI18nStore = create(
  persist(
    (set, get) => ({
      language: "es", // Default Spanish

      // Set language
      setLanguage: (lang) => {
        if (LANGUAGES[lang]) {
          set({ language: lang });
        }
      },

      // Get translation
      t: (key, params = {}) => {
        const lang = get().language;
        let text =
          translations[lang]?.[key] || translations["es"]?.[key] || key;

        // Replace params
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, v);
        });

        return text;
      },

      // Get current language info
      getCurrentLanguage: () => {
        return LANGUAGES[get().language];
      },

      // Get all languages
      getAllLanguages: () => LANGUAGES,
    }),
    {
      name: "facelesstube-i18n",
    },
  ),
);

// Hook for translations
export const useTranslation = () => {
  const { t, language, setLanguage, getCurrentLanguage, getAllLanguages } =
    useI18nStore();
  return { t, language, setLanguage, getCurrentLanguage, getAllLanguages };
};
