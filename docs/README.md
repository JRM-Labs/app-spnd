# AppSpnd Documentation

This folder is the planning source of truth before implementation starts.

## Recommended Read Order

1. [Product Vision](prd/001-product-vision.md)
2. [MVP Scope](prd/002-mvp-scope.md)
3. [System Overview](architecture/system-overview.md)
4. [Firebase And Cloudflare Setup Runbook](operations/firebase-cloudflare-setup.md)
5. [Architecture Decision Records](#architecture-decision-records)

## Product Requirements

- [PRD 001: Product Vision](prd/001-product-vision.md)
- [PRD 002: MVP Scope](prd/002-mvp-scope.md)
- [PRD 003: Receipt Ingestion](prd/003-receipt-ingestion.md)
- [PRD 004: Family Accounts](prd/004-family-accounts.md)
- [PRD 005: Parsing And Review](prd/005-parsing-and-review.md)

## Architecture

- [System Overview](architecture/system-overview.md)
- [Email Ingestion Flow](architecture/email-ingestion-flow.md)
- [Parser Pipeline](architecture/parser-pipeline.md)
- [Data Model](architecture/data-model.md)
- [Schema And Contracts](architecture/schema-and-contracts.md)
- [Firestore Query And Aggregate Strategy](architecture/firestore-query-and-aggregate-strategy.md)
- [Roles And Permissions](architecture/roles-and-permissions.md)
- [Security And Abuse](architecture/security-and-abuse.md)
- [Privacy, Retention, And Deletion](architecture/privacy-retention-and-deletion.md)
- [Observability And Operations](architecture/observability-and-operations.md)
- [Parser Fixtures And Tests](architecture/parser-fixtures-and-tests.md)
- [Environments And Deployment](architecture/environments-and-deployment.md)

## Architecture Decision Records

- [ADR 0001: Use Firebase-First Backend](adr/0001-use-firebase-first-backend.md)
- [ADR 0002: Use Cloudflare Email Routing For Inbound Email](adr/0002-use-cloudflare-email-routing-for-inbound-email.md)
- [ADR 0003: Store Raw Emails In Cloud Storage](adr/0003-store-raw-emails-in-cloud-storage.md)
- [ADR 0004: Use Firestore For Application Data](adr/0004-use-firestore-for-application-data.md)
- [ADR 0005: Use Generated Family Forwarding Addresses](adr/0005-use-generated-family-forwarding-addresses.md)
- [ADR 0006: Run Parsing Server-Side](adr/0006-run-parsing-server-side.md)
- [ADR 0007: Web-First Angular Application](adr/0007-web-first-angular-application.md)
- [ADR 0008: Document Number Is Primary Receipt Identity](adr/0008-document-number-is-primary-receipt-identity.md)

## Operations

- [Firebase And Cloudflare Setup Runbook](operations/firebase-cloudflare-setup.md)

## Research

- [Market Viability And Pricing](research/market-viability-and-pricing.md)

## Design

- [Google Stitch UI Design Prompt](design/google-stitch-ui-prompt.md)

## Decisions To Resolve Before Production

- Final Firebase project IDs for dev and production.
- Final inbound receipt subdomain.
- Unknown-recipient policy: drop at Worker level or quarantine in Firebase.
- Raw email retention policy.
- Whether normalized parser artifacts are stored in all environments or only during development.
- Angular hosting target.
- Whether parser execution stays on Cloud Functions or moves to Cloud Run before production.
- AI parser provider and fallback strategy.
