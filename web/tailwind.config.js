/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#a14af7",
                "background-light": "#f7f5f8",
                "background-dark": "#191022",
                "deep-space": "#050505",
                "neon-purple": "#A855F7",
                "electric-cyan": "#06B6D4",
            },
            fontFamily: {
                "display": ["Space Grotesk", "Inter", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "1rem",
                "lg": "2rem",
                "xl": "3rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
}
