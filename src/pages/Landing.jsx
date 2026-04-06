import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Sparkles,
  Zap,
  Youtube,
  CheckCircle2,
  ArrowRight,
  Star,
  Wand2,
  Video,
  Upload,
  Mail,
  Plus,
  Minus,
  ChevronDown,
  X,
  Users,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  Globe,
} from "lucide-react";
import { useTranslation, LANGUAGES } from "../store/i18nStore";

// Particle component for background effect
function Particles() {
  return (
    <div className="particles-container">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 15}s`,
          }}
        />
      ))}
    </div>
  );
}

// Countdown Timer Component
function CountdownTimer({ t }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 6,
    hours: 14,
    minutes: 23,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0)
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="countdown-container">
      <div className="countdown-box">
        <span className="countdown-value">{timeLeft.days}</span>
        <span className="countdown-label">{t("landing.days")}</span>
      </div>
      <div className="countdown-box">
        <span className="countdown-value">{timeLeft.hours}</span>
        <span className="countdown-label">{t("landing.hrs")}</span>
      </div>
      <div className="countdown-box">
        <span className="countdown-value">{timeLeft.minutes}</span>
        <span className="countdown-label">{t("landing.min")}</span>
      </div>
      <div className="countdown-box">
        <span className="countdown-value">{timeLeft.seconds}</span>
        <span className="countdown-label">{t("landing.sec")}</span>
      </div>
    </div>
  );
}

// Language Selector Dropdown
function LanguageSwitcher({ language, setLanguage }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all text-sm"
      >
        <Globe size={16} />
        <span>{LANGUAGES[language]?.flag}</span>
        <span className="hidden sm:inline">{LANGUAGES[language]?.code.toUpperCase()}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl glass border border-white/10 shadow-2xl py-2 z-[100]">
          {Object.values(LANGUAGES).map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-white/10 ${
                language === lang.code ? "text-aurora-teal bg-white/5" : "text-white/70"
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
              {language === lang.code && <CheckCircle2 size={14} className="ml-auto text-aurora-teal" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Landing() {
  const { t, language, setLanguage } = useTranslation();
  const [activeFaq, setActiveFaq] = useState(null);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [liveUsers, setLiveUsers] = useState(247);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !localStorage.getItem("exit_popup_shown")) {
        setShowExitPopup(true);
        localStorage.setItem("exit_popup_shown", "true");
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    const interval = setInterval(() => {
      setLiveUsers((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearInterval(interval);
    };
  }, []);

  const faq = [
    { q: t("landing.faq1q"), a: t("landing.faq1a") },
    { q: t("landing.faq2q"), a: t("landing.faq2a") },
    { q: t("landing.faq3q"), a: t("landing.faq3a") },
    { q: t("landing.faq4q"), a: t("landing.faq4a") },
    { q: t("landing.faq5q"), a: t("landing.faq5a") },
  ];

  const tiers = [
    {
      name: "Free",
      price: 0,
      features: t("landing.freeFeatures").split(","),
      highlight: false,
    },
    {
      name: "Starter",
      price: 9,
      features: t("landing.starterFeatures").split(","),
      highlight: false,
    },
    {
      name: "Creator",
      price: 19,
      features: t("landing.creatorFeatures").split(","),
      highlight: true,
      comingSoon: true,
    },
    {
      name: "Pro",
      price: 39,
      features: t("landing.proFeatures").split(","),
      highlight: false,
    },
  ];

  const steps = [
    {
      icon: Wand2,
      title: t("landing.step1Title"),
      desc: t("landing.step1Desc"),
    },
    {
      icon: Sparkles,
      title: t("landing.step2Title"),
      desc: t("landing.step2Desc"),
    },
    {
      icon: Upload,
      title: t("landing.step3Title"),
      desc: t("landing.step3Desc"),
    },
  ];

  return (
    <div className="relative bg-cosmic-950 min-h-screen">
      {/* Background Effects */}
      <div className="bg-glow-top" />
      <Particles />

      {/* Aurora Orbs */}
      <div className="aurora-orb aurora-orb-1" />
      <div className="aurora-orb aurora-orb-2" />
      <div className="aurora-orb aurora-orb-3" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="FacelessTube" className="h-10 w-auto" />
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher language={language} setLanguage={setLanguage} />

            <Link to="/auth" className="btn-aurora py-2.5 px-6">
              {t("landing.enter")}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-28 pb-10 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass mb-8 border border-aurora-teal/30">
            <Star size={16} className="text-aurora-gold" />
            <span className="text-sm font-medium">
              {t("landing.earlyAccess")}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
            {t("landing.heroTitle")}{" "}
            <span className="text-aurora">{t("landing.heroHighlight")}</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-10 font-medium">
            {t("landing.heroSubtitle")}
          </p>

          <div className="flex flex-col items-center gap-6 mb-16">
            <Link
              to="/auth"
              className="btn-aurora text-xl px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold transform hover:scale-105 transition-all shadow-xl shadow-green-500/20"
            >
              {t("landing.startFree")}
            </Link>

            <div className="mt-4">
              <p className="text-sm text-aurora-teal mb-4 font-bold uppercase tracking-widest">
                {t("landing.offerEnds")}
              </p>
              <CountdownTimer t={t} />
            </div>
          </div>

          {/* Visual Proof */}
          <div className="mt-12 max-w-4xl mx-auto rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl">
            <video
              src="./splash.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full h-auto aspect-video object-cover"
              poster="/logo.png"
            />
          </div>
        </div>
      </section>

      {/* Section 2: Problem -> Solution */}
      <section className="py-24 px-6 relative z-10 bg-cosmic-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-rose-400">
                {t("landing.problemTitle")}
              </h2>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <X className="text-rose-500 flex-shrink-0" />
                  <p className="text-white/60">
                    {t("landing.problem1")}
                  </p>
                </li>
                <li className="flex gap-4">
                  <X className="text-rose-500 flex-shrink-0" />
                  <p className="text-white/60">
                    {t("landing.problem2")}
                  </p>
                </li>
                <li className="flex gap-4">
                  <X className="text-rose-500 flex-shrink-0" />
                  <p className="text-white/60">
                    {t("landing.problem3")}
                  </p>
                </li>
              </ul>
            </div>
            <div className="glass-card p-8 border-aurora-teal/30">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-aurora-teal">
                {t("landing.solutionTitle")}
              </h2>
              <div className="space-y-8">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl bg-aurora-teal/10 flex items-center justify-center border border-aurora-teal/20 flex-shrink-0">
                      <step.icon className="text-aurora-teal" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                      <p className="text-white/50">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-24 px-6 relative z-10 bg-cosmic-900/50"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            {t("landing.pricingTitle")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className={`glass-card p-8 flex flex-col ${tier.highlight ? "border-aurora-violet ring-2 ring-aurora-violet/30 scale-105 z-10" : ""}`}
              >
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-white/40">{t("landing.perMonth")}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex gap-3 text-sm text-white/70">
                      <CheckCircle2
                        size={16}
                        className="text-aurora-teal flex-shrink-0"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className={`w-full py-4 rounded-xl font-bold text-center transition-all ${tier.highlight ? "btn-aurora" : "btn-secondary"}`}
                >
                  {tier.price === 0 ? t("landing.startFreeBtn") : t("landing.choosePlan")}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            {t("landing.faqTitle")}
          </h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <div
                key={i}
                className={`faq-item ${activeFaq === i ? "active" : ""}`}
              >
                <button
                  className="faq-question font-bold text-lg"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  {item.q}
                  <ChevronDown
                    className={`faq-icon ${activeFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div className="faq-answer">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exit Intent Popup */}
      <div className={`exit-popup-overlay ${showExitPopup ? "show" : ""}`}>
        <div className="exit-popup-content">
          <button
            className="absolute top-6 right-6 text-white/20 hover:text-white"
            onClick={() => setShowExitPopup(false)}
          >
            <X size={24} />
          </button>
          <h2 className="text-3xl font-bold mb-4 text-aurora-teal">{t("landing.exitTitle")}</h2>
          <p className="text-xl text-white/60 mb-8">
            {t("landing.exitDesc").split("\\n").map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
          <Link
            to="/auth"
            className="btn-aurora text-lg px-12 py-4 w-full block"
          >
            {t("landing.exitCta")}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
          <div className="flex items-center gap-8 text-sm text-white/40">
            <Link to="/privacy">{t("landing.privacy")}</Link>
            <Link to="/terms">{t("landing.terms")}</Link>
            <a href="mailto:contacto@facelesstube.mx">{t("landing.contact")}</a>
          </div>
          <div className="text-center">
            <p className="text-white/30 text-sm">
              {t("landing.copyright")}
            </p>
            <p className="text-white/20 text-xs mt-1">
              {t("landing.madeBy")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
