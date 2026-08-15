-- Lets the feedback table accept kind = 'gear'. Run once in the Supabase SQL
-- editor. Safe to run again.
--
-- Why this exists as its own file: the `feedback` table was created by an
-- earlier version of add_tone_likes_and_feedback.sql whose CHECK did not list
-- 'gear'. CREATE TABLE IF NOT EXISTS does nothing to a table that already
-- exists, so re-running that file does not widen the constraint on its own,
-- and the gear form kept failing on 23514 while every other kind saved fine.
--
-- Verified broken before this ran: POST /api/feedback with kind "gear" answered
-- 500 "That didn't send. Please try again." while kind "bug" and "feature"
-- both returned 200. The gear request form is the only thing that posts 'gear',
-- so it was the whole feature failing, not an edge case.

ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_kind_check;

ALTER TABLE public.feedback ADD CONSTRAINT feedback_kind_check
  CHECK (kind IN ('bug', 'gear', 'feature', 'improvement', 'praise', 'other'));
