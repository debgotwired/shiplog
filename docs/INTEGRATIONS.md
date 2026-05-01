# Integrations

## GitHub

`POST /api/integrations/github` accepts merged pull request webhook payloads and creates AI draft candidates in the review queue. In demo mode it returns a deterministic changelog draft.

## Linear

`POST /api/integrations/linear` accepts completed issue payloads and returns a draft candidate. GitHub is the primary integration path; Linear is secondary.

## AI

Anthropic is used for draft generation, rewrites, monthly intros, and social copy when a key is configured. Without a key, mock generation keeps all flows usable.

## Email

Resend powers instant publish emails, weekly digests, monthly editions, and analytics webhooks. Self-hosted orgs may BYOK. Demo mode logs mock sends.

## Distribution

Slack webhook and generic webhook are implemented as mockable post actions. X and LinkedIn include social copy generation and scheduling placeholders ready for provider credentials.
