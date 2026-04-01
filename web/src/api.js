/**
 * FacelessTube API Service
 * Servicios para comunicarse con el backend
 */

// URL del backend - cambiar en producción
const API_URL = import.meta.env.VITE_API_URL || 'https://facelesstube-backend.onrender.com';

/**
 * Generar guión completo con metadata
 * @param {Object} params - Parámetros de generación
 * @param {string} params.tema - Tema del video
 * @param {number} params.duracion - Duración en segundos (default: 60)
 * @param {string} params.idioma - "es" o "en" (default: "es")
 * @param {string} params.estilo - informativo, humor, misterio, motivacional
 * @returns {Promise<Object>} - { guion, descripcion, titulo, hashtags, duracion_estimada }
 */
export async function generateScript({ tema, duracion = 60, idioma = 'es', estilo = 'informativo' }) {
    try {
        const response = await fetch(`${API_URL}/api/generate-script`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tema, duracion, idioma, estilo }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error generando guión');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en generateScript:', error);
        throw error;
    }
}

/**
 * Generar solo el guión (más rápido)
 */
export async function generateScriptOnly({ tema, duracion = 60, idioma = 'es', estilo = 'informativo' }) {
    try {
        const response = await fetch(`${API_URL}/api/generate-script-only`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tema, duracion, idioma, estilo }),
        });

        if (!response.ok) {
            throw new Error('Error generando guión');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en generateScriptOnly:', error);
        throw error;
    }
}

/**
 * Verificar estado del servidor
 */
export async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        return await response.json();
    } catch (error) {
        return { status: 'error', ollama_status: 'disconnected', model: 'unknown' };
    }
}

/**
 * Convertir texto a audio usando Web Speech API (fallback)
 * En producción usaremos el TTS nativo de Android
 */
export function textToSpeechWeb(text, lang = 'es-MX') {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error('TTS no soportado en este navegador'));
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(e);

        speechSynthesis.speak(utterance);
    });
}

/**
 * Generar thumbnail usando Canvas
 */
export function generateThumbnail(title, backgroundUrl = null) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');

        // Fondo degradado si no hay imagen
        const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1280, 720);

        // Círculos decorativos
        ctx.beginPath();
        ctx.arc(100, 100, 200, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(1180, 620, 300, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
        ctx.fill();

        // Overlay oscuro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, 1280, 720);

        // Texto principal
        ctx.font = 'bold 64px "Segoe UI", sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Word wrap del título
        const words = title.split(' ');
        let lines = [];
        let currentLine = '';
        const maxWidth = 1100;

        words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine.trim());

        // Dibujar líneas de texto
        const lineHeight = 80;
        const startY = 360 - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
            // Sombra
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;

            ctx.fillText(line.toUpperCase(), 640, startY + i * lineHeight);
        });

        // Reset shadow
        ctx.shadowColor = 'transparent';

        // Badge "FacelessTube"
        ctx.font = 'bold 24px "Segoe UI", sans-serif';
        ctx.fillStyle = '#00d4ff';
        ctx.textAlign = 'left';
        ctx.fillText('FACELESSTUBE', 40, 680);

        // Exportar
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
    });
}

/**
 * Obtener lista de packs de gameplay disponibles
 */
