# Shiplog QA Test Plan

Last updated: 2026-05-01

## QA Position

The current automated suite proves the demo MVP can load, render, and exercise the main dashboard, public changelog, widget, feed, and mock API paths. It does not prove production readiness for all requested features. Several areas are intentionally demo/mock mode until Supabase persistence, provider credentials, webhooks, scheduled jobs, and real hosted/self-hosted deployment paths are wired.

This plan is designed to separate three things clearly:

- Verified now: behavior covered by unit, API, and Playwright tests.
- Needs expanded automation: behavior available in UI/API but not exhaustively tested.
- Needs product implementation hardening: behavior currently mocked or scaffolded.

## Quality Gates

No release should be promoted beyond demo/MVP unless all P0/P1 gates pass.

| Gate | Required For | Command / Evidence | Pass Criteria |
| --- | --- | --- | --- |
| Unit | Every PR | `pnpm test` | All shared targeting, plan, key routing, validation tests pass. |
| Type safety | Every PR | `pnpm typecheck` | All workspaces pass TypeScript strict checks. |
| Lint | Every PR | `pnpm lint` | No ESLint errors or warnings intended to ship. |
| Build | Every PR | `pnpm build` | Web and widget packages build successfully. |
| Local E2E | Every PR touching UX/API/widget | `pnpm e2e` | Chromium suite passes locally. |
| Production E2E | Every production deploy | `PLAYWRIGHT_BASE_URL=https://shiplog-psi.vercel.app pnpm e2e` | Same e2e suite passes against deployed Vercel URL. |
| Manual exploratory | Before launch | Checklist below | No unresolved P0/P1 defects. |

## Test Environments

### Local Demo

- URL: `http://localhost:3000`
- Data: browser localStorage plus deterministic demo API data.
- Use for: fast UI, widget, API, local build, no-provider regression testing.

### Production Demo

- URL: `https://shiplog-psi.vercel.app`
- Data: deterministic demo API data.
- Use for: Vercel routing, deployed static/dynamic routes, widget script URL, public surface, CDN/cache behavior.

### Supabase Integration Staging

Not yet configured. Required before claiming production readiness.

- Supabase project with migrations applied.
- `NEXT_PUBLIC_DEMO_MODE=false`.
- Seed orgs/projects/users/entries/subscribers/events.
- RLS and auth policies enabled.

### Provider Staging

Not yet configured. Required before claiming real distribution readiness.

- Anthropic test key.
- Resend test domain/key.
- GitHub App test installation.
- Linear webhook source.
- Slack test webhook.
- Generic webhook capture endpoint.
- X/LinkedIn sandbox or manual mock harness.

## Severity Model

| Severity | Meaning | Examples |
| --- | --- | --- |
| P0 | Blocks product usage or causes data/security loss | Cannot publish entry, wrong org data visible, widget breaks host page, provider keys leak. |
| P1 | Major feature broken or serious trust issue | Targeting shows wrong users, email sent to unsubscribed user, admin plan gate wrong. |
| P2 | Important but workaround exists | Feed metadata wrong, social preview copy not saved, analytics delayed. |
| P3 | Polish or edge-case issue | Minor spacing, copy clarity, noncritical empty state. |

## Current Automated Coverage

### Unit Tests

Located in `packages/shared/tests`.

- Targeting evaluator: AND/OR groups, page URL, user attributes, segments, recency, dismiss/frequency caps.
- Plan/key routing: self-hosted unlocks standard features, hosted starter gates, hosted env vs BYOK routing.
- Widget event validation: accepted events and rejected unknown events.

### Playwright E2E

Located in `e2e/shiplog.spec.ts`.

- Dashboard loads and core navigation renders.
- Entry create, live preview, save draft, publish.
- Targeting UI renders rule/frequency concepts.
- Widget customization changes snippet and preview.
- Email mock send.
- Social copy generation.
- Integration mock draft generation.
- Adoption flow UI renders 3-step tour controls.
- Admin plan controls render and plan can change.
- Public changelog search and feeds.
- Widget config/event APIs validate happy/unhappy paths.
- Mock GitHub, Linear, AI, email, social, distribution endpoints return expected data.
- Widget modes: bell, toast, modal, sidebar, banner.
- Widget SDK globals: `identify` and `track` callable.

