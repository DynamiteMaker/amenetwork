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

## Design System

- All colors defined as CSS custom properties in `globals.css`
- Use Tailwind utility classes with custom color tokens (e.g., `text-brand`, `bg-peach-soft`)
- Custom component classes: `.btn-primary-soft`, `.card-soft`, `.eyebrow`, `.display-xl`, etc.
- Fonts: `--font-display` (Fraunces) for headings, `--font-body` (Manrope) for body text

## Testing

- Vitest + Testing Library
- Test files colocated or in `tests/` directory
- Run before every commit: `bun run test`
