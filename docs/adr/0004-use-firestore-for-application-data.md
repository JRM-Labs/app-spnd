# ADR 0004: Use Firestore For Application Data

## Status

Accepted

## Context

AppSpnd needs to store users, family/business groups, generated forwarding addresses, raw email metadata, parse jobs, parsed receipts, line items, member mappings, review states, and correction history.

The MVP benefits from Firebase Authentication integration and serverless access patterns.

## Decision

Use Firestore as the primary application database.

Firestore stores:

- User profiles.
- Family/business group records.
- Membership/admin roles.
- Generated forwarding address metadata.
- Raw email metadata.
- Parse jobs.
- Parsed receipt documents.
- Line items and extracted details.
- Member attribution and reassignment data.

## Consequences

- Data model must be shaped around known query patterns.
- Aggregates should be maintained intentionally rather than computed through expensive broad reads.
- Server-side functions should own trusted receipt, parse, and aggregate writes.
- Security rules must prevent users from reading families they do not belong to.

## Alternatives Considered

- MongoDB.
- PostgreSQL.
- Hybrid Firestore plus SQL.

## Notes

Firestore does not replace Cloud Storage for raw email artifacts.