## Major Gaps To Close

| Area | Current State | Risk | Required Before Production Claim |
| --- | --- | --- | --- |
| Supabase persistence | Migration exists; UI is localStorage/demo data | P0 | Real CRUD, auth, RLS, org/project isolation, migration rollback tests. |
| Auth | Auth-ready structure only | P0 | Sign up/sign in/sign out/session refresh/password reset/org membership tests. |
| Real provider webhooks | Mock endpoints exist | P1 | Signature verification, idempotency, replay protection, failure retries. |
| AI generation | Anthropic SDK touchpoint, mock response | P1 | Real prompt tests, malformed input tests, rate limits, BYOK routing tests. |
| Email | React Email template and mock endpoint | P1 | Real Resend send, preferences, unsubscribe, webhook analytics, bounce handling. |
| Scheduled jobs | UI/mock only | P1 | Weekly/monthly digest scheduling, delayed adoption follow-up jobs. |
| Social posting | Mock/social copy UI | P2 | OAuth/token handling, post now/schedule, provider failure states. |
| Analytics | Demo counters | P1 | Event ingestion, aggregation, duplicate handling, account-level analytics. |
| Adoption tours | Widget has lightweight tour behavior | P1 | Real per-entry tour storage, selector misses, multi-step completion, focus/escape handling. |
| Custom domains | Architecture/doc only | P2 | Domain routing, SSL, project lookup by host, ownership validation. |
| Plan enforcement | Shared helper and admin UI | P1 | Server-side gates on projects, AI usage, subscribers, channels, custom domains. |
| Security | Basic validation only | P0 | Authz, RLS, provider key encryption/decryption, webhook secrets, CSP, XSS tests. |

## Detailed Functional Test Matrix

### 1. Repository And Build

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| R-001 | Fresh clone, `pnpm install`, `pnpm build` | Automated | P0 | All workspaces build. |
| R-002 | Fresh clone, `.env.example` copied to `apps/web/.env.local` | Manual | P0 | App starts in demo mode. |
| R-003 | No provider env vars present | Automated/API | P1 | Mock mode remains usable; no crashes. |
| R-004 | Invalid env var values | Manual/API | P1 | Clear errors, no secret leakage. |

### 2. Authentication And Org Membership

Current product gap: needs implementation beyond demo mode.

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| AUTH-001 | New user signs up | E2E | P0 | User lands in org/project onboarding. |
| AUTH-002 | Existing user signs in | E2E | P0 | Dashboard loads correct orgs. |
| AUTH-003 | User signs out | E2E | P0 | Session cleared; protected routes blocked. |
| AUTH-004 | User refreshes page after session expiry | E2E | P1 | Session refresh or login redirect works. |
| AUTH-005 | Member of org A attempts org B project API | API/security | P0 | Request denied. |
| AUTH-006 | Admin invites teammate | E2E/API | P1 | Invite created; role enforced. |

### 3. Project Management

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| PROJ-001 | Create project | E2E/API | P0 | Project appears in switcher and public route. |
| PROJ-002 | Edit name/slug/theme | E2E/API | P1 | Dashboard and public page update. |
| PROJ-003 | Delete/archive project | E2E/API | P1 | Project no longer appears; data retained or deleted per policy. |
| PROJ-004 | Hosted starter creates fourth project | API/E2E | P1 | Server denies with plan gate. |
| PROJ-005 | Self-hosted creates many projects | API | P2 | Allowed by self-hosted standard limits. |

