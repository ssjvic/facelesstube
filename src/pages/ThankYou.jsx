import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Crown,
  Sparkles,
  Star,
  Heart,
  Rocket,
  PartyPopper,
  ArrowRight,
  CheckCircle,
  Zap,
  Infinity,
  Video,
  Mic,
  Palette,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

// ============ CONFETTI PARTICLE SYSTEM ============
function ConfettiCanvas() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);

  const COLORS = [
    "#00d4aa", "#00e5ff", "#7c3aed", "#e879f9",
    "#fbbf24", "#fb7185", "#34d399", "#60a5fa",
    "#f472b6", "#a78bfa", "#fcd34d", "#6ee7b7",
  ];

  const createParticle = useCallback((canvas) => {
    const shapes = ["rect", "circle", "triangle", "star"];
    return {
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 8,
      h: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: 1.5 + Math.random() * 3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      opacity: 0.8 + Math.random() * 0.2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.04,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initial burst
    for (let i = 0; i < 120; i++) {
      const p = createParticle(canvas);
      p.y = -Math.random() * canvas.height;
      particlesRef.current.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new confetti occasionally
      if (Math.random() < 0.3 && particlesRef.current.length < 200) {
        particlesRef.current.push(createParticle(canvas));
      }

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx + Math.sin(p.wobble) * 0.5;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.wobble += p.wobbleSpeed;
        p.opacity -= 0.001;

        if (p.y > canvas.height + 20 || p.opacity <= 0) return false;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "triangle") {
          ctx.beginPath();
          ctx.moveTo(0, -p.w / 2);
          ctx.lineTo(-p.w / 2, p.w / 2);
          ctx.lineTo(p.w / 2, p.w / 2);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === "star") {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = i === 0 ? p.w / 2 : p.w / 2;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
        return true;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
      }}
    />
  );
}

// ============ FLOATING EMOJI ============
function FloatingEmoji({ emoji, delay, duration, left }) {
  return (
    <div
      className="absolute text-2xl sm:text-3xl pointer-events-none select-none"
      style={{
        left: `${left}%`,
        bottom: "-40px",
        animation: `floatUp ${duration}s ease-out ${delay}s infinite`,
        opacity: 0,
      }}
    >
      {emoji}
    </div>
  );
}

// ============ TIER CONFIGS ============
const TIER_CELEBRATION = {
  starter: {
    icon: Sparkles,
    title: "¡Bienvenido al plan Starter! ⚡",
    titleEn: "Welcome to Starter! ⚡",
    subtitle: "Tu viaje como creador comienza ahora",
    subtitleEn: "Your creator journey begins now",
    color: "from-blue-400 to-cyan-400",
    glowColor: "rgba(59, 130, 246, 0.3)",
    badge: "badge-starter",
    perks: [
      { icon: Video, text: "30 videos al mes" },
      { icon: Zap, text: "Sin marca de agua" },
      { icon: Mic, text: "Hasta 5 min de duración" },
    ],
  },
  creator: {
    icon: Crown,
    title: "¡Eres un Creator ahora! 👑",
    titleEn: "You're a Creator now! 👑",
    subtitle: "Desbloquea tu potencial creativo sin límites",
    subtitleEn: "Unleash your creative potential",
    color: "from-purple-400 via-violet-400 to-fuchsia-400",
    glowColor: "rgba(124, 58, 237, 0.3)",
    badge: "badge-pro",
    perks: [
      { icon: Video, text: "100 videos al mes" },
      { icon: Mic, text: "Voces premium" },
      { icon: Palette, text: "Hasta 10 min de duración" },
    ],
  },
  pro: {
    icon: Infinity,
    title: "¡Plan Pro Ilimitado! 🚀",
    titleEn: "Unlimited Pro Plan! 🚀",
    subtitle: "Todo el poder de FacelessTube es tuyo",
    subtitleEn: "All the power of FacelessTube is yours",
    color: "from-emerald-400 via-teal-400 to-cyan-400",
    glowColor: "rgba(0, 212, 170, 0.3)",
    badge: "badge-unlimited",
    perks: [
      { icon: Infinity, text: "Videos ilimitados" },
      { icon: Rocket, text: "Hasta 20 min de duración" },
      { icon: Star, text: "Soporte 24/7 + API" },
    ],
  },
};

const DEFAULT_CELEBRATION = TIER_CELEBRATION.creator;

