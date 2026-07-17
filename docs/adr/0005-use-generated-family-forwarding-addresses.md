# ADR 0005: Use Generated Family Forwarding Addresses

## Status

Accepted

## Context

AppSpnd needs a simple way to route forwarded Apple receipt emails to the correct family or business group.

The old prototype generated one forwarding address per family using the family ID as the local part.

## Decision

Generate one stable forwarding address per family/business group.

Initial testing format:

```text
{familyId}@receipts.jrm-labs.com
```

The generated address is stored on the family document and displayed in onboarding, empty dashboard states, and profile/settings.

## Consequences

- Inbound email routing can map recipient address to family without trusting user-supplied payload data.
- No mailbox needs to be created per family.
- Address generation must use unguessable identifiers.
- Address rotation may be needed later if an address is abused or exposed.

## Alternatives Considered

- One shared upload mailbox with user-specific subject/body codes.
- Per-user addresses instead of per-family addresses.
- Real mailbox/alias creation per family.

## Notes

Unknown recipient addresses should be rejected or quarantined. They must not create families automatically.
