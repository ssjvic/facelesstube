/**
 * Viral Video Ideas — Random idea generator by niche
 * Used by the "Dame una idea" button
 */

export const VIDEO_TEMPLATES = [
    {
        id: 'general',
        name: 'General',
        icon: '🎬',
        color: '#3b82f6',
        description: 'Videos informativos y entretenidos'
    },
    {
        id: 'horror',
        name: 'Terror',
        icon: '👻',
        color: '#ef4444',
        description: 'Historias de miedo y misterio'
    },
    {
        id: 'motivational',
        name: 'Motivacional',
        icon: '🔥',
        color: '#f59e0b',
        description: 'Inspiración y superación personal'
    },
    {
        id: 'curiosidades',
        name: 'Curiosidades',
        icon: '🧠',
        color: '#8b5cf6',
        description: '¿Sabías que...? Datos increíbles'
    },
    {
        id: 'gaming',
        name: 'Gaming',
        icon: '🎮',
        color: '#22c55e',
        description: 'Videojuegos y eSports'
    },
    {
        id: 'humor',
        name: 'Humor',
        icon: '😂',
        color: '#ec4899',
        description: 'Comedia y entretenimiento'
    },
    {
        id: 'storytelling',
        name: 'Historias',
        icon: '📖',
        color: '#06b6d4',
        description: 'Narrativas que enganchan'
    }
]

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
        "Qué pasaría si la Luna desapareciera"
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
        "El último mensaje que envió antes de desaparecer"
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
        "El discurso de 2 minutos que cambió millones de vidas"
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
        "El número que está prohibido en Japón"
    ],
    gaming: [
        "El glitch que destruyó la economía de un juego",
        "El jugador que ganó $3 millones en 10 minutos",
        "Easter eggs que nadie ha encontrado todavía",
        "El speedrun más imposible de la historia",
        "Por qué este juego fue baneado en 5 países",
        "La IA que venció a todos los pros en un torneo",
        "El mod que hizo el juego 1000 veces mejor",
        "Teorías de videojuegos que resultaron ser verdad",
        "El nivel secreto que tardaron 20 años en descubrir",
        "La partida más larga de la historia del gaming"
    ],
    humor: [
        "Cosas que solo pasan en Latinoamérica",
        "Si los animales pudieran hablar",
        "Tu mamá vs la mamá de tu amigo",
        "Expectativa vs realidad del home office",
        "Tipos de personas en el gimnasio",
        "Lo que piensas vs lo que dices en una entrevista",
        "Cada signo del zodiaco en el supermercado",
        "Si las apps de citas fueran honestas",
        "Tipos de compañeros de trabajo tóxicos",
        "Lo que realmente haces cuando 'trabajas desde casa'"
    ],
    storytelling: [
        "El hombre que vivió en un aeropuerto por 18 años",
        "La carta que llegó 50 años después",
        "El gemelo que descubrió la verdad sobre su hermano",
        "La noche que cambió todo en ese pequeño pueblo",
        "El profesor que hizo llorar a toda la clase",
        "La última llamada antes del accidente",
        "El soldado que encontró a su familia 30 años después",
        "La confesión del detective más famoso del mundo",
        "El día que todo el internet se cayó",
        "La promesa que hicieron de niños y cumplieron 40 años después"
    ]
}

/**
 * Get a random idea for a specific template
 */
export function getRandomIdea(template = 'general') {
    const ideas = VIRAL_IDEAS[template] || VIRAL_IDEAS.general
    return ideas[Math.floor(Math.random() * ideas.length)]
}

/**
 * Get a random idea from any category
 */
export function getRandomIdeaAny() {
    const allTemplates = Object.keys(VIRAL_IDEAS)
    const randomTemplate = allTemplates[Math.floor(Math.random() * allTemplates.length)]
    const ideas = VIRAL_IDEAS[randomTemplate]
    return {
        idea: ideas[Math.floor(Math.random() * ideas.length)],
        template: randomTemplate
    }
}
