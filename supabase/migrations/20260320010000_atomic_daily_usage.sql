-- Atomic daily usage reservation to prevent TOCTOU race condition.
-- Called by the rate limiter BEFORE generation starts.
-- Uses INSERT ON CONFLICT + atomic increment to handle concurrent requests.

CREATE OR REPLACE FUNCTION reserve_daily_usage(
  p_user_id TEXT,
  p_date DATE,
  p_records INTEGER,
  p_limit INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_current INTEGER;
  v_new INTEGER;
BEGIN
  -- Upsert: create row if missing, then atomically increment
  INSERT INTO daily_usage (user_id, date, records_used, requests_count)
  VALUES (p_user_id, p_date, 0, 0)
  ON CONFLICT (user_id, date) DO NOTHING;

  -- Atomic check-and-increment using row-level lock
  UPDATE daily_usage
  SET records_used = records_used + p_records,
      requests_count = requests_count + 1
  WHERE user_id = p_user_id
    AND date = p_date
    AND records_used + p_records <= p_limit
  RETURNING records_used INTO v_new;

  IF v_new IS NULL THEN
    -- Limit would be exceeded — read current usage for error message
    SELECT records_used INTO v_current
    FROM daily_usage
    WHERE user_id = p_user_id AND date = p_date;

    RETURN json_build_object('allowed', false, 'records_used', COALESCE(v_current, 0));
  END IF;

  RETURN json_build_object('allowed', true, 'records_used', v_new);
END;
$$;

-- Release reserved records when generation fails
CREATE OR REPLACE FUNCTION release_daily_usage(
  p_user_id TEXT,
  p_date DATE,
  p_records INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE daily_usage
  SET records_used = GREATEST(0, records_used - p_records),
      requests_count = GREATEST(0, requests_count - 1)
  WHERE user_id = p_user_id
    AND date = p_date;
END;
$$;