### 4. Changelog CRUD

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| ENTRY-001 | Create draft entry with all fields | E2E/API | P0 | Draft saved with title, slug, summary, content, type, categories, CTA, media. |
| ENTRY-002 | Markdown preview renders headings/lists/links/code | E2E | P1 | Preview matches content safely. |
| ENTRY-003 | Publish draft | E2E/API | P0 | Entry visible on public page, widget, feeds. |
| ENTRY-004 | Schedule entry in future | E2E/API | P0 | Not visible before scheduled time; visible after job/time. |
| ENTRY-005 | Edit published entry | E2E/API | P1 | Public/widget/feed content update. |
| ENTRY-006 | Duplicate slug in project | API | P1 | Validation error. |
| ENTRY-007 | Same slug in different project | API | P2 | Allowed. |
| ENTRY-008 | Media attachment invalid URL/type | API | P1 | Validation error. |
| ENTRY-009 | XSS payload in markdown | Security | P0 | Script does not execute. |
| ENTRY-010 | Search by title/category/content/status | E2E | P2 | Correct filtered results. |

### 5. Public Changelog

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| PUB-001 | Public page loads by project slug | E2E | P0 | Published entries visible. |
| PUB-002 | Draft/scheduled entries excluded | E2E/API | P0 | Only eligible entries shown. |
| PUB-003 | Search works | E2E | P2 | Search narrows entries. |
| PUB-004 | Category filter works | E2E | P2 | Filter narrows entries. |
| PUB-005 | RSS feed valid XML | API | P1 | Feed parses and includes published entries. |
| PUB-006 | Atom feed valid XML | API | P1 | Feed parses and includes published entries. |
| PUB-007 | SEO metadata | Manual/API | P2 | Title/description/canonical render. |
| PUB-008 | Sitemap | API | P2 | Includes public changelog URL. |
| PUB-009 | Light/dark/theme branding | Visual | P2 | Logo/color/theme applied without contrast failures. |
| PUB-010 | Mobile layout | Visual/E2E | P1 | No overflow or text overlap. |

### 6. Widget SDK

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| WID-001 | Script loads from hosted URL | E2E/API | P0 | `/widget/shiplog.js` returns JS and initializes. |
| WID-002 | Bell mode | E2E | P0 | Launcher visible/clickable; unread badge works. |
| WID-003 | Toast mode | E2E | P1 | Opens automatically; can dismiss. |
| WID-004 | Modal mode | E2E | P1 | Centered; close works; mobile safe. |
| WID-005 | Sidebar mode | E2E | P1 | Drawer visible; scroll safe. |
| WID-006 | Banner mode | E2E | P1 | Top banner does not block host app controls unexpectedly. |
| WID-007 | LocalStorage visitor id stable | E2E | P1 | Same visitor retained across reloads. |
| WID-008 | Dismiss entry | E2E | P0 | Entry never appears again for same visitor. |
| WID-009 | Last seen/unread | E2E | P1 | Badge count updates after open. |
| WID-010 | CTA take_me_there | E2E | P0 | Navigates to CTA URL. |
| WID-011 | Subscribe event | E2E/API | P1 | Event sent and subscriber captured. |
| WID-012 | Host page CSS collision | Visual | P1 | Widget remains styled; host page not broken. |
| WID-013 | Widget payload size | Perf | P2 | Bundle under agreed budget. |
| WID-014 | Offline/API failure | E2E | P2 | Widget fails quietly without breaking host. |
| WID-015 | Multiple widgets on one page | E2E | P2 | No duplicate globals or state corruption. |

### 7. Targeting

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| TGT-001 | all rule | Unit/API | P0 | Always true. |
| TGT-002 | page_url equals/contains/matches | Unit/E2E | P0 | Correct path/URL matching. |
| TGT-003 | user_attribute equals/contains/in/not_in/exists | Unit/E2E | P0 | Correct against `identify` traits. |
| TGT-004 | segment rule | Unit/E2E | P1 | Segment membership respected. |
| TGT-005 | recency rule | Unit/E2E | P1 | Page visits in last N days respected. |
| TGT-006 | nested AND/OR groups | Unit/API | P1 | Boolean logic correct. |
| TGT-007 | frequency once per session | Unit/E2E | P1 | Entry shown once. |
| TGT-008 | max N per week | Unit/E2E | P1 | Entry capped. |
| TGT-009 | dismiss override | Unit/E2E | P0 | Dismissed entries never show. |
| TGT-010 | malformed targeting JSON | API | P1 | Validation error, no crash. |

