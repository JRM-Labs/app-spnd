# Firestore Query And Aggregate Strategy

## Objective

Define expected query patterns before locking in Firestore document shapes.

## Known MVP Views

- Dashboard totals.
- Recent receipts.
- Receipt list.
- Receipt detail.
- Family members.
- Member detail.
- Parser review queue.
- Failed parse list.

## Query Patterns

### Dashboard

Needs:

- Total spend for date ranges.
- Spend by member.
- Spend by category/type.
- Recent purchases.

Avoid computing dashboard totals by scanning all receipts on every page load.

### Receipt List

Needs:

- Paginated receipts by purchase date.
- Filter by member.
- Filter by status.
- Search by document/order maybe later.

### Parser Review

Needs:

- Parse jobs by status.
- Failed/needs-review records first.
- Link from parse job to raw email and receipt if created.

## Aggregate Documents

Use server-maintained aggregate documents for expensive dashboard data.

Suggested paths:

```text
families/{familyId}/summaries/current
families/{familyId}/summaries/monthly-{yyyyMM}
families/{familyId}/memberSummaries/{memberId}
```

These should be written by server-side Functions after receipt creation/correction.

## Firestore Index Planning

Likely indexes:

- Receipts by `purchaseDate desc`.
- Receipts by `status`, `purchaseDate desc`.
- Receipts by `assignedMemberId`, `purchaseDate desc`.
- Parse jobs by `status`, `createdAt desc`.
- Raw emails by `messageHash`.
- Raw emails by `messageId`.

Exact indexes should be generated from emulator/dev errors and then committed.

## Document Size Watchouts

Firestore documents have size limits. Receipt documents should not grow without bound.

Keep large or repeated data out of the receipt root when needed:

- Raw `.eml` stays in Storage.
- Line items live in subcollection.
- Parser debug artifacts can live in Storage or separate debug docs.
- Full raw HTML fragments should be used carefully.

## Correction Impact

When an admin reassigns a receipt or line item:

- Write correction audit record.
- Update receipt or line item attribution.
- Update affected aggregate documents.
- Preserve parser-original attribution separately if useful.

## First Implementation Recommendation

Start with receipt and line-item documents, but add summary document writes before building dashboard-heavy UI. This avoids a frontend that only works with tiny data.
