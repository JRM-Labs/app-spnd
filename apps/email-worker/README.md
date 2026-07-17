# Email Worker

Cloudflare Email Routing Worker for AppSpnd receipt ingestion.

The Worker receives raw routed email, streams the `.eml` payload to the Firebase ingest endpoint, and adds metadata headers for recipient, sender, and subject.

## Local Commands

```bash
npx nx run email-worker:types
npx nx run email-worker:typecheck
npx nx run email-worker:dev
```

## Secrets

Set these with Wrangler before deploy:

```bash
npx wrangler secret put FIREBASE_INGEST_URL --config apps/email-worker/wrangler.jsonc --env dev
npx wrangler secret put INGEST_SHARED_SECRET --config apps/email-worker/wrangler.jsonc --env dev
```

Production uses `--env prod`.

## Cloudflare Setup

This repo does not need to be connected to Cloudflare before local scaffolding. To receive real email, enable Email Routing for the domain in Cloudflare and route the desired address pattern to this Worker after it is deployed.