// ============ MAIN COMPONENT ============
export default function ThankYou() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, checkAuth } = useAuthStore();
  const [showContent, setShowContent] = useState(false);
  const [showPerks, setShowPerks] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [pulseHeart, setPulseHeart] = useState(false);

  // Detect tier from query param or user state
  const tierParam = searchParams.get("tier") || user?.tier || "creator";
  const celebration = TIER_CELEBRATION[tierParam] || DEFAULT_CELEBRATION;
  const TierIcon = celebration.icon;

  useEffect(() => {
    // Refresh auth to get updated tier
    checkAuth();

    // Staggered reveal animations
    const t1 = setTimeout(() => setShowContent(true), 400);
    const t2 = setTimeout(() => setShowPerks(true), 1200);
    const t3 = setTimeout(() => setShowButton(true), 2000);

    // Heart pulse every few seconds
    const heartInterval = setInterval(() => {
      setPulseHeart(true);
      setTimeout(() => setPulseHeart(false), 600);
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(heartInterval);
    };
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-cosmic-950 relative overflow-hidden">
      {/* Confetti */}
      <ConfettiCanvas />

      {/* Aurora background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, ${celebration.glowColor} 0%, transparent 50%),
            radial-gradient(ellipse at 20% 80%, rgba(124, 58, 237, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 80%, rgba(232, 121, 249, 0.1) 0%, transparent 40%)
          `,
        }}
      />

      {/* Animated rings behind the icon */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ marginTop: "-120px" }}>
        <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full border border-white/[0.03] animate-ping" style={{ animationDuration: "3s" }} />
      </div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ marginTop: "-120px" }}>
        <div className="w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] rounded-full border border-white/[0.05] animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
      </div>

      {/* Floating emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingEmoji emoji="🎉" delay={0} duration={4} left={10} />
        <FloatingEmoji emoji="⭐" delay={0.5} duration={5} left={25} />
        <FloatingEmoji emoji="🚀" delay={1} duration={4.5} left={40} />
        <FloatingEmoji emoji="💎" delay={1.5} duration={5.5} left={55} />
        <FloatingEmoji emoji="🎊" delay={0.3} duration={4} left={70} />
        <FloatingEmoji emoji="✨" delay={0.8} duration={5} left={85} />
        <FloatingEmoji emoji="🏆" delay={1.2} duration={4.8} left={15} />
        <FloatingEmoji emoji="💜" delay={2} duration={5.2} left={90} />
        <FloatingEmoji emoji="🔥" delay={0.7} duration={4.3} left={50} />
        <FloatingEmoji emoji="👑" delay={1.8} duration={5.5} left={35} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-lg w-full text-center">

          {/* Tier icon with glow */}
          <div
            className={`
              mx-auto mb-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full 
              bg-gradient-to-br ${celebration.color}
              flex items-center justify-center
              transition-all duration-700
              ${showContent ? "opacity-100 scale-100" : "opacity-0 scale-50"}
            `}
            style={{
              boxShadow: `0 0 60px ${celebration.glowColor}, 0 0 120px ${celebration.glowColor}`,
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            <TierIcon size={48} className="text-white drop-shadow-lg" />
          </div>

          {/* Title */}
          <h1
            className={`
              text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-3
              transition-all duration-700 delay-200
              ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
            `}
          >
            <span className="text-aurora">¡Gracias!</span>
          </h1>

          {/* Heart */}
          <div className={`mb-4 transition-transform duration-300 ${pulseHeart ? "scale-125" : "scale-100"}`}>
            <Heart
              size={32}
              className="mx-auto text-pink-400 fill-pink-400 drop-shadow-lg"
              style={{ filter: "drop-shadow(0 0 12px rgba(244, 114, 182, 0.6))" }}
            />
          </div>

          {/* Subtitle — tier specific */}
          <h2
            className={`
              text-xl sm:text-2xl font-semibold text-white mb-2
              transition-all duration-700 delay-300
              ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
            `}
          >
            {celebration.title}
          </h2>
          <p
            className={`
              text-white/60 text-sm sm:text-base mb-8
              transition-all duration-700 delay-500
              ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
            `}
          >
            {celebration.subtitle}
          </p>

          {/* Glass card with perks */}
          <div
            className={`
              glass-card p-6 sm:p-8 mb-8
              transition-all duration-700
              ${showPerks ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
            `}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <PartyPopper size={20} className="text-amber-400" />
              <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                Lo que ahora puedes hacer
              </span>
              <PartyPopper size={20} className="text-amber-400" style={{ transform: "scaleX(-1)" }} />
            </div>

            <div className="space-y-4">
              {celebration.perks.map((perk, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all"
                  style={{
                    animationDelay: `${1.4 + i * 0.2}s`,
                    animation: showPerks ? `slideInLeft 0.5s ease-out ${i * 0.15}s both` : "none",
                  }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${celebration.color} bg-opacity-20 flex items-center justify-center flex-shrink-0`}
                    style={{ background: `linear-gradient(135deg, ${celebration.glowColor}, rgba(255,255,255,0.05))` }}
                  >
                    <perk.icon size={18} className="text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-white/90 text-sm sm:text-base font-medium">{perk.text}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* User name personalization */}
            {user?.name && (
              <div className="mt-6 pt-4 border-t border-white/[0.06]">
                <p className="text-white/50 text-xs">
                  Suscripción activa para <span className="text-white/80 font-medium">{user.name}</span>
                </p>
              </div>
            )}
          </div>

          {/* Motivational quote */}
          <p
            className={`
              text-white/40 text-xs italic mb-8
              transition-all duration-700 delay-700
              ${showPerks ? "opacity-100" : "opacity-0"}
            `}
          >
            "Cada gran canal de YouTube empezó con un solo video."
          </p>

          {/* CTA Button */}
          <div
            className={`
              transition-all duration-700
              ${showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
            `}
          >
            <button
              onClick={() => navigate("/app")}
              className="btn-aurora text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-5 inline-flex items-center gap-3 group"
              id="thankyou-create-btn"
            >
              <Rocket size={22} className="group-hover:animate-bounce" />
              ¡Crear mi primer video!
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-4">
              <button
                onClick={() => navigate("/app/premium")}
                className="text-white/40 hover:text-white/60 text-sm underline underline-offset-4 transition-colors"
              >
                Ver mi plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg) scale(0.5);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
            transform: translateY(-10vh) rotate(15deg) scale(1);
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-110vh) rotate(360deg) scale(0.3);
            opacity: 0;
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
