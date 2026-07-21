# Parser Pipeline

## Objective

Convert raw Apple receipt emails into normalized receipt records while preserving raw source data, parser metadata, and reviewability.

## Pipeline

```text
raw .eml
  -> MIME parse
  -> header normalization
  -> body decoding
  -> DOM/table extraction
  -> canonical receipt mapping
  -> schema validation
  -> dedupe
  -> receipt write
  -> aggregate/member updates
```

## Stage 1: MIME Parse

Use a real MIME parser to extract:

- Headers.
- HTML body.
- Text body.
- Attachments.
- Content transfer encoding.
- Message identifiers.

The parser must support multi-line/folded headers and quoted-printable body content.

## Stage 2: Normalize Email

Create a normalized email representation:

```text
normalizedEmail
  headers
  html
  text
  attachments
  providerMetadata
```

Normalization tasks:

- Decode quoted-printable HTML.
- Decode HTML entities.
- Normalize Apple `Apple Account` and legacy `Apple ID` labels.
- Preserve original links and unwrap provider safe-links when possible.
- Identify desktop/mobile duplicate sections.

## Stage 3: Extract Receipt Header

Extract:

- Apple account.
- Billed-to/payment section.
- Purchase date.
- Order ID.
- Document number.
- Subtotal.
- Tax.
- Total.
- Currency.

## Stage 4: Extract Line Items

Extract every useful line-item detail:

- Title.
- Subtitle.
- Type.
- Category.
- Developer/publisher.
- Device/person label.
- Price.
- Currency.
- Image/artwork URL.
- Report-a-problem URL.
- Original URLs.
- Raw text.
- Raw HTML fragment.

Line items belong to the receipt document. They are not independent receipts.

## Stage 5: Optional AI Assistance

Gemini is the initial AI-assisted parser provider for MVP-era extraction support. AppSpnd should keep the integration boundary clean enough to allow fallback or secondary providers later if cost, quality, or availability pressures require it.

AI output is candidate data only. It must pass schema validation and reconciliation before being trusted.

## Stage 6: Validation

Validate:

- Document number or fallback identity exists.
- Date is parseable.
- Money fields are valid.
- Item totals reconcile with subtotal/total when possible.
- Repeated desktop/mobile sections are not double-counted.
- Required line-item fields are present or clearly marked unknown.

## Stage 7: Write Results

Write:

- Parse job result.
- Parsed receipt.
- Line items.
- Attribution candidates.
- Validation warnings.
- Parser debug metadata when useful.

## Reprocessing

Every receipt should be traceable to raw email storage. Reprocessing starts from the raw `.eml`, not from prior parsed output.
