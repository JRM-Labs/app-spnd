# Email Ingestion Flow

## Objective

Receive Apple receipt emails at generated family addresses, store the raw email, and create a parse job without trusting client-provided data.

## Flow

```text
1. Family is created
2. AppSpnd generates forwardingEmail
3. User configures Apple receipt forwarding
4. Apple receipt email reaches Cloudflare
5. Cloudflare Worker forwards raw email to Firebase
6. Firebase validates Worker request
7. Firebase looks up family by recipient address
8. Firebase stores raw email in Cloud Storage
9. Firebase writes rawEmail metadata to Firestore
10. Firebase creates parse job
```

## Generated Address

```text
{familyId}@app-spnd.jrm-labs.com
```

This address is the routing key. The email recipient maps to the family.

## Firebase Ingest Function Inputs

Minimum request data from Cloudflare:

- Raw message body.
- Original recipient.
- Original sender.
- Received timestamp if available.
- Cloudflare request signature or shared secret.

## Raw Storage Path

```text
families/{familyId}/raw-emails/{rawEmailId}.eml
```

## Firestore Metadata

```text
families/{familyId}/rawEmails/{rawEmailId}
  familyId
  rawEmailId
  storagePath
  to
  from
  subject
  messageId
  appleTransactionId
  appleBusinessGroup
  appleEmailTypeId
  receivedAt
  ingestedAt
  status
  messageHash
  parseJobId
```

## Unknown Recipient Handling

If no family matches the recipient address:

- Do not parse.
- Do not create a family.
- Store the raw message in quarantine for later human or AI review.
- Surface the quarantined message in an admin review flow.
- Emit structured log/alert.

## Idempotency

The ingest function should be safe for retries.

Idempotency signals:

- Message hash.
- RFC `Message-ID`.
- Apple `X-TXN_ID`.
- Recipient address.

Duplicate delivery should not create duplicate parse jobs for the same raw email unless explicitly requested.

## Security

- Only Cloudflare should call the ingest function.
- The ingest function should reject unauthenticated requests.
- Clients should not call ingestion endpoints directly.
- Raw email files should not be publicly readable.
