# Privacy, Retention, And Deletion

## Objective

Define the initial data privacy posture for raw emails, billing details, parsed receipts, and deletion workflows.

## Data Sensitivity

AppSpnd handles sensitive personal and financial-adjacent data:

- Apple account emails.
- Purchase history.
- App/subscription usage.
- Billing names.
- Billing addresses.
- Masked payment method details.
- Raw email headers.

Even when payment credentials are not stored, this data should be treated as private.

## Storage Principles

- Store raw email because it is needed for audit and reprocessing.
- Do not expose raw email to clients by default.
- Store only masked/display payment data from receipts.
- Do not store full payment credentials.
- Avoid logging raw email or decoded HTML.

## Retention Policy

MVP default:

- Keep raw emails indefinitely for personal testing and parser reprocessing.
- Revisit before production or external users.

Production decision needed:

- Keep raw emails forever.
- Keep raw emails for a fixed period.
- Keep parsed data forever but delete raw email after a retention window.
- Allow family admins to choose retention.

## Deletion Requirements

Eventually AppSpnd should support:

- Delete a raw email and associated parse jobs.
- Delete a receipt and line items.
- Delete a family/business group.
- Delete a user account.
- Export family data before deletion.

## MVP Deletion Scope

Before production, at minimum document and implement an admin/manual cleanup path for:

- Bad test data.
- Unknown-recipient quarantine data.
- Raw emails accidentally sent to the wrong address.

## Redaction For Fixtures

Parser fixtures committed to git must be redacted.

Redact:

- Names.
- Street addresses.
- Personal Apple account emails.
- Message IDs if they identify a real account.

Preserve:

- HTML structure.
- Document number format.
- Order ID format.
- Masked payment display format.
- Line-item structure.
