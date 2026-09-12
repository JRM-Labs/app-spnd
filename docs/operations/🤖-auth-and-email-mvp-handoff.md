# 🤖 Auth and Email MVP Handoff

Updated: 2026-09-12

## Where things stand

- Angular authentication is implemented with Firebase email/password sign-up, email verification, sign-in, forgotten-password, and a verified-user household setup flow.
- A verified user creates a household through the callable Firebase function `provisionFamily`.
- Provisioning generates an address such as `harris-975b4c73@app-spnd.jrm-labs.com`, creates Firestore records for the user, family, membership, and forwarding address, and returns the address to the UI.
- The email Worker posts raw inbound email to the `ingestEmail` Firebase HTTP function. The function looks up `forwardingAddresses/{recipient}`, stores the raw message in Cloud Storage, and writes email/receipt records to Firestore.

## Cloudflare routing decision for the MVP

Google Workspace owns mail for `jrm-labs.com`. Do not change its Google MX or SPF records.

`app-spnd.jrm-labs.com` has been enabled as a Cloudflare Email Routing subdomain. However, Cloudflare's catch-all rule is zone-wide in the dashboard/API and appears for both the root domain and subdomain. Do not enable it: it could catch mail addressed to `@jrm-labs.com` and interfere with Google Workspace.

For the MVP, use one exact Cloudflare Email Routing rule per generated forwarding address. Cloudflare currently limits this to 200 routing rules per domain, so this is deliberately temporary.

`provisionFamily` now automates the literal-recipient rule creation:

- API: `POST /zones/{zoneId}/email/routing/rules`
- Matcher: the exact generated recipient address
- Action: the deployed Cloudflare email Worker
- The returned rule ID is stored at `forwardingAddresses/{address}.cloudflareRoutingRuleId`.
- Existing households are repaired on the next provisioning call if their address has no stored rule ID.

Code: `apps/functions/src/main.ts`

## Current blocker

The latest `provisionFamily` request fails before Cloudflare is called.

Cloud Function logs show:

```text
FirebaseAuthError: auth/insufficient-permission
service account: 61898329222-compute@developer.gserviceaccount.com
```

In Google Cloud Console for `app-spnd-dev`, go to **IAM & Admin → IAM**, edit that service account, and grant **Firebase Authentication Admin**. Retry afterward.

## Required Firebase secrets

Before (or after) deploying the Cloudflare-rule code, set these in `app-spnd-dev`:

```bash
npx -y firebase-tools@latest functions:secrets:set CLOUDFLARE_API_TOKEN --project app-spnd-dev
npx -y firebase-tools@latest functions:secrets:set CLOUDFLARE_ZONE_ID --project app-spnd-dev
npx -y firebase-tools@latest functions:secrets:set CLOUDFLARE_EMAIL_WORKER_NAME --project app-spnd-dev
```

Create the Cloudflare token with only **Zone → Email Routing Rules → Edit** for `jrm-labs.com`. Do not use a Global API key.

For the current development Worker, `CLOUDFLARE_EMAIL_WORKER_NAME` should be `app-spnd-email-worker-dev` if that is the deployed Worker receiving development email.

Deploy the updated function:

```bash
npx -y firebase-tools@latest deploy --only functions:provisionFamily --project app-spnd-dev
```

## Next test sequence

1. Fix the runtime service-account role above.
2. Confirm all three Cloudflare secrets are set.
3. Deploy `provisionFamily`.
4. Register a fresh test user with a real inbox, verify the Firebase email, and complete household setup.
5. Confirm an exact Cloudflare routing rule exists for the returned `@app-spnd.jrm-labs.com` address and targets the email Worker.
6. Forward a receipt to that address.
7. Check Worker logs, `ingestEmail` logs, Cloud Storage, and Firestore for the resulting raw email and receipt records.

## Validated locally

After the Cloudflare-rule implementation:

- `npm exec nx run functions:typecheck --skipNxCache`
- `npm exec nx run functions:lint --skipNxCache`
- `npm exec nx run functions:build --skipNxCache`

all passed. Nx Cloud artifact upload was unavailable locally because DNS could not resolve Nx Cloud; that did not affect task execution.