### 8. AI Generation

Current state: mock response unless Anthropic key exists.

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| AI-001 | GitHub PR title/body/diff to draft | Integration | P1 | Draft generated; never auto-published. |
| AI-002 | Linear completed issue to draft | Integration | P1 | Draft generated; never auto-published. |
| AI-003 | Multi-audience rewrite | API | P1 | Product, technical, short variants returned. |
| AI-004 | Batch grouped release | API | P2 | Grouped summary generated. |
| AI-005 | Project tone settings | API | P2 | Output follows tone/banned words. |
| AI-006 | Hosted key routing | Unit/API | P1 | Uses env key for hosted org. |
| AI-007 | Self-hosted BYOK routing | Unit/API | P1 | Uses encrypted configured key. |
| AI-008 | Missing key in self-hosted | API | P1 | Clear setup error or mock if demo mode. |
| AI-009 | Provider timeout/rate limit | API | P1 | Graceful error and retry/backoff behavior. |
| AI-010 | Prompt injection in PR body | Security | P1 | Does not leak keys or override system constraints. |

### 9. GitHub And Linear Integrations

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| INT-001 | GitHub merged PR webhook accepted | API | P1 | Draft candidate created. |
| INT-002 | GitHub non-merged PR ignored | API | P1 | No draft. |
| INT-003 | GitHub webhook signature invalid | Security/API | P0 | Request rejected. |
| INT-004 | Duplicate GitHub webhook delivery | API | P1 | Idempotent; one draft. |
| INT-005 | Linear completed issue accepted | API | P1 | Draft candidate created. |
| INT-006 | Linear non-completed issue ignored | API | P2 | No draft. |
| INT-007 | Integration disconnected | E2E/API | P1 | Webhook disabled; UI reflects status. |

### 10. Email Distribution

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| EMAIL-001 | Public subscribe | E2E/API | P1 | Subscriber created with default preferences. |
| EMAIL-002 | In-widget subscribe | E2E/API | P1 | Subscriber created and event tracked. |
| EMAIL-003 | Preference center cadence all/weekly/monthly | E2E/API | P1 | Preferences saved. |
| EMAIL-004 | Category-only preference | E2E/API | P1 | Only matching category sends. |
| EMAIL-005 | Unsubscribe | E2E/API | P0 | No future sends. |
| EMAIL-006 | Instant email on publish | Integration | P1 | Email sent once to eligible subscribers. |
| EMAIL-007 | Weekly digest | Integration/job | P1 | Correct entries included. |
| EMAIL-008 | Monthly edition AI intro | Integration/job | P2 | Intro generated or mock fallback. |
| EMAIL-009 | Resend webhook sent/open/click/unsub | API | P1 | Analytics updated idempotently. |
| EMAIL-010 | Email send failure | API/job | P1 | Error recorded; retry policy applied. |

### 11. Social And Distribution

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| SOC-001 | Generate social copy | E2E/API | P2 | X, LinkedIn, Slack variants returned. |
| SOC-002 | Edit generated copy | E2E | P2 | Edited copy preserved. |
| SOC-003 | Slack webhook post | Integration | P1 | Message delivered or clear failure. |
| SOC-004 | Generic webhook post | Integration | P1 | Payload delivered with retry on failure. |
| SOC-005 | X post now/schedule | Integration | P2 | Provider receives correct post. |
| SOC-006 | LinkedIn post now/schedule | Integration | P2 | Provider receives correct post. |
| SOC-007 | OG image generation | Visual/API | P2 | Image generated and available. |
| SOC-008 | Distribution checklist | E2E | P2 | Per-entry state accurate. |

