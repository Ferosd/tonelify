-- Citations for hand-verified original rigs.
-- Run this once in the Supabase SQL editor.
--
-- These columns are the only path to a clickable source link in the product.
-- The tone engine is asked to name its sources but is never allowed to emit a
-- URL, because an invented link that 404s costs more trust than no link. A row
-- here means a person opened the page and stored it, so the link can be shown.
--
-- source_title  -> "Premier Guitar Rig Rundown: Metallica" (shown as the label)
-- source_url    -> the page that was actually checked (optional)
-- source_detail -> one sentence on what it establishes (optional)

ALTER TABLE public.song_gear
  ADD COLUMN IF NOT EXISTS source_title  TEXT,
  ADD COLUMN IF NOT EXISTS source_url    TEXT,
  ADD COLUMN IF NOT EXISTS source_detail TEXT;
