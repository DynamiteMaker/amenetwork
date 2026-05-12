-- Replace the overly permissive WITH CHECK (true) on contact_submissions
-- with field-level validation. Anonymous submissions are still allowed
-- (the contact form needs to work for unauthenticated visitors), but the
-- payload must look like a real contact request.
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

CREATE POLICY "Anyone can submit valid contact form"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  full_name IS NOT NULL
  AND length(btrim(full_name)) BETWEEN 2 AND 120
  AND email IS NOT NULL
  AND length(email) BETWEEN 5 AND 254
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND message IS NOT NULL
  AND length(btrim(message)) BETWEEN 10 AND 5000
  AND (company IS NULL OR length(company) <= 200)
  AND (phone IS NULL OR length(phone) <= 40)
);