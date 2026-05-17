# Kleo — CLAUDE.md

Ο Kleo είναι ο προσωπικός βοηθός του Tommy. Monorepo: Next.js 14 (web) + Expo 51 (mobile) + Supabase + Gemini.

## Coding Rules

**TypeScript:** strict mode, μηδέν `any`, όλα τα types από `@kleo/shared`

**Supabase:**
- Server client σε RSC/API routes (`lib/supabase/server.ts`)
- Browser client σε Client Components (`lib/supabase/client.ts`)
- Service role ΜΟΝΟ σε Edge Functions
- RLS ποτέ δεν παρακάμπτεται

**AI:** ΜΟΝΟ μέσω `lib/gemini/client.ts`, πάντα `buildUserContext()`, πάντα try/catch

**UX:**
- Απλότητα πάνω από όλα
- Quick Capture floating button παντού
- Ελληνικά παντού
- Dark mode default (`#141E2E` bg, `#1E2D42` elevated)
- Coral: `#E8523A`, Teal: `#2BB8B8`, Muted: `#9AA5B8`

**Error pattern:**
```ts
try {
  const result = await operation()
  return NextResponse.json({ data: result })
} catch (error) {
  console.error('[route]:', error)
  return NextResponse.json({ error: 'Κάτι πήγε στραβά' }, { status: 500 })
}
```

**Naming:** files kebab-case, components PascalCase, functions camelCase, DB snake_case

**No comments** unless the WHY is non-obvious.

## Commands

```bash
pnpm --filter web dev        # Web dev server
pnpm --filter mobile start   # Mobile dev server
supabase db push             # Apply migrations
```

## Stack

| Layer | Tool |
|---|---|
| Web | Next.js 14 App Router |
| Mobile | Expo SDK 51 |
| Backend | Supabase (Postgres + Auth + Realtime) |
| AI | Google Gemini 2.0 Flash |
| State | Zustand (web) |
| Offline | Expo SQLite |
| Monorepo | Turborepo + pnpm |
