import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-cosmic-950 font-display text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Noise & Lights */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/20 rounded-full blur-[150px] -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-6"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-primary/20 p-4 rounded-2xl border border-primary/30 shadow-[0_0_50px_rgba(var(--primary),0.3)]">
            <img src="/logo.png" alt="FacelessTube" className="h-12 w-auto" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <Sparkles size={16} className="text-primary" />
          <span className="text-sm font-bold tracking-widest text-primary uppercase">Próximamente</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6">
          Estamos <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-electric-cyan neon-text">Evolucionando.</span>
        </h1>

        <p className="text-xl text-white/50 max-w-lg mx-auto font-medium">
          FacelessTube está recibiendo una gran actualización. Estaremos de vuelta muy pronto.
        </p>
      </motion.div>
    </div>
  );
}
