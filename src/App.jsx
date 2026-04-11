import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import Layout from "./components/layout/Layout";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Account from "./pages/Account";
import Premium from "./pages/Premium";
import VideoLibrary from "./pages/VideoLibrary";
import Auth from "./pages/Auth";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Tutorials from "./pages/Tutorials";
import Success from "./pages/Success";
import ThankYou from "./pages/ThankYou";
import ToastContainer from "./components/ui/Toast";
import SplashScreen from "./components/ui/SplashScreen";
import AdModal from "./components/ui/AdModal";
import { useAuthStore } from "./store/authStore";
import { toast } from "./store/toastStore";
import { supabase, isSupabaseConfigured } from "./config/supabase";

function App() {
  const { user, loading, checkAuth } = useAuthStore();
  const isNative = Capacitor.isNativePlatform();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on first app load (not on refresh in browser during dev)
    const hasShownSplash = sessionStorage.getItem("splashShown");
    return !hasShownSplash;
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem("splashShown", "true");
    setShowSplash(false);
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Check promo code expiration on every app load
  useEffect(() => {
    if (loading || !user) return;
    const expiresAt = localStorage.getItem("facelesstube_promo_expires");
    if (expiresAt && user.tier !== "free") {
      if (new Date() > new Date(expiresAt)) {
        console.log("⏰ Promo expired on app load, reverting to free");
        useAuthStore.getState().updateUser({ tier: "free" });
        localStorage.removeItem("facelesstube_promo_expires");
        localStorage.removeItem("facelesstube_promo_code");
        toast.info(
          "Tu periodo de prueba ha terminado. Mejora tu plan para seguir disfrutando.",
        );
      }
    }
  }, [loading, user]);

  // SAFETY NET: If loading is stuck for more than 8 seconds, force it off.
  // This prevents infinite spinner/black screen if any auth path fails silently.
  useEffect(() => {
    if (!loading) return;
    const safetyTimer = setTimeout(() => {
      console.warn("⚠️ Loading safety timeout triggered (8s)");
      useAuthStore.setState({ loading: false });
    }, 8000);
    return () => clearTimeout(safetyTimer);
  }, [loading]);

  // Handle OAuth callback tokens from URL hash (works for both web and Capacitor)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const handleOAuthCallback = async () => {
      // Check if the current URL hash contains OAuth tokens
      // Supabase appends tokens as: #access_token=...&refresh_token=...&type=...
      const hash = window.location.hash;
      if (
        hash &&
        hash.includes("access_token") &&
        hash.includes("refresh_token")
      ) {
        console.log("🔗 OAuth tokens detected in URL hash");
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          console.log("✅ Setting session from OAuth tokens...");
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("❌ Error setting session:", error);
          } else {
            console.log("✅ Session set successfully from OAuth");
            // Clean up the URL hash to avoid re-processing
            window.location.hash = "";
            await checkAuth();
          }
        }
      }
    };

    // Check on mount (for deep link opens)
    handleOAuthCallback();

    // Also check when app resumes from background (Capacitor)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleOAuthCallback();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkAuth]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("¡Conexión restaurada!");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Sin conexión a internet", { duration: 0 });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // SplashScreen - re-enabled
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show loading while auth state is being determined
  // CRITICAL: Without this, navigating to /app while checkAuth() is running
  // sees user=null and redirects back to /auth causing a black screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmic-950">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/logo.png"
            alt="FacelessTube"
            className="h-16 w-auto opacity-50 animate-pulse"
          />
          <div className="w-8 h-8 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-950 bg-grid">
      <div className="bg-glow-top" />

      {/* Offline banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-yellow-500 text-dark-900 text-center py-2 text-sm font-medium">
          ⚠️ Sin conexión - Algunas funciones pueden no estar disponibles
        </div>
      )}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={isNative ? <Navigate to="/app" replace /> : <ComingSoon />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/success" element={<Success />} />
        <Route path="/thank-you" element={<ThankYou />} />

        {/* Protected routes */}
        <Route
          path="/app"
          element={user ? <Layout /> : <Navigate to="/auth" />}
        >
          <Route index element={<Dashboard />} />
          <Route path="history" element={<History />} />
          <Route path="account" element={<Account />} />
          <Route path="premium" element={<Premium />} />
          <Route path="library" element={<VideoLibrary />} />
          <Route path="tutorials" element={<Tutorials />} />
          <Route path="thank-you" element={<ThankYou />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to={isNative ? "/app" : "/"} />} />
      </Routes>

      {/* Toast notifications */}
      <ToastContainer />

      {/* Ad Modal - muestra anuncios para usuarios gratuitos */}
      <AdModal />
    </div>
  );
}

export default App;
