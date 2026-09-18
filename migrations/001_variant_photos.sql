-- Apply only after a verified backup of the existing Neon database.
-- This is an additive migration; it does not delete products, variants, or orders.
BEGIN;
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
COMMIT;
