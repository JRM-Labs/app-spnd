# ADR 0008: Document Number Is Primary Receipt Identity

## Status

Accepted

## Context

Apple receipt emails include a `DOCUMENT NO.` field. The same receipt may be forwarded more than once, and Apple emails may include multiple line items under one document.

The old prototype used combinations of document number and order ID in places. The new model should make identity explicit.

## Decision

Use Apple `DOCUMENT NO.` as the primary receipt-level identity when present.

Dedupe should consider:

- `documentNumber`
- `orderId`
- Apple `X-TXN_ID` header when present
- RFC `Message-ID`
- raw message hash

Line items are children of a receipt/document and should not be treated as independent receipts.

## Consequences

- Duplicate forwarded emails should not double-count spending.
- Multi-line-item receipts remain a single receipt with multiple child items.
- Missing document numbers must fall back to secondary identity signals.
- Parser validation should flag receipts with weak identity confidence.

## Alternatives Considered

- Use raw message hash only.
- Use order ID only.
- Treat each line item as a receipt.

## Notes

The parser should retain all identity signals, even when one is selected as primary.
