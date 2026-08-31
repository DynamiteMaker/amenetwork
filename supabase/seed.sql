-- Seed data for local development
-- Run with: supabase db reset

-- Demo posts
INSERT INTO public.posts (slug, status, type, is_featured, category, tags, published_at) VALUES
(
  'welcome-to-ame-marketing',
  'published',
  'post',
  true,
  'Company',
  ARRAY['marketing', 'branding', 'vietnam', 'japan'],
  now() - interval '7 days'
),
(
  '5-digital-marketing-trends-2026',
  'published',
  'post',
  false,
  'Digital',
  ARRAY['digital-marketing', 'trends', '2026'],
  now() - interval '3 days'
),
(
  'ame-expands-tokyo-office',
  'published',
  'news',
  false,
  'Company',
  ARRAY['expansion', 'tokyo', 'japan'],
  now() - interval '1 day'
),
(
  'social-media-strategy-guide',
  'draft',
  'post',
  false,
  'Social',
  ARRAY['social-media', 'strategy'],
  NULL
);

-- Demo post translations (English only; a post is invisible in locales it has no translation for)
INSERT INTO public.post_translations (post_id, locale, title, excerpt, content)
SELECT
  id,
  'en',
  'Welcome to AME Marketing',
  'We are a strategic marketing agency bridging Vietnamese and Japanese brands.',
  '<h2>About AME Marketing</h2><p>AME Marketing is a full-service agency specializing in cross-cultural brand strategy between Vietnam and Japan. We help businesses expand their reach and connect with new audiences.</p><p>Our team combines deep local market knowledge with international best practices to deliver measurable results.</p>'
FROM public.posts WHERE slug = 'welcome-to-ame-marketing';

INSERT INTO public.post_translations (post_id, locale, title, excerpt, content)
SELECT
  id,
  'en',
  '5 Digital Marketing Trends for 2026',
  'Stay ahead of the curve with these emerging digital marketing strategies.',
  '<h2>Digital Marketing in 2026</h2><p>The digital landscape continues to evolve rapidly. Here are the top trends to watch:</p><ul><li><strong>AI-Powered Personalization</strong> - Hyper-targeted content delivery</li><li><strong>Short-form Video</strong> - TikTok, Reels, and Shorts dominate</li><li><strong>Voice Search Optimization</strong> - Growing importance of conversational SEO</li><li><strong>Sustainability Marketing</strong> - Consumers demand authentic green initiatives</li><li><strong>Cross-border E-commerce</strong> - Expanding reach across APAC markets</li></ul>'
FROM public.posts WHERE slug = '5-digital-marketing-trends-2026';

INSERT INTO public.post_translations (post_id, locale, title, excerpt, content)
SELECT
  id,
  'en',
  'AME Expands to Tokyo Office',
  'Our new Tokyo office strengthens our Japan-Vietnam bridge capabilities.',
  '<h2>New Tokyo Office</h2><p>AME Marketing is proud to announce the opening of our Tokyo office, marking a significant milestone in our mission to bridge Vietnamese and Japanese brands.</p><p>The new office will serve as our hub for Japanese market entry services and cross-cultural consulting.</p>'
FROM public.posts WHERE slug = 'ame-expands-tokyo-office';

INSERT INTO public.post_translations (post_id, locale, title, excerpt, content)
SELECT
  id,
  'en',
  'Draft: Social Media Strategy Guide',
  'A comprehensive guide to building your social media presence.',
  '<h2>Work in Progress</h2><p>This is a draft post about social media strategy.</p>'
FROM public.posts WHERE slug = 'social-media-strategy-guide';

-- Demo contact submissions
INSERT INTO public.contact_submissions (full_name, email, phone, company, message) VALUES
('Tanaka Yuki', 'tanaka@example.co.jp', '+81-90-1234-5678', 'Tanaka Corp', 'We are interested in your Vietnam market entry services. Can we schedule a consultation?'),
('Nguyen Van A', 'nguyenvana@email.com', NULL, NULL, 'I would like to learn more about your digital marketing packages for small businesses.');
