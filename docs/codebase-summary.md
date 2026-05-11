# Codebase Summary

## Project Overview

AME Marketing corporate website built with Next.js 16, Supabase auth/database, and next-intl for internationalization.

## Architecture

### Authentication Flow

1. **Middleware** (`middleware.ts`):
   - Combines next-intl i18n middleware with Supabase auth
   - Refreshes session on every request
   - Protects `/admin/*` routes (redirects to `/admin/login` if unauthenticated)

2. **Login Flow**:
   - User submits credentials to `app/[locale]/admin/login/actions.ts`
   - Server Action calls `supabase.auth.signInWithPassword()`
   - On success, redirects to `/admin`
   - Session maintained via Supabase cookies

3. **Auth Helpers** (`lib/auth.ts`):
   - `getCurrentUser()`: Returns authenticated user from session
   - `getUserRole(userId)`: Queries `user_roles` table for role
   - `requireAdmin()`: Checks user + role, returns authorization status

### Database Schema

**Supabase PostgreSQL** with following tables:

- **user_roles**: `{ id, user_id, role, created_at }`
  - Roles: `admin | editor | user` (enum: `app_role`)
  - One-to-one with `auth.users`

- **posts**: Blog posts with TipTap content
  - Fields: `id, slug, title, content, excerpt, status, category, tags, featured_image, is_featured, meta_title, meta_description, author_id, published_at, created_at, updated_at`

- **contact_submissions**: Contact form submissions
  - Fields: `id, full_name, email, phone, company, message, created_at`

### Client Architecture

**Server Components** (default):
- Use `@/lib/supabase/server` for data fetching
- Use `@/lib/auth` for auth checks
- Direct database queries via Supabase client

**Client Components** (when needed):
- Use `@/lib/supabase/client` for auth state
- Browser-based Supabase client with realtime support

**Server Actions**:
- Use `@/lib/supabase/server` for mutations
- Auth checks before database operations
- Form validation and error handling

## Key Dependencies

### Core
- `next@16`: App Router, Turbopack, Server Components
- `@supabase/ssr`: Server-side Supabase auth
- `next-intl`: i18n routing + translations (4 locales)

### Database
- `@supabase/supabase-js`: Admin client
- Generated types in `lib/supabase/types.ts` from Supabase CLI

### UI
- `tailwindcss@v4`: Utility-first styling
- `@radix-ui/*`: Unstyled component primitives
- `clsx` + `tailwind-merge`: `cn()` utility for className merging

## Development Workflow

### Local Development
```bash
bun install              # Install dependencies
bun dev                  # Start dev server (http://localhost:3000)
bun run test            # Run Vitest tests
bun run build           # Production build
```

### Database Management
```bash
supabase init           # Initialize local Supabase
supabase start          # Start local Supabase instance
supabase db diff        # Generate migrations
supabase db push        # Push schema changes
supabase gen types      # Regenerate TypeScript types
```

## Current Implementation Status

### Phase 1: Project Setup ✅
- Next.js 16 with Turbopack
- Tailwind CSS v4 + custom design system
- shadcn/ui components
- next-intl routing (EN, VI, JA, ZH)

### Phase 2: Supabase & Auth ✅
- Supabase project setup
- Database schema (user_roles, posts, contact_submissions)
- Auth integration (server, client, admin clients)
- Middleware auth protection
- Admin login page + server actions
- Auth helper functions

### Phase 3: Admin Dashboard (Pending)
- Admin dashboard layout
- Post CRUD with TipTap editor
- File uploads for featured images
- Contact form submissions view

### Phase 4: Public Pages (Pending)
- Blog listing + detail pages
- Contact form
- SEO optimization

## File Structure Highlights

```
lib/
├── auth.ts              # getCurrentUser, getUserRole, requireAdmin
├── supabase/
│   ├── server.ts        # Server Component client (cookies-based)
│   ├── client.ts        # Browser client (localStorage-based)
│   ├── admin.ts         # Service role client (bypasses RLS)
│   └── types.ts         # Generated Database schema types
└── utils.ts             # cn() className utility

app/
├── [locale]/
│   ├── admin/
│   │   └── login/
│   │       ├── page.tsx      # Login form
│   │       └── actions.ts    # login/logout server actions
│   ├── layout.tsx            # Locale layout
│   └── page.tsx              # Home page
└── globals.css               # Design system tokens

middleware.ts                 # i18n + auth middleware
```

## Security Considerations

- **Admin routes**: Protected by middleware + `requireAdmin()` checks
- **Service role key**: Only used in `lib/supabase/admin.ts` for privileged operations
- **Row Level Security**: Enabled in Supabase for `user_roles` and `posts` tables
- **Server Actions**: Authenticated before database mutations
- **CSRF protection**: Built into Next.js Server Actions

## Performance Optimizations

- **Turbopack**: Fast refresh for development
- **Server Components**: Reduce client-side JavaScript
- **Middleware**: Single-pass i18n + auth handling
- **Supabase connection pooling**: Managed by Supabase cloud
