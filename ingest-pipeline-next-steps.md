# 🤖 Email Ingest Pipeline Next Steps

The Cloudflare-to-Firebase handshake is working. Cloudflare Email Routing receives mail for `test@app-spnd.jrm-labs.com`, invokes `app-spnd-email-worker-dev`, and the Worker posts the raw RFC822 payload to the Firebase `ingestEmail` function with the shared secret.

## 1. Commit the Infrastructure Baseline

Commit the source and configuration needed to reproduce the current setup:

- `apps/email-worker/`
- `apps/functions/`
- `firebase.json`
- `.firebaserc`
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- package and Nx project changes

Do not commit local secrets, `.env` files, generated output, local agent config, or tool caches.

## 2. Persist Raw Email First

Update `ingestEmail` to store the raw email in Firebase Storage before parsing. This keeps the original input replayable while parser logic changes.

Suggested path:

```text
raw-emails/{yyyy}/{mm}/{messageId}.eml
```

Also create a Firestore metadata document with sender, recipient, subject, content type, byte size, received timestamp, storage path, and status.

## 3. Add Idempotency

Extract the email `Message-ID` header when available. If it is missing, generate a deterministic hash from sender, recipient, subject, date, and raw bytes. Use that value as the ingest identity so Cloudflare retries do not create duplicates.

## 4. Build Parser Fixtures

Save sanitized real emails as parser fixtures. Start with a few known examples such as Apple receipts, then add more merchants as parsing rules mature.

Suggested location:

```text
libs/parser/src/fixtures/
```

## 5. Implement the Parser Library

Build parsing in `libs/parser` and keep the first version narrow. Parse merchant, transaction date, total, currency, document number, and line items when available. Return a normalized result plus warnings for uncertain fields.

## 6. Store Parsed Results

Write parsed output to Firestore separately from raw ingest metadata. A practical starting point:

- `emailIngests`: raw email metadata and processing status
- `transactions`: normalized spending records

Keep parser failures visible with `needsReview` status instead of dropping data.

## 7. Add the Review UI

Use the Angular app to show recent ingests, parser status, parsed transaction previews, and records requiring manual review. This should come after raw email persistence so the UI can work against real data.

## Operational Notes

- Keep `INGEST_SHARED_SECRET` only in Firebase Secret Manager and Cloudflare Worker secrets.
- Keep the Cloud Run service public, but require the shared secret inside the function.
- Use `npx wrangler tail app-spnd-email-worker-dev` for Worker logs.
- Use Google Cloud Logs Explorer for `resource.labels.service_name="ingestemail"` when Firebase CLI logs are noisy.
