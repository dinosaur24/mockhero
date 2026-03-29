-- Add credits column to profiles for pay-per-use credit packs.
-- Credits are purchased one-time via Polar and deducted per record generated.
-- When credits > 0, they are used instead of the daily tier limit.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits integer NOT NULL DEFAULT 0;

-- Atomic credit deduction RPC: deducts credits and returns success/remaining.
-- Returns NULL if insufficient credits.
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id text,
  p_amount  integer
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_remaining integer;
BEGIN
  UPDATE profiles
     SET credits = credits - p_amount
   WHERE id = p_user_id
     AND credits >= p_amount
  RETURNING credits INTO v_remaining;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false);
  END IF;

  RETURN jsonb_build_object('success', true, 'remaining', v_remaining);
END;
$$;

-- Add credits to a user (called from webhook on purchase).
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id text,
  p_amount  integer
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  UPDATE profiles
     SET credits = credits + p_amount
   WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  RETURN COALESCE(v_new_balance, 0);
END;
$$;
