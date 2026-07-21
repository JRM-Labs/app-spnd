# System Overview

## Purpose

AppSpnd ingests Apple receipt emails for a family or business group, preserves the raw source email, parses the receipt into structured purchase data, and presents spending views with review and correction workflows.

## High-Level Architecture

```text
Angular web app
  -> Firebase Auth
  -> Firestore reads for app data
  -> callable/HTTPS Functions for trusted commands

Cloudflare Email Worker
  -> receives *@app-spnd.jrm-labs.com email
  -> forwards raw message to Firebase ingest function

Firebase/GCP
  -> Cloud Functions for ingestion, parsing, corrections, aggregation
  -> Cloud Storage for raw .eml artifacts
  -> Firestore for metadata, receipts, line items, members, jobs
```

## Core Runtime Responsibilities

### Cloudflare

- Receive inbound email for the testing subdomain.
- Preserve original recipient address.
- Forward raw email to Firebase.
- Authenticate calls to Firebase with a secret or signed request.

### Firebase Functions

- Validate Cloudflare requests.
- Map recipient address to family.
- Store raw email artifacts.
- Create raw email metadata.
- Create and run parse jobs.
- Validate parser output.
- Write receipts and line items.
- Maintain aggregates and correction history.

### Firestore

- Users.
- Families/business groups.
- Member/admin roles.
- Raw email metadata.
- Parse job state.
- Parsed receipts.
- Receipt line items.
- Member attribution.
- Review/correction state.

### Cloud Storage

- Raw `.eml` email files.
- Optional normalized artifacts such as decoded HTML snapshots.
- Optional parser debug artifacts when needed.

### Angular Web App

- Authentication.
- Setup guide and forwarding address display.
- Dashboard.
- Receipt list/detail.
- Family members and mappings.
- Unknown-recipient review/admin workflows.
- Parser review/admin workflows.
- Receipt reassignment/correction UI.

## Trust Boundary

Clients are not trusted to write parsed receipt totals, parser output, raw email artifacts, or aggregate spending. Those writes happen server-side.

## MVP Deployment Shape

```text
app-spnd.jrm-labs.com MX
  -> Cloudflare Email Routing / Worker

Firebase project
  -> Auth
  -> Firestore
  -> Storage
  -> Functions

Angular web app
  -> Cloudflare-hosted web frontend for stage and production environments
```

## References

- [PRD 001: Product Vision](../prd/001-product-vision.md)
- [PRD 003: Receipt Ingestion](../prd/003-receipt-ingestion.md)
- [PRD 005: Parsing And Review](../prd/005-parsing-and-review.md)
- [Data Model](data-model.md)
- [Email Ingestion Flow](email-ingestion-flow.md)
- [Parser Pipeline](parser-pipeline.md)
- [Roles And Permissions](roles-and-permissions.md)
- [Firestore Query And Aggregate Strategy](firestore-query-and-aggregate-strategy.md)
- [Schema And Contracts](schema-and-contracts.md)
- [Parser Fixtures And Tests](parser-fixtures-and-tests.md)
- [Security And Abuse](security-and-abuse.md)
- [Privacy, Retention, And Deletion](privacy-retention-and-deletion.md)
- [Observability And Operations](observability-and-operations.md)
- [Environments And Deployment](environments-and-deployment.md)
- [ADR 0001: Use Firebase-First Backend](../adr/0001-use-firebase-first-backend.md)
- [ADR 0002: Use Cloudflare Email Routing For Inbound Email](../adr/0002-use-cloudflare-email-routing-for-inbound-email.md)
