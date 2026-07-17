# ADR 0007: Web-First Angular Application

## Status

Accepted

## Context

The MVP needs to prove receipt ingestion, parsing, family attribution, review, and dashboard workflows before investing in native mobile.

The existing prototype and developer experience are Angular-oriented.

## Decision

Build the first client as a web-first Angular application.

Mobile/native work is out of MVP scope. A future iOS application may be considered after the ingestion and parsing system is reliable.

## Consequences

- Product iteration focuses on the core workflow first.
- Admin/review tools can ship in the same web app.
- Shared contracts and design tokens can still be prepared for future clients.
- Native iOS decisions remain deferred until there is enough validated product behavior.

## Alternatives Considered

- Native SwiftUI first.
- Ionic/Capacitor first.
- Flutter first.

## Notes

Future mobile work should reuse contracts and design tokens, not duplicate parsing or ingestion responsibilities.
