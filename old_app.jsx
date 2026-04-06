import {
  Rocket,
  Zap,
  Play,
  ChevronRight,
  Menu,
  User,
  Bell,
  Layout,
  Settings,
  History,
  Video,
  Smartphone,
  Laptop,
  Globe,
  Info,
  HelpCircle,
  Lock,
  Gift,
  Star,
  BarChart3,
  CloudUpload,
  Languages,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  BookOpen,
  ExternalLink,
  TrendingUp,
  Users,
  Download,
  Wand2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { translations } from "./i18n";
import { loadStripe } from "@stripe/stripe-js";
import CreatorStudio from "./CreatorStudio";

// Load Stripe outside of a component’s render to avoid recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const GlassCard = ({ children, className = "" }) => (
  <div className={`glass-card rounded-2xl p-6 ${className}`}>{children}</div>
);

const NeonButton = ({ children, onClick, active = false, className = "" }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-full font-bold transition-all active:scale-95 flex items-center gap-2 ${
      active
        ? "bg-primary text-white neon-glow"
        : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
    } ${className}`}
  >
    {children}
  </button>
);

const CountdownTimer = ({ targetDate, label }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
        {label}
      </span>
      <div className="flex gap-4">
        {[
          { val: timeLeft.days, label: "D" },
          { val: timeLeft.hours, label: "H" },
          { val: timeLeft.minutes, label: "M" },
          { val: timeLeft.seconds, label: "S" },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="size-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black mb-1">
              {String(item.val).padStart(2, "0")}
            </div>
            <span className="text-[8px] font-bold text-white/40">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState("es");
  const [activeTab, setActiveTab] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("New Artist");
  const [userAvatar, setUserAvatar] = useState(
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  );
  const [stats, setStats] = useState({ videos: 0, level: 1, plan: "Waitlist" });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(890); // Base starting count
  const [pageVisits, setPageVisits] = useState(10400); // Base starting count

  useEffect(() => {
    const savedLogin = localStorage.getItem("ft_isLoggedIn");
    const savedName = localStorage.getItem("ft_userName");
    const savedAvatar = localStorage.getItem("ft_userAvatar");
    const savedStats = localStorage.getItem("ft_stats");
    const savedLang = localStorage.getItem("ft_lang");

    if (savedLogin === "true") setIsLoggedIn(true);
    if (savedName) setUserName(savedName);
    if (savedAvatar) setUserAvatar(savedAvatar);
    if (savedStats) setStats(JSON.parse(savedStats));

    // Language detection
    if (savedLang) {
      setLang(savedLang);
    } else {
      const browserLang = navigator.language || navigator.userLanguage;
      const defaultLang = browserLang.startsWith("es") ? "es" : "en";
      setLang(defaultLang);
      localStorage.setItem("ft_lang", defaultLang);
    }

    // Metrics: Page Visits
    const visits = parseInt(localStorage.getItem("ft_page_visits") || "10400");
    const newVisits = visits + 1;
    setPageVisits(newVisits);
    localStorage.setItem("ft_page_visits", newVisits.toString());

    // Metrics: Waitlist
    const savedSub = localStorage.getItem("ft_subscribed");
    if (savedSub === "true") setIsSubscribed(true);

    const emails = JSON.parse(
      localStorage.getItem("ft_waitlist_emails") || "[]",
    );
    setWaitlistCount(890 + emails.length);
  }, []);

  const handleLanguageToggle = () => {
    const newLang = lang === "es" ? "en" : "es";
    setLang(newLang);
    localStorage.setItem("ft_lang", newLang);
  };

  const [authInitialMode, setAuthInitialMode] = useState("login");

  const handleLogin = (options = {}) => {
    if (isLoggedIn) {
      setActiveTab("studio");
      return;
    }
    if (options.openMode) setAuthInitialMode(options.openMode);
    if (options.userData) {
      setIsLoggedIn(true);
      localStorage.setItem("ft_isLoggedIn", "true");
      if (options.userData.name) {
        setUserName(options.userData.name);
        localStorage.setItem("ft_userName", options.userData.name);
      }
      setActiveTab("account");
      return;
    }
    setActiveTab("account");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("ft_isLoggedIn", "false");
    setUserName("New Artist");
    setStats({ videos: 0, level: 1, plan: "Free" });
    localStorage.removeItem("ft_userName");
    localStorage.removeItem("ft_stats");
    setActiveTab("home");
  };

  const handleSubscribe = (email) => {
    const emails = JSON.parse(
      localStorage.getItem("ft_waitlist_emails") || "[]",
    );
    if (!emails.includes(email)) {
      emails.push(email);
      localStorage.setItem("ft_waitlist_emails", JSON.stringify(emails));
      setWaitlistCount(890 + emails.length);
    }
    setIsSubscribed(true);
    localStorage.setItem("ft_subscribed", "true");
  };

  const t = translations[lang];

  const tabs = [
    { id: "home", label: t.nav.home, icon: <Globe size={18} /> },
    { id: "news", label: t.nav.news, icon: <Bell size={18} /> },
    { id: "studio", label: t.nav.studio, icon: <Video size={18} /> },
    { id: "download", label: t.nav.download, icon: <Smartphone size={18} /> },
    {
      id: "account",
      label: isLoggedIn ? t.nav.account : t.nav.login,
      icon: isLoggedIn ? <User size={18} /> : <Lock size={18} />,
    },
  ];

  return (
    <div className="min-h-screen bg-background-dark font-display text-white overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] -z-10"></div>
      <div className="fixed bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-electric-cyan/10 rounded-full blur-[150px] -z-10"></div>

      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab("home")}
          >
            <div className="relative">
              <div className="bg-primary/20 p-2 rounded-xl border border-primary/30 group-hover:scale-110 transition-transform duration-500">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="size-8 object-contain brightness-110 group-hover:brightness-125"
                />
              </div>
              <div className="absolute inset-0 bg-primary/20 blur-xl -z-10 group-hover:opacity-100 opacity-0 transition-opacity"></div>
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
              FacelessTube
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => setActiveTab("download")}
              className="px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase neon-glow hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              {t.nav.downloadFree}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLanguageToggle}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase hover:bg-white/10 transition-all"
            >
              <Languages size={14} className="text-primary" />
              {lang === "es" ? "EN" : "ES"}
            </button>

            <button
              className="p-2 rounded-full bg-white/5 border border-white/10 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={20} />
            </button>
            <button
              onClick={
                isLoggedIn
                  ? () => setActiveTab("account")
                  : () => handleLogin({ openMode: "login" })
              }
              className="px-5 py-2 rounded-full bg-primary font-bold text-sm hidden md:block neon-glow hover:scale-105 active:scale-95 transition-all"
            >
              {isLoggedIn ? t.nav.account : t.nav.login}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:px-8 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <HomeSection
              key="home"
              t={t}
              onLogin={handleLogin}
              isLoggedIn={isLoggedIn}
              setActiveTab={setActiveTab}
              lang={lang}
              isSubscribed={isSubscribed}
              onSubscribe={handleSubscribe}
            />
          )}
          {activeTab === "news" && (
            <NewsSection
              key="news"
              t={t}
              pageVisits={pageVisits}
              waitlistCount={waitlistCount}
            />
          )}
          {activeTab === "studio" && (
            <StudioSection
              key="studio"
              t={t}
              isLoggedIn={isLoggedIn}
              onLogin={handleLogin}
              stats={stats}
              lang={lang}
            />
          )}
          {activeTab === "download" && <DownloadSection key="download" t={t} />}
          {activeTab === "account" &&
            (isLoggedIn ? (
              <AccountSection
                key="account"
                t={t}
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
                userName={userName}
                setUserName={(val) => {
                  setUserName(val);
                  localStorage.setItem("ft_userName", val);
                }}
                userAvatar={userAvatar}
                setUserAvatar={(val) => {
                  setUserAvatar(val);
                  localStorage.setItem("ft_userAvatar", val);
                }}
                stats={stats}
                setStats={setStats}
                lang={lang}
                isSubscribed={isSubscribed}
                onSubscribe={handleSubscribe}
              />
            ) : (
              <AuthSection
                key="auth"
                t={t}
                onLogin={(userData) => handleLogin({ userData })}
                initialMode={authInitialMode}
                lang={lang}
              />
            ))}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background-dark/90 backdrop-blur-xl border-t border-white/5 md:hidden px-4 py-3 flex justify-between items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === tab.id ? "text-primary" : "text-white/30"
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-bold uppercase tracking-tight">
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function WelcomeSection({ t }) {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 relative overflow-hidden rounded-[40px] border border-white/5 bg-white/[0.02]">
      <div className="absolute top-0 right-0 size-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
      <div className="relative space-y-10">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase font-display italic text-primary">
            {t.welcome.title}
          </h2>
          <div className="h-1 w-20 bg-primary rounded-full"></div>
        </div>

        <div className="prose prose-invert prose-base max-w-none space-y-6 text-white/70 font-medium leading-[1.6]">
          <p>{t.welcome.p1}</p>
          <p>{t.welcome.p2}</p>
          <p>{t.welcome.p3}</p>
          <p className="text-xl text-white font-black italic border-l-4 border-primary pl-6 py-2">
            {t.welcome.p4}
          </p>
          <p>{t.welcome.p5}</p>
          <p>{t.welcome.p6}</p>
          <p>{t.welcome.p7}</p>
          <div className="space-y-2 pt-6">
            <p className="text-xl font-black italic text-primary uppercase tracking-tighter">
              "{t.welcome.winner}"
            </p>
            <p className="text-xl font-black">{t.welcome.p8}</p>
            <p className="text-xl font-black text-primary">{t.welcome.p9}</p>
          </div>
        </div>

        <div className="pt-8 flex items-center gap-6">
          <div className="size-16 rounded-2xl overflow-hidden border-2 border-primary/20 p-1">
            <img
              src="https://lh3.googleusercontent.com/a/ACg8ocLwP0jP3O3z2h0M1j2K0H5L1H5L1H5L1H5L1H5L=s96-c"
              alt="Victor Kawas"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <div className="font-display text-3xl font-black tracking-tighter text-white signature-font scale-y-125 origin-left">
              {t.welcome.founder}
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 mt-1">
              {t.welcome.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeSection({
  t,
  onLogin,
  isLoggedIn,
  setActiveTab,
  lang,
  isSubscribed,
  onSubscribe,
}) {
  const preLaunchDate = new Date("2026-02-14T00:00:00").getTime();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-24"
    >
      <div className="relative rounded-[40px] overflow-hidden min-h-[600px] flex flex-col items-center justify-center p-8 text-center border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-background-dark/80 via-background-dark/40 to-primary/20 -z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200"
          alt="AI Visualization"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay -z-20"
        />

        <div className="space-y-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md">
            <Zap size={14} className="text-primary fill-current" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {t.hero.preLaunch}
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none glow-text uppercase">
            {t.hero.title} <br />{" "}
            <span className="text-primary italic underline decoration-primary/30">
              {t.hero.withAI}
            </span>
          </h2>

          <p className="text-lg md:text-xl text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col items-center gap-10 pt-4">
            <CountdownTimer
              targetDate={preLaunchDate}
              label={t.hero.countdownTitle}
            />

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-2xl">
              <button
                onClick={() => setActiveTab("download")}
                className="w-full md:w-auto px-10 py-5 rounded-[24px] bg-primary text-white font-black text-xl uppercase tracking-widest neon-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Smartphone size={24} />
                {t.nav.downloadFree}
              </button>
              <button
                onClick={() => setActiveTab("studio")}
                className="w-full md:w-auto px-10 py-5 rounded-[24px] bg-white text-background-dark font-black text-xl uppercase tracking-widest border border-white/10 hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <BookOpen size={24} />
                {t.studio.title}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <WaitlistForm
          t={t}
          isSubscribed={isSubscribed}
          onSubscribe={onSubscribe}
        />
      </div>

      <WelcomeSection t={t} />

      <div className="max-w-4xl mx-auto">
        <GlassCard className="border-electric-cyan/30 bg-gradient-to-r from-electric-cyan/10 to-transparent p-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="bg-electric-cyan/20 p-6 rounded-[32px] shadow-xl shadow-electric-cyan/10">
              <Gift size={48} className="text-electric-cyan" />
            </div>
            <div className="space-y-4 text-center md:text-left flex-1">
              <h3 className="text-3xl font-black tracking-tight uppercase italic">
                {t.referral.title}
              </h3>
              <p className="text-white/60 font-medium text-base">
                {t.referral.desc}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-black text-primary block mb-1 uppercase tracking-widest">
                    Paso 01
                  </span>
                  <p className="text-sm font-bold">{t.referral.step1}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-black text-electric-cyan block mb-1 uppercase tracking-widest">
                    Paso 02
                  </span>
                  <p className="text-sm font-bold">{t.referral.step2}</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <DownloadCTA t={t} />
    </motion.section>
  );
}

function NewsSection({ t, pageVisits, waitlistCount }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard className="bg-primary/10 border-primary/20 flex flex-col items-center text-center p-8">
          <TrendingUp className="text-primary mb-4" size={32} />
          <span className="text-4xl font-black text-white">
            {pageVisits.toLocaleString()}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary mt-2">
            {t.news.visitors}
          </span>
        </GlassCard>
        <GlassCard className="bg-electric-cyan/10 border-electric-cyan/20 flex flex-col items-center text-center p-8">
          <Users className="text-electric-cyan mb-4" size={32} />
          <span className="text-4xl font-black text-white">
            {waitlistCount.toLocaleString()}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-electric-cyan mt-2">
            {t.news.waitlist}
          </span>
        </GlassCard>
        <GlassCard className="bg-white/5 border-white/10 p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            {t.news.live}
          </div>
          <h3 className="text-xl font-black uppercase">{t.news.title}</h3>
        </GlassCard>
      </div>

      <div className="space-y-16">
        <section className="space-y-8">
          <h3 className="text-2xl font-black uppercase italic border-l-4 border-primary pl-4">
            {t.news.category1}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {t.news.items
              .filter((item) => item.category === "category1")
              .map((item, idx) => (
                <NewsCard key={idx} item={item} />
              ))}
          </div>
        </section>

        <section className="space-y-8">
          <h3 className="text-2xl font-black uppercase italic border-l-4 border-electric-cyan pl-4">
            {t.news.category2}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {t.news.items
              .filter((item) => item.category === "category2")
              .map((item, idx) => (
                <NewsCard key={idx} item={item} />
              ))}
          </div>
        </section>
      </div>

      <DownloadCTA t={t} />
    </motion.section>
  );
}

function NewsCard({ item }) {
  return (
    <div
      onClick={() => window.open(item.url, "_blank")}
      className="group relative rounded-[32px] overflow-hidden border border-white/10 bg-white/[0.02] hover:border-primary/40 transition-all duration-500 cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 to-transparent"></div>
        <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20 backdrop-blur-md">
            {item.tag}
          </span>
          <div className="flex items-center gap-2 text-[10px] font-black text-white/60 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-md">
            <Play size={10} fill="currentColor" /> {item.duration}
          </div>
        </div>
      </div>
      <div className="p-8 space-y-3">
        <h3 className="text-xl font-black leading-tight group-hover:text-primary transition-colors uppercase italic line-clamp-2">
          {item.title}
        </h3>
        <p className="text-white/40 text-sm leading-relaxed line-clamp-2">
          {item.desc}
        </p>
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-white/20 tracking-wider font-display italic underline decoration-primary/20">
            {item.channel}
          </span>
          <div className="size-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <ExternalLink size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StudioSection({ t, isLoggedIn, onLogin, lang }) {
  const [studioTab, setStudioTab] = useState("create");

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-12"
    >
      {/* Tab Navigation */}
      <div className="flex items-center justify-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 max-w-md mx-auto">
        <button
          onClick={() => setStudioTab("create")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-bold uppercase transition-all ${
            studioTab === "create"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-white/40 hover:text-white"
          }`}
        >
          <Wand2 size={16} />
          {lang === "es" ? "Crear" : "Create"}
        </button>
        <button
          onClick={() => setStudioTab("learn")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-bold uppercase transition-all ${
            studioTab === "learn"
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-white/40 hover:text-white"
          }`}
        >
          <BookOpen size={16} />
          {lang === "es" ? "Aprender" : "Learn"}
        </button>
      </div>

      {/* Create Tab - AI Generator */}
      {studioTab === "create" && (
        <div className="animate-fade-in">
          {isLoggedIn ? (
            <CreatorStudio t={t} lang={lang} />
          ) : (
            <div className="max-w-xl mx-auto p-12 rounded-[40px] bg-primary/10 border border-primary/20 text-center space-y-6 backdrop-blur-xl relative overflow-hidden group">
              <div className="size-20 rounded-[24px] bg-primary/20 flex items-center justify-center mx-auto neon-glow">
                <Lock className="text-primary" size={40} />
              </div>
              <h3 className="text-2xl font-black uppercase">
                {lang === "es" ? "Inicia sesión para crear" : "Login to create"}
              </h3>
              <p className="text-white/60 text-sm">
                {lang === "es"
                  ? "Accede a tu cuenta para usar el generador de contenido con IA"
                  : "Access your account to use the AI content generator"}
              </p>
              <button
                onClick={() => onLogin({ openMode: "register" })}
                className="px-10 py-5 rounded-2xl bg-primary text-white font-black text-lg uppercase tracking-widest neon-glow hover:scale-105 active:scale-95 transition-all"
              >
                {t.auth.registerCta}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Learn Tab - Academy */}
      {studioTab === "learn" && (
        <div className="space-y-12 animate-fade-in">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md mb-4">
              <BookOpen size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Academy Live
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter glow-text leading-none">
              {t.studio.title}
            </h2>
            <p className="text-white/60 font-medium text-lg max-w-2xl mx-auto">
              {t.studio.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <AcademyModule
              icon={<Globe size={24} />}
              label={t.studio.step1}
              desc="Master the fundamentals of automated content creation."
              active={isLoggedIn}
            />
            <AcademyModule
              icon={<Zap size={24} />}
              label={t.studio.step2}
              desc="Understand the algorithms to trigger massive viral loops."
              active={isLoggedIn}
            />
            <AcademyModule
              icon={<Smartphone size={24} />}
              label={t.studio.step3}
              desc="Scale your content empire efficiently with AI."
              active={isLoggedIn}
            />
          </div>

          {isLoggedIn ? (
            <div className="space-y-16">
              <div className="space-y-8">
                <h3 className="text-3xl font-black uppercase italic border-l-4 border-primary pl-4">
                  Premium Tutorials
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {t.news.items.map((item, idx) => (
                    <NewsCard key={idx} item={item} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto p-12 rounded-[40px] bg-primary/10 border border-primary/20 text-center space-y-6 backdrop-blur-xl relative overflow-hidden group">
              <div className="size-20 rounded-[24px] bg-primary/20 flex items-center justify-center mx-auto neon-glow">
                <Lock className="text-primary" size={40} />
              </div>
              <h3 className="text-2xl font-black uppercase">
                {t.studio.unlockAcademy}
              </h3>
              <button
                onClick={() => onLogin({ openMode: "register" })}
                className="px-10 py-5 rounded-2xl bg-primary text-white font-black text-lg uppercase tracking-widest neon-glow hover:scale-105 active:scale-95 transition-all"
              >
                {t.auth.registerCta}
              </button>
            </div>
          )}
        </div>
      )}

      <DownloadCTA t={t} />
    </motion.section>
  );
}

function AcademyModule({ icon, label, desc, active }) {
  return (
    <GlassCard
      className={`relative group p-8 rounded-[32px] transition-all duration-500 ${!active ? "opacity-40 grayscale blur-[1px]" : "border-primary/40 hover:border-primary"}`}
    >
      <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-6 w-fit group-hover:scale-110 group-hover:bg-primary/20 transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-black uppercase mb-3 tracking-tight">
        {label}
      </h3>
      <p className="text-sm text-white/40 leading-relaxed font-medium">
        {desc}
      </p>
      {!active && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-dark/30 backdrop-blur-[2px] rounded-[32px]">
          <Lock size={24} className="text-white/20" />
        </div>
      )}
    </GlassCard>
  );
}

function DownloadSection({ t }) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-12 max-w-5xl mx-auto"
    >
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter glow-text leading-none">
          {t.download.title}
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <GlassCard className="p-10 space-y-6 border-primary/40 bg-primary/5">
            <div className="size-16 rounded-[24px] bg-primary/20 flex items-center justify-center text-primary mb-2 shadow-lg shadow-primary/20">
              <Download size={32} />
            </div>
            <h3 className="text-3xl font-black uppercase">
              {t.download.directApk}
            </h3>
            <p className="text-white/60 font-medium">
              Instala FacelessTube directamente en tu Android.
            </p>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-primary" />
                <span className="text-sm font-bold">{t.download.bonusPro}</span>
              </div>
              <div className="flex items-center gap-3">
                <Gift size={20} className="text-electric-cyan" />
                <span className="text-sm font-bold">
                  {t.download.bonusFree}
                </span>
              </div>
            </div>

            <button
              onClick={() => window.open("/facelesstube.apk", "_blank")}
              className="w-full py-5 rounded-[24px] bg-primary text-white font-black uppercase tracking-widest neon-glow hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 flex items-center justify-center gap-3"
            >
              <Download size={24} />
              DOWNLOAD APK
            </button>
          </GlassCard>

          <GlassCard className="p-8 space-y-5 opacity-40">
            <div className="size-12 rounded-[16px] bg-white/10 flex items-center justify-center text-white/40">
              <Smartphone size={24} />
            </div>
            <h3 className="text-2xl font-black uppercase">
              {t.download.iosTitle}
            </h3>
            <p className="text-white/40 text-sm">{t.download.iosDesc}</p>
          </GlassCard>
        </div>

        <div className="relative group p-4 bg-white/5 rounded-[48px] border border-white/10">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 group-hover:bg-primary/30 transition-colors"></div>
          <img
            src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800"
            className="rounded-[32px] grayscale group-hover:grayscale-0 transition-all duration-700 shadow-2xl"
            alt="Mobile App"
          />
        </div>
      </div>
    </motion.section>
  );
}

function AccountSection({
  t,
  isLoggedIn,
  onLogout,
  userName,
  setUserName,
  userAvatar,
  setUserAvatar,
  stats,
  setStats,
  lang,
  isSubscribed,
  onSubscribe,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <div className="flex-1 space-y-12 w-full">
          <div className="flex flex-col md:flex-row items-center gap-10 p-8 rounded-[40px] bg-white/[0.02] border border-white/10 relative overflow-hidden group">
            <div className="relative size-32 shrink-0">
              <img
                src={userAvatar}
                className="w-full h-full object-cover rounded-[32px] border-2 border-primary/20 shadow-2xl"
                alt="Avatar"
              />
              <button
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (re) => setUserAvatar(re.target.result);
                      reader.readAsDataURL(file);
                    }
                  };
                  input.click();
                }}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-[32px] transition-all backdrop-blur-sm"
              >
                <CloudUpload size={24} className="text-white" />
              </button>
            </div>
            <div className="space-y-3 flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-white/5 border border-primary/40 rounded-xl px-4 py-2 text-2xl font-black w-full outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setUserName(tempName);
                      setIsEditing(false);
                    }}
                    className="p-3 bg-primary rounded-xl hover:scale-105 transition-all"
                  >
                    <Zap size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <h2 className="text-4xl font-black tracking-tighter uppercase italic">
                    {userName}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-white/20 hover:text-primary transition-colors"
                  >
                    <Settings size={20} />
                  </button>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">
                  {isSubscribed ? "VIP EARLY ACCESS" : "WAITLIST MEMBER"}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all text-[10px] font-black uppercase flex items-center gap-2"
            >
              {t.nav.logout} <LogOut size={14} />
            </button>
          </div>

          <WaitlistForm
            t={t}
            isSubscribed={isSubscribed}
            onSubscribe={onSubscribe}
          />
        </div>

        <div className="w-full md:w-[340px] space-y-6">
          <GlassCard className="space-y-6 border-primary/20 p-8 rounded-[32px]">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-center">
              Status
            </h3>
            <div className="p-6 rounded-[24px] bg-white/[0.03] text-center space-y-4">
              <div
                className={`mx-auto size-16 rounded-[20px] flex items-center justify-center shadow-xl ${isSubscribed ? "bg-primary text-white neon-glow" : "bg-white/5 text-white/10 border-2 border-dashed border-white/5"}`}
              >
                <Zap size={28} fill={isSubscribed ? "currentColor" : "none"} />
              </div>
              <h4 className="text-lg font-black uppercase tracking-tight">
                {isSubscribed ? "VIP QUEUE" : "PENDING"}
              </h4>
            </div>
            <a
              href="https://t.me/facelesstubeapp"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all text-center"
            >
              JOIN TELEGRAM
            </a>
          </GlassCard>
        </div>
      </div>
      <DownloadCTA t={t} />
    </motion.section>
  );
}

function WaitlistForm({ t, onSubscribe, isSubscribed }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const inputVal = email.toLowerCase().trim();

    // Google Reviewer Coupon Bypass
    if (inputVal === "premiumusergoogle123123") {
      onSubscribe(inputVal);
      setStatus("success");
      return;
    }

    if (!email.includes("@")) {
      setStatus("error");
      return;
    }
    onSubscribe(email);
    setStatus("success");
  };

  if (isSubscribed || status === "success") {
    return (
      <div className="p-10 rounded-[40px] bg-primary/10 border border-primary/20 text-center space-y-4 backdrop-blur-xl">
        <div className="mx-auto size-20 bg-primary/20 rounded-[28px] flex items-center justify-center text-primary neon-glow shadow-xl mb-2">
          <Zap size={40} fill="currentColor" />
        </div>
        <h4 className="text-3xl font-black uppercase text-primary tracking-tighter">
          {t.account.waitlist.success}
        </h4>
        <p className="text-white/40 font-medium text-sm">
          Stand by for your VIP drop codes.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-10 md:p-14 rounded-[48px] bg-white/[0.02] border border-white/10 space-y-10 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 transition-all group-hover:bg-primary/10"></div>
      <div className="relative space-y-3">
        <h4 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
          {t.account.waitlist.title}
        </h4>
        <p className="text-white/40 text-base md:text-lg font-medium max-w-xl">
          {t.account.waitlist.subtitle}
        </p>
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-primary/5 border border-primary/10 w-fit group-hover:border-primary/30 transition-all">
          <Info size={14} className="text-primary" />
          <p className="text-[10px] font-bold text-primary/60 italic">
            {t.account.waitlist.riddle}
          </p>
        </div>
      </div>
      <div className="relative flex flex-col md:flex-row gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.account.waitlist.placeholder}
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 outline-none focus:border-primary/40 focus:bg-white/10 transition-all text-lg placeholder:text-white/10"
        />
        <button
          type="submit"
          className="px-10 py-5 bg-primary rounded-2xl font-black text-lg uppercase tracking-widest neon-glow hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          {t.account.waitlist.cta}
        </button>
      </div>
      {status === "error" && (
        <p className="text-[10px] text-red-500 font-bold ml-8">
          {t.account.waitlist.emailError}
        </p>
      )}
    </form>
  );
}

function DownloadCTA({ t, className = "" }) {
  const visits = parseInt(localStorage.getItem("ft_page_visits") || "10400");
  const emails = JSON.parse(localStorage.getItem("ft_waitlist_emails") || "[]");
  const waitlist = 890 + emails.length;

  return (
    <div
      className={`mt-16 text-center py-16 bg-primary/5 rounded-[48px] border border-primary/10 backdrop-blur-sm relative overflow-hidden ${className}`}
    >
      <div className="relative z-10 space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase tracking-tight italic">
            Ready to Start Your Empire?
          </h3>
          <p className="text-white/30 text-sm max-w-md mx-auto font-medium">
            Get the official FacelessTube tool and start creating today.
          </p>
        </div>
        <button
          onClick={() => window.open("/facelesstube.apk", "_blank")}
          className="px-12 py-6 rounded-[32px] bg-primary text-white font-black text-2xl uppercase tracking-tighter neon-glow hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 flex items-center gap-4 mx-auto group"
        >
          <Download
            size={32}
            className="group-hover:translate-y-1 transition-transform"
          />
          DOWNLOAD APK
        </button>
        <div className="flex items-center justify-center gap-10 pt-4">
          <div className="text-center">
            <span className="block text-xl font-black">
              {visits.toLocaleString()}
            </span>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
              {t.news.visitors}
            </span>
          </div>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="text-center">
            <span className="block text-xl font-black">
              {waitlist.toLocaleString()}
            </span>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
              {t.news.waitlistFooter}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthSection({ t, onLogin, initialMode = "login", lang }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [paypal, setPaypal] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !email ||
      !password ||
      (mode === "register" && !name) ||
      (mode === "register" && !paypal)
    ) {
      setError("Please fill all fields");
      return;
    }
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("ft_mock_users") || "[]");
      const inputEmail = email.toLowerCase().trim();
      const inputPass = password.toLowerCase().trim();

      // Google Reviewer Coupon Bypass
      if (
        inputEmail === "premiumusergoogle123123" ||
        inputPass === "premiumusergoogle123123"
      ) {
        setIsLoading(false);
        // Set the global subscriber status since they used the premium coupon
        localStorage.setItem("ft_subscribed", "true");
        onLogin({ name: "VIP Reviewer" });
        return;
      }

      if (mode === "register") {
        if (users.find((u) => u.email === email)) {
          setError(t.auth.emailExists);
          setIsLoading(false);
          return;
        }
        users.push({ email, password, name, paypal });
        localStorage.setItem("ft_mock_users", JSON.stringify(users));
        setIsLoading(false);
        onLogin({ name });
      } else {
        const user = users.find(
          (u) => u.email === email && u.password === password,
        );
        if (user) {
          setIsLoading(false);
          onLogin({ name: user.name });
        } else {
          setError(t.auth.invalidCreds);
          setIsLoading(false);
        }
      }
    }, 1200);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[600px] flex items-center justify-center p-4"
    >
      <GlassCard className="max-w-md w-full p-10 border-primary/20 relative overflow-hidden rounded-[40px]">
        <div className="relative space-y-6">
          <div className="text-center space-y-2">
            <div className="size-14 rounded-[20px] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Lock size={28} className="text-primary" />
            </div>

            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mb-6">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === "login" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40"}`}
              >
                {t.nav.login}
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === "register" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40"}`}
              >
                {t.nav.signUp}
              </button>
            </div>

            <h2 className="text-3xl font-black uppercase tracking-tighter italic">
              {mode === "login" ? t.auth.loginTitle : t.auth.registerTitle}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-white/40 ml-1">
                  {t.account.profile.name}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/40 outline-none"
                  placeholder="Victor Kawas"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-white/40 ml-1">
                {t.auth.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/40 outline-none"
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-white/40 ml-1">
                {t.auth.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/40 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
            {mode === "register" && (
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-white/40 ml-1 flex items-center justify-between">
                  {t.auth.paypal}
                  <span className="text-[6px] tracking-normal lowercase">
                    {t.auth.paypalInfo}
                  </span>
                </label>
                <input
                  type="email"
                  value={paypal}
                  onChange={(e) => setPaypal(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/40 outline-none"
                  placeholder="paypal@example.com"
                />
              </div>
            )}
            {error && (
              <p className="text-[10px] text-red-500 font-bold text-center">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest neon-glow active:scale-95 transition-all shadow-lg"
            >
              {isLoading
                ? t.auth.loggingIn
                : mode === "login"
                  ? t.auth.loginCta
                  : t.auth.registerCta}
            </button>
          </form>
        </div>
      </GlassCard>
    </motion.section>
  );
}
