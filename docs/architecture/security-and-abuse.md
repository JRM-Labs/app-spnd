# Security And Abuse

## Objective

Define early security boundaries for email ingestion, raw email storage, receipt parsing, and family data access.

## Trust Model

Trusted:

- Firebase Admin SDK in server-side functions.
- Cloudflare Worker calls authenticated by a shared secret or signature.

Untrusted:

- Browser clients.
- Incoming email contents.
- Forwarded headers.
- AI parser output.

## Ingestion Endpoint

The Firebase ingest endpoint must:

- Require authentication from Cloudflare Worker.
- Reject requests without valid signature/secret.
- Limit request size.
- Log unknown recipients.
- Quarantine unknown recipients for later review.
- Avoid creating families from inbound email.
- Avoid trusting any family ID in the request body.

## Raw Email Access

Raw email artifacts may contain personal information and billing details.

Rules:

- Raw email files are private.
- Client apps do not get broad raw email read access.
- Admin/debug views should use narrowly scoped server endpoints.
- Logs should not dump full raw email bodies.

## Payment Data

Store only masked/display payment details from the Apple receipt email.

Allowed:

- Payment label.
- Network.
- Last four digits when shown in the email.
- Apple Pay indicator.
- Billing name/address lines from the receipt.

Not allowed:

- Full card numbers.
- Payment credentials.
- Any attempt to reconstruct sensitive payment data.

## Parser Output

Parser output is untrusted until validated.

Validation must check:

- Identity fields.
- Date fields.
- Money fields.
- Line-item duplication.
- Total/subtotal/tax reconciliation.

## Family Access

Users can access only families they belong to.

Family admins can:

- Edit member mappings.
- Reassign receipts and purchases.
- Retry failed parses.

Non-admin members may have read-only access initially unless product scope changes.

## Abuse Cases

- Unknown users send email to generated addresses.
- A family address is leaked.
- Duplicate emails are sent repeatedly.
- Oversized emails are sent.
- Non-Apple emails are sent.
- Malformed MIME content attempts to break parser logic.

## Mitigations

- Unguessable generated addresses.
- Unknown recipient quarantine with review workflow.
- Request size limits.
- Message hashing and dedupe.
- Sender/domain checks for Apple receipt parsing.
- Parser sandboxing and strict timeouts.
- Address rotation later if needed.
