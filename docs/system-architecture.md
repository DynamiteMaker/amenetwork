# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Browser (Next.js 16 App Router)                            │
│  ├── Server Components (default)                            │
│  ├── Client Components (interactive UI)                     │
│  └── Server Actions (mutations)                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Middleware Layer                       │
├─────────────────────────────────────────────────────────────┤
│  middleware.ts                                              │
│  ├── next-intl i18n routing (4 locales)                     │
│  ├── Supabase session refresh                               │
│  └── Admin route protection                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  lib/                                                       │
│  ├── auth.ts (getCurrentUser, getUserRole, requireAdmin)   │
│  ├── supabase/server.ts (Server Component client)           │
│  ├── supabase/client.ts (Browser client)                    │
│  └── supabase/admin.ts (Service role client)                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL)                                      │
│  ├── auth.users (Supabase Auth)                             │
│  ├── user_roles (app-specific roles)                        │
│  ├── posts (blog content)                                   │
│  └── contact_submissions (form data)                        │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### Login Sequence

```
User                  Next.js                  Supabase
 │                      │                         │
 ├─ POST /admin/login ──┤                         │
 │    (credentials)     │                         │
 │                      ├─ signInWithPassword ────┤
 │                      │                         │
 │                      │─ session token ─────────┤
 │                      │                         │
 │←─ Set cookie ────────┤                         │
 │                      │                         │
 │←─ Redirect /admin ───┤                         │
 │                      │                         │
 ├─ GET /admin ─────────┤                         │
 │    (with cookie)     │                         │
 │                      ├─ getUser() ─────────────┤
 │                      │  (validate session)     │
 │                      │                         │
 │←─ Admin dashboard ───┤                         │
```

### Middleware Auth Check

Every request to `/admin/*` routes:

1. **next-intl middleware** resolves locale from URL/path
2. **Supabase session refresh** updates cookie if needed
3. **Auth check**: If no user and not `/admin/login`, redirect to login

```typescript
// middleware.ts
const { data: { user } } = await supabase.auth.getUser();
if (pathname.includes("/admin") && !pathname.includes("/admin/login") && !user) {
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
```

## Database Schema

### ER Diagram

```
┌─────────────────┐       ┌─────────────────┐
│  auth.users     │       │  user_roles     │
│  (Supabase)     │───────│  (public)       │
├─────────────────┤ 1:1  ├─────────────────┤
│ id (uuid)       │───────│ user_id (uuid)  │
│ email           │       │ role (enum)     │
│ encrypted_pass  │       │ created_at      │
│ last_sign_in    │       └─────────────────┘
└─────────────────┘
                            │
                            │ 1:N
                            ▼
                    ┌─────────────────┐
                    │     posts       │
                    ├─────────────────┤
                    │ id (uuid)       │
                    │ slug (text)     │
                    │ title (text)    │
                    │ content (text)  │
                    │ author_id ──────┘
                    │ status (enum)   │
                    │ category        │
                    │ tags[]          │
                    │ featured_image  │
                    │ published_at    │
                    │ created_at      │
                    └─────────────────┘

                    ┌─────────────────────────┐
                    │ contact_submissions      │
                    ├─────────────────────────┤
                    │ id (uuid)                │
                    │ full_name (text)         │
                    │ email (text)             │
                    │ phone (text)             │
                    │ company (text)           │
                    │ message (text)           │
                    │ created_at (timestamp)   │
                    └─────────────────────────┘
```

### Table Details

**user_roles** (Authorization)
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own role
CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all
CREATE POLICY "Service role full access"
  ON user_roles FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
```

**posts** (Content Management)
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,  -- TipTap JSON
  excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft | published | archived
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  featured_image TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  meta_title TEXT,
  meta_description TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);
```

