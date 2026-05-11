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
- **Database:** Supabase PostgreSQL (user_roles, posts, contact_submissions)
- **CMS:** TipTap editor + Supabase
- **Testing:** Vitest + Testing Library
- **Package Manager:** Bun

## Project Structure

```
app/
├── [locale]/          # next-intl locale routing
│   ├── layout.tsx     # Locale layout (html, body, fonts)
│   ├── page.tsx       # Home page
│   └── admin/         # Protected admin routes
│       └── login/     # Admin login page + server actions
├── layout.tsx         # Root layout (metadata only)
└── globals.css        # Design system tokens + components

components/
├── ui/                # shadcn/ui components
└── ...                # Custom components (Phase 3+)

i18n/
├── routing.ts         # Locale config + navigation helpers
└── request.ts         # Server-side locale resolution

lib/
├── auth.ts            # Auth helpers (getCurrentUser, getUserRole, requireAdmin)
├── supabase/          # Supabase client configurations
│   ├── server.ts      # Server client (Server Components)
│   ├── client.ts      # Browser client (Client Components)
│   ├── admin.ts       # Admin client (service role)
│   └── types.ts       # Database schema types
└── utils.ts           # cn() helper

messages/              # next-intl JSON translations
├── en.json, vi.json, ja.json, zh.json

middleware.ts          # next-intl + Supabase auth middleware
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
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_SITE_URL=
```
