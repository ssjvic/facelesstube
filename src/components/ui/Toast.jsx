// Toast Container Component
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
}

const colors = {
    success: 'bg-neon-green/20 border-neon-green/50 text-neon-green',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    info: 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
}

export default function ToastContainer() {
    const { toasts, removeToast } = useToastStore()

    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => {
                const Icon = icons[toast.type]

                return (
                    <div
                        key={toast.id}
                        className={`
                            flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm
                            animate-slide-up ${colors[toast.type]}
                        `}
                    >
                        <Icon size={20} className="flex-shrink-0 mt-0.5" />

                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{toast.message}</p>

                            {toast.action && (
                                <button
                                    onClick={toast.action.onClick}
                                    className="mt-2 text-xs font-medium hover:underline"
                                >
                                    {toast.action.label}
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
