CREATE TABLE bulk_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  request JSONB NOT NULL,
  result JSONB,
  error TEXT,
  records_total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_bulk_jobs_user_id ON bulk_jobs(user_id);
CREATE INDEX idx_bulk_jobs_status ON bulk_jobs(status);
