-- Pedals and multi-FX units live in user_equipment alongside rigs.
-- Run this once in the Supabase SQL editor.
--
-- type = 'rig'     -> guitar + amp preset (guitar_model / amp_model / pickup_type)
-- type = 'pedal'   -> single stompbox (brand / name / category / notes)
-- type = 'multifx' -> multi-FX processor (brand / name / notes)

ALTER TABLE public.user_equipment
  ADD COLUMN IF NOT EXISTS type     TEXT NOT NULL DEFAULT 'rig',
  ADD COLUMN IF NOT EXISTS brand    TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS notes    TEXT;

-- Rows created before this migration are all guitar+amp rigs.
UPDATE public.user_equipment SET type = 'rig' WHERE type IS NULL;

ALTER TABLE public.user_equipment
  DROP CONSTRAINT IF EXISTS user_equipment_type_check;

ALTER TABLE public.user_equipment
  ADD CONSTRAINT user_equipment_type_check
  CHECK (type IN ('rig', 'pedal', 'multifx'));

CREATE INDEX IF NOT EXISTS user_equipment_user_type_idx
  ON public.user_equipment (user_id, type);
