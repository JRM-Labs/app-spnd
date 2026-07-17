# Firebase And Cloudflare Setup Runbook

## Status

Draft

## Purpose

This document describes the setup steps needed to support AppSpnd's MVP infrastructure:

```text
Cloudflare Email Routing
  -> Cloudflare Email Worker
  -> Firebase HTTPS Function
  -> Cloud Storage raw .eml
  -> Firestore metadata
  -> parser job
```

The instructions are based on current Firebase and Cloudflare documentation checked on 2026-07-16.

## Official References

- Firebase web setup: https://firebase.google.com/docs/web/setup
- Firebase CLI: https://firebase.google.com/docs/cli
- Firebase Authentication web setup: https://firebase.google.com/docs/auth/web/start
- Cloud Firestore quickstart: https://firebase.google.com/docs/firestore/quickstart
- Cloud Functions for Firebase: https://firebase.google.com/docs/functions/get-started
- Cloud Functions TypeScript: https://firebase.google.com/docs/functions/typescript
- Cloud Storage for Firebase: https://firebase.google.com/docs/storage/web/start
- Firebase Emulator Suite: https://firebase.google.com/docs/emulator-suite/install_and_configure
- Cloud Storage Security Rules: https://firebase.google.com/docs/storage/security
- Cloudflare Email Routing rules: https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/
- Cloudflare Email Routing local development: https://developers.cloudflare.com/email-service/local-development/routing/
- Cloudflare Workers secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Cloudflare Wrangler configuration: https://developers.cloudflare.com/workers/wrangler/configuration/
- Cloudflare email DNS records: https://developers.cloudflare.com/dns/manage-dns-records/how-to/email-records/

## Assumptions

- Testing domain/subdomain: `receipts.jrm-labs.com`.
- Firebase project name: choose during setup, suggested `app-spnd-dev`.
- Firebase/GCP region: choose once and keep consistent. Suggested `us-central1` for MVP.
- AppSpnd stores raw emails in Firebase/Google Cloud Storage, not Cloudflare storage.
- Cloudflare only receives inbound email and forwards it to Firebase.
- The first app is web-first Angular.

## Phase 1: Create Firebase Project

1. Open the Firebase Console.
2. Create a new Firebase project.
3. Suggested project name: `app-spnd-dev`.
4. Disable Google Analytics for now unless you know you want it immediately.
5. Confirm the backing Google Cloud project is created.

Firebase's web setup docs state that a Firebase project must be created before registering a web app and obtaining the Firebase config object.

## Phase 2: Upgrade Firebase Billing Plan

Cloud Storage for Firebase requires the pay-as-you-go Blaze plan. Firebase's Cloud Storage setup docs call this out as a requirement before creating the default bucket.

Steps:

1. In Firebase Console, open Project Settings > Usage and billing.
2. Upgrade the project to Blaze.
3. Set a budget alert in Google Cloud Billing.
4. Keep the MVP region and services minimal.

Recommended budget alerts:

- 50% of expected monthly budget.
- 90% of expected monthly budget.
- 100% of expected monthly budget.

## Phase 3: Register Web App

1. In Firebase Console, open Project Overview.
2. Select the Web app icon.
3. Register an app named `app-spnd-web`.
4. Copy the generated Firebase config.
5. Do not commit secret-like environment files. Firebase web config is not a secret, but environment files may later include non-public values.

The web app will eventually initialize:

```ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
```

## Phase 4: Enable Firebase Authentication

1. In Firebase Console, open Build > Authentication.
2. Click Get started.
3. Enable initial sign-in providers.

Recommended MVP providers:

- Email/password.
- Google sign-in if you want faster personal testing.

Later decisions:

- Apple sign-in may matter if/when native iOS becomes a target.
- Business group support may need invite flows, but not for initial setup.

## Phase 5: Create Firestore Database

1. In Firebase Console, open Databases & Storage > Firestore.
2. Click Create database.
3. Choose the region.
4. Start in production mode unless doing a throwaway prototype.
5. Add rules intentionally before exposing a client.

Firestore should store:

```text
users/{userId}
families/{familyId}
families/{familyId}/members/{memberId}
families/{familyId}/rawEmails/{rawEmailId}
families/{familyId}/parseJobs/{parseJobId}
families/{familyId}/receipts/{receiptId}
families/{familyId}/receipts/{receiptId}/lineItems/{lineItemId}
families/{familyId}/corrections/{correctionId}
```

## Phase 6: Create Cloud Storage Bucket

1. In Firebase Console, open Databases & Storage > Storage.
2. Click Get started.
3. Create the default bucket.
4. Choose the same general region strategy as Firestore/Functions.
5. Start with locked-down rules.

