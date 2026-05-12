---
phase: 3
name: Public Pages
status: pending
priority: high
depends_on: [phase-01-database-schema, phase-02-seed-data]
---

# Phase 3: Public Pages

Update cases listing and detail pages to fetch from Supabase instead of i18n.

## Overview
- /cases listing page: fetch published cases with current locale translation
- /cases/[slug] detail page: fetch single case with translation
- ISR with revalidate = 3600
- Client-side tag filtering (keep existing UX)
- Fallback to EN when translation missing

## Files to Modify
- app/[locale]/(marketing)/cases/page.tsx
- app/[locale]/(marketing)/cases/[slug]/page.tsx
- app/[locale]/(marketing)/cases/cases-client.tsx

## Implementation Steps
1. Update cases listing to query Supabase
2. Update case detail page to fetch by slug
3. Update cases-client.tsx to work with DB data structure
4. Add generateStaticParams from DB slugs
5. Implement EN fallback for missing translations

## Success Criteria
- /cases shows all published cases
- /cases/[slug] shows full detail
- Tag filtering works
- ISR cache revalidates on admin changes
