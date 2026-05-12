---
name: dynamic-cases
status: completed
created: 2026-05-12
---

# Plan: Dynamic Cases with Admin Management

Convert cases from static i18n content to Supabase-backed dynamic content with full admin CRUD, multi-language support, and homepage featured flag.

## Phases

| # | Phase | Status | Description |
|---|-------|--------|-------------|
| 1 | Database Schema | completed | Migration: cases + case_translations tables, RLS policies, types |
| 2 | Seed Data | completed | Script: migrate 9 existing cases from i18n JSON to database |
| 3 | Public Pages | completed | Update /cases listing + /cases/[slug] detail to fetch from DB |
| 4 | Admin CRUD | completed | Cases list, create/edit forms with locale tabs, image upload |
| 5 | Homepage Featured | completed | Update featured-case-section to query DB |
| 6 | Cleanup | completed | Verify build, keep i18n data as fallback until seeded |

## Key Decisions
- 2-table architecture: `cases` (shared) + `case_translations` (per-locale)
- Images via Supabase Storage (same as blog)
- `is_featured` boolean flag on cases table
- `results` as JSONB, `solution` as text array, `testimonial` as nullable JSONB
- ISR with revalidatePath on publish/edit
- Fallback to EN translation when locale missing