Firebase notes that default buckets created on or after September 2024 use this format:

```text
PROJECT_ID.firebasestorage.app
```

Raw email storage path:

```text
families/{familyId}/raw-emails/{rawEmailId}.eml
```

Optional normalized artifact path:

```text
families/{familyId}/normalized-emails/{rawEmailId}.json
```

Important rule: client apps should not freely read raw email artifacts. Raw emails may include billing names, addresses, Apple account emails, masked payment details, and other personal data.

## Phase 7: Install Firebase CLI Locally

Install or update Firebase CLI:

```bash
npm install -g firebase-tools
firebase --version
firebase login
```

Firebase CLI docs state that `firebase init` links a local project directory to a Firebase project and creates `firebase.json` plus `.firebaserc`.

From the project root:

```bash
cd /Users/chrisharris/DevProjects/jrm-labs/app-spnd
firebase init
```

Select:

- Firestore.
- Functions.
- Storage.
- Emulators.
- Hosting later if using Firebase Hosting for the Angular app.

For Functions:

- Choose TypeScript.
- Use a single default functions codebase initially.
- Install dependencies when prompted.

## Phase 8: Configure Firebase Emulators

Firebase Emulator Suite requires Node.js and Java JDK. Firebase docs currently call out Node.js 16+ and Java JDK 11+.

Initialize emulators:

```bash
firebase init emulators
```

Recommended emulators:

- Authentication.
- Firestore.
- Functions.
- Storage.
- Emulator UI.

Start locally:

```bash
firebase emulators:start
```

Expected default ports from Firebase docs include:

- Auth: `9099`
- Firestore: `8080`
- Functions: `5001`
- Storage: `9199`
- Emulator UI: `4000`

## Phase 9: Create Firebase Function Contracts

Initial function endpoints:

```text
POST /ingestCloudflareEmail
POST /retryParseJob
POST /correctReceiptAttribution
```

The first function to build should be `ingestCloudflareEmail`.

Responsibilities:

1. Verify Cloudflare secret/signature.
2. Read original recipient address.
3. Lookup family by `forwardingEmail`.
4. Reject/quarantine unknown recipients.
5. Write raw `.eml` to Cloud Storage.
6. Write `rawEmails/{rawEmailId}` metadata.
7. Create `parseJobs/{parseJobId}`.
8. Return success to Cloudflare.

Recommended HTTP headers from Cloudflare Worker to Firebase:

```text
x-appspnd-ingest-secret
x-appspnd-original-to
x-appspnd-original-from
x-appspnd-received-at
content-type: message/rfc822
```

The secret value must live in Cloudflare Worker secrets and Firebase Functions config/secrets, not source control.

## Phase 10: Set Up Cloudflare Email Routing

Cloudflare Email Routing docs describe routing rules as a pair of an email pattern and a destination. Destinations can be verified email addresses or Workers with an `email` handler.

1. Log in to Cloudflare.
2. Select the `jrm-labs.com` zone.
3. Go to Compute > Email Service > Email Routing.
4. Enable Email Routing for the domain/subdomain path you choose.
5. Configure DNS records as Cloudflare instructs.
6. Create or enable a routing rule that sends matching email to a Worker.

Recommended pattern for MVP:

```text
*@receipts.jrm-labs.com -> app-spnd-email-ingest Worker
```

If Cloudflare's UI requires routing at the zone/domain level, use a catch-all rule for the selected receiving domain/subdomain and have the Worker validate the recipient.

Important:

- The Worker must inspect `message.to`.
- Unknown recipients should still be forwarded to Firebase only if Firebase will quarantine/reject them, or dropped at Worker level if the rule can safely determine that.
- Keep routing rules simple at first.

## Phase 11: Create Cloudflare Email Worker

Use Wrangler for Worker development. Cloudflare's Wrangler docs recommend `wrangler.jsonc` for new projects.

Suggested worker location:

```text
apps/email-worker/
```

Minimal worker shape:

```ts
export default {
  async email(message, env, ctx) {
    const raw = await new Response(message.raw).arrayBuffer();

    const response = await fetch(env.FIREBASE_INGEST_URL, {
      method: 'POST',
      headers: {
        'content-type': 'message/rfc822',
        'x-appspnd-ingest-secret': env.APP_SPND_INGEST_SECRET,
        'x-appspnd-original-to': message.to,
        'x-appspnd-original-from': message.from,
      },
      body: raw,
    });

    if (!response.ok) {
      throw new Error(`Firebase ingest failed: ${response.status}`);
    }
  },
};
```

Do not put secrets in `wrangler.jsonc`. Cloudflare Workers secrets docs state that secrets should be stored with `wrangler secret put` or dashboard secrets.

