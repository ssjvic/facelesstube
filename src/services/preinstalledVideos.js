// Videos preinstalados para la app
// Videos de stock gratuitos de Pexels (CDN directo, CORS habilitado)

export const PREINSTALLED_VIDEOS = [
    {
        id: 'pre_gaming_1',
        name: 'Gaming Neon',
        category: 'gaming',
        thumbnail: 'https://images.pexels.com/videos/3129671/free-video-3129671.jpg?auto=compress&cs=tinysrgb&w=300',
        url: 'https://videos.pexels.com/video-files/3129671/3129671-sd_506_960_25fps.mp4'
    },
    {
        id: 'pre_gaming_2',
        name: 'Gameplay Abstract',
        category: 'gaming',
        thumbnail: 'https://images.pexels.com/videos/5377684/pexels-photo-5377684.jpeg?auto=compress&cs=tinysrgb&w=300',
        url: 'https://videos.pexels.com/video-files/5377684/5377684-sd_506_960_25fps.mp4'
    },
    {
        id: 'pre_motivation_1',
        name: 'Motivacional Sunrise',
        category: 'motivation',
        thumbnail: 'https://images.pexels.com/videos/1093662/free-video-1093662.jpg?auto=compress&cs=tinysrgb&w=300',
        url: 'https://videos.pexels.com/video-files/1093662/1093662-sd_506_960_25fps.mp4'
    },
    {
        id: 'pre_motivation_2',
        name: 'City Lights',
        category: 'motivation',
        thumbnail: 'https://images.pexels.com/videos/3571264/free-video-3571264.jpg?auto=compress&cs=tinysrgb&w=300',
        url: 'https://videos.pexels.com/video-files/3571264/3571264-sd_506_960_25fps.mp4'
    },
    {
        id: 'pre_nature_1',
        name: 'Ocean Waves',
        category: 'nature',
        thumbnail: 'https://images.pexels.com/videos/1093662/free-video-1093662.jpg?auto=compress&cs=tinysrgb&w=300',
        url: 'https://videos.pexels.com/video-files/857251/857251-sd_506_960_25fps.mp4'
    },
    {
        id: 'pre_nature_2',
        name: 'Forest Rain',
        category: 'nature',
        thumbnail: 'https://images.pexels.com/videos/856973/free-video-856973.jpg?auto=compress&cs=tinysrgb&w=300',
        url: 'https://videos.pexels.com/video-files/856973/856973-sd_506_960_25fps.mp4'
    },
    {
        id: 'pre_tech_1',
        name: 'Tech Particles',
        category: 'tech',
        thumbnail: 'https://images.pexels.com/videos/3129957/free-video-3129957.jpg?auto=compress&cs=tinysrgb&w=300',
        url: 'https://videos.pexels.com/video-files/3129957/3129957-sd_506_960_25fps.mp4'
    },
    {
        id: 'pre_tech_2',
        name: 'Digital Network',
        category: 'tech',
        thumbnail: 'https://images.pexels.com/videos/3141207/free-video-3141207.jpg?auto=compress&cs=tinysrgb&w=300',
        url: 'https://videos.pexels.com/video-files/3141207/3141207-sd_506_960_25fps.mp4'
    },
    {
        id: 'pre_satisfying_1',
        name: 'Satisfying Liquid',
        category: 'satisfying',
        thumbnail: 'https://images.pexels.com/videos/4793748/pexels-photo-4793748.jpeg?auto=compress&cs=tinysrgb&w=300',
        url: 'https://videos.pexels.com/video-files/4793748/4793748-sd_506_960_25fps.mp4'
    },
    {
        id: 'pre_money_1',
        name: 'Money Rain',
        category: 'money',
        thumbnail: 'https://images.pexels.com/videos/3943962/free-video-3943962.jpg?auto=compress&cs=tinysrgb&w=300',
        url: 'https://videos.pexels.com/video-files/3943962/3943962-sd_506_960_25fps.mp4'
    },
    {
        id: 'pre_scary_1',
        name: 'Dark Fog',
        category: 'scary',
        thumbnail: 'https://images.pexels.com/videos/4488286/pexels-photo-4488286.jpeg?auto=compress&cs=tinysrgb&w=300',
        url: 'https://videos.pexels.com/video-files/4488286/4488286-sd_506_960_25fps.mp4'
    },
    {
        id: 'pre_cooking_1',
        name: 'Kitchen Steam',
        category: 'cooking',
        thumbnail: 'https://images.pexels.com/videos/4253729/pexels-photo-4253729.jpeg?auto=compress&cs=tinysrgb&w=300',
        url: 'https://videos.pexels.com/video-files/4253729/4253729-sd_506_960_25fps.mp4'
    }
]

// Categorías de videos preinstalados
export const PREINSTALLED_CATEGORIES = [
    { id: 'all', label: 'Todos', icon: '🎬' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'motivation', label: 'Motivación', icon: '💪' },
    { id: 'nature', label: 'Naturaleza', icon: '🌿' },
    { id: 'tech', label: 'Tech', icon: '💻' },
    { id: 'satisfying', label: 'Satisfying', icon: '✨' },
    { id: 'money', label: 'Dinero', icon: '💰' },
    { id: 'scary', label: 'Terror', icon: '👻' },
    { id: 'cooking', label: 'Cocina', icon: '🍳' }
]

// Obtener videos por categoría
export function getPreinstalledByCategory(category = 'all') {
    if (category === 'all') {
        return PREINSTALLED_VIDEOS
    }
    return PREINSTALLED_VIDEOS.filter(v => v.category === category)
}

// Obtener un video preinstalado por ID
export function getPreinstalledById(id) {
    return PREINSTALLED_VIDEOS.find(v => v.id === id)
}

export default {
    PREINSTALLED_VIDEOS,
    PREINSTALLED_CATEGORIES,
    getPreinstalledByCategory,
    getPreinstalledById
}
