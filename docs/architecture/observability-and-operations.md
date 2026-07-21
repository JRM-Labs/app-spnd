# Observability And Operations

## Objective

Define the minimum logs, metrics, alerts, and operational workflows needed before AppSpnd starts ingesting real receipt emails.

## Structured Logs

Every server-side step should log structured events without dumping raw email contents.

Recommended events:

- `email.received`
- `email.recipient_unknown`
- `email.raw_stored`
- `email.duplicate_detected`
- `parse.job_created`
- `parse.started`
- `parse.succeeded`
- `parse.needs_review`
- `parse.failed`
- `receipt.created`
- `receipt.updated`
- `receipt.duplicate_skipped`
- `correction.created`

## Log Fields

Include:

- `familyId`
- `rawEmailId`
- `parseJobId`
- `receiptId`
- `documentNumber`
- `orderId`
- `messageHash`
- `parserVersion`
- `status`

Do not include:

- Full raw email.
- Full billing address in logs.
- Full decoded HTML.
- Secrets.

## Metrics To Watch

- Emails received.
- Unknown recipient count.
- Raw email storage failures.
- Parse job success rate.
- Parse job failure rate.
- `needs_review` rate.
- Duplicate detection count.
- Average parse duration.
- Function error count.
- Storage usage.
- Firestore read/write volume.

## Alerts

Initial alerts should cover:

- Firebase Function error spikes.
- Raw email storage failures.
- Parser failure rate above expected threshold.
- Unknown recipient spike.
- Billing budget thresholds.
- Cloudflare Worker delivery failures.

## Manual Operations

Admin/debug workflows eventually needed:

- Retry parse job.
- Reprocess raw email with newer parser version.
- View parse error summary.
- Review unknown-recipient quarantine items.
- Reassign receipt/member attribution.
- Rotate a family forwarding address.
- Quarantine or block abusive source.

## First Implementation Bar

Before real testing:

- Ingest function logs unknown recipient and successful storage.
- Parse job status is visible in Firestore.
- Failures produce actionable error records.
- No function logs full raw email payloads.
- Budget alert exists.
