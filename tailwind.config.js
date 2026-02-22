/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Cosmic dark backgrounds
                cosmic: {
                    950: '#030305',
                    900: '#050508',
                    800: '#0d0d12',
                    700: '#151520',
                    600: '#1e1e2e',
                    500: '#2a2a3d',
                },
                // Legacy dark theme (keep for compatibility)
                dark: {
                    900: '#0a0a0f',
                    800: '#12121a',
                    700: '#1a1a25',
                    600: '#252535',
                    500: '#35354a',
                },
                // Aurora accents - new vibrant palette
                aurora: {
                    teal: '#00d4aa',
                    cyan: '#00e5ff',
                    violet: '#7c3aed',
                    magenta: '#e879f9',
                    gold: '#fbbf24',
                    rose: '#fb7185',
                },
                // Legacy neon accents (keep for compatibility)
                neon: {
                    cyan: '#00f5ff',
                    purple: '#a855f7',
                    pink: '#ec4899',
                    blue: '#3b82f6',
                    green: '#10b981',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            boxShadow: {
                'neon-cyan': '0 0 20px rgba(0, 245, 255, 0.3)',
                'neon-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
                'neon-pink': '0 0 20px rgba(236, 72, 153, 0.3)',
                'glow': '0 0 40px rgba(0, 245, 255, 0.15)',
                // Aurora shadows
                'aurora-teal': '0 0 30px rgba(0, 212, 170, 0.4)',
                'aurora-violet': '0 0 30px rgba(124, 58, 237, 0.4)',
                'aurora-magenta': '0 0 30px rgba(232, 121, 249, 0.4)',
                'aurora-glow': '0 0 60px rgba(0, 229, 255, 0.2), 0 0 100px rgba(124, 58, 237, 0.15)',
                'aurora-intense': '0 0 40px rgba(0, 212, 170, 0.5), 0 0 80px rgba(232, 121, 249, 0.3)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 6s ease-in-out infinite',
                // Aurora animations
                'shimmer': 'shimmer 2s linear infinite',
                'aurora-shift': 'aurora-shift 8s ease-in-out infinite',
                'aurora-pulse': 'aurora-pulse 4s ease-in-out infinite',
                'particle-float': 'particle-float 20s linear infinite',
                'border-glow': 'border-glow 3s ease-in-out infinite',
                'gradient-x': 'gradient-x 3s ease infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.2)' },
                    '100%': { boxShadow: '0 0 30px rgba(0, 245, 255, 0.4)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'aurora-shift': {
                    '0%, 100%': {
                        backgroundPosition: '0% 50%',
                        filter: 'hue-rotate(0deg)',
                    },
                    '50%': {
                        backgroundPosition: '100% 50%',
                        filter: 'hue-rotate(30deg)',
                    },
                },
                'aurora-pulse': {
                    '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
                    '50%': { opacity: '1', transform: 'scale(1.05)' },
                },
                'particle-float': {
                    '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
                    '10%': { opacity: '1' },
                    '90%': { opacity: '1' },
                    '100%': { transform: 'translateY(-100vh) rotate(720deg)', opacity: '0' },
                },
                'border-glow': {
                    '0%, 100%': {
                        borderColor: 'rgba(0, 212, 170, 0.5)',
                        boxShadow: '0 0 20px rgba(0, 212, 170, 0.3)',
                    },
                    '33%': {
                        borderColor: 'rgba(124, 58, 237, 0.5)',
                        boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
                    },
                    '66%': {
                        borderColor: 'rgba(232, 121, 249, 0.5)',
                        boxShadow: '0 0 20px rgba(232, 121, 249, 0.3)',
                    },
                },
                'gradient-x': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            backgroundImage: {
                'aurora-gradient': 'linear-gradient(135deg, #00d4aa 0%, #00e5ff 25%, #7c3aed 50%, #e879f9 75%, #fb7185 100%)',
                'aurora-radial': 'radial-gradient(ellipse at center, rgba(0, 212, 170, 0.15) 0%, rgba(124, 58, 237, 0.1) 50%, transparent 70%)',
            },
        },
    },
    plugins: [],
}
