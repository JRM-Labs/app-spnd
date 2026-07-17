# PRD 004: Family Accounts

## Status

Draft

## Objective

Define how users, family/business groups, forwarding addresses, and member attribution work in the MVP.

## Core Concepts

### User

An authenticated person using AppSpnd.

### Family

A shared Apple spending group for a family or business group. The first user becomes the organizer.

### Forwarding Address

A generated inbound email address assigned to a family. Receipt emails sent to this address are routed into that family's account.

### Family Member

A person represented in spending views. In the MVP, members may be inferred from Apple IDs found in receipts and later renamed, mapped, or corrected by family admins.

## Family Creation

When a user signs in for the first time:

1. Create user profile.
2. Create family account.
3. Assign the user as organizer.
4. Generate family forwarding address.
5. Store forwarding address on the family record.

## Suggested Firestore Shape

```text
users/{userId}
  email
  displayName
  defaultFamilyId
  createdAt

families/{familyId}
  organizerUserId
  forwardingEmail
  createdAt
  updatedAt

families/{familyId}/members/{memberId}
  displayName
  appleIds[]
  createdAt
  updatedAt
```

## Permissions

- A user can read their own profile.
- A user can read family data only for families they belong to.
- Family admins can edit member display names, Apple ID mappings, and receipt or purchase attribution.
- Ingestion functions can write raw email and receipt records server-side.
- Clients cannot write trusted parsed receipt totals directly.

## Family Member Attribution

Initial attribution should use receipt fields such as Apple ID or billed-to email.

The app should support:

- Unknown Apple ID discovered from receipt.
- Manual display name assignment.
- Multiple Apple IDs mapped to one family member.
- Admin reassignment of incorrectly attributed receipts or purchases.
- Receipts remaining unassigned when attribution is unclear.

## Forwarding Address UX

The forwarding address should be visible in:

- Setup guide.
- Profile/settings.
- Empty dashboard state.

The UI should make it easy to copy the address and configure email forwarding.

## Acceptance Criteria

- First login creates a family and forwarding address.
- The forwarding address is stable across sessions.
- Family metadata loads after authentication.
- A parsed receipt can be associated with the correct family.
- A discovered Apple ID can be shown as an unnamed family member.