Required secrets:

```bash
npx wrangler secret put APP_SPND_INGEST_SECRET
npx wrangler secret put FIREBASE_INGEST_URL
```

Non-secret config can live in `wrangler.jsonc`, but the ingest URL can also be treated as a secret to avoid accidental environment confusion.

## Phase 12: Test Cloudflare Worker Locally

Cloudflare Email Routing local development docs support `wrangler dev` with simulated incoming emails.

Local test goals:

- Worker receives a simulated email.
- Worker reads `message.to`.
- Worker forwards raw body to local Firebase emulator or deployed dev function.
- Firebase function rejects bad secret.
- Firebase function accepts valid secret.

Suggested local `.dev.vars`:

```text
APP_SPND_INGEST_SECRET="local-dev-secret"
FIREBASE_INGEST_URL="http://127.0.0.1:5001/app-spnd-dev/us-central1/ingestCloudflareEmail"
```

Do not commit `.dev.vars`.

## Phase 13: Configure Firebase Secrets

Use Firebase/Google Cloud secret support for server-side secrets when implementing functions.

Secrets needed:

```text
APP_SPND_INGEST_SECRET
```

Later parser secrets:

```text
GEMINI_API_KEY or Vertex AI configuration
```

Do not store parser provider API keys in Angular or Cloudflare Worker code.

## Phase 14: Deploy Firebase Dev Functions

Deploy functions:

```bash
firebase deploy --only functions
```

Firebase Functions docs state that deploying HTTP functions outputs the function URL. Copy the `ingestCloudflareEmail` URL and store it as the Worker `FIREBASE_INGEST_URL` secret/config.

## Phase 15: Deploy Cloudflare Worker

From the Worker directory:

```bash
npx wrangler deploy
```

Then in Cloudflare Email Routing:

1. Create or edit the routing rule.
2. Choose action: Send to a Worker.
3. Select the deployed Worker.
4. Enable the rule.

## Phase 16: First End-To-End Test

Use a generated test family document:

```text
families/{familyId}
  forwardingEmail: "{familyId}@receipts.jrm-labs.com"
```

Send a test Apple receipt email to:

```text
{familyId}@receipts.jrm-labs.com
```

Verify:

1. Cloudflare Email logs show the email was routed.
2. Worker logs show delivery to Firebase.
3. Firebase Functions logs show ingest success.
4. Cloud Storage contains:

```text
families/{familyId}/raw-emails/{rawEmailId}.eml
```

5. Firestore contains:

```text
families/{familyId}/rawEmails/{rawEmailId}
families/{familyId}/parseJobs/{parseJobId}
```

6. Unknown recipient test is rejected or quarantined.
7. Duplicate delivery does not create duplicate spending records.

## Phase 17: Initial Security Rules

Firestore and Storage rules should be conservative.

Initial posture:

- Users can read only family data for families they belong to.
- Clients cannot write raw email metadata directly.
- Clients cannot write parsed receipt totals directly.
- Clients cannot read raw `.eml` files directly by default.
- Admin correction flows go through server-side functions until rules are mature.

Cloud Storage rule posture:

- Deny direct client reads of `families/{familyId}/raw-emails/**`.
- Allow server-side Admin SDK access.
- Consider adding narrow server-generated download URLs only for admin/debug workflows.

## Phase 18: Operational Checklist

Before building UI on top of this:

- Firebase project exists.
- Blaze billing enabled.
- Auth enabled.
- Firestore database created.
- Storage bucket created.
- Firebase CLI initialized in repo.
- Functions TypeScript initialized.
- Emulators configured.
- Cloudflare Email Routing enabled.
- Cloudflare Worker deployed.
- Worker secrets configured.
- Firebase ingest secret configured.
- End-to-end raw email save verified.
- Unknown recipient handling verified.
- Duplicate raw email handling verified.

## Open Decisions

- Exact Firebase project ID.
- Exact receiving subdomain: `receipts.jrm-labs.com` is the current recommendation.
- Whether normalized email JSON artifacts should always be stored or only stored during parser development.
- Whether unknown recipient emails should be dropped at Worker level or quarantined in Firebase.
- Whether Firebase Hosting or another host will serve the Angular web app.

## Recommended Implementation Order

1. Initialize Firebase project and local repo config.
2. Implement `ingestCloudflareEmail` against emulators.
3. Build a minimal Cloudflare Email Worker.
4. Prove Worker-to-Firebase request authentication.
5. Save raw `.eml` to Storage.
6. Write raw email metadata to Firestore.
7. Create parse job documents.
8. Add parser pipeline.
9. Add Angular setup/profile screens.
10. Add dashboard and review screens.
