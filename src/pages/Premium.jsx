import { useState, useEffect } from "react";
import {
  Sparkles,
  Check,
  Zap,
  Crown,
  Infinity,
  Mic,
  User,
  Image,
  Gauge,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { STRIPE_PRICES, createCheckoutSession } from "../config/stripe";

// Premium tools marketplace
const premiumTools = [
  {
    id: "elevenlabs",
    name: "ElevenLabs Voice",
    description: "Voces ultra realistas en HD para narración profesional",
    credits: 10,
    icon: Mic,
    color: "neon-cyan",
  },
  {
    id: "did_avatar",
    name: "D-ID Avatar",
    description: "Presentador AI con labios sincronizados",
    credits: 25,
    icon: User,
    color: "neon-purple",
  },
  {
    id: "leonardo",
    name: "Leonardo.ai Images",
    description: "Imágenes personalizadas para thumbnails",
    credits: 15,
    icon: Image,
    color: "neon-pink",
  },
  {
    id: "priority",
    name: "Priority Render",
    description: "Renderizado prioritario sin esperas",
    credits: 5,
    icon: Gauge,
    color: "neon-green",
  },
];

const tiers = [
  {
    id: "free",
    name: "Free",
    icon: Zap,
    price: { monthly: 0, annual: 0 },
    priceId: null,
    features: ["3-5 videos/mes", "Marca de agua", "1 min max", "Voces básicas"],
    limitations: ["Marca de agua", "Duración limitada"],
    badge: "badge-free",
  },
  {
    id: "starter",
    name: "Starter",
    icon: Sparkles,
    price: { monthly: 9, annual: 90 },
    priceId: STRIPE_PRICES.starter.monthly,
    features: [
      "30 videos/mes",
      "Sin marca de agua",
      "Hasta 10 min",
      "Soporte email",
    ],
    badge: "badge-starter",
  },
  {
    id: "creator",
    name: "Creator",
    icon: Crown,
    price: { monthly: 19, annual: 190 },
    priceId: STRIPE_PRICES.creator.monthly,
    features: [
      "100 videos/mes",
      "Sin marca de agua",
      "Hasta 15 min",
      "Voces premium",
      "Soporte prioritario",
    ],
    popular: true,
    badge: "badge-pro",
  },
  {
    id: "pro",
    name: "Pro",
    icon: Infinity,
    price: { monthly: 39, annual: 390 },
    priceId: STRIPE_PRICES.pro.monthly,
    features: [
      "Videos ilimitados",
      "Sin límites",
      "Hasta 20 min",
      "Todas las voces",
      "Soporte 24/7",
      "API access",
    ],
    badge: "badge-unlimited",
  },
];

export default function Premium() {
  const { user, updateUser } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedTool, setSelectedTool] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [products, setProducts] = useState([]);

  // Load Play Store products on mount
  useEffect(() => {
    const loadProducts = async () => {
      const { isAndroid, initPlayBilling, getProducts } =
        await import("../config/playBilling");
      if (isAndroid()) {
        await initPlayBilling();
        const prods = await getProducts();
        setProducts(prods);
      }
    };
    loadProducts();
  }, []);

  const handleUpgrade = async (tier) => {
    if (tier.id === "free" || tier.id === user?.tier) return;
    if (!tier.priceId) return;

    const { toast } = await import("../store/toastStore");

    if (!user?.id || !user?.email) {
      toast.error("Debes iniciar sesión para suscribirte.");
      return;
    }

    setIsLoading(tier.id);
    try {
      const result = await createCheckoutSession(
        tier.priceId,
        user.id,
        user.email,
        true, // apply Early Bird coupon
      );

      if (!result.success && result.error) {
        toast.error(`Error al iniciar el pago: ${result.error}`);
      }
      // On success the page redirects to Stripe — no further action needed
    } catch (e) {
      toast.error("No se pudo conectar con el servidor de pagos.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleToolPurchase = (tool) => {
    if (user?.credits >= tool.credits) {
      alert(`Usando ${tool.credits} créditos para ${tool.name}`);
    } else {
      alert("No tienes suficientes créditos");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4 md:mb-8 text-center">
        <h1 className="text-xl md:text-3xl font-display font-bold mb-1">
          <span className="text-gradient">Premium</span> Features
        </h1>
        <p className="text-white/60 text-sm md:text-base">
          Desbloquea todo el potencial de FacelessTube
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`px-4 py-2 rounded-lg transition-all ${
            billingCycle === "monthly"
              ? "bg-white/10 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => setBillingCycle("annual")}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
            billingCycle === "annual"
              ? "bg-white/10 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          Anual
          <span className="px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green text-xs">
            2 meses gratis
          </span>
        </button>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
        {tiers.map((tier) => {
          const isCurrentPlan = user?.tier === tier.id;
          const price =
            billingCycle === "annual" ? tier.price.annual : tier.price.monthly;

          return (
            <div
              key={tier.id}
              className={`
                glass-card p-4 md:p-6 relative
                ${tier.popular ? "ring-2 ring-neon-purple" : ""}
                ${isCurrentPlan ? "border-neon-cyan" : ""}
              `}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-neon-purple text-dark-900 text-xs font-bold rounded-full">
                  POPULAR
                </span>
              )}

              {isCurrentPlan && (
                <span className="absolute -top-3 right-4 px-3 py-1 bg-neon-cyan text-dark-900 text-xs font-bold rounded-full">
                  ACTUAL
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${tier.id === "free" ? "bg-white/10" : ""}
                  ${tier.id === "starter" ? "bg-neon-blue/20" : ""}
                  ${tier.id === "pro" ? "bg-neon-purple/20" : ""}
                  ${tier.id === "unlimited" ? "bg-gradient-to-br from-neon-cyan/20 to-neon-pink/20" : ""}
                `}
                >
                  <tier.icon
                    size={20}
                    className={`
                    ${tier.id === "free" ? "text-white/60" : ""}
                    ${tier.id === "starter" ? "text-neon-blue" : ""}
                    ${tier.id === "pro" ? "text-neon-purple" : ""}
                    ${tier.id === "unlimited" ? "text-neon-cyan" : ""}
                  `}
                  />
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${tier.badge}`}
                >
                  {tier.name}
                </span>
              </div>

              <div className="mb-3 md:mb-4">
                <span className="text-2xl md:text-3xl font-display font-bold">
                  ${price}
                </span>
                <span className="text-white/60 text-xs md:text-sm">
                  {" "}
                  USD{billingCycle === "annual" ? "/año" : "/mes"}
                </span>
              </div>

              <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check size={14} className="text-neon-cyan flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(tier)}
                disabled={isCurrentPlan || isLoading === tier.id}
                className={`
                  w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                  ${
                    isCurrentPlan
                      ? "bg-white/5 text-white/40 cursor-not-allowed"
                      : tier.popular
                        ? "btn-neon"
                        : "btn-secondary"
                  }
                `}
              >
                {isLoading === tier.id ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Redirigiendo...
                  </>
                ) : isCurrentPlan ? (
                  "Plan Actual"
                ) : (
                  "Elegir Plan"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
