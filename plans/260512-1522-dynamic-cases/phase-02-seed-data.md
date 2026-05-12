---
phase: 2
name: Seed Data
status: pending
priority: high
depends_on: [phase-01-database-schema]
---

# Phase 2: Seed Data

Migrate 9 existing cases from i18n JSON message files into the database.

## Overview
- Read case data from messages/en.json (and vi/ja/zh)
- Insert into cases + case_translations tables
- Copy static images to Supabase Storage (or keep references)

## Implementation Steps
1. Create seed script at scripts/seed-cases.ts
2. Parse all 4 locale JSON files for case data
3. Insert case records with shared fields
4. Insert translation records per locale
5. Verify data integrity

## Cases to Migrate
vinfast, bizfly, clb-ban-sung, honya, an-dien, shinbi, koolsoft, homegy, csm-hospital

## Success Criteria
- All 9 cases inserted with 4 locale translations each
- Data matches current static content exactly