export async function getPacksList() {
    try {
        const response = await fetch(`${API_URL}/api/packs`);
        if (!response.ok) {
            throw new Error('Error obteniendo packs');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en getPacksList:', error);
        // Fallback con datos locales si el servidor no responde
        return {
            packs: [
                { id: 'minecraft', name: 'Minecraft Parkour', clips: 10, size_mb: 45 },
                { id: 'satisfying', name: 'Satisfying', clips: 15, size_mb: 62 },
                { id: 'subway', name: 'Subway Surfers', clips: 8, size_mb: 38 },
                { id: 'gta', name: 'GTA Driving', clips: 12, size_mb: 55 },
            ]
        };
    }
}

/**
 * Obtener detalles de un pack específico
 */
export async function getPackDetails(packId) {
    try {
        const response = await fetch(`${API_URL}/api/packs/${packId}`);
        if (!response.ok) {
            throw new Error('Pack no encontrado');
        }
        return await response.json();
    } catch (error) {
        console.error('Error en getPackDetails:', error);
        throw error;
    }
}

/**
 * Descargar un pack con seguimiento de progreso
 * @param {string} packId - ID del pack a descargar
 * @param {function} onProgress - Callback con progreso (0-100)
 * @returns {Promise<Blob>} - Archivo descargado
 */
export async function downloadPack(packId, onProgress = () => { }) {
    try {
        // Obtener URL de descarga
        const packDetails = await getPackDetails(packId);
        const downloadUrl = packDetails.download_url;

        // Iniciar descarga con progreso
        const response = await fetch(downloadUrl);

        if (!response.ok) {
            throw new Error('Error descargando pack');
        }

        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10) || packDetails.size_mb * 1024 * 1024;
        let loaded = 0;

        const reader = response.body.getReader();
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            chunks.push(value);
            loaded += value.length;

            const progress = Math.round((loaded / total) * 100);
            onProgress(progress);
        }

        const blob = new Blob(chunks);

        // Guardar en IndexedDB para uso offline
        await savePackToStorage(packId, blob);

        return blob;
    } catch (error) {
        console.error('Error en downloadPack:', error);
        throw error;
    }
}

/**
 * Guardar pack en IndexedDB
 */
async function savePackToStorage(packId, blob) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FacelessTubePacks', 1);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('packs')) {
                db.createObjectStore('packs', { keyPath: 'id' });
            }
        };

        request.onsuccess = (e) => {
            const db = e.target.result;
            const tx = db.transaction('packs', 'readwrite');
            const store = tx.objectStore('packs');
            store.put({ id: packId, data: blob, downloadedAt: new Date().toISOString() });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        };

        request.onerror = () => reject(request.error);
    });
}

/**
 * Verificar si un pack está descargado
 */
export async function isPackDownloaded(packId) {
    return new Promise((resolve) => {
        const request = indexedDB.open('FacelessTubePacks', 1);

        request.onsuccess = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('packs')) {
                resolve(false);
                return;
            }
            const tx = db.transaction('packs', 'readonly');
            const store = tx.objectStore('packs');
            const getRequest = store.get(packId);
            getRequest.onsuccess = () => resolve(!!getRequest.result);
            getRequest.onerror = () => resolve(false);
        };

        request.onerror = () => resolve(false);
    });
}

/**
 * Obtener pack descargado de storage
 */
export async function getDownloadedPack(packId) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FacelessTubePacks', 1);

        request.onsuccess = (e) => {
            const db = e.target.result;
            const tx = db.transaction('packs', 'readonly');
            const store = tx.objectStore('packs');
            const getRequest = store.get(packId);
            getRequest.onsuccess = () => resolve(getRequest.result);
            getRequest.onerror = () => reject(getRequest.error);
        };

        request.onerror = () => reject(request.error);
    });
}

/**
 * Obtener voces TTS disponibles
 */
export async function getVoices(language = 'es') {
    try {
        const response = await fetch(`${API_URL}/api/voices?language=${language}`);
        return await response.json();
    } catch (error) {
        console.error('Error en getVoices:', error);
        return { voices: [] };
    }
}

/**
 * Generar audio con TTS
 */
export async function generateAudio(text, voiceId = 'es-MX-DaliaNeural') {
    try {
        const response = await fetch(`${API_URL}/api/generate-audio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice_id: voiceId }),
        });

        if (!response.ok) {
            throw new Error('Error generando audio');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en generateAudio:', error);
        throw error;
    }
}

/**
 * Renderizar video completo
 */
export async function renderVideo(script, packId = 'minecraft', voiceId = 'es-MX-DaliaNeural') {
    try {
        const response = await fetch(`${API_URL}/api/render-video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ script, pack_id: packId, voice_id: voiceId }),
        });

        if (!response.ok) {
            throw new Error('Error renderizando video');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en renderVideo:', error);
        throw error;
    }
}

/**
 * Obtener URL de descarga de archivo generado
 */
export function getDownloadUrl(filename) {
    return `${API_URL}/api/download/${filename}`;
}

export default {
    generateScript,
    generateScriptOnly,
    checkHealth,
    textToSpeechWeb,
    generateThumbnail,
    getPacksList,
    getPackDetails,
    downloadPack,
    isPackDownloaded,
    getDownloadedPack,
    getVoices,
    generateAudio,
    renderVideo,
    getDownloadUrl,
};
