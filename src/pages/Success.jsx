import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Success() {
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();
  const [status, setStatus] = useState("loading"); // loading | success

  useEffect(() => {
    // Re-fetch the user so the updated tier is reflected in the UI
    const refresh = async () => {
      await checkAuth();
      setStatus("success");
      // Redirect to app after 3 seconds
      setTimeout(() => navigate("/app/premium"), 3000);
    };
    refresh();
  }, [checkAuth, navigate]);

  return (
    <div className="min-h-screen bg-cosmic-950 flex items-center justify-center">
      <div className="glass-card p-10 text-center max-w-sm mx-4">
        {status === "loading" ? (
          <>
            <Loader2
              size={48}
              className="text-neon-cyan animate-spin mx-auto mb-4"
            />
            <h1 className="text-xl font-bold text-white mb-2">
              Procesando tu suscripción...
            </h1>
            <p className="text-white/60 text-sm">Espera un momento.</p>
          </>
        ) : (
          <>
            <CheckCircle size={56} className="text-neon-green mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-white mb-2">
              ¡Bienvenido al plan premium! 🎉
            </h1>
            <p className="text-white/60 text-sm">
              Tu suscripción está activa. Redirigiendo...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
