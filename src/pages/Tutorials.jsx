import {
  GraduationCap,
  PlayCircle,
  Lightbulb,
  Users,
  CheckCircle2,
  TrendingUp,
  Youtube,
  DollarSign,
  Zap,
  BookOpen,
  Lock,
} from "lucide-react";
import { useTranslation } from "../store/i18nStore";
import { useAuthStore } from "../store/authStore";

export default function Tutorials() {
  const { t } = useTranslation();
  const { user, getTierInfo } = useAuthStore();
  const tierInfo = getTierInfo();
  const isFreeUser = !user || user.tier === "free";

  const tutorials = [
    {
      title: "Cómo empezar en YouTube sin mostrar el rostro",
      duration: "12 min",
      views: "45k",
      category: "Estrategia",
      thumbnail:
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&h=225&auto=format&fit=crop",
    },
    {
      title: "Configura FacelessTube para máxima calidad",
      duration: "8 min",
      views: "12k",
      category: "Tutorial Técnico",
      thumbnail:
        "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&h=225&auto=format&fit=crop",
    },
    {
      title: "Técnicas de Narrativa para Retención (Watch Time)",
      duration: "15 min",
      views: "28k",
      category: "Contenido",
      thumbnail:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400&h=225&auto=format&fit=crop",
    },
    {
      title: "Cómo monetizar tu canal en tiempo récord",
      duration: "10 min",
      views: "89k",
      category: "Dinero",
      thumbnail:
        "https://images.unsplash.com/photo-1621643135540-309d437021e1?q=80&w=400&h=225&auto=format&fit=crop",
    },
  ];

  const niches = [
    {
      id: "stories",
      title: t("tutorials.niche.stories"),
      description:
        "Altamente viral y gran retención. Usa clips de parkour o Minecraft.",
      icon: "👹",
      cpm: "Medio",
    },
    {
      id: "facts",
      title: t("tutorials.niche.facts"),
      description: "Atemporal y educativo. Atrae a anunciantes premium.",
      icon: "🧠",
      cpm: "Alto",
    },
    {
      id: "motivation",
      title: t("tutorials.niche.motivation"),
      description:
        "Gran nicho para afiliados de desarrollo personal y finanzas.",
      icon: "🚀",
      cpm: "Muy Alto",
    },
    {
      id: "news",
      title: t("tutorials.niche.news"),
      description: "Contenido rápido y tendencia constante.",
      icon: "🎬",
      cpm: "Bajo-Medio",
    },
  ];

  const tips = [
    {
      user: "@YTMaster22",
      text: "La miniatura lo es todo. Dedícale el mismo tiempo que al video.",
      likes: 124,
    },
    {
      user: "@SuccessTube",
      text: "Sé constante. Youtube premia subir 2-3 videos semanales al principio.",
      likes: 89,
    },
    {
      user: "@CreadorMX",
      text: "Lo mejor es la consistencia. Subí 1 video diario durante 30 días y el algoritmo empezó a empujarlos.",
      likes: 210,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12 md:pb-20">
      {/* Hero Section */}
      <div className="relative mb-6 md:mb-12 p-4 md:p-8 rounded-2xl md:rounded-3xl overflow-hidden glass border border-white/10">
        <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-10 -translate-y-10">
          <GraduationCap size={200} className="text-aurora-teal" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aurora-teal/20 text-aurora-teal text-xs font-bold uppercase tracking-wider mb-4 border border-aurora-teal/30">
            <Zap size={12} />
            Centro de Crecimiento
          </span>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold mb-2 md:mb-4">
            {t("tutorials.title")}
          </h1>
          <p className="text-white/60 text-sm md:text-lg">
            {t("tutorials.subtitle")}
          </p>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Main Content: Video Tutorials */}
        <div className="lg:col-span-2 space-y-4 md:space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                <PlayCircle className="text-aurora-teal" />
                {t("tutorials.category.videos")}
              </h2>
              {isFreeUser && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <Lock size={12} />
                  Premium
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-6">
              {tutorials.map((video, i) => (
                <div
                  key={i}
                  className="glass-card group cursor-pointer overflow-hidden p-0 relative"
                >
                  <div className="relative aspect-video">
                    {isFreeUser ? (
                      /* Blurred thumbnail for free users */
                      <div className="w-full h-full relative">
                        <img
                          src={video.thumbnail}
                          alt="Tutorial Premium"
                          className="w-full h-full object-cover blur-md scale-110"
                        />
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                          <Lock size={24} className="text-amber-400" />
                          <span className="text-[10px] text-amber-400 font-bold uppercase">
                            Premium
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Full thumbnail for premium users */
                      <>
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-aurora-teal flex items-center justify-center">
                            <PlayCircle className="text-dark-900" />
                          </div>
                        </div>
                      </>
                    )}
                    <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-[10px] font-bold">
                      {video.duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] uppercase font-bold text-aurora-teal">
                        {video.category}
                      </span>
                      <span className="text-white/20 text-xs">•</span>
                      <span className="text-[10px] text-white/40">
                        {video.views} vistas
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-aurora-teal transition-colors">
                      {isFreeUser ? "🔒 Contenido Premium" : video.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Niche Ideas Section */}
          <div>
            <h2 className="text-2xl font-display font-bold flex items-center gap-3 mb-6">
              <Lightbulb className="text-aurora-magenta" />
              {t("tutorials.category.niches")}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {niches.map((niche) => (
                <div
                  key={niche.id}
                  className="p-4 rounded-2xl glass-card border-white/5 hover:border-aurora-magenta/30 transition-all flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-aurora-magenta/10 flex items-center justify-center text-2xl">
                    {niche.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm mb-1">{niche.title}</h3>
                    <p className="text-xs text-white/50 mb-2">
                      {niche.description}
                    </p>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} className="text-aurora-green" />
                      <span className="text-[10px] font-bold text-aurora-green uppercase">
                        CPM {niche.cpm}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Tips and Checklist */}
        <div className="space-y-4 md:space-y-8">
          {/* User Tips */}
          <div className="glass-card">
            <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
              <Users className="text-aurora-violet" />
              {t("tutorials.category.tips")}
            </h3>
            <div className="space-y-4">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-cosmic-800/50 border border-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-aurora-violet">
                      {tip.user}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-white/40">
                      <TrendingUp size={10} />
                      {tip.likes}
                    </div>
                  </div>
                  <p className="text-xs text-white/70 italic">"{tip.text}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Success Checklist */}
          <div className="glass-card border-aurora-teal/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <CheckCircle2 size={100} />
            </div>
            <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-aurora-green" />
              {t("tutorials.category.checklist")}
            </h3>
            <div className="space-y-3">
              {[
                "Define un micronicho específico",
                "Usa textos breves y directos",
                "Crea una miniatura contrastada",
                "Sincroniza audio y visuales",
                "Llamado a la acción (CTA)",
                "Responde a los primeros comentarios",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-4 h-4 rounded border border-aurora-green/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-sm bg-aurora-green" />
                  </div>
                  <span className="text-xs text-white/80">{item}</span>
                </div>
              ))}
            </div>

            <button className="btn-neon w-full mt-6 py-3 text-xs flex items-center justify-center gap-2">
              <DollarSign size={14} />
              Guía de Monetización
            </button>
          </div>

          {/* Community Link */}
          <div className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-aurora-teal/20 to-aurora-violet/20 border border-white/10 text-center">
            <Youtube className="mx-auto mb-3 text-red-500" size={32} />
            <h4 className="font-bold mb-2">Únete a la Comunidad</h4>
            <p className="text-xs text-white/60 mb-4">
              Comparte tus resultados y aprende de otros canales automatizados.
            </p>
            <a
              href="https://t.me/facelesstubeapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-aurora-teal font-bold hover:underline"
            >
              Ir al Canal de Telegram →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
