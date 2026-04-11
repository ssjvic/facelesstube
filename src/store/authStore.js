import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, isSupabaseConfigured, db } from "../config/supabase";

// Subscription tiers
const TIERS = {
  free: {
    name: "Free",
    price: 0,
    videosPerMonth: 5,
    maxDuration: 1200, // seconds (20 minutes) — all durations unlocked
    watermark: true,
    features: ["3-5 videos/mes", "Marca de agua", "Hasta 20 min"],
  },
  starter: {
    name: "Starter",
    price: 9,
    priceAnnual: 90,
    videosPerMonth: 30,
    maxDuration: 300, // 5 min
    watermark: false,
    features: [
      "30 videos/mes",
      "Sin marca de agua",
      "Hasta 5 min",
      "Soporte email",
    ],
  },
  pro: {
    name: "Pro",
    price: 19,
    priceAnnual: 190,
    videosPerMonth: 100,
    maxDuration: 600, // 10 min
    watermark: false,
    features: [
      "100 videos/mes",
      "Sin marca de agua",
      "Hasta 10 min",
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

// Guard flags to prevent checkAuth from racing with active logins/logouts
let _loginInProgress = false;
let _logoutInProgress = false;

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
    stripeCustomerId: profile?.stripe_customer_id || null,
    createdAt: profile?.created_at || new Date().toISOString(),
  };
}

// Helper: fetch profile from Supabase and set full user state
// This ensures counters (videosThisMonth, credits, tier) persist across reinstalls
async function fetchAndSetProfile(sessionUser, set, getState) {
  let profile = null;
  try {
    console.log("📊 fetchAndSetProfile: fetching user", sessionUser.id);
    profile = await db.getUser(sessionUser.id);
    console.log("📊 fetchAndSetProfile: db.getUser result:", profile ? `found (videos=${profile.videos_this_month})` : "null");
    if (!profile) {
      console.log("📊 fetchAndSetProfile: creating new user profile...");
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
      console.log("📊 fetchAndSetProfile: createUser result:", profile ? "created" : "FAILED");
    }
  } catch (e) {
    console.log("Profile fetch error (using session data):", e);
  }

  const serverUser = buildUserFromSession(sessionUser, profile);

  // SAFETY: Compare multiple sources to prevent video count resets.
  // Sources: (1) zustand in-memory state, (2) localStorage backup, (3) server profile
  // Use the HIGHEST videosThisMonth value across all sources.
  let highestCount = serverUser.videosThisMonth || 0;

  // Check zustand in-memory state
  let currentState = null;
  try {
    currentState = typeof getState === "function" ? getState() : null;
  } catch (e) {
    /* ignore */
  }
  const localUser = currentState?.user;
  if (localUser && localUser.id === serverUser.id) {
    highestCount = Math.max(highestCount, localUser.videosThisMonth || 0);
  }

  // Also check localStorage backup (survives app kill even if zustand hasn't hydrated)
  try {
    const lsRaw = localStorage.getItem("facelesstube_user");
    if (lsRaw) {
      const lsUser = JSON.parse(lsRaw);
      if (lsUser && lsUser.id === serverUser.id) {
        highestCount = Math.max(highestCount, lsUser.videosThisMonth || 0);
      }
    }
  } catch (e) {
    /* ignore parse errors */
  }

  // Also check the zustand persisted store (belt and suspenders)
  try {
    const persistedRaw = localStorage.getItem("facelesstube-auth");
    if (persistedRaw) {
      const persisted = JSON.parse(persistedRaw);
      const pUser = persisted?.state?.user;
      if (pUser && pUser.id === serverUser.id) {
        highestCount = Math.max(highestCount, pUser.videosThisMonth || 0);
      }
    }
  } catch (e) {
    /* ignore parse errors */
  }

  if (highestCount > (serverUser.videosThisMonth || 0)) {
    console.warn(
      `⚠️ Local videosThisMonth (${highestCount}) > server (${serverUser.videosThisMonth}). Syncing up.`,
    );
    serverUser.videosThisMonth = highestCount;
    // Also push the higher count to the server
    db.updateUser(sessionUser.id, {
      videos_this_month: highestCount,
    }).then((r) => {
      if (!r) console.warn("⚠️ Failed to sync videosThisMonth to server");
    });
  }

  console.log(`📊 fetchAndSetProfile FINAL: videosThisMonth=${serverUser.videosThisMonth}, tier=${serverUser.tier}, email=${serverUser.email}`);
  set({
    user: serverUser,
    loading: false,
    isDemo: false,
    error: null,
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
        // CRITICAL: Don't run checkAuth while a login or logout is in progress
        if (_loginInProgress || _logoutInProgress) {
          console.log("⏳ checkAuth skipped:", _loginInProgress ? "login" : "logout", "in progress");
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
            // Use fetchAndSetProfile which has the SAFETY MERGE logic:
            // it compares local persisted state vs server state and keeps
            // the higher videosThisMonth count. This prevents count resets
            // when the app is killed and reopened.
            await fetchAndSetProfile(session.user, set, get);
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

            // Decode JWT for error diagnostics only
            let jwtAud = "unknown";
            try {
              const parts = idToken.split(".");
              const payload = JSON.parse(atob(parts[1]));
              jwtAud = payload.aud;
            } catch (decodeErr) {
              console.log("Could not decode JWT:", decodeErr);
            }

            // Use the ID token to create a Supabase session
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: idToken,
            });

            if (error) {
              console.error("❌ Supabase signInWithIdToken error:", JSON.stringify(error));
              console.error("❌ Error message:", error.message);
              console.error("❌ Error status:", error.status);
              console.error("❌ Error code:", error.code);
              // Show FULL error on screen - very visible
              const errMsg = `ERROR: ${error.message}\n\nStatus: ${error.status || "N/A"}\nCode: ${error.code || "N/A"}\nAud: ${jwtAud}\nSupabase: ${import.meta.env.VITE_SUPABASE_URL}`;
              set({ error: errMsg, loading: false });
              // Don't throw - let user see the error
              _loginInProgress = false;
              return false;
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
                // BrowserRouter uses clean /routes, redirect to root.
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
            // Try to auto-login anyway (works when email confirmation is disabled in Supabase)
            console.log(
              "🔄 No session after signup — attempting auto-login...",
            );
            const { data: loginData, error: loginError } =
              await supabase.auth.signInWithPassword({ email, password });

            if (!loginError && loginData?.session?.user) {
              console.log("✅ Auto-login after signup successful");
              await fetchAndSetProfile(loginData.session.user, set, get);
              _loginInProgress = false;
              return true;
            }

            // If auto-login failed, ask the user to confirm their email
            console.log("📧 Auto-login failed — confirmation email sent");
            set({ loading: false });
            _loginInProgress = false;
            return { success: true, confirmationNeeded: true };
          }

          // Session exists immediately (email confirmation disabled), set user
          if (data.session?.user) {
            console.log(
              "✅ Signup with immediate session — fetching profile...",
            );
            await fetchAndSetProfile(data.session.user, set, get);
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

      // Logout — fully clear ALL sessions and persisted state so account switching works
      logout: async () => {
        _logoutInProgress = true;
        console.log("🚪 Logout: starting...");

        // 1. Clear zustand state FIRST so UI shows logged-out immediately
        set({ user: null, isDemo: false, loading: false, error: null });

        // 2. Clear ALL local persisted auth state
        localStorage.removeItem("facelesstube_user");      // manual backup
        localStorage.removeItem("facelesstube-auth");       // zustand persist store
        // Clear Supabase's own local storage tokens
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith("sb-") && (key.endsWith("-auth-token") || key.includes("supabase"))) {
            localStorage.removeItem(key);
          }
        }
        // Also clear sessionStorage (some Supabase versions use it)
        try {
          const sessionKeys = Object.keys(sessionStorage);
          for (const key of sessionKeys) {
            if (key.startsWith("sb-") || key.includes("supabase")) {
              sessionStorage.removeItem(key);
            }
          }
        } catch (e) { /* ignore */ }

        // 3. Sign out from Supabase (server-side)
        if (isSupabaseConfigured()) {
          try {
            await supabase.auth.signOut({ scope: 'global' });
          } catch (e) {
            console.warn("signOut error (non-fatal):", e);
          }
        }

        // 4. Also sign out from Firebase/Google if on native
        try {
          const isCapacitor =
            typeof window !== "undefined" &&
            window.Capacitor &&
            window.Capacitor.isNativePlatform &&
            window.Capacitor.isNativePlatform();
          if (isCapacitor) {
            const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
            await FirebaseAuthentication.signOut();
            console.log("🚪 Firebase signOut done");
          }
        } catch (e) {
          console.warn("Firebase signOut error (non-fatal):", e);
        }

        console.log("🚪 Logout: complete");

        // 5. Keep the flag active for a short time to block any
        //    onAuthStateChange SIGNED_IN events that fire in the aftermath
        setTimeout(() => {
          _logoutInProgress = false;
          console.log("🚪 Logout: guard released");
        }, 2000);
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

      // Increment video count — with Supabase verification to survive reinstalls
      incrementVideoCount: async () => {
        const user = get().user;
        if (!user) return;

        const newCount = (user.videosThisMonth || 0) + 1;

        // 1. Update local state immediately for responsiveness
        set({ user: { ...user, videosThisMonth: newCount } });

        // 2. Persist to Supabase with verification
        if (isSupabaseConfigured() && !get().isDemo) {
          try {
            // Direct Supabase update
            const result = await db.updateUser(user.id, {
              videos_this_month: newCount,
            });

            if (!result) {
              console.warn(
                "⚠️ incrementVideoCount: db.updateUser returned null — retrying...",
              );
              // Retry once after a short delay
              await new Promise((r) => setTimeout(r, 1000));
              const retry = await db.updateUser(user.id, {
                videos_this_month: newCount,
              });
              if (!retry) {
                console.error(
                  "❌ incrementVideoCount: retry also failed. Count may not persist.",
                );
                // Warn the user visibly
                try {
                  const { toast } = await import("../store/toastStore");
                  toast.warning(
                    "⚠️ No se pudo sincronizar tu uso. Verifica tu conexión.",
                  );
                } catch (_) {
                  /* ignore */
                }
              } else {
                console.log(
                  "✅ incrementVideoCount: retry succeeded, count =",
                  newCount,
                );
              }
            } else {
              console.log(
                "✅ incrementVideoCount: saved to Supabase, count =",
                newCount,
              );
            }

            // 3. Verify by re-reading from Supabase
            try {
              const profile = await db.getUser(user.id);
              if (profile) {
                const serverCount = profile.videos_this_month || 0;
                if (serverCount !== newCount) {
                  console.warn(
                    `⚠️ Verification mismatch: local=${newCount}, server=${serverCount}. Force-updating server.`,
                  );
                  // Force update server to match
                  await db.updateUser(user.id, {
                    videos_this_month: newCount,
                  });
                }
              }
            } catch (verifyErr) {
              console.warn("⚠️ Verification read failed:", verifyErr);
            }
          } catch (e) {
            console.error("❌ incrementVideoCount: Supabase error:", e.message);
            try {
              const { toast } = await import("../store/toastStore");
              toast.warning("⚠️ Error al guardar tu progreso en la nube.");
            } catch (_) {
              /* ignore */
            }
          }
        }

        // 4. Also persist to localStorage as backup for session continuity
        try {
          localStorage.setItem(
            "facelesstube_user",
            JSON.stringify({ ...user, videosThisMonth: newCount }),
          );
        } catch (e) {
          /* ignore */
        }
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

    // CRITICAL: Never interfere when login or logout functions are actively setting state
    if (_loginInProgress || _logoutInProgress) {
      console.log("⏳ onAuthStateChange skipped:", _loginInProgress ? "login" : "logout", "in progress");
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
