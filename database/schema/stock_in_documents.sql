CREATE TABLE IF NOT EXISTS stock_in_documents (
  id BIGSERIAL PRIMARY KEY,
  stock_in_reference TEXT NOT NULL,
  original_name TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS stock_in_documents_reference_idx
  ON stock_in_documents (stock_in_reference, created_at DESC);