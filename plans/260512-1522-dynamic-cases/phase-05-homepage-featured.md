---
phase: 5
name: Homepage Featured
status: pending
priority: medium
depends_on: [phase-01-database-schema, phase-03-public-pages]
---

# Phase 5: Homepage Featured

Update featured-case-section to query the featured case from database.

## Overview
- Query cases WHERE is_featured=true AND status=published
- Fetch translation for current locale
- Fall back to most recent published case if none featured
- Render with existing component design

## Files to Modify
- components/home/featured-case-section.tsx

## Implementation Steps
1. Convert to async server component (or pass data as props from page)
2. Query featured case from Supabase
3. Map DB fields to existing component props
4. Handle empty state (no featured case)

## Success Criteria
- Homepage shows featured case from DB
- Falls back gracefully if no featured case
- Works for all locales
