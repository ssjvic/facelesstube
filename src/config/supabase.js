// Supabase Client Configuration
// Replace with your actual Supabase project credentials
import { createClient } from '@supabase/supabase-js'

// Environment variables - in production, use .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
    return supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
}

// Database helper functions
// IMPORTANT: These functions return null on error instead of throwing,
// so that auth flows never crash on missing/misconfigured tables.
export const db = {
    // Users
    async getUser(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.log('db.getUser error (non-fatal):', error.message)
                return null
            }
            return data
        } catch (e) {
            console.log('db.getUser exception (non-fatal):', e.message)
            return null
        }
    },

    async createUser(user) {
        try {
            const { data, error } = await supabase
                .from('users')
                .insert([user])
                .select()
                .single()

            if (error) {
                console.log('db.createUser error (non-fatal):', error.message)
                return null
            }
            return data
        } catch (e) {
            console.log('db.createUser exception (non-fatal):', e.message)
            return null
        }
    },

    async updateUser(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', userId)
                .select()
                .single()

            if (error) {
                console.log('db.updateUser error (non-fatal):', error.message)
                return null
            }
            return data
        } catch (e) {
            console.log('db.updateUser exception (non-fatal):', e.message)
            return null
        }
    },

    // Videos
    async getVideos(userId) {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async saveVideo(video) {
        const { data, error } = await supabase
            .from('videos')
            .insert([video])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteVideo(videoId) {
        const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', videoId)

        if (error) throw error
        return true
    },

    // Subscriptions
    async getSubscription(userId) {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data
    },

    async createOrUpdateSubscription(subscription) {
        const { data, error } = await supabase
            .from('subscriptions')
            .upsert([subscription])
            .select()
            .single()

        if (error) throw error
        return data
    }
}
