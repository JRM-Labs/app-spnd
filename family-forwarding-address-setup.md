# 🤖 Family Forwarding Address Setup

This setup creates the ownership layer required before raw email persistence. The goal is simple: Cloudflare receives mail for a generated address, Firebase resolves that address to a family, then every raw email and parsed record is stored under that family.

## Current Decision

Use generated family forwarding addresses:

```text
{alias}@app-spnd.jrm-labs.com
```

Example:

```text
harris-k7p3xq@app-spnd.jrm-labs.com
```

The alias is only a routing handle. It should resolve to an internal `familyId`, and storage should use the `familyId`, not the alias.

## 1. Confirm Firestore Target

Before adding data, confirm the project and database:

```bash
npx -y firebase-tools@latest use
npx -y firebase-tools@latest firestore:databases:list --project dev
```

If the default database does not exist yet, create it in the Firebase Console or with the CLI. Keep it in the same region family as the rest of the backend when possible.

## 2. Add Core Collections

Use this initial Firestore shape:

```text
users/{userId}
families/{familyId}
families/{familyId}/userMemberships/{userId}
forwardingAddresses/{normalizedRecipient}
```

Suggested `families/{familyId}` fields:

```ts
{
  displayName: string,
  organizerUserId: string,
  activeForwardingAddress: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Suggested `families/{familyId}/userMemberships/{userId}` fields:

```ts
{
  userId: string,
  role: 'organizer' | 'admin' | 'viewer',
  status: 'active' | 'disabled',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Suggested `forwardingAddresses/{normalizedRecipient}` fields:

```ts
{
  normalizedRecipient: string,
  familyId: string,
  status: 'active' | 'disabled',
  createdByUserId: string,
  createdAt: Timestamp,
  disabledAt?: Timestamp,
  rotatedTo?: string
}
```

Normalize addresses to lowercase and trim whitespace before lookup.

## 3. Skip Manual Seeding for Now

Do not manually seed these records just to prove email ingest. The current dev pipeline can use a temporary function-side mapping:

```text
test@app-spnd.jrm-labs.com -> dev-family
```

Add the Firestore records when the app has signup/onboarding or when multiple real families need separate addresses. Until then, manual seed records are ceremony.

## 4. Add a Function-Side Resolver

Update `ingestEmail` to resolve ownership before storage:

1. Read the recipient header from Cloudflare.
2. Normalize the address.
3. Load `forwardingAddresses/{normalizedRecipient}`.
4. Reject the request if the document is missing.
5. Reject the request if `status !== 'active'`.
6. Carry `familyId` into raw email persistence.

Unknown recipients should return a non-2xx response and write a structured warning log. They must not create families automatically.

## 5. Generate Real Aliases Later

When signup/onboarding exists, a backend function should create the family and alias together:

1. Firebase Auth creates the user.
2. A callable or HTTPS function creates `families/{familyId}`.
3. The same function creates `families/{familyId}/userMemberships/{userId}`.
4. It generates an unguessable alias.
5. It writes `forwardingAddresses/{normalizedRecipient}`.
6. It stores the active address on `families/{familyId}` for display.

Do not let the client choose arbitrary aliases for MVP. Generate them server-side to avoid collisions, impersonation, and support issues.

## 6. Raw Email Paths After Resolution

Once `familyId` is known, store the raw `.eml` under:

```text
families/{familyId}/raw-emails/{yyyy}/{mm}/{messageId}.eml
```

Write metadata under:

```text
families/{familyId}/rawEmails/{rawEmailId}
```

Include:

```ts
{
  familyId: string,
  rawEmailId: string,
  storagePath: string,
  to: string,
  from: string,
  subject: string,
  messageId?: string,
  messageHash: string,
  receivedAt: Timestamp,
  ingestedAt: Timestamp,
  status: 'received' | 'duplicate' | 'parseQueued' | 'needsReview' | 'failed'
}
```

## 7. Security Notes

Firestore and Storage client rules should remain default-deny until the web app needs reads. Server-side Firebase Functions can write with Admin credentials, but user-facing reads/writes must later check family membership through `families/{familyId}/userMemberships/{userId}`.

The Cloud Run function can stay public because `ingestEmail` validates `INGEST_SHARED_SECRET`. Public access only allows the request to reach the function; the shared secret decides whether it is accepted.

## 8. Validation Checklist

- `test@app-spnd.jrm-labs.com` exists in `forwardingAddresses`.
- The forwarding address points to `dev-family`.
- `ingestEmail` rejects unknown recipients.
- `ingestEmail` rejects disabled recipients.
- Known active recipients resolve a `familyId`.
- Raw email persistence uses `familyId`, not the alias.
- Logs include recipient, resolved `familyId`, and rejection reason when applicable.

## References Checked

- Local Firebase Firestore skill: data model and security rule guidance.
- Local Firebase Auth skill: `request.auth` and ownership checks for future client rules.
- Firebase Firestore data model docs: documents, collections, subcollections, and lightweight document design.
- Firebase Firestore security rules docs: rules structure, default-deny thinking, and server SDK/IAM behavior.
- Firebase callable functions docs: useful later for authenticated family creation from the web app.
