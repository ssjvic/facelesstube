import { useState } from "react";
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
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useTranslation } from "../store/i18nStore";
import { toast } from "../store/toastStore";
import { signInWithGoogle } from "../services/googleAuth";

// Mock transactions
const mockTransactions = [
  {
    id: "1",
    type: "video",
    description: "Video: Traición Familiar",
    credits: 0,
    date: "2025-01-04",
  },
  {
    id: "2",
    type: "video",
    description: "Video: El Secreto",
    credits: 0,
    date: "2025-01-03",
  },
  {
    id: "3",
    type: "signup",
    description: "Welcome credits",
    credits: 100,
    date: "2025-01-01",
  },
];

// Valid promo codes (add your codes here or verify server-side via Supabase)
// Format: 'CODE': { credits: 50, type: 'credits', message: 'Message' }
// Or for upgrades: 'CODE': { tier: 'pro', type: 'upgrade', message: 'Message' }
const PROMO_CODES = {
  // Add your promo codes here
};

export default function Account() {
  const { user, getTierInfo, getAllTiers, addCredits, updateUser } =
    useAuthStore();
  const { language } = useTranslation();
  const tierInfo = getTierInfo();
  const allTiers = getAllTiers();
  const [transactions] = useState(mockTransactions);
  const [promoCode, setPromoCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  // Handle profile name update
  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === user?.name) {
      setIsEditingName(false);
      return;
    }
    try {
      await updateUser({ name: trimmed });
      toast.success("Nombre actualizado");
    } catch (e) {
      toast.error("Error al actualizar el nombre");
    }
    setIsEditingName(false);
  };

  // Handle YouTube connection via native Google Sign-In (Firebase)
  const handleConnectYouTube = async () => {
    setIsConnectingYouTube(true);

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        await updateUser({ youtubeConnected: true });
        toast.success("¡Canal de YouTube conectado!");
      } else {
        // Check for user cancellation
        if (
          result.error?.includes("12501") ||
          result.error?.includes("cancelado")
        ) {
          // User cancelled, not a real error
        } else {
          toast.error(result.error || "Error al conectar YouTube");
          if (result.errorHelp) {
            toast.error(result.errorHelp);
          }
        }
      }
    } catch (error) {
      console.error("YouTube auth error:", error);
      toast.error(error.message || "Error al conectar YouTube");
    } finally {
      setIsConnectingYouTube(false);
    }
  };

  const videosUsed = user?.videosThisMonth || 0;
  const videosLimit = tierInfo.videosPerMonth;
  const videosPercent =
    videosLimit === Infinity ? 0 : (videosUsed / videosLimit) * 100;

  // Handle promo code redemption
  const handleRedeemCode = async () => {
    if (!promoCode.trim()) return;

    setIsRedeeming(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1000));

    const code = promoCode.toUpperCase().trim();
    const promo = PROMO_CODES[code];

    if (promo) {
      if (promo.type === "credits") {
        await addCredits(promo.credits);
        toast.success(promo.message);
      } else if (promo.type === "upgrade") {
        await updateUser({ tier: promo.tier });
        toast.success(promo.message);
      }
      setPromoCode("");
    } else {
      toast.error(getText("invalidCode"));
    }

    setIsRedeeming(false);
  };

  // Translations
  const t = {
    myAccount: { es: "Mi Cuenta", en: "My Account", pt: "Minha Conta" },
    manageProfile: {
      es: "Gestiona tu perfil, suscripción y créditos",
      en: "Manage your profile, subscription and credits",
      pt: "Gerencie seu perfil, assinatura e créditos",
    },
    currentPlan: { es: "Plan actual", en: "Current plan", pt: "Plano atual" },
    changePlan: { es: "Cambiar plan", en: "Change plan", pt: "Mudar plano" },
    videosThisMonth: {
      es: "Videos este mes",
      en: "Videos this month",
      pt: "Vídeos este mês",
    },
    watermarkWarning: {
      es: "Videos con marca de agua (max 1 min)",
      en: "Videos with watermark (max 1 min)",
      pt: "Vídeos com marca d'água (max 1 min)",
    },
    creditBalance: {
      es: "Balance de créditos",
      en: "Credit balance",
      pt: "Saldo de créditos",
    },
    buyCredits: {
      es: "Comprar créditos",
      en: "Buy credits",
      pt: "Comprar créditos",
    },
    creditsTip: {
      es: "Los créditos se usan solo para herramientas premium (ElevenLabs, D-ID, etc). La generación básica es",
      en: "Credits are only used for premium tools (ElevenLabs, D-ID, etc). Basic generation is",
      pt: "Os créditos são usados apenas para ferramentas premium (ElevenLabs, D-ID, etc). A geração básica é",
    },
    free: { es: "gratis", en: "free", pt: "grátis" },
    channelConnected: {
      es: "Canal conectado",
      en: "Channel connected",
      pt: "Canal conectado",
    },
    connectYouTubeDesc: {
      es: "Conecta tu canal de YouTube para subir videos directamente.",
      en: "Connect your YouTube channel to upload videos directly.",
      pt: "Conecte seu canal do YouTube para enviar vídeos diretamente.",
    },
    connectChannel: {
      es: "Conectar Canal",
      en: "Connect Channel",
      pt: "Conectar Canal",
    },
    transactionHistory: {
      es: "Historial de transacciones",
      en: "Transaction history",
      pt: "Histórico de transações",
    },
    credits: { es: "créditos", en: "credits", pt: "créditos" },
    promoCode: {
      es: "Código promocional",
      en: "Promo code",
      pt: "Código promocional",
    },
    enterCode: {
      es: "Ingresa tu código",
      en: "Enter your code",
      pt: "Digite seu código",
    },
    redeem: { es: "Canjear", en: "Redeem", pt: "Resgatar" },
    invalidCode: {
      es: "Código inválido o ya usado",
      en: "Invalid or already used code",
      pt: "Código inválido ou já usado",
    },
    promoDesc: {
      es: "Obtén créditos gratis o upgrades con códigos de promoción",
      en: "Get free credits or upgrades with promo codes",
      pt: "Obtenha créditos grátis ou upgrades com códigos promocionais",
    },
  };

  const getText = (key) => t[key]?.[language] || t[key]?.en || key;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-3xl font-display font-bold mb-1">
          {getText("myAccount")}
        </h1>
        <p className="text-white/60 text-sm md:text-base">
          {getText("manageProfile")}
        </p>
      </div>

      {/* Profile card */}
      <div className="glass-card p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-neon-purple/50"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
            )}
            <button
              onClick={() => document.getElementById("avatarInput").click()}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Cambiar foto"
            >
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <User size={20} className="text-white" />
              </div>
            </button>
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                // Simple size check (2MB)
                if (file.size > 2 * 1024 * 1024) {
                  toast.error("La imagen es demasiado grande (máx 2MB)");
                  return;
                }

                const reader = new FileReader();
                reader.onloadend = async () => {
                  const base64 = reader.result;
                  try {
                    await updateUser({ avatar: base64 });
                    toast.success("Foto actualizada");
                  } catch (err) {
                    toast.error("Error al actualizar la foto");
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-dark-500 border border-white/20 rounded-lg px-3 py-1 text-white text-lg font-semibold w-full focus:border-neon-cyan focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 text-neon-green hover:bg-white/10 rounded"
                  title="Guardar"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="p-1 text-red-400 hover:bg-white/10 rounded"
                  title="Cancelar"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">
                  {user?.name || "Usuario"}
                </h2>
                <button
                  onClick={() => {
                    setEditName(user?.name || "");
                    setIsEditingName(true);
                  }}
                  className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
                  title="Editar nombre"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
            <p className="text-white/60">{user?.email}</p>
          </div>
        </div>

        {/* Current plan */}
        <div className="p-4 rounded-xl bg-dark-600/50 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/60 mb-1">
                {getText("currentPlan")}
              </p>
              <span
                className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${user?.tier === "free" ? "badge-free" : ""}
                ${user?.tier === "starter" ? "badge-starter" : ""}
                ${user?.tier === "pro" ? "badge-pro" : ""}
                ${user?.tier === "unlimited" ? "badge-unlimited" : ""}
              `}
              >
                {tierInfo.name}
              </span>
            </div>
            <a
              href="/app/premium"
              className="flex items-center gap-1 text-neon-cyan hover:underline text-sm"
            >
              {getText("changePlan")}
              <ChevronRight size={16} />
            </a>
          </div>

          {/* Usage bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/60">
                {getText("videosThisMonth")}
              </span>
              <span>
                {videosUsed} / {videosLimit === Infinity ? "∞" : videosLimit}
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
              <span>{getText("watermarkWarning")}</span>
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
            <h3 className="text-lg font-semibold">{getText("promoCode")}</h3>
            <p className="text-sm text-white/50">{getText("promoDesc")}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder={getText("enterCode")}
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
            {getText("redeem")}
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
            <span>{getText("channelConnected")}</span>
          </div>
        ) : (
          <div>
            <p className="text-white/60 mb-4">
              {getText("connectYouTubeDesc")}
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
              {isConnectingYouTube
                ? "Conectando..."
                : getText("connectChannel")}
            </button>
          </div>
        )}
      </div>

      {/* Version */}
      <div className="text-center mt-12 pb-6 text-white/40 text-xs">
        FacelessTube v2.0.0 (Server Rendering)
      </div>
    </div>
  );
}

function Play(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
