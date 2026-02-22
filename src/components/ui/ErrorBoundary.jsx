// Error Boundary Component
// Catches JavaScript errors and shows fallback UI

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-dark-900 p-6">
                    <div className="glass-card p-8 max-w-md text-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} className="text-red-400" />
                        </div>

                        <h2 className="text-xl font-display font-bold mb-2">
                            Algo salió mal
                        </h2>

                        <p className="text-white/60 mb-6">
                            Ha ocurrido un error inesperado. Por favor intenta recargar la página.
                        </p>

                        {this.state.error && (
                            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-left">
                                <p className="text-xs text-red-300 font-mono break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <RefreshCw size={16} />
                                Reintentar
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="btn-neon"
                            >
                                Ir al inicio
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
