import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useState, useEffect } from "react";

export default function Auth() {
  const { user, loginWithGoogle, error, loading } = useAuthStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect if user is already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate("/app", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        // Navigation happens via useEffect
      }
    } catch (e) {
      console.error("Google login error:", e);
    }
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="glass-card p-8 md:p-10 max-w-md w-full">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 text-sm"
        >
          <ArrowLeft size={16} />
          <span>Volver</span>
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center mx-auto mb-4 shadow-lg shadow-neon-purple/30">
            <span className="text-2xl">🎬</span>
          </div>
          <h1 className="text-2xl font-display font-bold">FacelessTube</h1>
          <p className="text-white/50 text-sm mt-1">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-gray-800 font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoggingIn ? (
            <Loader2 size={20} className="animate-spin text-gray-600" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {isLoggingIn ? "Conectando..." : "Continuar con Google"}
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-white/30 text-xs">SEGURO Y RÁPIDO</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Info */}
        <div className="text-center space-y-3">
          <p className="text-white/40 text-xs">
            Al continuar, aceptas nuestros términos de servicio y política de
            privacidad.
          </p>
          <div className="flex items-center justify-center gap-4 text-white/30 text-xs">
            <div className="flex items-center gap-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Cifrado SSL
            </div>
            <div className="flex items-center gap-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Datos protegidos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
