-- Two tables behind the library upgrade. Run once in the Supabase SQL editor.
--
-- 1. tone_likes  : "N players like this tone" on the library pages
-- 2. feedback    : the /feedback form, read in the app at /admin/feedback
--
-- tone_likes is deliberately separate from tone_feedback. They read as the same
-- click but they answer different questions: tone_feedback is "did these
-- settings work on your rig", which is a verification signal and is the number
-- worth putting near the settings. A like is taste, and mixing the two would
-- quietly turn a verification count into a popularity count.


-- ---------------------------------------------------------------
-- tone_likes
--
-- song_key is the same lowercased "artist|title" key that tone_feedback uses,
-- computed in lib/tone-feedback.ts, so a like on a library page and a like on a
-- match result for the same recording land in one bucket.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tone_likes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  song_key   TEXT NOT NULL,
  song_title TEXT NOT NULL,
  artist     TEXT NOT NULL,
  slug       TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- One like per player per recording. A counter anyone can raise by tapping
-- twice is not a number worth printing on the page.
CREATE UNIQUE INDEX IF NOT EXISTS tone_likes_user_song_idx
  ON public.tone_likes (user_id, song_key);

-- Every read is either "count for this song" or "counts for these songs".
CREATE INDEX IF NOT EXISTS tone_likes_song_idx
  ON public.tone_likes (song_key);

-- All writes go through the service role in app/api/tone-likes, so RLS on with
-- no policy is what closes anon and authenticated access.
ALTER TABLE public.tone_likes ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------
-- feedback
--
-- This table IS the inbox. There is no notification mail, deliberately: a mail
-- provider is another key to keep alive and another thing that can quietly stop
-- delivering, and the row is the part that actually matters. It is read at
-- /admin/feedback, and `status` is what moves a message out of the queue.
--
-- user_id is nullable because the form is open to signed-out visitors.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('bug', 'feature', 'improvement', 'praise', 'other')),
  message    TEXT NOT NULL,
  email      TEXT,
  page_path  TEXT,
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'actioned', 'spam')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- The inbox view: newest first, optionally filtered to what has not been read.
CREATE INDEX IF NOT EXISTS feedback_created_idx
  ON public.feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_status_idx
  ON public.feedback (status);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
