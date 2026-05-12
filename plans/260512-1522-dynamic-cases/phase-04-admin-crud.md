---
phase: 4
name: Admin CRUD
status: pending
priority: high
depends_on: [phase-01-database-schema]
---

# Phase 4: Admin CRUD

Build admin interface for managing cases — list, create, edit, delete with multi-locale tabs.

## Overview
- Cases list page: table with thumbnail, client, title, tag, status, featured
- Create/edit form: shared fields + 4 locale tabs for translations
- Image upload via Supabase Storage (reuse existing image-upload component)
- Actions: save draft, publish, delete, toggle featured
- Reuse existing admin patterns from posts

## Files to Create
- app/[locale]/admin/(dashboard)/cases/page.tsx — list
- app/[locale]/admin/(dashboard)/cases/new/page.tsx — create form
- app/[locale]/admin/(dashboard)/cases/[id]/edit/page.tsx — edit form
- components/admin/cases-list.tsx — table component
- components/admin/case-editor.tsx — form with locale tabs

## Files to Modify
- app/[locale]/admin/(dashboard)/actions.ts — add case CRUD actions
- components/admin/admin-sidebar.tsx — add Cases menu item

## Implementation Steps
1. Add case CRUD server actions (saveCase, deleteCase, toggleFeatured)
2. Create cases list page with table
3. Create case editor component with locale tabs
4. Create new/edit pages wrapping editor
5. Add sidebar navigation entry
6. Add revalidatePath calls on save/delete

## Success Criteria
- Admin can create/edit/delete cases
- Locale tabs switch content for each language
- Image upload works
- Publish/unpublish toggles status
- Featured flag works
- revalidatePath clears ISR cache
