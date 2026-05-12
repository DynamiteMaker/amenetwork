---
phase: 1
name: Database Schema
status: pending
priority: critical
depends_on: []
---

# Phase 1: Database Schema

Create `cases` and `case_translations` tables in Supabase with RLS policies.

## Overview
- Create migration SQL file
- Add TypeScript types to lib/supabase/types.ts
- Enable RLS with admin/editor write, public read

## Requirements
- cases table: shared fields (slug, tag, images, metrics, results, testimonial, status, is_featured)
- case_translations table: per-locale text fields (client, title, context, challenge)
- RLS: authenticated users can CRUD, anonymous can SELECT published only
- Storage: use existing `media` bucket for case images

## Implementation Steps
1. Create migration file in supabase/migrations/
2. Add cases + case_translations types to lib/supabase/types.ts
3. Run migration locally to verify

## Success Criteria
- Migration runs without error
- Types are accurate
- RLS policies tested
