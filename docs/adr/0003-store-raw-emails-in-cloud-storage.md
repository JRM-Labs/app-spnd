# ADR 0003: Store Raw Emails In Cloud Storage

## Status

Accepted

## Context

Apple receipt emails can contain large raw payloads, multi-line headers, quoted-printable HTML, nested tables, provider relay headers, and possibly attachments or forwarded `.eml` files.

Firestore is appropriate for queryable metadata and parsed records. It is not the right place to store full raw email artifacts.

## Decision

Store raw email artifacts in Google Cloud Storage/Firebase Storage.

Suggested path:

```text
gs://{bucket}/families/{familyId}/raw-emails/{rawEmailId}.eml
```

Store metadata in Firestore:

```text
families/{familyId}/rawEmails/{rawEmailId}
```

## Consequences

- Raw emails are preserved for reprocessing.
- Parser improvements can run against original source material.
- Firestore documents remain smaller and query-focused.
- Storage access must be server-controlled; clients should not freely read raw email artifacts.
- The raw email artifact is the audit source for parser output.

## Alternatives Considered

- Store raw email body directly in Firestore.
- Store raw email in Cloudflare R2.
- Store only parsed receipt data.

## Notes

Cloudflare receives the email. Firebase/GCP stores the raw email and owns the application data lifecycle.
