# Code Standards

## File Naming

- Components: kebab-case (e.g., `site-header.tsx`, `cta-band.tsx`)
- Hooks: kebab-case with `use-` prefix (e.g., `use-mobile.tsx`)
- Utilities: kebab-case (e.g., `slug.ts`)
- Test files: `*.test.ts` or `*.test.tsx`

## Component Patterns

- **Server Components** by default (no `'use client'` unless needed)
- Client boundary only when: state, effects, event handlers, browser APIs
- Keep client components small — push interactivity to leaf components

## Import Conventions

- Use `@/` path alias for imports
- `import { cn } from "@/lib/utils"` for className merging
- next-intl: `import { useTranslations } from "next-intl"` for client, `getTranslations` for server

## Authentication & Database Access

### Supabase Client Selection

- **Server Components:** Use `createClient()` from `@/lib/supabase/server`
  ```ts
  import { createClient } from "@/lib/supabase/server";
  const supabase = await createClient();
  ```

- **Client Components:** Use `createClient()` from `@/lib/supabase/client`
  ```ts
  import { createClient } from "@/lib/supabase/client";
  const supabase = createClient();
  ```

- **Admin Operations:** Use `createAdminClient()` from `@/lib/supabase/admin`
  ```ts
  import { createAdminClient } from "@/lib/supabase/admin";
  const supabase = createAdminClient();
  ```

### Auth Helper Functions

Use helpers from `@/lib/auth` for common auth operations:

```ts
import { getCurrentUser, getUserRole, requireAdmin } from "@/lib/auth";

// Get current authenticated user
const user = await getCurrentUser();

// Get user role from user_roles table
const role = await getUserRole(userId); // "admin" | "editor" | "user"

// Protect admin routes (returns user, role, authorized)
const { user, role, authorized } = await requireAdmin();
if (!authorized) {
  redirect("/admin/login");
}
```

### Route Protection

- Admin routes protected by `middleware.ts` (redirects unauthenticated users to `/admin/login`)
- Server Components should call `requireAdmin()` for role-based access control
- Server Actions should verify user session before mutations

## Design System

- All colors defined as CSS custom properties in `globals.css`
- Use Tailwind utility classes with custom color tokens (e.g., `text-brand`, `bg-peach-soft`)
- Custom component classes: `.btn-primary-soft`, `.card-soft`, `.eyebrow`, `.display-xl`, etc.
- Fonts: `--font-display` (Fraunces) for headings, `--font-body` (Manrope) for body text

## Testing

- Vitest + Testing Library
- Test files colocated or in `tests/` directory
- Run before every commit: `bun run test`
