# Architecture

Shiplog is a pnpm monorepo with a Next.js hosted app, a Preact widget SDK, shared targeting and plan logic, and Supabase Postgres migrations.

## Runtime surfaces

- Dashboard: operator workspace for projects, entries, targeting, analytics, email, social, integrations, settings, admin, and adoption flows.
- Public changelog: `/changelog/[projectSlug]` with branded theming, SEO, RSS, Atom, filtering, and subscribe affordances.
- Widget API: `/api/widget/[projectId]/config` returns theme, entries, unread inputs, and targeting metadata.
- Widget script: `/widget/shiplog.js` is served by the hosted app for a same-origin production install path.
- Provider APIs: GitHub, Linear, Anthropic, Resend, Slack, webhooks, X, and LinkedIn are demo/mock ready until real keys are configured.

## Data ownership

Self-hosted/open-source orgs get the standard feature set and BYOK provider routing. Hosted starter/pro orgs use hosted environment keys and internal plan controls. Stripe is intentionally omitted; billing is manual invoicing.

## Demo mode

When Supabase credentials are absent or `NEXT_PUBLIC_DEMO_MODE=true`, dashboard actions persist in browser localStorage and APIs return deterministic sample data. This keeps the whole product explorable without credentials.
