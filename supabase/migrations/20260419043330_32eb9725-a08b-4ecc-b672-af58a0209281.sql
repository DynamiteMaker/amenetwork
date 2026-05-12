-- Remove the broad public SELECT on storage.objects for the media bucket.
-- Public buckets serve files via the public CDN URL without needing a SELECT policy,
-- so dropping this prevents anonymous users from listing all objects in the bucket
-- while keeping direct file URLs working.
DROP POLICY IF EXISTS "Media is publicly accessible" ON storage.objects;

-- Allow admins and editors to list/read media objects via the API (e.g. media library).
CREATE POLICY "Editors can view media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'media'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);