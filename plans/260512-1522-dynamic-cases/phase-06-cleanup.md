---
phase: 6
name: Cleanup
status: pending
priority: low
depends_on: [phase-03-public-pages, phase-04-admin-crud, phase-05-homepage-featured]
---

# Phase 6: Cleanup

Remove hardcoded case data from i18n files, verify build.

## Files to Modify
- messages/en.json — remove cases.items, cases.vinfast, etc.
- messages/vi.json — same
- messages/ja.json — same
- messages/zh.json — same
- Keep: cases.eyebrow, cases.title, cases.titleAccent, cases.sub, cases.filters (UI labels)

## Implementation Steps
1. Remove case content from all 4 locale JSON files (keep UI labels)
2. Verify build passes
3. Test all pages render correctly
4. Test admin CRUD end-to-end

## Success Criteria
- Build passes with no errors
- No hardcoded case data in i18n files
- All public pages render from DB
- Admin CRUD fully functional
