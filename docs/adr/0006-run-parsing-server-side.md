# ADR 0006: Run Parsing Server-Side

## Status

Accepted

## Context

Receipt parsing is trust-sensitive. It may use AI, parser credentials, retry workflows, raw email access, dedupe rules, and privileged writes to receipt records and aggregates.

Parsing Apple receipt emails also requires MIME decoding, quoted-printable HTML decoding, DOM/table parsing, validation, and duplicate desktop/mobile markup handling.

## Decision

Run receipt parsing only in trusted server-side code.

The client can:

- Display parsed receipts.
- Show parser status.
- Submit corrections.
- Request a retry when allowed.

The client cannot:

- Call AI parsing providers directly.
- Write trusted parsed totals directly.
- Bypass dedupe or validation.
- Read unrestricted raw email artifacts.

## Consequences

- Parser code can safely use secrets and privileged Firebase Admin APIs.
- Parser output can be versioned and reprocessed.
- User corrections must be tracked separately from raw parser output.
- Parser implementation can evolve from deterministic DOM extraction to AI-assisted extraction without changing client trust boundaries.

## Alternatives Considered

- Client-side parsing.
- Client-side AI calls.
- Manual-only receipt entry.

## Notes

AI output is treated as candidate data and must pass schema validation and reconciliation before becoming trusted app data.
