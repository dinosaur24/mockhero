-- Migration 002: Switch from Supabase Auth to Clerk
-- Profiles now keyed by Clerk user ID (text) instead of auth.users UUID

-- Drop the old trigger (no longer have auth.users inserts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop old RLS policies that reference auth.uid()
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_update ON public.profiles;
DROP POLICY IF EXISTS api_keys_select ON public.api_keys;
DROP POLICY IF EXISTS api_keys_insert ON public.api_keys;
DROP POLICY IF EXISTS api_keys_update ON public.api_keys;
DROP POLICY IF EXISTS usage_logs_select ON public.usage_logs;
DROP POLICY IF EXISTS daily_usage_select ON public.daily_usage;
DROP POLICY IF EXISTS subscriptions_select ON public.subscriptions;

-- Drop foreign key constraints that reference profiles
ALTER TABLE public.api_keys DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey;
ALTER TABLE public.usage_logs DROP CONSTRAINT IF EXISTS usage_logs_user_id_fkey;
ALTER TABLE public.usage_logs DROP CONSTRAINT IF EXISTS usage_logs_api_key_id_fkey;
ALTER TABLE public.daily_usage DROP CONSTRAINT IF EXISTS daily_usage_user_id_fkey;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

-- Drop old profiles FK to auth.users AND primary key
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Also drop the unique index on daily_usage before type change
DROP INDEX IF EXISTS idx_daily_usage_user_date;
ALTER TABLE public.daily_usage DROP CONSTRAINT IF EXISTS daily_usage_user_id_date_key;

-- Change profiles.id from UUID to TEXT (Clerk user IDs are strings like "user_2x...")
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.profiles ADD PRIMARY KEY (id);

-- Change user_id columns from UUID to TEXT
ALTER TABLE public.api_keys ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.usage_logs ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.daily_usage ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.subscriptions ALTER COLUMN user_id TYPE TEXT;

-- Re-add foreign key constraints pointing to new profiles
ALTER TABLE public.api_keys
  ADD CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.usage_logs
  ADD CONSTRAINT usage_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.daily_usage
  ADD CONSTRAINT daily_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Re-add unique index on daily_usage
CREATE UNIQUE INDEX idx_daily_usage_user_date ON public.daily_usage (user_id, date);

-- RLS stays enabled but we remove user-facing policies.
-- All queries from the app use the service_role key (server-side only),
-- which bypasses RLS. This is secure because the API never exposes
-- the Supabase client to the browser — all DB access goes through
-- Next.js server components and API routes.
