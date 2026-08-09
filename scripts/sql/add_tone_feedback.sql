-- Did the settings actually work on the player's rig?
-- Run this once in the Supabase SQL editor.
--
-- The tone-match result card already had thumbs up / thumbs down buttons, but
-- the answer only went to an analytics event and was lost. Storing it gives
-- three things off one click: a quality signal for the tone engine, an honest
-- "N players confirmed this" line for the tone pages, and a ranked list of
-- which recordings are worth adding to song_gear by hand.
--
-- song_key is the aggregation key: lowercased "artist|title" with whitespace
-- collapsed, computed in lib/tone-feedback.ts. It is stored rather than joined
-- because a match can be run for a song that has no row in public.songs.

CREATE TABLE IF NOT EXISTS public.tone_feedback (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_key     TEXT NOT NULL,
  song_title   TEXT NOT NULL,
  artist       TEXT NOT NULL,
  verdict      TEXT NOT NULL CHECK (verdict IN ('up', 'down')),
  guitar_model TEXT,
  amp_model    TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- One vote per player per song. Without this, a user who regenerates a tone
-- five times could count as five confirmations, which is exactly the kind of
-- inflated number the review policy on this site exists to avoid. Changing
-- your mind updates the row instead of adding one.
CREATE UNIQUE INDEX IF NOT EXISTS tone_feedback_user_song_idx
  ON public.tone_feedback (user_id, song_key);

-- Aggregation reads always filter by song_key.
CREATE INDEX IF NOT EXISTS tone_feedback_song_idx
  ON public.tone_feedback (song_key);

-- Every write goes through the service role in app/api/tone-feedback, so no
-- policy is needed. RLS on with no policy closes anon and authenticated access.
ALTER TABLE public.tone_feedback ENABLE ROW LEVEL SECURITY;