### 12. Admin, Plans, Usage, BYOK

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| ADMIN-001 | List orgs | E2E/API | P1 | Admin sees org list only if authorized. |
| ADMIN-002 | Toggle `is_hosted` | E2E/API | P1 | Plan/key routing updates. |
| ADMIN-003 | Set plan free/starter/pro | E2E/API | P1 | Gates update immediately. |
| ADMIN-004 | Hosted starter gates | Unit/API/E2E | P1 | 3 projects, page targeting, 100 AI, 1000 subscribers, X+Slack only, no adoption/custom domain. |
| ADMIN-005 | Hosted pro gates | Unit/API/E2E | P1 | Full targeting, adoption, custom domain, LinkedIn/webhook, branding removal. |
| ADMIN-006 | Self-hosted gates | Unit/API | P1 | Standard features and BYOK available. |
| ADMIN-007 | Usage metering | API/job | P1 | Entries, impressions, emails, AI, projects counted. |
| ADMIN-008 | BYOK save key | E2E/API/security | P0 | Key encrypted, hint shown, raw key never returned. |
| ADMIN-009 | BYOK rotate/delete | E2E/API/security | P1 | Routing updates; old key unavailable. |
| ADMIN-010 | Hosted org cannot use BYOK unexpectedly | API | P2 | Env keys used unless policy changes. |

### 13. Adoption Flows

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| ADOPT-001 | Create 3-step tour | E2E/API | P1 | Steps saved with selectors/title/body/placement. |
| ADOPT-002 | More than 3 steps | API | P1 | Validation rejects for MVP. |
| ADOPT-003 | Start tour CTA | E2E | P1 | Tour starts and highlights first selector. |
| ADOPT-004 | Missing selector | E2E | P2 | Graceful fallback or skipped step. |
| ADOPT-005 | Complete tour | E2E/API | P1 | `tour_complete` tracked. |
| ADOPT-006 | Track feature used | E2E/API | P0 | `feature_used` event stored. |
| ADOPT-007 | Funnel analytics | API/E2E | P1 | Saw/opened/clicked/started/completed/used counts accurate. |
| ADOPT-008 | Follow-up email after delay | Job/API | P1 | Sent only to users who saw but did not adopt. |
| ADOPT-009 | Per-account adoption dashboard | E2E/API | P2 | Account trait grouping accurate. |

### 14. Accessibility

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| A11Y-001 | Keyboard navigation dashboard | Manual/E2E | P1 | All controls reachable and visible focus. |
| A11Y-002 | Widget keyboard close/open | Manual/E2E | P1 | Launcher/panel usable without mouse. |
| A11Y-003 | Modal/drawer focus management | Manual/E2E | P1 | Focus does not escape unexpectedly. |
| A11Y-004 | Screen reader labels | Manual/axe | P1 | Buttons/inputs have names. |
| A11Y-005 | Contrast | Manual/axe | P1 | WCAG AA for text and controls. |
| A11Y-006 | Reduced motion | Manual | P2 | Motion respects user settings. |

### 15. Security

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| SEC-001 | RLS org isolation | API/security | P0 | Cross-org data access denied. |
| SEC-002 | Admin endpoint authz | API/security | P0 | Non-admin denied. |
| SEC-003 | Provider key encryption | Unit/API/security | P0 | Raw key never stored/returned. |
| SEC-004 | Webhook signature verification | API/security | P0 | Invalid signatures rejected. |
| SEC-005 | Replay attack | API/security | P1 | Duplicate old webhook rejected or idempotent. |
| SEC-006 | Markdown XSS | E2E/security | P0 | No script execution. |
| SEC-007 | Widget host-page XSS via entry content | E2E/security | P0 | Content escaped/sanitized. |
| SEC-008 | Rate limiting | API/security | P1 | Widget/events/provider endpoints protected. |
| SEC-009 | CORS | API/security | P1 | Widget API allows expected origins only where needed. |
| SEC-010 | Secrets in logs | Manual/security | P0 | No keys in client bundle, logs, errors, traces. |

