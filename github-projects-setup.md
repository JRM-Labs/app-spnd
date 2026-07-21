# 🤖 GitHub Projects Setup For AppSpnd

## Purpose

This document outlines a pragmatic GitHub Projects setup for the `app-spnd` repository based on the current product, MVP, and architecture documentation in `docs/`.

The goal is not to create a heavyweight process. The goal is to make work visible, preserve architectural decisions, and keep delivery aligned with the MVP defined in the repo.

## Recommendation

Use one GitHub Project for the repo:

- `AppSpnd MVP`
- `https://github.com/orgs/JRM-Labs/projects/4`

Do not create multiple projects yet. The product is still early enough that separate roadmap, engineering, and operations projects would add overhead without adding much clarity.

Important GitHub detail:

- ProjectV2 boards are owned by a user or organization, not by an individual repository.
- For `JRM-Labs/app-spnd`, the correct setup is an organization-owned project linked from the repository.
- The current project for this repo is `AppSpnd MVP` at `https://github.com/orgs/JRM-Labs/projects/4`.

## Why This Fits The Repo

The documentation already defines:

- MVP scope
- system boundaries
- major workstreams
- open architectural decisions
- release bar

That means GitHub Projects should mirror the documented work rather than inventing a second planning model.

## Project Model

Use GitHub Issues as the base unit of planning.

Recommended issue types:

- `Epic`
- `Feature`
- `Task`
- `Bug`
- `Decision`
- `Spike`

Recommended structure:

1. Create one epic issue per major workstream.
2. Create decision issues for unresolved product or architecture choices.
3. Create child feature or task issues only for the next executable slice of work.
4. Avoid creating dozens of low-value issues before implementation actually needs them.

## Recommended Epics

Start with these epics:

- `Foundation / Workspace Bootstrap`
- `Auth, Users, and Family Setup`
- `Forwarding Address and Onboarding UX`
- `Cloudflare Email Ingestion`
- `Raw Email Storage and Metadata`
- `Parser Normalization and MIME Handling`
- `Receipt Extraction, Validation, and Dedupe`
- `Member Attribution and Corrections`
- `Dashboard, Receipt List, and Detail UI`
- `Security, Privacy, and Access Rules`
- `Observability, Alerts, and Operations`
- `Environments, Deployment, and Dev Setup`

These epics map well to the MVP and architecture documents and give enough separation to track backend, parser, frontend, and operational work without turning the board into a junk drawer.

## Recommended Project Fields

Add these custom fields in GitHub Projects.

### `Status`

Suggested values:

- `Backlog`
- `Ready`
- `In Progress`
- `Blocked`
- `In Review`
- `Done`

### `Type`

Suggested values:

- `Epic`
- `Feature`
- `Task`
- `Bug`
- `Decision`
- `Spike`

### `Area`

Suggested values:

- `Product`
- `Frontend`
- `Firebase`
- `Cloudflare`
- `Parser`
- `Data`
- `Security`
- `Ops`

### `Priority`

Suggested values:

- `P0`
- `P1`
- `P2`

### `Milestone`

Suggested values:

- `M0 Docs Decisions`
- `M1 Local Scaffold`
- `M2 Ingest E2E`
- `M3 Parser + Review`
- `M4 MVP Personal Release`

### `Risk`

Suggested values:

- `Low`
- `Medium`
- `High`

### `Owner`

Use the built-in assignee where possible, but a visible owner field in the project can still be useful if the repo later involves multiple collaborators.

Note:

- In the live GitHub project, some field names differ slightly from the recommendation because of GitHub ProjectV2 naming and creation constraints.
- Current live field names are `Workflow Status`, `Work Type`, `Work Area`, `Priority`, `Release Phase`, `Risk`, `Estimate`, and `Blocked By`.

### `Estimate`

Suggested values:

- `XS`
- `S`
- `M`
- `L`

### `Blocked By`

Use a text field for now. It is simple and good enough until dependency tracking becomes painful.

## Recommended Labels

Use labels for cross-cutting concerns that need to be easy to filter.

Suggested labels:

- `needs-decision`
- `security`
- `parser`
- `firebase`
- `cloudflare`
- `ui`
- `ops`
- `tech-debt`

Avoid building a giant label taxonomy. If a label is not going to be used in filters or triage, it probably does not need to exist.

