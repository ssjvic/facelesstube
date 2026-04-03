// Supabase Client Configuration
// Replace with your actual Supabase project credentials
import { createClient } from "@supabase/supabase-js";

// Environment variables - in production, use .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Create Supabase client — only if properly configured
// If env vars are missing, create a safe dummy to prevent app crash
let _supabase = null;
try {
  if (supabaseUrl && supabaseUrl !== "YOUR_SUPABASE_URL" &&
      supabaseAnonKey && supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY") {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn("⚠️ Supabase not configured — running in offline mode");
  }
} catch (e) {
  console.warn("⚠️ Supabase init failed:", e.message);
}
export const supabase = _supabase;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "YOUR_SUPABASE_URL" &&
    supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY" &&
    _supabase !== null
  );
};

// Database helper functions
// IMPORTANT: These functions return null on error instead of throwing,
// so that auth flows never crash on missing/misconfigured tables.
export const db = {
  // Users
  async getUser(userId) {
    if (!_supabase) return null;
    try {
      const { data, error } = await _supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.log("db.getUser error (non-fatal):", error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.log("db.getUser exception (non-fatal):", e.message);
      return null;
    }
  },

  async createUser(user) {
    if (!_supabase) return null;
    try {
      const { data, error } = await _supabase
        .from("users")
        .insert([user])
        .select()
        .single();

      if (error) {
        console.log("db.createUser error (non-fatal):", error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.log("db.createUser exception (non-fatal):", e.message);
      return null;
    }
  },

  async updateUser(userId, updates) {
    if (!_supabase) return null;
    try {
      const { data, error } = await _supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("db.updateUser FAILED:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          updates,
          userId: userId?.substring(0, 8) + "...",
        });
        return null;
      }
      return data;
    } catch (e) {
      console.error("db.updateUser EXCEPTION:", e.message, { updates });
      return null;
    }
  },

  // Videos
  async getVideos(userId) {
    if (!_supabase) return [];
    const { data, error } = await _supabase
      .from("videos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async saveVideo(video) {
    if (!_supabase) return null;
    const { data, error } = await _supabase
      .from("videos")
      .insert([video])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteVideo(videoId) {
    if (!_supabase) return false;
    const { error } = await _supabase.from("videos").delete().eq("id", videoId);

    if (error) throw error;
    return true;
  },

  // Subscriptions
  async getSubscription(userId) {
    if (!_supabase) return null;
    const { data, error } = await _supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async createOrUpdateSubscription(subscription) {
    if (!_supabase) return null;
    const { data, error } = await _supabase
      .from("subscriptions")
      .upsert([subscription])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
