# Environments And Deployment

## Objective

Define how AppSpnd separates local development, test/dev cloud resources, and future production resources.

## Environments

### Local

Used for parser development, Firebase emulator work, and UI development.

Expected services:

- Firebase Auth emulator.
- Firestore emulator.
- Storage emulator.
- Functions emulator.
- Cloudflare Worker local development with `wrangler dev`.

Local data may include sample Apple receipt fixtures, but should not include real private inbox exports unless intentionally placed in ignored local fixture folders.

### Dev

Used for real Cloudflare-to-Firebase integration testing.

Suggested Firebase project:

```text
app-spnd-dev
```

Suggested receiving subdomain:

```text
app-spnd.jrm-labs.com
```

The dev environment can receive real forwarded Apple receipts for personal testing, so it must still be treated as sensitive.

### Production

Deferred until the MVP path is proven.

Production should use a separate Firebase project, separate Cloudflare routing configuration, separate secrets, and a production-specific receiving domain or subdomain.

The web frontend target for MVP is Cloudflare-hosted delivery with distinct stage and production environments.

## Environment Separation Rules

- Do not share Firebase projects between dev and production.
- Do not share Cloudflare Worker secrets between dev and production.
- Do not point dev Cloudflare routing at production Firebase functions.
- Do not use production raw email storage for parser experiments.
- Do not commit `.env`, `.dev.vars`, Firebase service account files, or exported raw email fixtures containing personal data.

## Suggested Config Names

```text
Firebase project aliases:
  dev
  prod

Cloudflare Worker envs:
  dev
  prod

Firebase Functions regions:
  us-central1 initially
```

## Deployment Flow

Dev deployment:

```text
firebase deploy --only functions,firestore,storage --project dev
npx wrangler deploy --env dev
```

Production deployment later:

```text
firebase deploy --only functions,firestore,storage --project prod
npx wrangler deploy --env prod
```

## Pre-Production Gates

Before production exists:

- Raw email storage verified.
- Unknown recipient handling verified.
- Duplicate ingestion verified.
- Parser fixtures cover representative Apple receipt formats.
- Security rules reviewed.
- Budget alerts configured.
- Deletion/export story documented.
- Admin correction workflow implemented.

## Current Direction

- Angular web app hosting target: Cloudflare-hosted frontend with stage and production environments.
- Parser execution target for MVP and dev: Cloud Functions.
- Re-evaluate Cloud Run before production only if runtime, concurrency, or cost constraints justify the move.

## Open Decisions

- Final production domain/subdomain.
- How Cloudflare stage and production frontend environments are promoted and operated.
