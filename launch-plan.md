# 🤖 AppSpnd Launch Plan

This is the shortest credible path from the current dev prototype to something you can actually use and decide whether to keep pushing.

## Current State

Working now:

- Cloudflare Email Routing delivers inbound email to the Worker.
- The Worker forwards raw email to Firebase.
- Firebase stores raw `.eml` files in Storage under `families/dev-family/raw-emails/...`.
- Firebase writes `rawEmails` metadata and rough `receipts` documents under `families/dev-family/...`.
- The Angular app has a basic Firebase-backed receipts service scaffolded.

Not production-ready yet:

- No authentication or user-bound Firestore access.
- No real family creation flow.
- No forwarding-address lookup in Firestore.
- Parser is still a rough Apple-focused proof, not a durable receipt parser.
- No review/correction workflow.
- No launch-grade security rules for client reads.

## Phase 1: Lock In Identity And Access

This is the next real milestone. Everything else gets cleaner once user identity and family ownership are real.

1. Enable Firebase Auth for the web app.
2. Add sign-in UI in Angular.
3. On first login, create:
   - `users/{userId}`
   - `families/{familyId}`
   - `families/{familyId}/userMemberships/{userId}`
4. Generate and store one forwarding address per family.
5. Replace the temporary `test@app-spnd... -> dev-family` mapping with a Firestore lookup.

Definition of done:

- A signed-in user lands in one real family.
- Firestore reads are scoped by family membership.
- The Angular app reads receipts for the logged-in user’s family, not `dev-family`.

## Phase 2: Make Ingest Stable

The ingest path works, but it still needs cleanup before it is trustworthy.

1. Keep `ingestEmail` ingest-only.
2. Add proper forwarding-address resolution from Firestore.
3. Reintroduce duplicate handling correctly:
   - keep repeated raw emails if useful
   - prevent duplicate spending records
4. Add better stage logging and error states.
5. Decide unknown-recipient behavior:
   - reject
   - quarantine

Definition of done:

- Repeated forwards do not double-count spend.
- Unknown addresses do not silently disappear.
- Every ingest failure is obvious in logs and recoverable.

## Phase 3: Upgrade The Parser

The current parser is enough to prove the pipe, not enough to trust.

1. Build a normalized email model:
   - headers
   - decoded HTML
   - decoded text
2. Add sanitized Apple receipt fixtures.
3. Extract reliable MVP fields:
   - merchant
   - document number
   - order ID
   - purchase date
   - total
   - currency
   - Apple account
   - line items
4. Write parser version and confidence on every receipt.
5. Mark uncertain receipts as `needsReview`.

Definition of done:

- A reasonable sample of real Apple receipts parse consistently.
- Receipt identity is stable enough to prevent duplicate spend.

## Phase 4: Build The MVP UI

The first usable UI should stay narrow.

Screens to build first:

- Sign in
- Setup / forwarding address
- Dashboard
- Receipts list
- Receipt detail
- Family members
- Review queue

The first useful dashboard only needs:

- recent receipts
- total spend
- `needsReview` count

Do not overbuild charts yet.

## Phase 5: Launch Bar

Call it launchable for personal use when all of this is true:

- Auth works.
- Family creation works.
- Forwarding address is generated and visible.
- Ingest works end to end for a real family.
- Raw emails are retained.
- Parsed receipts appear in the app.
- Duplicate emails do not create duplicate spending.
- Failed parses are visible and retryable.
- Firestore and Storage rules are no longer wide open or globally locked in the wrong places.

## Recommended Order

If you want the most leverage with the least wasted motion, do the work in this order:

1. Auth
2. Family creation + membership
3. Firestore rules for authenticated family reads
4. Angular app reads receipts for the logged-in family
5. Firestore forwarding-address lookup
6. Duplicate-spend handling
7. Parser fixtures and parser upgrade
8. Review/correction UI

## Things To Avoid

- Do not keep using `dev-family` longer than necessary.
- Do not use `ingestEmail` for app reads.
- Do not let client code write trusted receipt totals.
- Do not treat the current parser as reliable enough for launch.
- Do not widen Firestore rules more than needed just to make the UI easier.
