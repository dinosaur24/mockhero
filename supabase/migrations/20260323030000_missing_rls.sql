-- Add RLS to tables that were missing it

-- bulk_jobs: only accessible via service role (API routes)
ALTER TABLE IF EXISTS bulk_jobs ENABLE ROW LEVEL SECURITY;

-- webhooks: only accessible via service role (API routes)
ALTER TABLE IF EXISTS webhooks ENABLE ROW LEVEL SECURITY;

-- webhook_deliveries: only accessible via service role
ALTER TABLE IF EXISTS webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- system_settings: only accessible via service role (admin)
ALTER TABLE IF EXISTS system_settings ENABLE ROW LEVEL SECURITY;
