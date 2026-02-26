/**
 * Viral Video Ideas — Random idea generator by niche
 * Used by the "Dame una idea" button
 */

export const VIDEO_TEMPLATES = [
  {
    id: "general",
    name: "General",
    icon: "🎬",
    color: "#3b82f6",
    description: "Videos informativos y entretenidos",
  },
  {
    id: "horror",
    name: "Terror",
    icon: "👻",
    color: "#ef4444",
    description: "Historias de miedo y suspenso",
  },
  {
    id: "curiosidades",
    name: "Curiosidades",
    icon: "🧠",
    color: "#8b5cf6",
    description: "¿Sabías que...? Datos increíbles",
  },
  {
    id: "narracion",
    name: "Narración",
    icon: "🎙️",
    color: "#06b6d4",
    description: "Historias narradas con suspenso",
  },
  {
    id: "primera_persona",
    name: "1ra Persona",
    icon: "👤",
    color: "#f97316",
    description: 'Relatos contados como "yo viví esto"',
  },
  {
    id: "tercera_persona",
    name: "3ra Persona",
    icon: "👥",
    color: "#64748b",
    description: "Historias contadas como observador",
  },
  {
    id: "documental",
    name: "Documental",
    icon: "🎥",
    color: "#0ea5e9",
    description: "Estilo documental con datos reales",
  },
  {
    id: "motivational",
    name: "Motivacional",
    icon: "🔥",
    color: "#f59e0b",
    description: "Inspiración y superación personal",
  },
  {
    id: "conspiración",
    name: "Conspiración",
    icon: "🔺",
    color: "#dc2626",
    description: "Teorías y misterios sin resolver",
  },
];

