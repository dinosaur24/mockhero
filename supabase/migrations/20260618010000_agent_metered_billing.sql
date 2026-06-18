-- Agent-first metered billing through Polar.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_tier_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_tier_check CHECK (tier IN ('free', 'agent', 'pro', 'scale'));

CREATE TABLE IF NOT EXISTS public.agent_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_email TEXT NOT NULL,
  agent_user_id TEXT NOT NULL UNIQUE,
  claim_token_hash VARCHAR(64) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'claimed', 'expired')),
  polar_checkout_id VARCHAR(255),
  polar_customer_id VARCHAR(255),
  polar_subscription_id VARCHAR(255),
  api_key_prefix VARCHAR(12),
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_checkouts_claim_token_hash
  ON public.agent_checkouts (claim_token_hash);

CREATE INDEX IF NOT EXISTS idx_agent_checkouts_status
  ON public.agent_checkouts (status);

CREATE INDEX IF NOT EXISTS idx_agent_checkouts_polar_subscription
  ON public.agent_checkouts (polar_subscription_id);

ALTER TABLE public.agent_checkouts ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS agent_checkouts_updated_at ON public.agent_checkouts;
CREATE TRIGGER agent_checkouts_updated_at
  BEFORE UPDATE ON public.agent_checkouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
