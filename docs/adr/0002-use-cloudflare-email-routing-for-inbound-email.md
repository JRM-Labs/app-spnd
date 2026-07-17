# ADR 0002: Use Cloudflare Email Routing For Inbound Email

## Status

Accepted

## Context

Firebase does not receive arbitrary inbound email for a domain. AppSpnd needs generated family forwarding addresses such as:

```text
{familyId}@receipts.jrm-labs.com
```

The old prototype used a Gmail mailbox listener. That approach worked conceptually, but it introduced polling/listener concerns and mailbox-specific operational complexity.

## Decision

Use Cloudflare Email Routing/Workers as the inbound email adapter for the testing domain.

Initial flow:

```text
{familyId}@receipts.jrm-labs.com
  -> Cloudflare Email Worker
  -> Firebase HTTPS Function
  -> Cloud Storage raw email
  -> Firestore metadata
  -> parser job
```

## Consequences

- AppSpnd does not create real mailboxes or aliases for each family.
- Cloudflare owns MX/email ingress for the subdomain.
- Firebase owns product logic and storage after email receipt.
- The Cloudflare Worker should do minimal work: capture recipient and forward the raw email to Firebase.
- Firebase must authenticate Worker calls with a shared secret or signed request scheme.

## Alternatives Considered

- Google Workspace catch-all mailbox plus Gmail API watch.
- Gmail polling.
- SendGrid/Mailgun/Postmark inbound parse.

## Notes

Cloudflare is only the intake adapter. It should not own AppSpnd business data.
