# Data Model

## Objective

Define the initial Firestore and Storage model for AppSpnd MVP.

## Cloud Storage

```text
families/{familyId}/raw-emails/{rawEmailId}.eml
families/{familyId}/normalized-emails/{rawEmailId}.json
```

The normalized email artifact is optional but useful during parser development.

## Firestore Collections

```text
users/{userId}
families/{familyId}
families/{familyId}/members/{memberId}
families/{familyId}/rawEmails/{rawEmailId}
families/{familyId}/parseJobs/{parseJobId}
families/{familyId}/receipts/{receiptId}
families/{familyId}/receipts/{receiptId}/lineItems/{lineItemId}
families/{familyId}/corrections/{correctionId}
```

## User

```text
users/{userId}
  email
  displayName
  defaultFamilyId
  createdAt
  updatedAt
```

## Family

```text
families/{familyId}
  organizerUserId
  forwardingEmail
  createdAt
  updatedAt
```

## Member

```text
families/{familyId}/members/{memberId}
  displayName
  appleIds[]
  role
  createdAt
  updatedAt
```

## Raw Email

```text
families/{familyId}/rawEmails/{rawEmailId}
  familyId
  rawEmailId
  storagePath
  normalizedStoragePath
  to
  from
  subject
  messageId
  appleTransactionId
  appleBusinessGroup
  appleEmailTypeId
  receivedAt
  ingestedAt
  messageHash
  status
  parseJobId
```

## Parse Job

```text
families/{familyId}/parseJobs/{parseJobId}
  rawEmailId
  status
  parserVersion
  startedAt
  completedAt
  confidence
  warnings[]
  error
```

## Receipt

```text
families/{familyId}/receipts/{receiptId}
  rawEmailId
  parseJobId
  parserVersion
  source
  documentNumber
  orderId
  appleTransactionId
  appleAccount
  purchaseDate
  currency
  subtotal
  tax
  total
  paymentMethod
  billingInfo
  status
  attributionStatus
  assignedMemberId
  confidence
  createdAt
  updatedAt
```

## Line Item

```text
families/{familyId}/receipts/{receiptId}/lineItems/{lineItemId}
  title
  subtitle
  type
  category
  developer
  publisher
  deviceName
  purchaserLabel
  price
  currency
  quantity
  imageUrl
  reportProblemUrl
  originalUrls[]
  rawText
  rawHtmlFragment
  sourceSection
  assignedMemberId
  sourceDetails
```

## Correction

```text
families/{familyId}/corrections/{correctionId}
  targetType
  targetPath
  field
  previousValue
  nextValue
  correctedByUserId
  correctedAt
  reason
```

## Identity

Receipt identity should prefer:

1. `documentNumber`
2. `documentNumber + orderId`
3. `appleTransactionId`
4. `messageHash`

The selected identity should be stable enough to prevent duplicate spending when the same receipt is forwarded more than once.
