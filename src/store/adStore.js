// Ad Store - Gestión de anuncios publicitarios
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Configuración de anuncios
export const AD_CONFIG = {
    // Cada cuántas acciones mostrar anuncio
    actionsBeforeAd: 1, // Mostrar antes de cada video generado

    // Duración mínima que debe ver el anuncio (segundos)
    minWatchTime: 5,

    // Duración máxima del anuncio (segundos)
    maxAdDuration: 30,

    // Probabilidad de mostrar anuncio (0-1)
    adProbability: 1.0, // 100% para usuarios free

    // Tipos de triggers
    triggers: {
        GENERATE_VIDEO: 'generate_video',
        VIEW_VIDEO: 'view_video',
        DOWNLOAD_VIDEO: 'download_video'
    }
}

// Videos de anuncios (puedes reemplazar con tus propios anuncios)
// Estos son ejemplos - deberías reemplazarlos con tus videos publicitarios reales
export const AD_VIDEOS = [
    {
        id: 'ad_1',
        title: 'FacelessTube Pro',
        description: 'Desbloquea todas las funciones premium',
        videoUrl: null, // Se mostrará como imagen/promoción interna
        thumbnailUrl: null,
        type: 'internal', // 'internal' | 'external' | 'youtube'
        ctaText: 'Obtener Pro',
        ctaUrl: '/app/premium',
        duration: 5
    },
    {
        id: 'ad_2',
        title: 'Sin límites de videos',
        description: 'Genera videos ilimitados con el plan Premium',
        videoUrl: null,
        thumbnailUrl: null,
        type: 'internal',
        ctaText: 'Ver planes',
        ctaUrl: '/app/premium',
        duration: 5
    },
    {
        id: 'ad_3',
        title: 'Conecta tu YouTube',
        description: 'Sube videos directamente a tu canal',
        videoUrl: null,
        thumbnailUrl: null,
        type: 'internal',
        ctaText: 'Conectar',
        ctaUrl: '/app/settings',
        duration: 5
    }
]

// Store de anuncios
export const useAdStore = create(
    persist(
        (set, get) => ({
            // Contador de acciones desde último anuncio
            actionsSinceLastAd: 0,

            // Total de anuncios vistos
            totalAdsWatched: 0,

            // Último anuncio mostrado
            lastAdId: null,

            // ¿Está mostrando un anuncio?
            isShowingAd: false,

            // Anuncio actual
            currentAd: null,

            // Callback después del anuncio
            onAdComplete: null,

            // Tiempo restante del anuncio
            remainingTime: 0,

            // Incrementar contador de acciones
            incrementActions: () => {
                set(state => ({
                    actionsSinceLastAd: state.actionsSinceLastAd + 1
                }))
            },

            // Verificar si debe mostrar anuncio
            shouldShowAd: (trigger, userTier = 'free') => {
                // Usuarios premium no ven anuncios
                if (userTier !== 'free') return false

                const { actionsSinceLastAd } = get()

                // Verificar probabilidad
                if (Math.random() > AD_CONFIG.adProbability) return false

                // Verificar si alcanzó el número de acciones
                return actionsSinceLastAd >= AD_CONFIG.actionsBeforeAd - 1
            },

            // Obtener un anuncio aleatorio
            getRandomAd: () => {
                const { lastAdId } = get()
                // Evitar repetir el último anuncio
                const availableAds = AD_VIDEOS.filter(ad => ad.id !== lastAdId)
                const randomIndex = Math.floor(Math.random() * availableAds.length)
                return availableAds[randomIndex] || AD_VIDEOS[0]
            },

            // Mostrar anuncio
            showAd: (onComplete) => {
                const ad = get().getRandomAd()
                set({
                    isShowingAd: true,
                    currentAd: ad,
                    onAdComplete: onComplete,
                    remainingTime: ad.duration || AD_CONFIG.minWatchTime
                })
            },

            // Actualizar tiempo restante
            updateRemainingTime: (time) => {
                set({ remainingTime: time })
            },

            // Completar anuncio
            completeAd: () => {
                const { onAdComplete, currentAd } = get()

                set(state => ({
                    isShowingAd: false,
                    currentAd: null,
                    actionsSinceLastAd: 0,
                    totalAdsWatched: state.totalAdsWatched + 1,
                    lastAdId: currentAd?.id,
                    remainingTime: 0
                }))

                // Ejecutar callback
                if (onAdComplete) {
                    onAdComplete()
                }
            },

            // Cancelar anuncio (solo si permitido)
            cancelAd: () => {
                set({
                    isShowingAd: false,
                    currentAd: null,
                    onAdComplete: null,
                    remainingTime: 0
                })
            },

            // Reset para usuarios premium
            resetForPremium: () => {
                set({
                    actionsSinceLastAd: 0,
                    isShowingAd: false,
                    currentAd: null
                })
            }
        }),
        {
            name: 'facelesstube-ads',
            partialize: (state) => ({
                totalAdsWatched: state.totalAdsWatched,
                lastAdId: state.lastAdId
            })
        }
    )
)

export default useAdStore
