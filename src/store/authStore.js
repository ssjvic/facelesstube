import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, isSupabaseConfigured, db } from "../config/supabase";

// Subscription tiers
const TIERS = {
  free: {
    name: "Free",
    price: 0,
    videosPerMonth: 5,
    maxDuration: 60, // seconds (1 minute)
    watermark: true,
    features: ["3-5 videos/mes", "Marca de agua", "1 minuto max"],
  },
  starter: {
    name: "Starter",
    price: 9,
    priceAnnual: 99,
    videosPerMonth: 30,
    maxDuration: 600, // 10 min
    watermark: false,
    features: [
      "30 videos/mes",
      "Sin marca de agua",
      "Hasta 10 min",
      "Soporte email",
    ],
  },
  pro: {
    name: "Pro",
    price: 19,
    priceAnnual: 190,
    videosPerMonth: 100,
    maxDuration: 900, // 15 min
    watermark: false,
    features: [
      "100 videos/mes",
      "Sin marca de agua",
      "Hasta 15 min",
      "Voces premium",
      "Soporte prioritario",
    ],
  },
  unlimited: {
    name: "Unlimited",
    price: 29,
    priceAnnual: 290,
    videosPerMonth: Infinity,
    maxDuration: 1200, // 20 min
    watermark: false,
    features: [
      "Videos ilimitados",
      "Sin marca de agua",
      "Hasta 20 min",
      "Todas las voces",
      "Soporte 24/7",
      "API access",
    ],
  },
};

// Mock user for demo mode (when Supabase not configured)
const createMockUser = () => ({
  id: "demo-user-" + Date.now(),
  email: "demo@facelesstube.mx",
  name: "Usuario Demo",
  avatar: null,
  tier: "free",
  credits: 100,
  videosThisMonth: 0,
  youtubeConnected: false,
  createdAt: new Date().toISOString(),
});

// Guard flag to prevent checkAuth from racing with active logins
let _loginInProgress = false;

// Helper: build a user object from Supabase session + optional profile
function buildUserFromSession(sessionUser, profile = null) {
  return {
    id: sessionUser.id,
    email: sessionUser.email || profile?.email,
    name:
      profile?.name ||
      sessionUser.user_metadata?.full_name ||
      sessionUser.email?.split("@")[0] ||
      "Usuario",
    avatar: profile?.avatar || sessionUser.user_metadata?.avatar_url,
    tier: profile?.tier || "free",
    credits: profile?.credits ?? 100,
    videosThisMonth: profile?.videos_this_month || 0,
    youtubeConnected: profile?.youtube_connected || false,
    createdAt: profile?.created_at || new Date().toISOString(),
  };
}