### 16. Performance And Reliability

| ID | Scenario | Type | Priority | Expected Result |
| --- | --- | --- | --- | --- |
| PERF-001 | Dashboard cold load | Lighthouse | P2 | Acceptable TTI/LCP for SaaS dashboard. |
| PERF-002 | Public changelog cold load | Lighthouse | P2 | SEO and performance acceptable. |
| PERF-003 | Widget payload size | Bundle analysis | P2 | Under budget; no large unused deps. |
| PERF-004 | Widget API latency | Load/API | P1 | p95 under agreed target. |
| PERF-005 | High-volume widget events | Load/API | P1 | No data loss; backpressure works. |
| PERF-006 | Large changelog project | E2E/API | P2 | Pagination/search remain responsive. |
| PERF-007 | Provider outage | Chaos/API | P1 | Product degrades gracefully. |

## Manual Exploratory Charters

### Charter A: SaaS Operator Happy Path

1. Sign in.
2. Create org/project.
3. Create draft from scratch.
4. Add targeting for admin users on billing page.
5. Publish.
6. Confirm public changelog and widget show update.
7. Send email mock/real test.
8. Generate social copy.
9. Confirm analytics/events update.

### Charter B: Widget Host Compatibility

1. Install script on a dense app-like page.
2. Try all five modes.
3. Change host CSS globals aggressively.
4. Verify no overlap, no viewport escape, no host-page breakage.
5. Test mobile width and zoomed browser.

### Charter C: Plan And BYOK Abuse

1. Toggle hosted/self-hosted.
2. Switch starter/pro/free.
3. Attempt gated features through UI and direct API.
4. Configure and rotate BYOK keys.
5. Verify hosted env routing vs self-hosted BYOK routing.

### Charter D: Provider Failure Reality

1. Send malformed GitHub and Linear webhook payloads.
2. Send duplicate webhook delivery ids.
3. Simulate Anthropic timeout.
4. Simulate Resend failure and webhook retries.
5. Confirm visible operator status and no auto-publish.

### Charter E: Security And Privacy

1. Attempt cross-org reads/writes.
2. Insert markdown/script payloads.
3. Inspect built client bundles for secrets.
4. Verify API errors do not expose internal config.
5. Confirm unsubscribe/preference changes are respected.

## Recommended Automation Roadmap

### Immediate Next Tests

- Add API tests for every route with invalid payloads and auth assumptions.
- Add Playwright mobile viewport project.
- Add axe accessibility smoke tests.
- Add screenshot snapshots for public changelog and widget modes.
- Add tests for CTA navigation and dismiss/unread localStorage state.
- Add tests for schedule visibility once persistence exists.

### After Supabase Wiring

- Contract tests for every table and RLS policy.
- E2E auth/org/project CRUD with real database cleanup.
- Transaction/idempotency tests for webhooks and email sends.
- Usage metering tests with month boundary cases.

### After Provider Wiring

- Webhook signature tests with recorded fixtures.
- Anthropic prompt/output schema tests with mocked client.
- Resend sandbox send and webhook analytics tests.
- Slack/webhook retry and dead-letter tests.

## Exit Criteria By Milestone

### Demo MVP

- Unit/type/lint/build green.
- Local and production Playwright suite green.
- Known mock/demo gaps documented.

### Private Alpha

- Supabase auth and persistence wired.
- P0/P1 auth, CRUD, widget, targeting, public changelog, admin gates automated.
- No open P0/P1 defects.

### Hosted Beta

- Provider integrations wired behind safe mock/staging harnesses.
- Email preferences/unsubscribe verified.
- Webhook signatures and idempotency verified.
- Usage metering and plan gates enforced server-side.

### Public Launch

- Security review complete.
- Accessibility pass complete.
- Load/performance pass complete.
- Disaster/recovery and provider outage behavior verified.
- Docs match deployed behavior.
