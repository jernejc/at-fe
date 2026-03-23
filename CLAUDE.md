# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LookAcross Account Intelligence — a B2B SaaS frontend for tracking buying signals, managing campaigns, and coordinating partner outreach. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

## Commands

```bash
npm run dev        # Start dev server (uses --webpack flag, not Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint (flat config, v9)
npm run format     # Prettier (format all files)
npm run test       # Vitest (single run)
npm run test:watch # Vitest (watch mode)
```

## Architecture

### Auth (dual-layer)

1. **Firebase Auth (client-side)**: Google OAuth + passwordless email link. Client SDK in `lib/auth/firebaseClient.ts`, admin SDK in `lib/auth/firebaseAdmin.ts`.
2. **NextAuth.js (session management)**: JWT strategy via custom Credentials provider. Receives Firebase ID token, verifies server-side with `firebase-admin`, fetches user role from backend `/api/v1/users/me`. Session augmented with `role`, `partner_id`, `partner_name` (see `types/next-auth.d.ts`).

### Proxy (`proxy.ts`)

Auth guard and role-based routing using Next.js 16's [proxy convention](https://nextjs.org/docs/messages/middleware-to-proxy). Exports `proxy` function and `config` matcher. Two roles:

- **pdm** — internal users, full access except `/partner/*`
- **partner** — restricted to `/partner/*` routes only

### API Layer (`lib/api/`)

All API calls go through `fetchAPI<T>()` in `lib/api/core.ts`:

- Injects Firebase Bearer token on every request
- Auto-retries on 401 with forced token refresh
- Parses FastAPI-style errors (`{ "detail": "..." }`)
- Two base URLs: `NEXT_PUBLIC_API_URL` (main backend, default `:8000`) and `NEXT_PUBLIC_A2A_API_URL` (A2A agent service, default `:8100`)

API modules are organized per-domain: `campaigns`, `companies`, `employees`, `fit-scores`, `notifications`, `partners`, `playbooks`, `products`, `search`.

WebSocket client for agentic/streaming search lives in `hooks/useAgenticSearch.ts` (connects to `NEXT_PUBLIC_WS_URL`).

### State Management

No global state library. State is managed via:

- **React Context (global)**: `PartnerProvider` (current partner data) and `ThemeProvider` (dark/light/system theme via localStorage — custom implementation, not `next-themes`)
- **React Context (feature-specific)**:
  - `CampaignDetailProvider` — caches campaign, overview, and partners data; provides publish/unpublish handlers
  - `CampaignCompanyDetailProvider` — caches company + membership eagerly; lazy-loads product fit and playbook data
  - `DiscoveryDetailProvider` — company detail with eager/lazy loading pattern (eager: company data; lazy: explainability, jobs, team, playbooks)
- **NextAuth session**: `useSession()` for auth state
- **Page-level hooks**: Complex state encapsulated in custom hooks (`useCampaignSettings`, `useAgenticSearch`, `usePlaybookGeneration`, etc.)

All data fetching is client-side via `useEffect` in `"use client"` components — no RSC data fetching.

### Styling

- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin (not v3 config-based)
- **shadcn/ui** with `base-nova` style, CSS variables enabled, `lucide` icons
- Theme colors use oklch color space, defined as CSS custom properties in `app/globals.css`
- Dark mode via `.dark` class on `<html>` (managed by custom `ThemeProvider`)
- Class merging: `cn()` utility from `lib/utils.ts` (clsx + tailwind-merge)
- Component variants via `class-variance-authority`
- **Always consider dark mode.** Never use hardcoded colors (hex, hsl, rgb) for backgrounds, borders, or text. Use Tailwind theme tokens (`bg-muted`, `text-foreground`, `border-border`, `currentColor`, etc.) so styles adapt to both light and dark themes automatically. If a design specifies a raw color value, find the closest semantic token in `app/globals.css` that maps correctly in both themes.

### Type Definitions

All TypeScript types/interfaces are in `lib/schemas/` with barrel exports from `lib/schemas/index.ts`. Organized per-domain matching the API modules.

### Provider Hierarchy (root layout)

```
AuthProvider → PartnerProvider → ThemeProvider → TooltipProvider → [ScrollToTop + Nav + {children}] + Toaster
```

### Key Conventions

