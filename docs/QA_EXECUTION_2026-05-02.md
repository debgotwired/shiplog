# QA Execution Report - 2026-05-02

## Scope

Executed the QA plan against the current Shiplog demo MVP. This pass focused on executable local and production-demo behavior, not unimplemented production dependencies such as Supabase persistence, real auth, real provider webhooks, scheduled jobs, or real email/social provider credentials.

## Deployment Status

The Vercel email titled "Failed production deployment" referred to the first production deployment attempt:

- `https://shiplog-8jrfqqte3-debdut94-gmailcoms-projects.vercel.app` - Error

Current Vercel state showed newer production deployments as `Ready`, and the production alias responded with `HTTP 200`:

- `https://shiplog-psi.vercel.app`

## Baseline Gates

| Gate | Command | Result |
| --- | --- | --- |
| Unit | `pnpm test` | Passed: 8 tests |
| Typecheck | `pnpm typecheck` | Passed |
| Lint | `pnpm lint` | Passed |
| Build | `pnpm build` | Passed |

## Expanded Playwright Coverage

Command:

```bash
pnpm e2e
```

Result:

- Passed: 12 tests
- Browser: Chromium

Expanded coverage added:

- Public changelog category filtering.
- Widget event API invalid event, missing visitor id, bad URL, and malformed JSON handling.
- Widget unread badge reset.
- Widget dismissed-entry persistence across reload.
- Widget CTA navigation.
- Mobile overflow checks for dashboard, public changelog, and widget demo.

## Issues Found And Fixed

### P1 - Hosted widget bell panel could render outside clickable viewport

The bell panel close button could be visible but outside the clickable viewport in Chromium. Fixed the hosted widget script styles so widget cards are `position: fixed`, viewport constrained, and scroll internally when needed.

### P1 - Dashboard had mobile horizontal overflow

The mobile dashboard overflowed by roughly 416px at a 390px viewport. Fixed panel/grid minimum widths and table overflow containment.

### P2 - Widget event API threw on malformed JSON

Malformed or empty JSON posted to `/api/widget/[projectId]/events` threw a dev-server stack trace. Fixed the route to return a controlled `400` with `Invalid JSON body`.

### Test Harness - LocalStorage persistence test was self-invalidating

The first expanded test harness cleared localStorage via `addInitScript`, which runs before every navigation and reload. Removed that setup because Playwright already isolates tests with fresh browser contexts.

## Still Not Executable In This MVP

These remain blocked by implementation/staging dependencies and are not passed by this execution:

- Supabase persistence for dashboard mutations.
- Supabase Auth flows and RLS isolation.
- Real GitHub App installation, webhook signatures, and idempotency.
- Real Linear webhook signature/idempotency behavior.
- Real Anthropic generation and BYOK decryption.
- Real Resend sends, preference persistence, unsubscribe enforcement, and webhook analytics.
- Real scheduled weekly/monthly digest jobs.
- Real social posting to X/LinkedIn.
- Real Slack/generic webhook delivery retries.
- Server-side plan enforcement for every gated action.
- Real adoption-flow persistence, follow-up jobs, and account-level analytics.

## Conclusion

The current demo MVP now passes the expanded executable QA plan locally. The product should still be treated as a demo MVP, not production-complete SaaS, until the unimplemented Supabase/provider/security items above are built and tested in staging.
