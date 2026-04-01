-- ============================================
-- FacelessTube — FIX: Users table is empty
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Fix RLS: Allow authenticated users to insert/update their own row
-- The old policies were too strict, preventing the app from creating user profiles
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;

-- Allow ANY authenticated user to insert (the app sets id = auth.uid())
CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = id);

-- Allow users to read their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT TO authenticated
    USING (auth.uid()::text = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

-- 2. Also grant proper permissions (belt and suspenders)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.videos TO authenticated;
GRANT ALL ON public.subscriptions TO authenticated;
GRANT ALL ON public.transactions TO authenticated;

-- 3. Verify the trigger exists
-- This should return 1 row. If it returns 0, the trigger needs to be recreated.
SELECT count(*) as trigger_exists FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 4. Backfill: Create user rows for ALL existing auth users who don't have one
INSERT INTO public.users (id, email, name, credits, videos_this_month, tier)
SELECT 
    id::text,
    email,
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    100,
    0,
    'free'
FROM auth.users
WHERE id::text NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- 5. Verify: Show all users now
SELECT id, email, videos_this_month, tier, credits FROM public.users;
