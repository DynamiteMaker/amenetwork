# AME Marketing — Next.js Project

## Overview

Corporate website for AME Marketing, a strategic marketing agency bridging Vietnamese and Japanese brands.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + custom design system
- **UI Components:** shadcn/ui (Radix UI)
- **i18n:** next-intl (EN, VI, JA, ZH)
- **Auth:** Supabase Auth (`@supabase/ssr`)
- **CMS:** TipTap editor + Supabase
- **Testing:** Vitest + Testing Library
- **Package Manager:** Bun

## Project Structure

```
app/
├── [locale]/          # next-intl locale routing
│   ├── layout.tsx     # Locale layout (html, body, fonts)
│   └── page.tsx       # Home page
├── layout.tsx         # Root layout (metadata only)
└── globals.css        # Design system tokens + components

components/
├── ui/                # shadcn/ui components
└── ...                # Custom components (Phase 3+)

i18n/
├── routing.ts         # Locale config + navigation helpers
└── request.ts         # Server-side locale resolution

messages/              # next-intl JSON translations
├── en.json, vi.json, ja.json, zh.json

lib/                   # Utilities
└── utils.ts           # cn() helper
```

## Getting Started

```bash
bun install
bun dev              # http://localhost:3000
bun run build        # Production build
bun run test         # Run tests
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
```
