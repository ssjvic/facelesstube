import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: './', // CRITICAL: Use relative paths for Capacitor
    server: {
        port: 5173,
        open: true
    },
    build: {
        // Optimize for smaller bundle
        target: 'es2020',
        rollupOptions: {
            external: ['@huggingface/transformers'],
            output: {
                paths: {
                    '@huggingface/transformers': 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0/dist/transformers.js'
                },
                // Code splitting for better caching
                manualChunks: {
                    'vendor': ['react', 'react-dom', 'react-router-dom'],
                    'store': ['zustand']
                }
            }
        },
        // Reduce chunk size warnings
        chunkSizeWarningLimit: 500,
        // Enable source map only in dev
        sourcemap: false
    }
})