**contact_submissions** (Contact Form)
```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Client Architecture

### Server Components (Default)

```typescript
// app/[locale]/admin/page.tsx
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  const { user, authorized } = await requireAdmin();
  if (!authorized) redirect("/admin/login");

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminDashboard posts={posts} user={user} />;
}
```

**Benefits:**
- Data fetching on server (no client-side JS)
- Direct database access (no API routes needed)
- Automatic auth checks via middleware

### Client Components (Interactive UI)

```typescript
// components/logout-button.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

**Use cases:**
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, geolocation)
- Realtime subscriptions
- Form state management

### Server Actions (Mutations)

```typescript
// app/[locale]/admin/login/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) throw new Error(error.message);
  redirect("/admin");
}
```

**Security:**
- Authenticated before execution
- CSRF protection built-in
- No API routes needed

## Internationalization

### Locale Routing

```
/                    → Redirects to /en (default locale)
/en/about            → English about page
/vi/gioi-thieu       → Vietnamese about page
/ja/about            → Japanese about page
/zh/guanyu           → Chinese about page
```

### Implementation

```typescript
// i18n/routing.ts
export const routing = {
  locales: ["en", "vi", "ja", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed",
};

// middleware.ts
const intlMiddleware = createIntlMiddleware(routing);
```

### Translation Usage

```typescript
// Server Component
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  return <h1>{t("title")}</h1>;
}

// Client Component
import { useTranslations } from "next-intl";

export function Welcome() {
  const t = useTranslations("HomePage");
  return <p>{t("subtitle")}</p>;
}
```

## Security Architecture

### Authentication Layers

1. **Middleware**: Route-level protection (redirect unauthenticated)
2. **Server Components**: Role-based access control via `requireAdmin()`
3. **Server Actions**: Auth checks before mutations
4. **Row Level Security**: Database-level access control

### Authorization Model

```
Role: admin  → Full access (users, posts, settings)
Role: editor → Post management only
Role: user   → Public content only
```

### API Security

```typescript
// lib/supabase/admin.ts - Service role (bypasses RLS)
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // Never expose to client
  );
}
```

**Rules:**
- Service role key only in server code
- Never commit `.env` files
- Use RLS policies for all tables
- Validate user input before queries

## Performance Considerations

### Server-Side Rendering

- **Static Generation**: Use for public pages (blog posts, about)
- **Server Components**: Reduce client bundle size
- **Streaming**: Progressive page rendering with `<Suspense>`

### Database Optimization

- **Indexes**: `posts.status`, `posts.published_at`, `posts.slug`
- **Connection Pooling**: Managed by Supabase
- **Query Optimization**: Select only needed columns

### Caching Strategy

- **Next.js cache**: Automatic for Server Components
- **Supabase cache**: Session tokens cached in cookies
- **Static assets**: CDN via Vercel (deployment)

## Deployment Architecture

### Environment Variables

```env
# Production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # Server-only
NEXT_PUBLIC_SITE_URL=https://amenext.com
```

### Hosting

- **App**: Vercel (Next.js optimized)
- **Database**: Supabase Cloud (PostgreSQL)
- **Storage**: Supabase Storage (images, files)
- **CDN**: Vercel Edge Network

### CI/CD Pipeline

```
Git Push → GitHub Actions → Tests → Build → Deploy to Vercel
                                      │
                                      ↓
                              Supabase Migrations
```

## Monitoring & Observability

### Logging

- **Next.js**: Built-in request logging
- **Supabase**: Dashboard logs (auth, database, storage)
- **Errors**: Server Components error boundaries

### Analytics

- **Page views**: Next.js analytics (Vercel)
- **User sessions**: Supabase auth logs
- **Database queries**: Supabase query stats

## Future Architecture Considerations

### Scalability

- **Edge Functions**: For geo-specific content delivery
- **Database Replication**: Multi-region read replicas
- **CDN Caching**: Aggressive caching for static content

### Features

- **Realtime**: Supabase realtime for live collaboration
- **Webhooks**: Supabase webhooks for external integrations
- **Storage**: Supabase Storage for file uploads
- **Functions**: Supabase Edge Functions for background jobs
