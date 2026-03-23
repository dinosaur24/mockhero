-- Add optional name column to api_keys for user-defined labels
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS name VARCHAR(100);