export const VIRAL_IDEAS = {
  general: [
    "5 inventos que cambiaron el mundo y nadie conoce",
    "Lo que pasa en tu cerebro cuando no duermes",
    "Por qué los aviones no vuelan sobre el Pacífico",
    "El truco psicológico que usan todos los supermercados",
    "Cosas que haces mal todos los días sin saberlo",
    "Lo que tu cuerpo hace mientras duermes",
    "Por qué el tiempo pasa más rápido cuando creces",
    "5 trucos de productividad que usa Elon Musk",
    "La razón por la que siempre tienes hambre",
    "Qué pasaría si la Luna desapareciera",
  ],
  horror: [
    "La casa que Google Maps no quiere mostrarte",
    "El hospital abandonado donde siguen encendiendo las luces",
    "La transmisión de radio que nadie puede explicar",
    "El pueblo que desapareció en una sola noche",
    "La escalera que lleva a ningún lugar",
    "El pasajero que nadie recuerda haber visto subir",
    "La llamada que llegó desde un teléfono sin batería",
    "El video de seguridad que la policía no quiso publicar",
    "La puerta que apareció en medio del bosque",
    "El último mensaje que envió antes de desaparecer",
  ],
  curiosidades: [
    "Tu teléfono tiene más bacterias que un inodoro",
    "El color que NO existe pero puedes ver",
    "Por qué los flamencos son rosados",
    "El país donde es ilegal morir",
    "El animal que es técnicamente inmortal",
    "Por qué el agua del océano es salada",
    "La fruta que tarda 7 años en madurar",
    "El lugar más silencioso del mundo que te vuelve loco",
    "Por qué los gatos siempre caen de pie",
    "El número que está prohibido en Japón",
  ],
  narracion: [
    "El taxista que me llevó al lugar equivocado a propósito",
    "Lo que encontraron dentro de las paredes al remodelar",
    "La noche que el pueblo entero se quedó sin luz",
    "El viajero que llegó a un hotel que no existe en ningún mapa",
    "La carta que apareció debajo de la puerta 20 años después",
    "El sonido que se escucha cada noche a las 3:33",
    "La mujer del vestido blanco en la carretera",
    "Lo que el pescador sacó del lago aquella mañana",
    "La habitación 313 que ningún huésped quiere usar",
    "El tren que llegó con un pasajero de más",
  ],
  primera_persona: [
    "Desperté y mi reflejo no me estaba mirando",
    "Encontré un diario escondido en mi nueva casa",
    "Mi vecino desapareció y nadie recuerda que existió",
    "Vi algo en el bosque que no puedo explicar",
    "Recibí un mensaje de mi propio número de teléfono",
    "Trabajo de noche en un hospital y escuché algo",
    "Me perdí en una ciudad que no aparece en Google",
    "Alguien me dejó una nota que decía: no abras la puerta",
    "Descubrí que mi mejor amigo tenía un secreto oscuro",
    "La cámara de seguridad de mi casa grabó algo imposible",
  ],
  tercera_persona: [
    "María nunca debió abrir esa puerta",
    "El detective encontró algo que no esperaba en la escena",
    "Nadie sabe qué le pasó a los 5 estudiantes esa noche",
    "El piloto vio algo en el radar que no debería existir",
    "La científica descubrió que el experimento había funcionado demasiado bien",
    "El niño le dijo a su madre algo que la dejó helada",
    "Los vecinos notaron que algo cambió en la casa del frente",
    "El buzo encontró algo en el fondo del lago",
    "La maestra se dio cuenta de que uno de sus alumnos no era real",
    "El vigilante nocturno escuchó pasos en el piso de arriba",
  ],
  documental: [
    "La verdadera historia detrás del Área 51",
    "Cómo funciona la deep web y qué hay realmente ahí",
    "El experimento social más perturbador de la historia",
    "La isla prohibida donde nadie puede entrar",
    "El caso criminal que la policía nunca pudo resolver",
    "La ciudad subterránea que descubrieron por accidente",
    "El animal más peligroso del mundo y no es el que crees",
    "La historia del hombre que vivió solo en una isla 29 años",
    "Los secretos que guardan los océanos más profundos",
    "El misterio de las señales de radio del espacio",
  ],
  motivational: [
    "Fue rechazado 300 veces, hoy vale billones",
    "El hábito de 5 minutos que cambió mi vida",
    "Por qué el 99% de la gente nunca será rica",
    "La única diferencia entre exitosos y fracasados",
    "Cómo un homeless se convirtió en millonario en 2 años",
    "El secreto que los ricos nunca te dirán",
    "3 reglas que nunca rompen las personas exitosas",
    "Lo que aprendí perdiendo todo a los 25",
    "Por qué deberías fallar más seguido",
    "El discurso de 2 minutos que cambió millones de vidas",
  ],
  conspiración: [
    "La teoría del universo simulado explicada en 60 segundos",
    "Por qué algunos creen que la Luna es artificial",
    "El proyecto secreto del gobierno que sí fue real",
    "La señal WOW que recibimos del espacio en 1977",
    "¿Por qué nunca volvimos a la Luna?",
    "El experimento Filadelfia — ¿qué pasó realmente?",
    "Los archivos desclasificados más perturbadores del FBI",
    "La teoría de que vivimos en un multiverso",
    "¿Qué oculta realmente el Vaticano en sus archivos?",
    "El misterio de los números que nadie puede descifrar",
  ],
};

/**
 * Get a random idea for a specific template
 */
export function getRandomIdea(template = "general") {
  const ideas = VIRAL_IDEAS[template] || VIRAL_IDEAS.general;
  return ideas[Math.floor(Math.random() * ideas.length)];
}

/**
 * Get a random idea from any category
 */
export function getRandomIdeaAny() {
  const allTemplates = Object.keys(VIRAL_IDEAS);
  const randomTemplate =
    allTemplates[Math.floor(Math.random() * allTemplates.length)];
  const ideas = VIRAL_IDEAS[randomTemplate];
  return {
    idea: ideas[Math.floor(Math.random() * ideas.length)],
    template: randomTemplate,
  };
}
