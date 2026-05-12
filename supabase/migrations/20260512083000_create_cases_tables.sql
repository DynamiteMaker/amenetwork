
-- Cases: shared fields (locale-agnostic)
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  tag TEXT NOT NULL DEFAULT 'branding' CHECK (tag IN ('branding', 'digital', 'growth', 'healthcare', 'apac')),
  thumbnail TEXT,
  hero_image TEXT,
  metric_value TEXT,
  metric_label TEXT,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  solution TEXT[] NOT NULL DEFAULT '{}',
  testimonial JSONB,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cases_status ON public.cases (status, sort_order);
CREATE INDEX idx_cases_slug ON public.cases (slug);
CREATE INDEX idx_cases_featured ON public.cases (is_featured) WHERE is_featured = true AND status = 'published';

-- Case translations: per-locale text content
CREATE TABLE public.case_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'vi', 'ja', 'zh')),
  client TEXT NOT NULL,
  title TEXT NOT NULL,
  context TEXT NOT NULL DEFAULT '',
  challenge TEXT NOT NULL DEFAULT '',
  UNIQUE (case_id, locale)
);

CREATE INDEX idx_case_translations_case ON public.case_translations (case_id);
CREATE INDEX idx_case_translations_locale ON public.case_translations (locale);

-- RLS: cases
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published cases"
  ON public.cases FOR SELECT
  USING (status = 'published');

CREATE POLICY "Editors can view all cases"
  ON public.cases FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Editors can insert cases"
  ON public.cases FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Editors can update cases"
  ON public.cases FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins can delete cases"
  ON public.cases FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS: case_translations
ALTER TABLE public.case_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view case translations for published cases"
  ON public.case_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = case_translations.case_id AND cases.status = 'published'
    )
  );

CREATE POLICY "Editors can view all case translations"
  ON public.case_translations FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Editors can insert case translations"
  ON public.case_translations FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Editors can update case translations"
  ON public.case_translations FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admins can delete case translations"
  ON public.case_translations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update trigger
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
