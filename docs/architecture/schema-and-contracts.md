# Schema And Contracts

## Objective

Define how AppSpnd keeps parser output, Firestore writes, Cloudflare ingestion payloads, and frontend types aligned.

## Contracts Needed

### Cloudflare To Firebase Ingest Request

Defines:

- Required headers.
- Raw email body format.
- Authentication/signature.
- Expected status responses.

### Normalized Email

Defines:

- Headers.
- Decoded HTML.
- Decoded text.
- Attachments.
- Provider metadata.

### Parsed Receipt

Defines:

- Receipt identity.
- Apple account.
- Purchase date.
- Totals.
- Payment display information.
- Attribution candidates.
- Parser metadata.

### Parsed Line Item

Defines:

- Item identity.
- Title/subtitle.
- Type/category.
- Developer/publisher.
- Device/person label.
- Price.
- Artwork.
- Links.
- Raw/source details.

### Correction Command

Defines:

- Who is changing what.
- Target receipt or line item.
- Previous and next values.
- Reason.

## Versioning

Every parser result should carry:

```text
schemaVersion
parserVersion
normalizerVersion
```

Versioning matters because raw emails may be reprocessed later.

## Recommended Implementation

Use a TypeScript schema library for runtime validation and type inference.

Candidate:

```text
Zod
```

Benefits:

- Validates untrusted parser output.
- Infers frontend/backend types.
- Produces focused test fixtures.
- Makes reprocessing safer.

## Rule

No parser output should be written as trusted receipt data until it passes schema validation.
