# Parser Fixtures And Tests

## Objective

Define how AppSpnd will test Apple receipt parsing before relying on it for product data.

## Why This Matters

Apple receipts are not simple text files. They may include:

- MIME multipart bodies.
- Quoted-printable HTML.
- Folded headers.
- Desktop and mobile duplicate markup.
- Outlook/Gmail/forwarding wrappers.
- Safe-link rewrites.
- Multiple line items in one document.
- Payment details under `BILLED TO`.
- Artwork and report-a-problem links embedded in table markup.

Parser work should start with fixtures, not production code guesses.

## Fixture Types

### Raw Email Fixtures

Full `.eml` samples with headers and body intact.

Path:

```text
fixtures/apple-receipts/raw/{fixtureName}.eml
```

### Expected Normalized Email Fixtures

Decoded and normalized intermediate output.

Path:

```text
fixtures/apple-receipts/normalized/{fixtureName}.json
```

### Expected Receipt Fixtures

Canonical parser output expected from a raw email.

Path:

```text
fixtures/apple-receipts/expected/{fixtureName}.json
```

## Privacy Rule

Real receipt fixtures may contain personal data. Before committing fixtures:

- Redact names.
- Redact addresses.
- Redact Apple account emails unless using synthetic addresses.
- Keep only masked payment data already present in the email.
- Preserve structure while replacing private values.

Private unredacted fixtures should stay outside git.

## Minimum Fixture Coverage Before MVP

- Single item Apple receipt.
- Multi-item Apple receipt.
- In-app purchase receipt.
- Subscription receipt or renewal.
- Receipt forwarded normally.
- Receipt forwarded as `.eml` attachment if that workflow is supported.
- Receipt with Outlook-style relay headers.
- Receipt with desktop/mobile duplicate markup.
- Failed/unsupported Apple email.

## Test Levels

### MIME Normalization Tests

Assert:

- Headers unfold correctly.
- HTML/text bodies decode correctly.
- Quoted-printable content is decoded.
- Original links and safe-link original URLs are handled.

### Receipt Extraction Tests

Assert:

- Document number.
- Order ID.
- Apple account.
- Purchase date.
- Totals.
- Payment display information.
- Line items.
- Artwork URLs.
- Report-a-problem URLs.

### Validation Tests

Assert:

- Duplicate desktop/mobile sections do not double-count.
- Totals reconcile where possible.
- Missing identity fields produce `needs_review` or `failed`.
- Parser output conforms to schema.

### Idempotency Tests

Assert:

- Same raw email does not create duplicate spending.
- Same document number does not create duplicate receipt.
- Reprocessing updates parser metadata intentionally.

## Parser Versioning

Every parser result should include:

```text
parserVersion
normalizerVersion
schemaVersion
```

Version changes should be visible in parse job metadata.
