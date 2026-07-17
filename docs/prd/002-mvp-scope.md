# PRD 002: MVP Scope

## Status

Draft

## Objective

Define the smallest useful AppSpnd product that proves receipt ingestion, family routing, parsing, and spending visibility.

## In Scope

- Firebase Authentication.
- Family account creation.
- One generated forwarding email per family.
- Cloudflare inbound email routing to Firebase.
- Raw email storage in Cloud Storage.
- Firestore metadata for raw emails, parse jobs, receipts, and family membership.
- Apple receipt parsing.
- Server-side parser execution.
- Parser status tracking.
- Receipt list and receipt detail views.
- Dashboard totals for family spending.
- Basic family or business group member mapping by Apple ID or email.
- Admin reassignment of receipts or purchases when automatic attribution is wrong.
- Admin/review path for failed parses.

## Out of Scope

- Bank sync.
- Payment account integrations.
- Generic receipt ingestion.
- Non-Apple merchant receipt parsing.
- Native iOS app.
- Android app.
- Public API.
- Complex subscription forecasting.
- Multi-currency support beyond storing the detected currency.
- Advanced invite flows.
- Paid billing/subscriptions for AppSpnd itself.

## MVP User Flow

1. User signs in.
2. AppSpnd creates a family account if one does not exist.
3. AppSpnd generates a forwarding address for the family.
4. User configures email forwarding for Apple receipts.
5. Receipt email arrives at the generated address.
6. Raw email is saved.
7. Parser extracts receipt data.
8. Parsed receipt appears in the dashboard.
9. User reviews or corrects data when needed.

## MVP Screens

- Sign in.
- Onboarding/setup guide.
- Dashboard.
- Receipts list.
- Receipt detail.
- Family members.
- Parser review/admin.
- Profile/settings with forwarding address.

## Release Bar

The MVP is releasable for personal use when:

- Receipt ingestion works end to end.
- Raw emails are retained.
- Parsed Apple receipts are linked to the correct family or business group.
- Family admins can reassign incorrectly attributed receipts or purchases.
- Duplicate forwarded receipts do not create duplicate spending records.
- Parse failures are visible and retryable.

## Risks

- Email provider behavior may alter forwarded receipt formatting.
- Apple receipt formats may vary across email clients and over time.
- AI extraction may produce plausible but incorrect output.
- Firestore reads can become wasteful if dashboard queries are not modeled intentionally.
