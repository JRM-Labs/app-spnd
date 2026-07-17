# Roles And Permissions

## Objective

Define the MVP permission model for families/business groups, receipt visibility, member attribution, and correction workflows.

## Concepts

### User

An authenticated Firebase user.

### Family

A family or business group that owns forwarding addresses, raw emails, receipts, members, and settings.

### Membership

The relationship between a user and a family.

### Family Member

A person or Apple account represented in spending data. A family member may or may not be a signed-in user.

## Roles

### Organizer

The first user who creates the family.

Allowed:

- View all family receipts.
- View dashboard data.
- View and edit family member mappings.
- Reassign receipts and line items.
- Retry failed parses.
- Manage future admin/member invitations.
- Rotate forwarding address later if supported.

### Admin

A trusted user with nearly the same permissions as organizer.

Allowed:

- View all family receipts.
- Edit family member mappings.
- Reassign receipts and line items.
- Retry failed parses.
- Review parser failures.

### Viewer

A future read-only or limited member role.

Allowed:

- View permitted family data.
- Possibly view only assigned purchases if product scope changes.

Not required for MVP unless multi-user access is implemented early.

## Firestore Membership Shape

Recommended structure:

```text
families/{familyId}/userMemberships/{userId}
  userId
  role
  status
  createdAt
  updatedAt
```

The existing `users/{userId}.defaultFamilyId` field is useful for navigation, but authorization should check membership, not only a default family pointer.

## Family Member Mapping

Receipt attribution should separate signed-in users from Apple receipt identities.

Recommended structure:

```text
families/{familyId}/members/{memberId}
  displayName
  appleIds[]
  userIds[]
  roleLabel
  createdAt
  updatedAt
```

This supports:

- A child or spouse without an AppSpnd login.
- Multiple Apple IDs mapped to one person.
- Business group members.
- Later linking a family member to an authenticated user.

## Correction Permissions

Only organizer/admin users can:

- Reassign a receipt.
- Reassign a line item.
- Edit Apple ID mappings.
- Retry a parser job.
- Mark parser output as accepted.

Every correction should write an audit record.

## Security Rule Principle

Firestore rules should answer:

```text
Is request.auth.uid a member of this family?
Does request.auth.uid have the required role for this write?
```

Server-side Functions can use Admin SDK for trusted writes, but should still validate caller role before applying user-requested corrections.

## MVP Decision

For the first build, it is acceptable to support only one signed-in organizer per family, but the data model should not block adding admins later.