// Helper: fetch profile from Supabase and set full user state
// This ensures counters (videosThisMonth, credits, tier) persist across reinstalls
async function fetchAndSetProfile(sessionUser, set, getState) {
  let profile = null;
  try {
    profile = await db.getUser(sessionUser.id);
    if (!profile) {
      profile = await db.createUser({
        id: sessionUser.id,
        email: sessionUser.email,
        name:
          sessionUser.user_metadata?.full_name ||
          sessionUser.email?.split("@")[0],
        avatar: sessionUser.user_metadata?.avatar_url,
        tier: "free",
        credits: 100,
        videos_this_month: 0,
        youtube_connected: false,
      });
    }
  } catch (e) {
    console.log("Profile fetch error (using session data):", e);
  }

  const serverUser = buildUserFromSession(sessionUser, profile);

  // SAFETY: If we have locally persisted user data with a higher video count,
  // use the higher value to prevent accidental resets on reinstall/re-login.
  // This can happen if db.updateUser silently failed in a previous session.
  let currentState = null;
  try {
    currentState = typeof getState === "function" ? getState() : null;
  } catch (e) {
    /* ignore */
  }
  const localUser = currentState?.user;
  if (localUser && localUser.id === serverUser.id) {
    if ((localUser.videosThisMonth || 0) > (serverUser.videosThisMonth || 0)) {
      console.warn(
        `⚠️ Local videosThisMonth (${localUser.videosThisMonth}) > server (${serverUser.videosThisMonth}). Syncing up.`,
      );
      serverUser.videosThisMonth = localUser.videosThisMonth;
      // Also push the higher count to the server
      db.updateUser(sessionUser.id, {
        videos_this_month: localUser.videosThisMonth,
      }).then((r) => {
        if (!r) console.warn("⚠️ Failed to sync videosThisMonth to server");
      });
    }
  }

  set({
    user: serverUser,
    loading: false,
    isDemo: false,
  });
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      error: null,
      isDemo: false,

      // Check if user is authenticated
      checkAuth: async () => {
        // CRITICAL: Don't run checkAuth while a login is in progress
        if (_loginInProgress) {
          console.log("⏳ checkAuth skipped: login in progress");
          set({ loading: false });
          return;
        }

        // If Supabase not configured, use demo mode
        if (!isSupabaseConfigured()) {
          const savedUser = localStorage.getItem("facelesstube_user");
          if (savedUser) {
            try {
              set({
                user: JSON.parse(savedUser),
                loading: false,
                isDemo: true,
              });
            } catch {
              set({ loading: false, isDemo: true });
            }
          } else {
            set({ loading: false, isDemo: true });
          }
          return;
        }

        // Real Supabase auth
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error("Session error:", error);
            set({ loading: false });
            return;
          }

          if (session?.user) {
            // Try to fetch user profile, but ALWAYS work without it
            // db.getUser and db.createUser now return null on error
            // instead of throwing, so this is safe
            let profile = null;
            try {
              profile = await db.getUser(session.user.id);
              if (!profile) {
                profile = await db.createUser({
                  id: session.user.id,
                  email: session.user.email,
                  name:
                    session.user.user_metadata?.full_name ||
                    session.user.email?.split("@")[0],
                  avatar: session.user.user_metadata?.avatar_url,
                  tier: "free",
                  credits: 100,
                  videos_this_month: 0,
                  youtube_connected: false,
                });
              }
            } catch (profileError) {
              console.log("Profile error (using session data):", profileError);
              profile = null;
            }

            set({
              user: buildUserFromSession(session.user, profile),
              loading: false,
              isDemo: false,
            });
          } else {
            // No session found
            if (!_loginInProgress) {
              set({ user: null, loading: false, isDemo: false });
            } else {
              set({ loading: false });
            }
          }
        } catch (error) {
          console.error("Auth check error:", error);
          // CRITICAL: Always set loading to false, never leave spinner stuck
          set({ error: error.message, loading: false });
        }
      },

      // Login with Google
      loginWithGoogle: async () => {
        _loginInProgress = true;
        set({ error: null });

        // If Supabase not configured, use demo mode
        if (!isSupabaseConfigured()) {
          await new Promise((r) => setTimeout(r, 1000));
          const user = createMockUser();
          localStorage.setItem("facelesstube_user", JSON.stringify(user));
          set({ user, loading: false, isDemo: true });
          _loginInProgress = false;
          return true;
        }

        // Check if running on Capacitor (native Android/iOS)
        const isCapacitor =
          typeof window !== "undefined" &&
          window.Capacitor &&
          window.Capacitor.isNativePlatform &&
          window.Capacitor.isNativePlatform();

        if (isCapacitor) {
          // NATIVE: Use Firebase Google Sign-In → Supabase signInWithIdToken
          try {
            console.log("🔄 Native Google Sign-In via Firebase...");
            let FirebaseAuth;
            try {
              const mod = await import("@capacitor-firebase/authentication");
              FirebaseAuth = mod.FirebaseAuthentication;
            } catch (importErr) {
              console.error(
                "❌ Cannot import @capacitor-firebase/authentication:",
                importErr,
              );
              // FALLBACK: Use Supabase OAuth redirect in in-app browser
              console.log("🔄 Falling back to Supabase OAuth redirect...");
              const redirectUrl = "com.facelesstube.app://auth-callback";
              const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: redirectUrl },
              });
              if (error) throw error;
              set({ loading: false });
              _loginInProgress = false;
              return true;
            }

            console.log(
              "📱 FirebaseAuthentication loaded, calling signInWithGoogle...",
            );
            const result = await FirebaseAuth.signInWithGoogle({
              scopes: ["email", "profile"],
              useCredentialManager: false,
            });

            console.log(
              "✅ Firebase Google Sign-In result:",
              JSON.stringify(result, null, 2),
            );

            // Get the ID token from Firebase
            const idToken = result.credential?.idToken;
            if (!idToken) {
              console.error(
                "❌ No idToken in result.credential:",
                result.credential,
              );
              throw new Error("No se recibió ID token de Google");
            }

            console.log("🔑 Got ID token, signing in to Supabase...");

            // Use the ID token to create a Supabase session
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: idToken,
            });

            if (error) {
              console.error("❌ Supabase signInWithIdToken error:", error);
              throw error;
            }

            if (data?.user) {
              console.log("✅ Supabase session created for:", data.user.email);
              // Fetch real profile from DB to preserve counters
              await fetchAndSetProfile(data.user, set, get);
              _loginInProgress = false;
              return true;
            }

            set({ loading: false });
            _loginInProgress = false;
            return false;
          } catch (error) {
            console.error("❌ Native Google Sign-In error:", error);
            const msg =
              error?.message ||
              error?.code ||
              "Error al iniciar sesión con Google";
            // Don't show error for user cancellation
            if (
              error?.code === "12501" ||
              msg.includes("12501") ||
              msg.includes("cancel")
            ) {
              set({ loading: false });
            } else {
              set({ error: msg, loading: false });
            }
            _loginInProgress = false;
            return false;
          }
        } else {
          // WEB: Use Supabase OAuth redirect (opens in same browser)
          try {
            console.log("🔄 Web Google OAuth via Supabase...");

            const { data, error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                // HashRouter uses /#/ for routes, so we redirect to root.
                // The onAuthStateChange listener + checkAuth will handle
                // setting user state and Auth.jsx's useEffect redirects to /app.
                redirectTo: window.location.origin,
              },
            });

            if (error) throw error;

            // The redirect will happen automatically
            set({ loading: false });
            _loginInProgress = false;
            return true;
          } catch (error) {
            set({ error: error.message, loading: false });
            _loginInProgress = false;
            return false;
          }
        }
      },

      // Login with Email/Password
      loginWithEmail: async (email, password) => {
        _loginInProgress = true;
        set({ error: null, loading: true });

        // Demo mode - allow any login
        if (!isSupabaseConfigured()) {
          await new Promise((r) => setTimeout(r, 800));
          const user = createMockUser();
          user.email = email;
          user.name = email.split("@")[0];
          localStorage.setItem("facelesstube_user", JSON.stringify(user));
          set({ user, loading: false, isDemo: true });
          _loginInProgress = false;
          return true;
        }

        try {
          console.log("🔄 Email login attempt for:", email);
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error("❌ Email login error:", error.message);
            set({ error: error.message, loading: false });
            _loginInProgress = false;
            return false;
          }

          // Set user directly from session data
          if (data?.user) {
            console.log("✅ Email login success for:", data.user.email);
            // Fetch real profile from DB to preserve counters
            await fetchAndSetProfile(data.user, set, get);
            _loginInProgress = false;
            return true;
          }

          set({ loading: false });
          _loginInProgress = false;
          return false;
        } catch (error) {
          console.error("❌ Email login exception:", error.message);
          set({ error: error.message, loading: false });
          _loginInProgress = false;
          return false;
        }
      },

      // Sign up with Email/Password
      signUpWithEmail: async (email, password, name) => {
        _loginInProgress = true;
        set({ error: null });

        // Demo mode - allow any signup
        if (!isSupabaseConfigured()) {
          await new Promise((r) => setTimeout(r, 800));
          const user = createMockUser();
          user.email = email;
          user.name = name || email.split("@")[0];
          localStorage.setItem("facelesstube_user", JSON.stringify(user));
          set({ user, loading: false, isDemo: true });
          _loginInProgress = false;
          return true;
        }

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: name },
            },
          });

          if (error) {
            set({ error: error.message, loading: false });
            _loginInProgress = false;
            return { success: false, error: error.message };
          }

          // Check if email confirmation is required
          if (data.user && !data.session) {
            set({ loading: false });
            _loginInProgress = false;
            return { success: true, confirmationNeeded: true };
          }

          // Session exists, set user
          if (data.session?.user) {
            set({
              user: buildUserFromSession(data.session.user),
              loading: false,
              isDemo: false,
            });
            _loginInProgress = false;
            return true;
          }

          set({ loading: false });
          _loginInProgress = false;
          return { success: true };
        } catch (error) {
          set({ error: error.message, loading: false });
          _loginInProgress = false;
          return { success: false, error: error.message };
        }
      },

      // Logout
      logout: async () => {
        if (isSupabaseConfigured()) {
          await supabase.auth.signOut();
        }
        localStorage.removeItem("facelesstube_user");
        set({ user: null, isDemo: false });
      },

      // Update user data
      updateUser: async (updates) => {
        const user = get().user;
        if (!user) return;

        const updatedUser = { ...user, ...updates };

        if (isSupabaseConfigured() && !get().isDemo) {
          // Update in database (won't throw on error)
          const dbUpdates = {};
          if (updates.name !== undefined) dbUpdates.name = updates.name;
          if (updates.tier !== undefined) dbUpdates.tier = updates.tier;
          if (updates.credits !== undefined)
            dbUpdates.credits = updates.credits;
          if (updates.videosThisMonth !== undefined)
            dbUpdates.videos_this_month = updates.videosThisMonth;
          if (updates.youtubeConnected !== undefined)
            dbUpdates.youtube_connected = updates.youtubeConnected;

          const result = await db.updateUser(user.id, dbUpdates);
          if (!result) {
            console.warn(
              "⚠️ db.updateUser returned null — profile update may have failed for:",
              dbUpdates,
            );
          }
        } else {
          // Update in localStorage for demo
          localStorage.setItem(
            "facelesstube_user",
            JSON.stringify(updatedUser),
          );
        }

        set({ user: updatedUser });
      },

      // Increment video count
      incrementVideoCount: async () => {
        const user = get().user;
        if (!user) return;

        const newCount = (user.videosThisMonth || 0) + 1;
        await get().updateUser({ videosThisMonth: newCount });
      },

      // Use credits
      useCredits: async (amount) => {
        const user = get().user;
        if (!user || user.credits < amount) return false;

        await get().updateUser({ credits: user.credits - amount });
        return true;
      },

      // Add credits
      addCredits: async (amount) => {
        const user = get().user;
        if (!user) return;

        await get().updateUser({ credits: (user.credits || 0) + amount });
      },

      // Get tier info
      getTierInfo: () => {
        const user = get().user;
        return TIERS[user?.tier] || TIERS.free;
      },

      // Get all tiers
      getAllTiers: () => TIERS,

      // Check if can create video
      canCreateVideo: () => {
        const user = get().user;
        if (!user) return false;
        const tierInfo = TIERS[user.tier] || TIERS.free;
        if (tierInfo.videosPerMonth === Infinity) return true;
        return user.videosThisMonth < tierInfo.videosPerMonth;
      },

      // Alias for Dashboard compatibility
      canGenerateVideo: () => {
        const user = get().user;
        if (!user) return false;
        const tierInfo = TIERS[user.tier] || TIERS.free;
        if (tierInfo.videosPerMonth === Infinity) return true;
        return user.videosThisMonth < tierInfo.videosPerMonth;
      },

      // Connect YouTube
      connectYouTube: async () => {
        await get().updateUser({ youtubeConnected: true });
      },

      // Disconnect YouTube
      disconnectYouTube: async () => {
        await get().updateUser({ youtubeConnected: false });
      },
    }),
    {
      name: "facelesstube-auth",
      partialize: (state) => ({
        // Persist user data so limits survive app reinstall/cache clear.
        // On next login, fetchAndSetProfile() will refresh from Supabase
        // (source of truth), but this gives us a local fallback.
        isDemo: state.isDemo,
        user: state.user,
      }),
    },
  ),
);

