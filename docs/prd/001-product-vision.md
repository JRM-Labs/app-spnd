# PRD 001: Product Vision

## Status

Draft

## Problem

Families often lose visibility into Apple, App Store, subscription, and digital purchase spending because receipts are scattered across individual inboxes. The spending is real, recurring, and often small enough per purchase that it avoids attention until it becomes a larger pattern.

AppSpnd exists to turn forwarded receipt emails into a shared family spending view.

## Target Users

- A family or business group organizer who wants visibility into Apple and subscription purchases across group members.
- A parent or spouse who needs a practical way to understand recurring digital spend.
- A user who wants receipt-based spend tracking without connecting a bank account.

## Product Goals

- Give each family a unique receipt forwarding address.
- Ingest and preserve raw receipt emails.
- Parse Apple receipt data into normalized, reviewable records.
- Attribute purchases to family or business group members as accurately as possible.
- Show spending totals, trends, categories, and recent purchases.
- Make parser failures visible and recoverable.

## Non-Goals

- Bank account sync.
- Credit card transaction aggregation.
- Full budgeting and envelope planning.
- Bill splitting.
- Generic receipt or multi-merchant support.
- Android purchase tracking.
- Replacing a personal finance platform.

## MVP Value Proposition

Forward Apple receipt emails to AppSpnd and get a family-level spending dashboard without connecting financial accounts.

## Success Criteria

- A new family can get a forwarding address during onboarding.
- Forwarded receipt emails are saved before parsing.
- Apple receipt emails are parsed into usable purchase records.
- The dashboard shows total spend and recent purchases.
- Parser failures are visible to the user or admin.
- Old receipt emails can be reprocessed when the parser improves.

## Product Decisions

- AppSpnd is only for Apple family and business group purchases. It is not a generic receipt inbox, Android purchase tracker, or multi-merchant receipt parser.
- Receipts should be attributed to the correct family member automatically when possible. Family admins must be able to reassign a receipt or purchase when automatic attribution is wrong or incomplete.
- The testing environment will use a subdomain of `jrm-labs.com`.
