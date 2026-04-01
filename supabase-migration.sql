-- ============================================
-- FacelessTube — Migration Script
-- Run this in Supabase SQL Editor
-- This ADDS missing columns and tables WITHOUT deleting existing data
-- ============================================

-- 1. Add missing columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 100;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS youtube_connected BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Set default credits for existing users that have NULL
UPDATE public.users SET credits = 100 WHERE credits IS NULL;
UPDATE public.users SET youtube_connected = FALSE WHERE youtube_connected IS NULL;

-- 3. Drop the old wide-open RLS policies and create proper ones
DROP POLICY IF EXISTS "Allow all for service role" ON public.users;

CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = id);

-- 4. Fix videos table RLS too
DROP POLICY IF EXISTS "Allow all for service role" ON public.videos;

CREATE POLICY "Users can view own videos" ON public.videos
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own videos" ON public.videos
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own videos" ON public.videos
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own videos" ON public.videos
    FOR DELETE USING (auth.uid()::text = user_id);

-- 5. Create subscriptions table (if not exists)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    billing_cycle TEXT DEFAULT 'monthly',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid()::text = user_id);

-- 6. Create transactions table (if not exists)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    balance_after INTEGER,
    reference_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid()::text = user_id);

-- 7. Create trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar, credits, videos_this_month)
    VALUES (
        new.id::text,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url',
        100,
        0
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Function to reset monthly video count (run as cron job on 1st of each month)
CREATE OR REPLACE FUNCTION reset_monthly_video_count()
RETURNS void AS $$
BEGIN
    UPDATE public.users SET videos_this_month = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