## Recommended Views

Create these four views and stop there unless a real need appears.

### `Roadmap`

Purpose:

- group work by `Milestone`
- see whether the next proof point is actually covered

### `Delivery Board`

Purpose:

- daily execution view
- columns by `Status`

### `Backlog`

Purpose:

- table view
- sorted by `Priority`, then `Milestone`

### `Decisions / Risks`

Purpose:

- filter `Type = Decision`
- optionally include `Risk = High`
- keep unresolved architecture and product choices from getting buried in feature work

## Recommended Milestones

Use proof-point milestones, not fake sprint milestones.

Suggested milestones:

- `M0 Docs Decisions Resolved`
- `M1 Repo Scaffold + Local Emulator Dev`
- `M2 Cloudflare -> Firebase -> Storage -> Firestore E2E`
- `M3 Parser Fixtures, Validation, and Dedupe`
- `M4 UI for Dashboard, Receipts, Members, Review`
- `M5 Personal MVP Release`

These align better with the documented MVP release bar than time-boxed iterations would at this stage.

## Initial Decision Issues To Create

Create standalone decision issues for the unresolved questions already present in the docs.

Recommended decision issues:

- `Decide final Firebase project IDs for dev and production`
- `Decide final inbound receipt subdomain`
- `Decide unknown-recipient handling policy`
- `Decide raw email retention policy`
- `Decide normalized parser artifact retention policy`
- `Decide Angular hosting target`
- `Decide Cloud Functions vs Cloud Run for parser execution`
- `Decide AI parser provider and fallback strategy`

These should be added to the `Decisions / Risks` view immediately.

## Initial Epic Seeding Plan

Do not seed the project with every possible task from the docs.

Seed it like this:

1. Create 10 to 12 epic issues for the major workstreams.
2. Create 8 decision issues for the currently unresolved choices.
3. Create only the first 3 to 6 child issues under each epic where work is likely to start soon.

This keeps the board useful instead of turning it into a speculative todo landfill.

## Suggested First Child Issues

Examples of good first child issues:

- `Scaffold Nx workspace structure for web, functions, worker, and shared libs`
- `Implement family creation and forwarding address generation`
- `Define Cloudflare to Firebase ingest contract with runtime validation`
- `Implement raw email storage path and metadata write`
- `Create parser fixture folder structure and redaction rules`
- `Implement normalized email schema using Zod`
- `Add receipt identity and dedupe rules for document number and message hash`
- `Define Firestore security rules for family membership and admin correction flows`
- `Create dashboard summary document strategy`
- `Add structured logging events for ingest and parse pipeline`

These are concrete enough to execute and broad enough to support decomposition later.

## Operating Rules For The Board

Recommended rules:

- Every issue should have `Type`, `Area`, `Priority`, and `Milestone`.
- Every issue in `In Progress` should have an owner.
- Every blocked issue should name the blocker explicitly.
- Every architectural decision should either become an ADR or be closed with a clear implementation outcome.
- Do not move work into `Done` if the documented acceptance criteria are still not met.

## How This Maps To The Docs

The proposed project structure reflects the current planning docs:

- product goals and MVP boundary from `docs/prd/001-product-vision.md` and `docs/prd/002-mvp-scope.md`
- ingestion flow from `docs/prd/003-receipt-ingestion.md` and `docs/architecture/email-ingestion-flow.md`
- family and attribution work from `docs/prd/004-family-accounts.md` and `docs/architecture/roles-and-permissions.md`
- parsing and review workflow from `docs/prd/005-parsing-and-review.md` and `docs/architecture/parser-pipeline.md`
- data, contracts, and aggregate strategy from the architecture docs
- release readiness from operations, security, privacy, and deployment docs

## Bottom Line

Use GitHub Projects as a thin operational layer on top of the repo docs.

The docs should remain the source of truth for product intent and architecture.
The project board should answer only these questions:

- What are we building next?
- What is blocked?
- What decisions are unresolved?
- What has to be true for the MVP to ship for personal use?

## Current Live Setup

As of `2026-07-21`, the live GitHub Project setup is:

- Project: `AppSpnd MVP`
- URL: `https://github.com/orgs/JRM-Labs/projects/4`
- Seeded items: 20
- Seeded structure:
  - 12 epic issues
  - 8 decision issues
