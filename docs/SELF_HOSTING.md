# Self Hosting

1. Provision Supabase or any Postgres-compatible database.
2. Apply `supabase/migrations/0001_initial.sql`.
3. Copy `.env.example` to `apps/web/.env.local` and add Supabase keys.
4. Set `NEXT_PUBLIC_DEMO_MODE=false`.
5. Add provider keys globally or configure BYOK keys in Settings.
6. Run `pnpm install`, `pnpm build`, and deploy `apps/web`.

Self-hosted orgs should keep `is_hosted=false` in admin controls. The plan helper treats self-hosted as free with standard features unlocked and provider keys routed from encrypted org configuration.
