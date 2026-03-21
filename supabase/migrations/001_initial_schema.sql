-- MockHero Initial Schema
-- Source: docs/prd.md § Data Model
-- Run via Supabase SQL editor or `supabase db push`

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- profiles: Extends auth.users with app-specific data
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  avatar_url TEXT,
  tier VARCHAR(20) NOT NULL DEFAULT 'free'
    CHECK (tier IN ('free', 'pro', 'scale')),
  is_early_adopter BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- api_keys: One active key per user for API authentication
-- ============================================================
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key_hash VARCHAR(64) NOT NULL,
  key_prefix VARCHAR(12) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- ============================================================
-- usage_logs: Individual API request log for analytics
-- ============================================================
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  records_generated INTEGER NOT NULL,
  tables_count INTEGER NOT NULL DEFAULT 1,
  format VARCHAR(10) NOT NULL DEFAULT 'json'
    CHECK (format IN ('json', 'csv', 'sql')),
  locale VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- daily_usage: Aggregated daily record count per user for rate limiting
-- ============================================================
CREATE TABLE public.daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  records_used INTEGER NOT NULL DEFAULT 0,
  requests_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

-- ============================================================
-- subscriptions: Polar subscription state synced via webhooks
-- ============================================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  polar_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  polar_customer_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

-- API key lookup by hash (used on every API request for auth)
CREATE INDEX idx_api_keys_key_hash ON public.api_keys (key_hash) WHERE is_active = TRUE;

-- Daily usage lookup (used on every API request for rate limiting)
CREATE UNIQUE INDEX idx_daily_usage_user_date ON public.daily_usage (user_id, date);

-- Usage logs by user and date (dashboard queries)
CREATE INDEX idx_usage_logs_user_created ON public.usage_logs (user_id, created_at DESC);

-- Subscriptions by user and status (tier resolution)
CREATE INDEX idx_subscriptions_user_status ON public.subscriptions (user_id, status);

-- Subscriptions by Polar ID (webhook updates)
CREATE INDEX idx_subscriptions_polar_id ON public.subscriptions (polar_subscription_id);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- API Keys: users can manage their own keys
CREATE POLICY api_keys_select ON public.api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY api_keys_insert ON public.api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY api_keys_update ON public.api_keys FOR UPDATE USING (auth.uid() = user_id);

-- Usage logs: users can read their own logs
CREATE POLICY usage_logs_select ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);

-- Daily usage: users can read their own daily usage
CREATE POLICY daily_usage_select ON public.daily_usage FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions: users can read their own subscriptions
CREATE POLICY subscriptions_select ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- Functions & Triggers
-- ============================================================

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
