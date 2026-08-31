-- Blog posts become multilingual.
-- Locale-agnostic fields stay on `posts` (slug, status, type, category, tags,
-- featured_image, is_featured, published_at); translated text moves into
-- `post_translations`, mirroring the `cases` / `case_translations` split.
-- A post is only visible in a locale that has a translation row (no fallback).

CREATE TABLE public.post_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'vi', 'ja', 'zh')),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, locale)
);

CREATE INDEX idx_post_translations_post ON public.post_translations (post_id);
CREATE INDEX idx_post_translations_locale ON public.post_translations (locale);

ALTER TABLE public.post_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view translations of published posts"
  ON public.post_translations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_translations.post_id
        AND posts.status = 'published'
    )
  );

CREATE POLICY "Editors can view all post translations"
  ON public.post_translations
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Editors can insert post translations"
  ON public.post_translations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Editors can update post translations"
  ON public.post_translations
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Editors can delete post translations"
  ON public.post_translations
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_post_translations_updated_at
  BEFORE UPDATE ON public.post_translations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill: the two articles written in Vietnamese become `vi`, the remaining
-- seed articles are English.
INSERT INTO public.post_translations (post_id, locale, title, excerpt, content, meta_title, meta_description)
SELECT
  id,
  CASE
    WHEN slug IN (
      'buc-tranh-kinh-te-viet-nam-2026-va-co-hoi-cho-nganh-marketing',
      'nguoi-tieu-dung-viet-nam-trong-nen-kinh-te-so-hanh-trinh-mua-hang-da-thay-doi-ra'
    ) THEN 'vi'
    ELSE 'en'
  END,
  title,
  COALESCE(excerpt, ''),
  COALESCE(content, ''),
  meta_title,
  meta_description
FROM public.posts;

ALTER TABLE public.posts
  DROP COLUMN title,
  DROP COLUMN excerpt,
  DROP COLUMN content,
  DROP COLUMN meta_title,
  DROP COLUMN meta_description;
