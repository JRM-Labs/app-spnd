# PRD 003: Receipt Ingestion

## Status

Draft

## Objective

Reliably receive forwarded receipt emails, map each email to the correct family, store the raw email, and trigger downstream parsing.

## Decision Summary

AppSpnd will not create real mailbox accounts per family. It will generate deterministic-looking but unguessable forwarding addresses and use inbound email routing to deliver raw messages into Firebase.

Recommended initial path:

```text
{familyId}@receipts.jrm-labs.com
  -> Cloudflare Email Worker
  -> Firebase HTTPS Function
  -> Cloud Storage raw email
  -> Firestore raw email metadata
  -> parser job
```

## Address Generation

Each family receives one forwarding address:

```text
{familyId}@receipts.jrm-labs.com
```

The address should be stable for the family, stored on the family document, and shown in onboarding/profile screens.

## Inbound Email Requirements

- Accept email sent to generated family forwarding addresses.
- Capture the original recipient address.
- Capture sender, subject, received timestamp, headers, and raw body.
- Preserve the raw `.eml` or equivalent message payload.
- Preserve multi-line/folded headers exactly in the raw email artifact.
- Store enough normalized metadata to find a message without reparsing the full raw file.
- Reject or quarantine messages that do not map to a known family.
- Avoid trusting client-provided family IDs during ingestion.

## Raw Email Storage

Raw email content should be saved before parsing.

Storage target:

```text
gs://{bucket}/families/{familyId}/raw-emails/{rawEmailId}.eml
```

Firestore metadata:

```text
families/{familyId}/rawEmails/{rawEmailId}
```

Suggested fields:

- `familyId`
- `rawEmailId`
- `storagePath`
- `to`
- `from`
- `subject`
- `messageId`
- `appleTransactionId`
- `appleBusinessGroup`
- `appleEmailTypeId`
- `receivedAt`
- `ingestedAt`
- `status`
- `parserVersion`
- `parseJobId`
- `messageHash`

## Duplicate Handling

The ingestion function should calculate a stable hash from the raw message or meaningful email identifiers. If the same receipt is forwarded more than once, AppSpnd should keep the raw email record if needed but avoid double-counting parsed spending.

Useful duplicate signals include:

- Raw message hash.
- RFC `Message-ID`.
- Apple `X-TXN_ID` when present.
- Parsed Apple document number.
- Parsed Apple order ID.

The parsed Apple document number should be treated as the strongest receipt-level identifier when available.

## Failure States

- Unknown forwarding address.
- Invalid or missing raw email payload.
- Storage write failure.
- Firestore write failure.
- Parser enqueue failure.

Failures should be observable and recoverable. Unknown recipient messages should not create families automatically.

## Acceptance Criteria

- A generated family address can receive a forwarded receipt.
- The raw email is saved before parsing.
- The raw email metadata is linked to the correct family.
- Unknown recipient emails are rejected or quarantined.
- Ingestion is idempotent for repeated webhook delivery.
- Parser execution can be retried from the stored raw email.
