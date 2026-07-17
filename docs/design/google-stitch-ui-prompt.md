# Google Stitch UI Design Prompt

Use this prompt in Google Stitch to generate an initial UI design direction for AppSpnd.

```text
Design a polished web app UI for a product called AppSpnd.

AppSpnd is a private family spending utility for Apple Family Sharing organizers. It ingests Apple receipt emails, preserves the raw email for audit/reprocessing, parses purchases into structured data, and helps a family admin understand Apple/App Store/in-app purchase spending by family member, app, developer, category, payment method, and month.

This is not a generic budgeting app and not a marketing landing page. Design the actual logged-in product experience.

Primary user:
- A parent or family organizer who pays for Apple Family Sharing purchases.
- They receive many Apple receipt emails.
- They want to quickly answer: who bought this, what was purchased, what app/developer drove the spend, what payment method was billed, and what needs review.

Product tone:
- Private
- Trustworthy
- Calm
- Precise
- Admin-focused
- Helpful without feeling playful or childish

Visual style:
- Modern SaaS dashboard.
- Clean, restrained, information-dense layout.
- Light theme first.
- Avoid loud gradients, gimmicky finance visuals, oversized marketing hero sections, and decorative blobs.
- Use a quiet neutral base with clear accent colors for review state, purchase status, member identity, and warning/error states.
- Use compact cards only for individual metrics or receipt items. Do not make every page section a floating card.
- Prioritize scanability, clear table/list hierarchy, and easy filtering.

Brand:
- Name: AppSpnd
- Short product description: Apple family purchase tracking from receipt emails.

Core navigation:
- Dashboard
- Receipts
- Review Queue
- Family Members
- Forwarding Setup
- Settings

Screen 1: Dashboard
Design a dashboard for the family admin.
Include:
- Current month Apple spend.
- Spend by family member.
- Spend by app/developer.
- Count of receipts processed this month.
- Count of purchases needing review.
- Small trend line for monthly Apple spend.
- Recent receipts list.
- Quick filters for month, member, category, and payment method.
- Clear empty/loading/error states.

Screen 2: Receipt List
Design a searchable receipt ledger.
Include:
- Search field.
- Filters for family member, app, developer, category, date range, payment method, and review status.
- Rows showing date, assigned member, app/item title, item type, developer, category, payment method, total, and status.
- Visual badges for Parsed, Needs Review, Duplicate, Reassigned, and Failed Parse.
- A receipt/document number should be visible or accessible.
- Support grouped receipts with multiple line items.

Screen 3: Receipt Detail
Design a detailed receipt page.
Include:
- Receipt header with Apple document number, order ID, receipt date, total, subtotal, tax, currency, and billed-to payment method.
- Family member assignment with an admin reassignment control.
- Line item table/cards showing item title, item type, category, developer, image/artwork thumbnail, quantity if relevant, price, and source confidence.
- Raw extraction details section for parsed fields.
- Review actions: confirm, reassign, mark as duplicate, retry parse, flag issue.
- Link-style action for "view raw email metadata" but do not expose raw email content by default.

Screen 4: Review Queue
Design a workflow for receipts that need admin attention.
Include:
- Queue list with reason codes such as Unknown Member, Low Parser Confidence, Missing Document Number, Payment Method Mismatch, Duplicate Candidate, Failed Parse.
- Side-by-side review panel with parsed data and suggested fixes.
- Admin action buttons to confirm, edit assignment, retry parse, or ignore.
- Confidence indicators should be understandable but not overly technical.

Screen 5: Family Members
Design a family management page.
Include:
- List of family members with names, optional avatar/initials, Apple account email hints, monthly spend, receipt count, and status.
- Member detail panel showing purchase history, known Apple email aliases, matching rules, and recent assignments.
- Admin controls to add/edit/deactivate a family member.
- Clarify that family members do not necessarily need app logins.

Screen 6: Forwarding Setup
Design the setup screen for connecting Apple receipt emails.
Include:
- The generated family forwarding address, for example family-name@receipts.jrm-labs.com.
- Step-by-step setup checklist for forwarding Apple receipt emails.
- Status indicators: address created, test email received, first raw email stored, first receipt parsed.
- Copy button for forwarding address.
- Test email button or test status area.
- Security note that AppSpnd stores raw emails privately and only parses Apple receipt data.

Screen 7: Settings
Design settings for:
- Family profile.
- Admin users.
- Retention preference.
- Export CSV.
- Parser reprocessing.
- Notification preferences.
- Billing/subscription plan.

Important data concepts to represent:
- Raw email metadata
- Parsed receipt
- Receipt line items
- Apple document number
- Order ID
- Billed-to payment method
- Member attribution
- Parser confidence
- Review status
- Correction history

Do not design:
- Bank account connection screens.
- Generic receipt scanning camera flows.
- Android receipt flows.
- A broad personal finance app.
- A marketing homepage.

Design priorities:
1. The dashboard should immediately tell a family organizer what Apple spending happened this month.
2. The receipt list should feel like a useful ledger.
3. Receipt detail should make reassignment and review easy.
4. The UI should make privacy and trust feel obvious without heavy legal copy.
5. The design should be implementation-friendly for an Angular web app.

Deliver a cohesive multi-screen UI concept with desktop-first layouts and responsive mobile considerations.
```
