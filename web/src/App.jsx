import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, DollarSign, Play, TrendingUp, Clock, Zap, Smartphone, ChevronDown, Rocket, Target, Brain } from 'lucide-react';

const GlassCard = ({ children, className = "" }) => (
  <div className={`glass-card rounded-[32px] p-8 border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

export default function App() {
  const [activeFaq, setActiveFaq] = useState(null);

  const handleStart = () => {
    // Redirects to real app registration
    window.location.href = "https://app.facelesstube.mx/auth";
  };

  return (
    <div className="min-h-screen bg-cosmic-950 font-display text-white selection:bg-primary/30 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04]"></div>
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] -z-10"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-electric-cyan/10 rounded-full blur-[150px] -z-10"></div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
            <img src="/logo.png" alt="FacelessTube" className="w-8 h-8 object-contain" />
          </div>
          <span className="font-black text-xl uppercase tracking-tighter hidden sm:block">FacelessTube</span>
        </div>
        <button onClick={handleStart} className="px-6 py-2.5 rounded-full bg-primary text-white font-bold uppercase text-xs tracking-widest neon-glow hover:scale-105 active:scale-95 transition-all">
          Empezar Ahora
        </button>
      </header>

      <main className="pt-32 pb-32">

        {/* 1. EL GANCHO (HERO SECTION) */}
        <section className="px-6 max-w-5xl mx-auto text-center space-y-10 relative">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-primary/50 bg-primary/10 mb-4 animate-pulse">
            <Zap size={16} className="text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">El Secreto Mejor Guardado de YouTube</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-tight drop-shadow-2xl">
            El Sistema de IA que permite a principiantes <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-electric-cyan neon-text">Renunciar a sus Empleos</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 font-medium max-w-3xl mx-auto leading-relaxed">
            Genera ingresos pasivos creando <strong className="text-white">canales virales 100% automatizados.</strong> Sin mostrar tu cara, sin conocimientos de edición, y sin abrir Premiere Pro en tu vida.
          </p>

          <div className="flex flex-col items-center justify-center pt-8 gap-6">
            <button onClick={handleStart} className="px-12 py-6 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-white font-black text-2xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_80px_rgba(var(--primary),0.6)] flex items-center gap-3 group">
              Crear mi primer video 
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
            <p className="text-sm font-bold text-white/40 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-primary" /> Cancela cuando quieras. Acceso inmediato.
            </p>
          </div>

          {/* VSL Placeholder / Demo */}
          <div className="mt-16 relative max-w-4xl mx-auto rounded-[40px] overflow-hidden border border-white/10 shadow-2xl glass-card aspect-video flex items-center justify-center group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 to-transparent z-10 pointer-events-none"></div>
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200" alt="Video Preview" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-1000 group-hover:scale-105" />
            <div className="relative z-20 size-24 rounded-full bg-primary/90 flex items-center justify-center neon-glow group-hover:scale-110 transition-transform">
              <Play size={40} className="text-white fill-white ml-2" />
            </div>
            <div className="absolute bottom-8 left-8 z-20 text-left">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-primary border border-primary/30 mb-3 inline-block">Demostración de 2 min</span>
              <h3 className="text-2xl font-black italic">Mira cómo la IA hace el trabajo sucio.</h3>
            </div>
          </div>
        </section>

        {/* 2. AGITACIÓN DEL PROBLEMA */}
        <section className="mt-40 px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight">
                El modelo antiguo de YouTube <span className="text-red-500">está muerto.</span>
              </h2>
              <div className="space-y-6 text-lg text-white/70 font-medium">
                <p>Pasar 40 horas a la semana haciendo rico a otra persona en una oficina es frustrante, pero cuando intentas emprender en YouTube chocas con un muro de ladrillos.</p>
                <div className="space-y-4">
                  {[
                    "Comprar equipo caro (Cámaras, Luces, Micrófonos).",
                    "Grabar tu cara y odiar cómo se ve y suena tu voz.",
                    "Perder 8 horas editando un video en Premiere Pro que nadie verá.",
                    "Dar la cara frente a tus amigos y sufrir el síndrome del impostor."
                  ].map((pain, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="mt-1 size-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">✖</div>
                      <p>{pain}</p>
                    </div>
                  ))}
                </div>
                <p className="font-bold text-white pt-4 text-xl">¿La realidad? Solo los que sistematizan ganan en grande.</p>
              </div>
            </div>
            <div className="relative">
              <GlassCard className="border-primary/30 bg-gradient-to-tr from-primary/10 to-transparent">
                <div className="flex items-center gap-3 mb-6">
                  <Brain size={32} className="text-primary" />
                  <h3 className="text-2xl font-black uppercase italic">La Nueva Era: Faceless</h3>
                </div>
                <div className="space-y-6">
                  <p className="text-lg font-medium text-white/90">
                    FacelessTube es tu ejército privado de clones. Una IA entrenada literalmente para:
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Crear guiones atrapantes con retención brutal.",
                      "Robar el mejor metraje en bruto y sin copyright.",
                      "Sintetizar voces de alta fidelidad que transmiten emoción.",
                      "Ensamblar un video listo para subir en 2 minutos."
                    ].map((feature, idx) => (
                      <li key={idx} className="flex gap-4 items-center font-bold text-sm">
                        <CheckCircle2 size={24} className="text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* 3. HISTORIAS / SOCIAL PROOF HIPNÓTICO */}
        <section className="mt-40 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">No necesitas nuestro permiso para ganar dinero.</h2>
            <p className="text-xl text-white/60">Gente común ya está usando este atajo matemático.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* HISTORIA 1: EL CHICO DEL BAÑO */}
            <GlassCard className="hover:border-primary/50 transition-colors duration-500 group">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-full bg-gradient-to-br from-primary to-electric-cyan p-1">
                    <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200" alt="Marcos" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl">Marcos V.</h4>
                    <span className="text-primary text-xs font-bold uppercase tracking-widest">"El Chico del Baño"</span>
                  </div>
                </div>
                <DollarSign className="text-primary opacity-20 group-hover:opacity-100 transition-opacity" size={40} />
              </div>
              <p className="text-lg text-white/80 font-medium italic leading-relaxed">
                "Trabajo en una oficina de 9 a 5. Descubrí FacelessTube un martes y me propuse algo: cada vez que iba al baño en la oficina, sacaba el celular y generaba un video. Literalmente apretar un botón mientras perdía el tiempo. Al final del mes ya tenía 30 videos publicados en un nicho de misterio. Hoy ese canal paga mi renta completa."
              </p>
            </GlassCard>

            {/* HISTORIA 2: EL IMPERIO DE SEBAS */}
            <GlassCard className="hover:border-electric-cyan/50 transition-colors duration-500 group">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-full bg-gradient-to-br from-electric-cyan to-indigo-500 p-1">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200" alt="Sebastián" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl">Sebastián C.</h4>
                    <span className="text-electric-cyan text-xs font-bold uppercase tracking-widest">Decepción a Imperio</span>
                  </div>
                </div>
                <Rocket className="text-electric-cyan opacity-20 group-hover:opacity-100 transition-opacity" size={40} />
              </div>
              <p className="text-lg text-white/80 font-medium italic leading-relaxed">
                "Empecé subiendo videos por pura diversión. Cuando me llegó el primer pago de YouTube por $40 dólares, mi cerebro explotó al entender el potencial. Sistematicé todo con FacelessTube. Creé 10 canales usando diferentes IAs para diferentes nichos. Ahora dedico 3 horas a la semana a subir los videos y facturo en un mes lo que cobraba en 6 meses de godín."
              </p>
            </GlassCard>
          </div>
        </section>

        {/* 4. REALITY CHECK - MANEJO DE EXPECTATIVAS (BRUTAL HONESTY) */}
        <section className="mt-40 px-6 max-w-4xl mx-auto">
          <div className="border-l-4 border-primary pl-8 py-4 relative">
            <Target className="absolute -left-10 top-0 text-primary opacity-20" size={120} />
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6 relative z-10">
              Hablemos con la verdad.<br/> (El "Reality Check")
            </h2>
            <div className="space-y-6 text-xl text-white/80 font-medium relative z-10 leading-relaxed">
              <p>
                No te voy a mentir. <strong className="text-white">No te vas a hacer millonario mañana.</strong>
              </p>
              <p>
                El mes 1 es lento. Estás plantando semillas. YouTube tiene que testear tu contenido y probar tu canal. Muchos se rinden aquí porque son impacientes.
              </p>
              <p>
                Pero si tienes la constancia de apretar el botón de "Crear" todos los días durante tu tiempo libre... <span className="text-primary font-bold">El mes 2 y 3 verás el efecto bola de nieve.</span>
              </p>
              <p>
                Un video viejo que subiste hace 4 semanas de repente pega. El algoritmo lo recomienda. Arrastra a todos tus otros videos. Tus ingresos explotan de 0 a 100 muy rápido. Si pegas en un buen nicho rápido, explotas en semanas; si no, es pura consistencia matemática.
              </p>
              <p className="text-2xl font-black italic text-white mt-10">
                Paciencia + FacelessTube = Libertad Financiera.
              </p>
            </div>
          </div>
        </section>

        {/* 5. PRICING TIERS */}
        <section className="mt-40 px-6 max-w-6xl mx-auto" id="pricing">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-4 glow-text">Elige Tu Arsenal</h2>
            <p className="text-xl text-white/50">Recupera tu inversión con tu primer video viral.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="rounded-[32px] p-8 border border-white/10 bg-white/5 flex flex-col hover:border-white/30 transition-all">
              <div className="mb-8">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white">Starter</span>
                <div className="mt-4 text-5xl font-black">$9 <span className="text-xl text-white/40 font-medium">/mes</span></div>
                <p className="text-sm text-white/50 mt-4">Para probar el terreno y subir tu primer video en 5 minutos.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {['Creación Automática', 'Generador de Guiones Base', 'Voces IA Estándar', 'Exportación 720p', 'Plantillas limitadas'].map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm font-medium items-center">
                    <CheckCircle2 size={16} className="text-white/40" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleStart} className="w-full py-4 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition-colors uppercase tracking-wide">
                Iniciar Starter
              </button>
            </div>

            {/* Pro - Popular */}
            <div className="rounded-[32px] p-8 border-2 border-primary bg-primary/10 relative transform md:-translate-y-4 shadow-[0_0_50px_rgba(var(--primary),0.2)] flex flex-col">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full z-10 shadow-lg">
                Más Popular
              </div>
              <div className="mb-8 mt-2">
                <span className="px-3 py-1 bg-primary/20 rounded-full text-xs font-bold uppercase tracking-widest text-primary border border-primary/30">Pro Creator</span>
                <div className="mt-4 text-5xl font-black">$19 <span className="text-xl text-primary/50 font-medium">/mes</span></div>
                <p className="text-sm text-white/70 mt-4">La máquina perfecta para construir canales monetizables rápido.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {['Videos Ilimitados*', 'Guiones Altamente Persuasivos', 'Voces IA Premium (Humanas)', 'Exportación 1080p Full HD', 'Sin Marca de Agua', 'Generación Automática Títulos SEO'].map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm font-bold items-center">
                    <CheckCircle2 size={16} className="text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleStart} className="w-full py-4 rounded-xl font-black bg-primary text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30 neon-glow uppercase tracking-wide">
                Hacerme Pro
              </button>
            </div>

            {/* Agency */}
            <div className="rounded-[32px] p-8 border border-white/10 bg-white/5 flex flex-col hover:border-white/30 transition-all">
              <div className="mb-8">
                <span className="px-3 py-1 bg-gradient-to-r from-electric-cyan to-indigo-500 rounded-full text-xs font-bold uppercase tracking-widest text-white">Agency</span>
                <div className="mt-4 text-5xl font-black">$39 <span className="text-xl text-white/40 font-medium">/mes</span></div>
                <p className="text-sm text-white/50 mt-4">Para dueños de MÚLTIPLES canales como Sebastián.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {['Todo lo de Pro', 'Clonación de Voces Personalizada', 'Procesamiento Prioritario Rápido', 'Cuentas Multi-Canal (Hasta 5)', 'Exportación 4K', 'Soporte VIP'].map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm font-medium items-center">
                    <CheckCircle2 size={16} className="text-electric-cyan" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleStart} className="w-full py-4 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition-colors uppercase tracking-wide">
                Dominar el nicho
              </button>
            </div>
          </div>
        </section>

        {/* 6. URGENCIA Y CTA FINAL */}
        <section className="mt-40 px-6 max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-tr from-primary/30 to-electric-cyan/20 p-12 md:p-20 rounded-[40px] border border-primary/40 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-primary/20 blur-[120px] -z-10"></div>
            
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-8 leading-tight">
              ¿Tu tiempo vale más que $19 dólares?
            </h2>
            <p className="text-2xl text-white/80 font-medium mb-12">
              El tiempo pasa igual. Puedes seguir perdiendo horas en algo que odias, o invertir 5 minutos hoy para construir una máquina que pague tus facturas mientras duermes.
            </p>

            <button onClick={handleStart} className="w-full md:w-auto px-16 py-6 rounded-2xl bg-white text-background-dark font-black text-2xl uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 mx-auto group">
              <Zap className="text-primary group-hover:scale-125 transition-transform" />
              Sácame de mi trabajo
            </button>
            
            <p className="mt-8 text-white/50 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Clock size={14} /> Oferta de Early Access termina pronto
            </p>
          </div>
        </section>

      </main>

      {/* FOOTER BÁSICO */}
      <footer className="border-t border-white/5 py-12 px-6 text-center text-white/30 text-sm font-medium">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p>© 2026 FacelessTube. Los ingresos mostrados son ejemplos ilustrativos basados en casos de usuarios y no garantizan resultados financieros futuros.</p>
          <div className="flex gap-6 uppercase tracking-widest text-xs font-bold">
            <a href="https://app.facelesstube.mx/terms" className="hover:text-white transition-colors">Términos</a>
            <a href="https://app.facelesstube.mx/privacy" className="hover:text-white transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