- Path alias: `@/*` maps to project root
- Fonts: Inter (sans) + Exo 2 weight=500 (display), loaded via `next/font`
- Icons: `lucide-react`
- Toasts: `sonner` (via shadcn `Toaster` component)
- Animations: `framer-motion`
- Charts: `recharts`
- A2A diagrams: `@xyflow/react` + `dagre` for graph layout
- Maps: `react-leaflet` + `leaflet`
- Dates: `date-fns`
- Visual effects: `@paper-design/shaders-react`
- Analytics: Google Analytics via `@next/third-parties`
- Testing: `vitest` + `@testing-library/react` + `jsdom`
- Deployment: Firebase App Hosting (`apphosting.yaml`), `output: "standalone"` in next.config

## Development Guidelines

### Component Structure

- **Max ~150 lines per component file.** If a component grows beyond this, split it into smaller sub-components in the same directory or a dedicated folder.
- **One component per file.** Named exports matching the filename.
- **Separate logic from presentation.** Pages and complex components should follow:
  - `ComponentName.tsx` — rendering only, receives props
  - `useComponentName.ts` — hook containing all state, effects, and event handlers
  - `ComponentName.types.ts` — types/interfaces if they're shared or complex
- **Colocate related files.** Keep sub-components, hooks, and types next to the component that uses them. Only promote to top-level `hooks/` or `lib/schemas/` when shared across multiple features.
- **Prefer composition over prop drilling.** Use compound components or children/render props before reaching for context. Context should be reserved for genuinely cross-cutting concerns.

### Functions and Hooks

- **Max ~30 lines per function.** Extract helpers when a function does more than one conceptual thing.
- **Custom hooks should do one thing.** A hook that manages form state shouldn't also handle API calls — compose multiple hooks instead.
- **Name hooks descriptively:** `usePartnerCampaigns` not `useData`. The name should tell you what state/behavior it encapsulates.
- **Always type return values** of exported hooks and functions explicitly — don't rely on inference for public APIs.

### Documentation and Comments

- **JSDoc all exported functions, hooks, and components** with a one-line summary of purpose and `@param`/`@returns` when non-obvious.
- **Inline comments for "why", not "what."** Comment business logic rationale, workarounds, and non-obvious decisions. Don't comment self-explanatory code.
- **TODO format:** `// TODO(username): description` — include who and what so TODOs are actionable.
- **Document API contracts** at the top of each `lib/api/` module: what endpoint it hits, expected request/response shapes, and any quirks.

### Testing

Vitest is configured with `@testing-library/react` and `jsdom`. Run `npm run test` (single run) or `npm run test:watch` (watch mode). Config in `vitest.config.ts`, setup in `vitest.setup.ts`.

- **Test files live next to source files:** `ComponentName.test.tsx` alongside `ComponentName.tsx`.
- **Test behavior, not implementation.** Tests should assert what the user sees and what the API receives, not internal state.
- **Every new hook gets a test.** Hooks contain the core logic — they must be tested.
- **Every new API module function gets a test** with mocked `fetchAPI` responses covering success, error, and edge cases (empty responses, 401 retry).
- **Name tests as sentences:** `it('redirects partner users away from PDM routes')` — the test name should read as a spec.

### Security

- **Never expose secrets client-side.** Only `NEXT_PUBLIC_*` env vars reach the browser. Firebase admin credentials, `NEXTAUTH_SECRET`, and backend-only keys must stay server-side.
- **Always use `fetchAPI` for backend calls** — it handles auth token injection and refresh. Never build raw `fetch` calls with manual token handling.
- **Sanitize user-generated content** before rendering. Use React's default escaping; avoid `dangerouslySetInnerHTML` unless content is sanitized server-side.
- **Validate all external data** at the boundary: API responses should be validated against expected schemas before use. Don't trust shape assumptions from the backend.
- **Role checks in both proxy and UI.** `proxy.ts` enforces route-level access, but components should also conditionally render based on `session.user.role` — defense in depth.

### Performance

- **Memoize expensive computations** with `useMemo` and callbacks with `useCallback` only when there's a measured or obvious cost (large lists, frequent re-renders). Don't wrap everything preemptively.
- **Lazy-load heavy routes and components.** Use `next/dynamic` for pages/components with large dependencies (recharts, @xyflow/react, shader components).
- **Avoid waterfalls.** When a page needs multiple API calls, fire them in parallel with `Promise.all` — don't chain sequential `useEffect` calls.
- **Debounce user input** that triggers API calls (search, filters). Use 300ms minimum.
- **Image optimization:** Always use `next/image` for user-facing images. Configure `remotePatterns` in `next.config.ts` for external domains.
- **Bundle awareness:** Before adding a new dependency, check its bundle size. Prefer tree-shakeable libraries. Import only what you need (`import { Button } from ...` not `import * as UI from ...`).