// Listen for auth changes (for real Supabase auth)
if (isSupabaseConfigured()) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("🔔 Auth state changed:", event);

    // CRITICAL: Never interfere when login functions are actively setting state
    if (_loginInProgress) {
      console.log("⏳ onAuthStateChange skipped: login in progress");
      return;
    }

    if (event === "SIGNED_IN" && session?.user) {
      // Fetch real profile to preserve counters (videosThisMonth, credits, etc.)
      const { user: currentUser } = useAuthStore.getState();
      if (!currentUser) {
        console.log(
          "🔔 Setting user from auth state change (SIGNED_IN) — fetching profile...",
        );
        fetchAndSetProfile(
          session.user,
          (state) => useAuthStore.setState(state),
          useAuthStore.getState,
        );
      }
    } else if (event === "TOKEN_REFRESHED" && session?.user) {
      // On token refresh, quietly update — no need to call checkAuth
      const { user: currentUser } = useAuthStore.getState();
      if (currentUser) {
        console.log("🔔 Token refreshed, user still valid");
      } else {
        useAuthStore.setState({
          user: buildUserFromSession(session.user),
          loading: false,
          isDemo: false,
        });
      }
    } else if (event === "SIGNED_OUT") {
      useAuthStore.setState({ user: null, loading: false });
    }
  });
}
