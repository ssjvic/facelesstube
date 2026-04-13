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
import RateAppPopup from "./components/ui/RateAppPopup";
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

  // Handle OAuth callback tokens from deep links (Capacitor) and URL hash (web)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Helper: extract tokens from a URL string (hash fragment)
    const extractAndSetTokens = async (url) => {
      try {
        const hashIndex = url.indexOf("#");
        if (hashIndex === -1) return false;

        const hashStr = url.substring(hashIndex + 1);
        const params = new URLSearchParams(hashStr);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          console.log("🔑 OAuth tokens found, setting Supabase session...");
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("❌ Error setting session from tokens:", error);
            return false;
          }

          console.log("✅ Session set successfully from OAuth tokens!");
          window.location.hash = ""; // Clean up
          await checkAuth();
          return true;
        }
      } catch (e) {
        console.error("❌ Error processing OAuth tokens:", e);
      }
      return false;
    };

    // 1) Check the current URL hash on mount (web flow)
    if (window.location.hash.includes("access_token")) {
      extractAndSetTokens(window.location.href);
    }

    // 2) Listen for deep link opens (Capacitor native app)
    let appUrlListener = null;
    if (Capacitor.isNativePlatform()) {
      import("@capacitor/app").then(({ App }) => {
        App.addListener("appUrlOpen", async (event) => {
          console.log("📲 Deep link received:", event.url);
          if (event.url && event.url.includes("access_token")) {
            // Close the external OAuth browser
            try {
              const { Browser } = await import("@capacitor/browser");
              await Browser.close();
              console.log("✅ External browser closed");
            } catch (e) { /* browser might already be closed */ }

            // Extract and set tokens
            const success = await extractAndSetTokens(event.url);
            if (!success) {
              console.warn("⚠️ Failed to extract tokens from deep link, retrying checkAuth...");
              await checkAuth();
            }
          }
        });
        appUrlListener = App;
        console.log("📲 Deep link listener registered");
      }).catch((e) => {
        console.warn("⚠️ Could not load @capacitor/app:", e);
      });
    }

    // 3) Also check when app resumes from background
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Re-check hash in case OAuth redirect happened while app was backgrounded
        if (window.location.hash.includes("access_token")) {
          extractAndSetTokens(window.location.href);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 4) Listen for Supabase auth state changes (catches all auth flows)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔔 Auth state change:", event);
        if (event === "SIGNED_IN" && session?.user) {
          console.log("✅ User signed in via auth state change:", session.user.email);
          await checkAuth();
        }
      }
    );

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      subscription?.unsubscribe();
      if (appUrlListener) {
        appUrlListener.removeAllListeners().catch(() => {});
      }
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

      {/* Rate App Popup - solicitar calificación en Google Play */}
      <RateAppPopup />
    </div>
  );
}

export default App;
