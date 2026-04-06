import React, { useEffect } from "react";
import {
  Zap,
  Play,
  TrendingUp,
  Download,
  CheckCircle2,
  Lock,
  Wallet,
  Smartphone,
  Video,
  MonitorPlay
} from "lucide-react";
import { motion } from "framer-motion";

const GooglePlayIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 541 614" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M22.0621 1.71072C15.6548 4.90809 11.5977 12.0007 11.5977 21.0062V592.545C11.5977 601.55 15.6548 608.643 22.0621 611.84L284.28 349.529L22.0621 1.71072Z" fill="#00E676"/>
    <path d="M375.463 440.718L284.28 349.535L22.0621 611.846C29.6105 615.626 39.4678 615.42 49.6582 609.605L375.463 440.718Z" fill="#FF3D00"/>
    <path d="M375.463 172.937L49.6582 4.04944C39.4678 -1.76566 29.6105 -1.9723 22.0621 1.80801L284.28 264.119L375.463 172.937Z" fill="#FFC107"/>
    <path d="M375.463 172.937L284.28 264.119L375.463 349.535L511.233 281.657C532.748 270.893 532.748 253.256 511.233 242.493L375.463 172.937Z" fill="#29B6F6"/>
  </svg>
);

const externalAppURL = "https://app.facelesstube.mx"; // Example URL to redirect users to the real app

export default function App() {
  // Tracking
  useEffect(() => {
    let visits = parseInt(localStorage.getItem("ft_marketing_visits") || "10400");
    localStorage.setItem("ft_marketing_visits", (visits + 1).toString());
  }, []);

  const handleDownload = () => {
    // Start direct download of the APK
    const link = document.createElement("a");
    link.href = "/app-debug.apk";
    link.download = "FacelessTube.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubscribe = () => {
    // Emulate sending to the "Pricing" page of the app
    window.location.href = `${externalAppURL}/app/premium`;
  };

  return (
    <div className="min-h-screen bg-cosmic-950 font-display text-white selection:bg-primary/50 selection:text-white">
      {/* Dynamic Background Noise */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
      <div className="fixed top-0 left-[-20%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[150px] -z-10"></div>
      <div className="fixed bottom-0 right-[-20%] w-[60%] h-[60%] bg-electric-cyan/10 rounded-full blur-[150px] -z-10"></div>

      {/* Navbar Minimal */}
      <header className="fixed top-0 w-full z-50 bg-cosmic-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
              <img src="/logo.png" alt="FacelessTube" className="h-6 w-auto" />
            </div>
            <span className="text-xl font-black uppercase tracking-tight hidden sm:block">FacelessTube</span>
          </div>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full font-bold transition-all text-sm uppercase"
          >
            <Download size={16} /> Entrar a la App
          </button>
        </div>
      </header>

      <main className="pt-32 pb-24">
        {/* HERO SECTION */}
        <section className="px-6 relative z-10 max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-widest text-red-500">Última oportunidad: Precios de lanzamiento</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-[1.1] tracking-tighter drop-shadow-2xl">
              Gana dinero en YouTube <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-electric-cyan neon-text">Mientras Duermes.</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/70 font-medium max-w-3xl mx-auto leading-relaxed">
              Sin mostrar tu cara. Sin comprar equipo. Sin saber editar. <br/>
              La IA hace el <span className="font-bold text-white">100% del trabajo</span> pesado. Tú cobras.
            </p>

            <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4 flex-wrap">
              <button 
                onClick={handleSubscribe}
                className="w-full md:w-auto px-10 py-5 rounded-[24px] bg-primary text-white font-black text-xl uppercase tracking-widest neon-glow hover:scale-105 active:scale-95 transition-all"
              >
                Empezar a Monetizar
              </button>
              <button 
                onClick={() => {}} // TODO: Add Play Store Link here
                className="w-full md:w-auto px-8 py-5 rounded-[24px] bg-white text-black font-black text-lg uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex justify-center items-center gap-3"
              >
                <div className="bg-black/5 p-1 rounded-full"><GooglePlayIcon size={24} /></div> Google Play
              </button>
              <button 
                onClick={handleDownload}
                className="w-full md:w-auto px-8 py-5 rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-lg uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex justify-center items-center gap-2"
              >
                <Download size={24} /> Descargar APK
              </button>
            </div>
            
            <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-4">
              Ya somos +10,400 creadores haciendo dinero
            </p>
          </motion.div>
        </section>

        {/* DEMO / PROOF SECTION */}
        <section className="mt-24 px-6 max-w-6xl mx-auto">
          <div className="relative rounded-[40px] overflow-hidden border border-white/10 bg-white/[0.02] p-8 md:p-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-6">
                  El "Truco" Que Los YouTubers NO Quieren Que Sepas.
                </h2>
                <div className="space-y-6">
                  {[
                    "1. Escribes una idea tonta en la app.",
                    "2. La IA genera el guion, busca los videos y pone la voz.",
                    "3. En 2 minutos se sube a tu canal en Full HD.",
                    "4. Empiezas a acumular vistas y a generar $$."
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="font-medium text-lg text-white/90">{step.slice(3)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* CTA FINAL */}
        <section className="mt-32 px-6 max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-tr from-primary/30 to-electric-cyan/10 p-12 rounded-[40px] border border-primary/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10"></div>
            <h2 className="text-4xl font-black uppercase italic mb-6">¿Vas a seguir deslizando TikTok o quieres empezar a cobrar?</h2>
            <p className="text-lg text-white/80 mb-10">Crea hoy tu canal automatizado y súbete a la ola antes de que se sature. Tu yo de mañana te lo va a agradecer infinito.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <button 
                onClick={handleSubscribe}
                className="px-10 py-5 rounded-[24px] bg-primary text-white font-black text-xl uppercase neon-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Suscribirme Ahora <Zap size={20} className="fill-current"/>
              </button>
              <button 
                onClick={() => {}} // TODO: Add Play Store Link here
                className="px-8 py-5 rounded-[24px] bg-white text-black font-black text-sm uppercase hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <div className="bg-black/5 p-1 rounded-full"><GooglePlayIcon size={18} /></div> Google Play
              </button>
              <button 
                onClick={handleDownload}
                className="px-8 py-5 rounded-[24px] bg-white/5 border border-white/20 text-white font-black text-sm uppercase hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} /> Descargar APK
              </button>
            </div>
            
            <div className="mt-8 flex justify-center items-center gap-6 text-[10px] text-white/40 uppercase font-black">
              <span className="flex items-center gap-1"><Lock size={12}/> Pago 100% Seguro</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={12}/> Acceso Inmediato</span>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 px-6 text-center">
        <div className="flex justify-center gap-6 mb-6">
          <a href="#" className="text-white/40 hover:text-white uppercase font-black text-xs">Términos</a>
          <a href="#" className="text-white/40 hover:text-white uppercase font-black text-xs">Privacidad</a>
        </div>
        <p className="text-white/20 text-xs">© 2026 FacelessTube. Todos los derechos reservados. No garantizamos que te hagas millonario, pero te damos las herramientas para intentarlo.</p>
      </footer>
    </div>
  );
}
