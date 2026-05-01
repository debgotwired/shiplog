# Shiplog

Shiplog is an open-source and hosted changelog-as-a-surface platform for SaaS teams. It helps teams announce shipped work inside the product, target the right users, distribute updates across channels, and drive feature adoption.

## Quick start

Requires Node 22+ and pnpm 10+.

```bash
pnpm install
cp .env.example apps/web/.env.local
pnpm dev
```

Open http://localhost:3000. The app runs in demo mode without Supabase, Anthropic, Resend, GitHub, Linear, or social credentials.

## Structure

- `apps/web` - Next.js 15 App Router dashboard, API routes, public changelog, feeds, widget JS endpoint.
- `packages/widget` - Preact + Vite embeddable widget SDK.
- `packages/shared` - shared types, targeting evaluator, plan gates, provider key routing, validation.
- `supabase/migrations` - Postgres schema for self-hosted and hosted deployments.
- `docs` - architecture, setup, widget API, integrations, roadmap.

## Scripts

- `pnpm dev` - start the dashboard/API locally.
- `pnpm build` - build all workspaces.
- `pnpm lint` - run ESLint.
- `pnpm typecheck` - run TypeScript checks.
- `pnpm test` - run unit tests.
- `pnpm widget:build` - build the widget package.

## Widget snippet

```html
<script src="http://localhost:3000/widget/shiplog.js" data-project-id="demo-project" data-mode="bell" async></script>
```

Hosted deployments serve the same script at `https://your-vercel-domain/widget/shiplog.js`.
