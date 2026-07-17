# 🤖 Nx Setup Plan

Use this checklist to scaffold AppSpnd as an Nx TypeScript monorepo. Run commands from the repository root after `nvm use`.

## 1. Confirm Local Tooling

```bash
nvm use
npm install
npx nx report
```

Expected baseline:

- Node `v20.19.0`
- Nx `23.1.0`
- npm lockfile via `package-lock.json`
- Installed plugins: `@nx/angular`, `@nx/js`, `@nx/node`, `@nx/playwright`

## 2. Generate The Angular Web App

```bash
npx nx g @nx/angular:application --directory=apps/web --name=web --routing --style=css --no-interactive
```

Nx 23 does not accept the app name as a positional argument for this generator. Use `--directory=apps/web` for the project path and `--name=web` for the project name.

This app owns authentication, onboarding, dashboard, receipt list/detail, family members, parser review, and settings.

## 3. Generate Shared Libraries

```bash
npx nx g @nx/js:library --directory=libs/contracts --name=contracts --no-interactive
npx nx g @nx/js:library --directory=libs/parser --name=parser --no-interactive
npx nx g @nx/js:library --directory=libs/firebase-data --name=firebase-data --no-interactive
```

- `libs/contracts`: Zod schemas, inferred types, parser result contracts.
- `libs/parser`: MIME normalization and Apple receipt extraction.
- `libs/firebase-data`: Firestore converters, query helpers, shared data access utilities.

## 4. Generate Firebase Functions App

```bash
npx nx g @nx/node:application --directory=apps/functions --name=functions --no-interactive
```

Use this for trusted backend workflows: ingestion, parser execution, correction commands, dedupe, aggregate writes, and privileged Firestore updates.

## 5. Add Cloudflare Email Worker

Create this project manually unless an Nx Worker plugin becomes worthwhile:

```text
apps/email-worker/
  src/index.ts
  wrangler.jsonc
  project.json
```

Add Nx targets in `project.json` for `dev` and `deploy` using `npx wrangler`.

## 6. Install Product Dependencies

After the web app exists:

```bash
npm install primeng @primeuix/themes primeicons
npm install @ngrx/signals @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools
npm install firebase @angular/fire zod
```

Prefer NgRx Signal Store for feature state. Use classic NgRx Store only for broader cross-route workflows.

## 7. Establish Boundaries

Use project tags early:

```text
type:app
type:feature
type:data-access
type:util
scope:web
scope:backend
scope:shared
```

Later, enforce import boundaries so web code cannot import backend-only modules.

## 8. Verify Each Step

After generation and dependency setup:

```bash
npx nx show projects
npx nx run-many -t build,typecheck
npx nx format --check
```

Add lint, test, and E2E verification once those targets exist.
