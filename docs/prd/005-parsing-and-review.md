# PRD 005: Parsing And Review

## Status

Draft

## Objective

Turn raw receipt emails into normalized receipt records while preserving the ability to audit, correct, and reprocess parser output.

## Parser Principles

- Raw email must be stored before parsing.
- Parsing runs server-side.
- AI output is never trusted directly.
- Parsed records include parser version metadata.
- Failed parses are visible and retryable.
- Users should be able to correct important receipt fields.

## Initial Parser Scope

The MVP parser targets Apple receipt emails.

Fields to extract:

- Merchant/source.
- Apple ID or billed-to account.
- Order ID.
- Document number.
- Purchase date.
- Currency.
- Subtotal.
- Tax.
- Total.
- Billed-to/payment method details.
- Line items.
- Item title.
- Item type.
- Item category.
- Item developer/publisher.
- Item image/artwork URL.
- Device or purchaser label when present.
- Item price.
- Report-a-problem/original item links when present.
- Subscription indicators when present.

## Pipeline

```text
raw email
  -> parse MIME
  -> unfold/decode headers
  -> decode html/text bodies
  -> normalize message
  -> extract receipt header fields
  -> extract line-item rows
  -> AI structured extraction or deterministic parser
  -> schema validation
  -> receipt dedupe
  -> receipt write
  -> family/member summary update
```

## Email Normalization Requirements

Apple receipt emails can include multi-line/folded headers, quoted-printable HTML, nested tables, desktop/mobile duplicate markup, encoded entities, tracking links, and long provider-specific relay headers from Outlook or other mail systems.

The parser should not rely on naive line splitting. It should first produce a normalized message model:

```text
normalizedEmail
  headers
  html
  text
  attachments
  providerMetadata
```

Normalization should:

- Preserve the raw `.eml` unchanged in Cloud Storage.
- Decode MIME parts using a real MIME parser.
- Decode quoted-printable content before receipt parsing.
- Unfold multi-line headers.
- Normalize Apple terminology such as `Apple Account` and legacy `Apple ID`.
- Strip or ignore provider-added wrappers and safe-link rewrites when extracting receipt fields.
- Avoid parsing duplicate desktop and mobile sections as separate purchases.

## Receipt Identity

Apple receipts include a `DOCUMENT NO.` field. AppSpnd should store this as `documentNumber` and use it as the primary receipt identity when present.

Receipt dedupe should consider:

- `documentNumber`
- `orderId`
- Apple `X-TXN_ID` header when present
- source message hash

Line items should be children of the receipt, not independent receipts. A single document can include multiple purchases.

## Data Capture Philosophy

The parser should extract and store every meaningful Apple receipt detail available in the email, even if the first UI does not display it.

The database should distinguish:

- Raw email artifact.
- Normalized parsed email/body data.
- Canonical receipt fields.
- Canonical line-item fields.
- Parser/debug metadata.

This avoids losing data that may later become useful for grouping, filtering, attribution, subscriptions, reporting, or parser improvement.

## Payment Method Extraction

Apple receipts include payment details under a `BILLED TO` section. AppSpnd should parse and store the non-sensitive payment display information available there.

Suggested payment fields:

- `paymentMethodLabel`
- `paymentNetwork`
- `paymentLast4`
- `paymentWallet`
- `billingName`
- `billingAddressLines`
- `billingCountry`

Examples:

- `Visa .... 8405`
- `Apple Pay`
- billing name and address lines

AppSpnd should not attempt to store full card numbers or sensitive payment credentials. Only the masked/display values present in the receipt email should be retained.

## Line Item Detail Extraction

Each receipt line item should preserve as much source detail as possible.

Suggested line item fields:

- `lineItemId`
- `title`
- `subtitle`
- `type`
- `category`
- `developer`
- `publisher`
- `deviceName`
- `purchaserLabel`
- `price`
- `currency`
- `quantity`
- `imageUrl`
- `reportProblemUrl`
- `originalUrls`
- `rawText`
- `rawHtmlFragment`
- `sourceSection`

For Apple App Store receipts, fields may come from visible item markup, image attributes, link URLs, section headers, or surrounding table context. For example, the sample receipt includes item title, in-app purchase name, type, device/person label, artwork URL, price, and report-a-problem link.

When a field cannot be confidently mapped to a canonical field, it should still be retained in a structured `sourceDetails` or `parserExtract` object rather than discarded.

## Parse Job Metadata

Suggested Firestore shape:

```text
families/{familyId}/parseJobs/{parseJobId}
  rawEmailId
  status
  parserVersion
  startedAt
  completedAt
  error
  confidence
```

Receipt records should include:

- `rawEmailId`
- `parserVersion`
- `parseJobId`
- `documentNumber`
- `orderId`
- `appleAccount`
- `paymentMethod`
- `billingInfo`
- `lineItems`
- `confidence`
- `status`
- `createdAt`
- `updatedAt`

## Validation Rules

The parser should validate:

- Required identifiers when available.
- Total, subtotal, and tax consistency.
- Currency presence.
- Date parseability.
- Duplicate document/order combinations.
- Item prices as valid money values.
- Repeated desktop/mobile markup does not create duplicate line items.
- Receipt-level totals reconcile with extracted line items when possible.

## Review States

- `parsed`: parser result passed validation.
- `needs_review`: parser result is usable but uncertain.
- `failed`: parser could not produce a valid receipt.
- `corrected`: user or admin changed parsed values.
- `reprocessed`: receipt was parsed again from raw email.

## Reprocessing

Stored raw emails allow AppSpnd to rerun parser jobs when:

- Parser version changes.
- Apple changes email format.
- A failed parse can be recovered.
- A user requests manual retry.

## Acceptance Criteria

- Raw Apple receipt email can be parsed into a receipt record.
- Parser output stores version and raw email linkage.
- Invalid parser output does not silently become trusted spending data.
- Failed parses are visible in a review/admin view.
- A raw email can be reprocessed without requiring the user to forward it again.
