-- Scheduled publishing: posts can sit in a "scheduled" state with a future
-- published_at, and a pg_cron job flips them to "published" once due.
-- RLS already hides anything that is not published, so scheduled posts are
-- invisible to the public (and to post_translations via its parent policy)
-- until the cron job flips the status.

-- 1. Widen the status check.
ALTER TABLE public.posts
  DROP CONSTRAINT posts_status_check;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_status_check
  CHECK (status IN ('draft', 'scheduled', 'published'));

-- Published posts must always carry a publish date so the blog ordering
-- (published_at DESC) stays deterministic.
UPDATE public.posts
  SET published_at = created_at
  WHERE status = 'published' AND published_at IS NULL;

-- 2. Cheap lookup for the cron job: only scheduled rows matter.
CREATE INDEX IF NOT EXISTS idx_posts_scheduled
  ON public.posts (published_at)
  WHERE status = 'scheduled';

-- 3. pg_cron: check every minute and publish whatever is due.
-- The job runs as postgres (table owner), which bypasses RLS by design.
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule('publish-scheduled-posts')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'publish-scheduled-posts');

SELECT cron.schedule(
  'publish-scheduled-posts',
  '* * * * *',
  $cron$
  UPDATE public.posts
  SET status = 'published', updated_at = now()
  WHERE status = 'scheduled' AND published_at <= now()
  $cron$
);
