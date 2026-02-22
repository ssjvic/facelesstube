import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const themes = {
    night: {
        bgPrimary: '#0a0a12',
        bgSecondary: '#0f0f1a',
        bgCard: 'rgba(255,255,255,0.05)',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.6)',
        textMuted: 'rgba(255,255,255,0.4)',
        border: 'rgba(255,255,255,0.1)',
        inputBg: 'rgba(255,255,255,0.05)',
        inputBorder: 'rgba(255,255,255,0.2)',
        neonCyan: '#00f5ff',
        neonPurple: '#a855f7',
    },
    day: {
        bgPrimary: '#f8f9fa',
        bgSecondary: '#ffffff',
        bgCard: '#ffffff',
        textPrimary: '#1a1a2e',
        textSecondary: '#4a4a6a',
        textMuted: '#8a8aa0',
        border: 'rgba(0,0,0,0.1)',
        inputBg: '#ffffff',
        inputBorder: 'rgba(0,0,0,0.15)',
        neonCyan: '#0099cc',
        neonPurple: '#8b5cf6',
    }
}

export const useThemeStore = create(
    persist(
        (set, get) => ({
            themeName: 'night',
            theme: themes.night,

            setTheme: (name) => {
                if (themes[name]) {
                    set({ themeName: name, theme: themes[name] })
                    // Apply global styles
                    document.body.style.background = themes[name].bgPrimary
                    document.body.style.color = themes[name].textPrimary
                }
            },
        }),
        {
            name: 'facelesstube-theme',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // Re-apply styles on load
                    document.body.style.background = state.theme.bgPrimary
                    document.body.style.color = state.theme.textPrimary
                }
            }
        }
    )
)

export const useTheme = () => {
    const { theme, themeName, setTheme } = useThemeStore()
    return { theme, themeName, setTheme, themes }
}
