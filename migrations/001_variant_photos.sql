-- Run ONCE on the old site's existing PostgreSQL database (including Supabase PostgreSQL).
-- Make a full database backup first. Adds fields only; does not delete existing data.
BEGIN;
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
COMMIT;
