// Toast Notification System
import { create } from 'zustand'

// Toast store
export const useToastStore = create((set, get) => ({
    toasts: [],

    // Add a toast
    addToast: (toast) => {
        const id = Date.now().toString()
        const newToast = {
            id,
            type: toast.type || 'info', // 'success' | 'error' | 'warning' | 'info'
            message: toast.message,
            duration: toast.duration || 4000,
            action: toast.action // { label: string, onClick: () => void }
        }

        set(state => ({ toasts: [...state.toasts, newToast] }))

        // Auto remove after duration
        if (newToast.duration > 0) {
            setTimeout(() => {
                get().removeToast(id)
            }, newToast.duration)
        }

        return id
    },

    // Remove a toast
    removeToast: (id) => {
        set(state => ({
            toasts: state.toasts.filter(t => t.id !== id)
        }))
    },

    // Clear all toasts
    clearAll: () => {
        set({ toasts: [] })
    }
}))

// Helper functions
export const toast = {
    success: (message, options = {}) =>
        useToastStore.getState().addToast({ type: 'success', message, ...options }),

    error: (message, options = {}) =>
        useToastStore.getState().addToast({ type: 'error', message, ...options }),

    warning: (message, options = {}) =>
        useToastStore.getState().addToast({ type: 'warning', message, ...options }),

    info: (message, options = {}) =>
        useToastStore.getState().addToast({ type: 'info', message, ...options })
}
