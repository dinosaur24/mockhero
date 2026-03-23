-- Add mode column to usage_logs to track prompt vs schema vs template requests
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS mode text DEFAULT 'schema';
