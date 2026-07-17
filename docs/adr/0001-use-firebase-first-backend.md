# ADR 0001: Use Firebase-First Backend

## Status

Accepted

## Context

AppSpnd is an event-driven application. Most backend work happens when a user signs in, an email arrives, a parser runs, or a receipt is corrected. It does not need an always-on custom API server for the MVP.

The product also needs authentication, document data, file storage, server-side functions, and integration with Google Cloud services.

## Decision

Use Firebase as the primary backend platform for the MVP.

Firebase responsibilities:

- Firebase Authentication for users.
- Firestore for app metadata and parsed data.
- Cloud Storage/Firebase Storage for raw email artifacts.
- Cloud Functions for trusted backend logic.
- Optional Cloud Run later for heavier parser workloads.

## Consequences

- The MVP avoids maintaining a custom Express server.
- Trusted logic still runs server-side in Firebase/GCP.
- Client apps must not directly perform parser writes, AI calls, or trusted aggregate updates.
- Local development should use Firebase emulators where practical.
- If parser workloads exceed Cloud Functions limits, move parser execution to Cloud Run without changing the product data model.

## Alternatives Considered

- Custom Node/Express server.
- Cloud Run-only backend.
- Fully client-driven Firebase app.

## Notes

Firebase replaces custom server hosting, not backend responsibility. Ingestion, parsing, validation, dedupe, and privileged writes still belong in server-side code.
