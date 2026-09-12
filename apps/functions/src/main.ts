import { setGlobalOptions } from 'firebase-functions/v2';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { parseReceiptEmail } from 'parser';

const ingestSharedSecret = defineSecret('INGEST_SHARED_SECRET');
const cloudflareApiToken = defineSecret('CLOUDFLARE_API_TOKEN');
const cloudflareZoneId = defineSecret('CLOUDFLARE_ZONE_ID');
const cloudflareWorkerName = defineSecret('CLOUDFLARE_EMAIL_WORKER_NAME');
const FORWARDING_DOMAIN = 'app-spnd.jrm-labs.com';

initializeApp();

setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
});

function normalizeEmail(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

function forwardingAddressFor(familyName: string): string {
  return `${slugify(familyName)}-${randomBytes(4).toString('hex')}@${FORWARDING_DOMAIN}`;
}

function slugify(value: string): string {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);

  return slug || 'household';
}

function requiredFamilyName(value: unknown): string {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', 'A household name is required.');
  }

  const familyName = value.trim();
  if (familyName.length < 2 || familyName.length > 80) {
    throw new HttpsError(
      'invalid-argument',
      'Household names must be between 2 and 80 characters.',
    );
  }

  return familyName;
}

function stringField(
  data: Record<string, unknown> | undefined,
  field: string,
): string | null {
  const value = data?.[field];
  return typeof value === 'string' ? value : null;
}

function extractMessageId(rawBody: Buffer): string | null {
  const headerText = rawBody.toString(
    'utf8',
    0,
    Math.min(rawBody.length, 16_384),
  );
  const headerEnd = headerText.search(/\r?\n\r?\n/);
  const headers =
    headerEnd === -1 ? headerText : headerText.slice(0, headerEnd);
  const match = headers.match(/^message-id:\s*(.+(?:\r?\n[ \t].+)*)$/im);

  if (!match) {
    return null;
  }

  return match[1].replace(/\r?\n[ \t]+/g, ' ').trim();
}

function createMessageHash(rawBody: Buffer): string {
  return createHash('sha256').update(rawBody).digest('hex');
}

function createRawEmailId(messageHash: string): string {
  return `${messageHash.slice(0, 12)}-${randomUUID()}`;
}

function createStoragePath(familyId: string, rawEmailId: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');

  return `families/${familyId}/raw-emails/${year}/${month}/${rawEmailId}.eml`;
}

interface ProvisionFamilyResponse {
  familyId: string;
  forwardingAddress: string;
}

interface CloudflareRoutingRule {
  id?: string;
  actions?: Array<{
    type?: string;
    value?: string[];
  }>;
  matchers?: Array<{
    type?: string;
    field?: string;
    value?: string;
  }>;
}

interface CloudflareResponse<T> {
  success: boolean;
  result?: T;
  errors?: Array<{
    code?: number;
    message?: string;
  }>;
}

function cloudflareConfiguration(): {
  apiToken: string;
  zoneId: string;
  workerName: string;
} {
  const apiToken = cloudflareApiToken.value().trim();
  const zoneId = cloudflareZoneId.value().trim();
  const workerName = cloudflareWorkerName.value().trim();

  if (!apiToken || !zoneId || !workerName) {
    throw new HttpsError(
      'failed-precondition',
      'Forwarding address setup is not configured. Please try again later.',
    );
  }

  return { apiToken, zoneId, workerName };
}

async function cloudflareRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { apiToken, zoneId } = cloudflareConfiguration();
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}${path}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    },
  );
  const body = (await response.json()) as CloudflareResponse<T>;

  if (!response.ok || !body.success || !body.result) {
    logger.error('Cloudflare Email Routing API request failed', {
      path,
      status: response.status,
      errors: body.errors,
    });
    throw new Error('cloudflare-email-routing-request-failed');
  }

  return body.result;
}

function isRuleForForwardingAddress(
  rule: CloudflareRoutingRule,
  forwardingAddress: string,
  workerName: string,
): boolean {
  return (
    rule.matchers?.some(
      (matcher) =>
        matcher.type === 'literal' &&
        matcher.field === 'to' &&
        normalizeEmail(matcher.value) === forwardingAddress,
    ) === true &&
    rule.actions?.some(
      (action) =>
        action.type === 'worker' && action.value?.includes(workerName),
    ) === true
  );
}

async function findCloudflareRoutingRule(
  forwardingAddress: string,
): Promise<string | null> {
  const rules = await cloudflareRequest<CloudflareRoutingRule[]>(
    '/email/routing/rules',
  );
  const { workerName } = cloudflareConfiguration();
  return (
    rules.find((rule) =>
      isRuleForForwardingAddress(rule, forwardingAddress, workerName),
    )?.id ?? null
  );
}

async function createCloudflareRoutingRule(
  forwardingAddress: string,
): Promise<string> {
  const { workerName } = cloudflareConfiguration();
  const rule = await cloudflareRequest<CloudflareRoutingRule>(
    '/email/routing/rules',
    {
      method: 'POST',
      body: JSON.stringify({
        actions: [{ type: 'worker', value: [workerName] }],
        matchers: [{ type: 'literal', field: 'to', value: forwardingAddress }],
        enabled: true,
        name: `AppSpnd forwarding address: ${forwardingAddress}`,
      }),
    },
  );

  if (!rule.id) {
    throw new Error('cloudflare-email-routing-rule-missing-id');
  }

  return rule.id;
}

async function ensureCloudflareRoutingRule(
  forwardingAddress: string,
): Promise<string> {
  const existingRuleId = await findCloudflareRoutingRule(forwardingAddress);
  return existingRuleId ?? createCloudflareRoutingRule(forwardingAddress);
}

async function deleteCloudflareRoutingRule(ruleId: string): Promise<void> {
  try {
    await cloudflareRequest<CloudflareRoutingRule>(
      `/email/routing/rules/${ruleId}`,
      {
        method: 'DELETE',
      },
    );
  } catch (error) {
    logger.error(
      'Unable to remove orphaned Cloudflare Email Routing rule',
      error,
      { ruleId },
    );
  }
}

async function existingProvisioning(
  userId: string,
  db: FirebaseFirestore.Firestore,
): Promise<ProvisionFamilyResponse | null> {
  const existingUser = await db.doc(`users/${userId}`).get();
  const familyId = stringField(existingUser.data(), 'defaultFamilyId');
  if (!familyId) {
    return null;
  }

  const family = await db.doc(`families/${familyId}`).get();
  const forwardingAddress = stringField(
    family.data(),
    'activeForwardingAddress',
  );
  if (!forwardingAddress) {
    throw new HttpsError(
      'failed-precondition',
      'Your household setup is incomplete. Contact support.',
    );
  }

  const forwardingAddressRef = db.doc(
    `forwardingAddresses/${forwardingAddress}`,
  );
  const forwardingAddressRecord = await forwardingAddressRef.get();
  if (!forwardingAddressRecord.exists) {
    throw new HttpsError(
      'failed-precondition',
      'Your forwarding address setup is incomplete. Contact support.',
    );
  }

  const cloudflareRuleId =
    stringField(forwardingAddressRecord.data(), 'cloudflareRoutingRuleId') ??
    (await ensureCloudflareRoutingRule(forwardingAddress));

  await forwardingAddressRef.set(
    {
      cloudflareRoutingRuleId: cloudflareRuleId,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { familyId, forwardingAddress };
}

export const provisionFamily = onCall(
  {
    secrets: [cloudflareApiToken, cloudflareZoneId, cloudflareWorkerName],
  },
  async (request): Promise<ProvisionFamilyResponse> => {
    try {
      if (!request.auth) {
        throw new HttpsError(
          'unauthenticated',
          'Sign in before setting up a household.',
        );
      }

      const user = await getAuth().getUser(request.auth.uid);
      if (!user.emailVerified) {
        throw new HttpsError(
          'failed-precondition',
          'Verify your email before setting up a forwarding address.',
        );
      }

      const familyName = requiredFamilyName(
        (request.data as { familyName?: unknown })?.familyName,
      );
      const db = getFirestore();
      const existing = await existingProvisioning(user.uid, db);
      if (existing) {
        return existing;
      }

      const userRef = db.doc(`users/${user.uid}`);
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const familyId = randomUUID();
        const forwardingAddress = forwardingAddressFor(familyName);
        const forwardingAddressRef = db.doc(
          `forwardingAddresses/${forwardingAddress}`,
        );
        const familyRef = db.doc(`families/${familyId}`);
        const membershipRef = db.doc(
          `families/${familyId}/userMemberships/${user.uid}`,
        );
        let cloudflareRuleId: string | null = null;

        try {
          cloudflareRuleId =
            await ensureCloudflareRoutingRule(forwardingAddress);
          const result = await db.runTransaction(async (transaction) => {
            const existingUser = await transaction.get(userRef);
            const existingFamilyId = stringField(
              existingUser.data(),
              'defaultFamilyId',
            );

            if (existingFamilyId) {
              const existingFamily = await transaction.get(
                db.doc(`families/${existingFamilyId}`),
              );
              const existingAddress = stringField(
                existingFamily.data(),
                'activeForwardingAddress',
              );
              if (existingAddress) {
                return {
                  existing: {
                    familyId: existingFamilyId,
                    forwardingAddress: existingAddress,
                  },
                  created: false,
                };
              }
              throw new HttpsError(
                'failed-precondition',
                'Your household setup is incomplete. Contact support.',
              );
            }

            const existingAddress = await transaction.get(forwardingAddressRef);
            if (existingAddress.exists) {
              throw new Error('forwarding-address-collision');
            }

            const timestamp = FieldValue.serverTimestamp();
            transaction.set(
              userRef,
              {
                uid: user.uid,
                email: user.email ?? null,
                defaultFamilyId: familyId,
                createdAt: timestamp,
                updatedAt: timestamp,
              },
              { merge: true },
            );
            transaction.set(familyRef, {
              familyId,
              displayName: familyName,
              organizerUserId: user.uid,
              activeForwardingAddress: forwardingAddress,
              createdAt: timestamp,
              updatedAt: timestamp,
            });
            transaction.set(membershipRef, {
              uid: user.uid,
              role: 'organizer',
              status: 'active',
              createdAt: timestamp,
              updatedAt: timestamp,
            });
            transaction.set(forwardingAddressRef, {
              normalizedRecipient: forwardingAddress,
              familyId,
              status: 'active',
              cloudflareRoutingRuleId: cloudflareRuleId,
              createdByUserId: user.uid,
              createdAt: timestamp,
              updatedAt: timestamp,
            });

            return {
              existing: { familyId, forwardingAddress },
              created: true,
            };
          });
          if (result.created) {
            cloudflareRuleId = null;
            return result.existing;
          }

          await deleteCloudflareRoutingRule(cloudflareRuleId);
          return (await existingProvisioning(user.uid, db)) ?? result.existing;
        } catch (error) {
          if (cloudflareRuleId) {
            await deleteCloudflareRoutingRule(cloudflareRuleId);
            cloudflareRuleId = null;
          }
          if (
            error instanceof Error &&
            error.message === 'forwarding-address-collision'
          ) {
            continue;
          }
          throw error;
        }
      }

      throw new HttpsError(
        'aborted',
        'Unable to allocate a forwarding address. Please try again.',
      );
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }

      logger.error('Failed to provision household forwarding address', error, {
        userId: request.auth?.uid ?? null,
      });
      throw new HttpsError(
        'internal',
        'Unable to set up your forwarding address. Please try again.',
      );
    }
  },
);

export const ingestEmail = onRequest(
  {
    cors: false,
    maxInstances: 5,
    secrets: [ingestSharedSecret],
    timeoutSeconds: 60,
  },
  async (request, response) => {
    if (request.method !== 'POST') {
      response.status(405).send('Method not allowed');
      return;
    }

    const authorization = request.header('authorization') ?? '';
    const expected = `Bearer ${ingestSharedSecret.value()}`;

    if (authorization !== expected) {
      logger.warn('Rejected email ingest request with invalid authorization');
      response.status(401).send('Unauthorized');
      return;
    }

    const rawBody = request.rawBody;
    const recipient = normalizeEmail(request.header('x-appspnd-recipient'));
    const sender = normalizeEmail(request.header('x-appspnd-sender'));
    const subject = request.header('x-appspnd-subject') ?? null;
    const contentType = request.header('content-type') ?? 'message/rfc822';
    const db = getFirestore();
    const forwardingAddress = await db
      .doc(`forwardingAddresses/${recipient}`)
      .get();
    const forwardingAddressData = forwardingAddress.data();
    const familyId = stringField(forwardingAddressData, 'familyId');

    if (!forwardingAddress.exists || !familyId) {
      logger.warn('Rejected email ingest request for unknown recipient', {
        recipient,
        sender,
        subject,
      });
      response.status(404).send('Unknown recipient');
      return;
    }

    if (stringField(forwardingAddressData, 'status') !== 'active') {
      logger.warn('Rejected email ingest request for inactive recipient', {
        recipient,
        familyId,
      });
      response.status(403).send('Inactive recipient');
      return;
    }

    const messageId = extractMessageId(rawBody);
    const messageHash = createMessageHash(rawBody);
    const rawEmailId = createRawEmailId(messageHash);
    const storagePath = createStoragePath(familyId, rawEmailId);
    const familyRef = db.doc(`families/${familyId}`);
    const rawEmailRef = db.doc(`families/${familyId}/rawEmails/${rawEmailId}`);

    await familyRef.set(
      {
        familyId,
        activeForwardingAddress: recipient,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await getStorage()
      .bucket()
      .file(storagePath)
      .save(rawBody, {
        contentType,
        metadata: {
          metadata: {
            familyId,
            rawEmailId,
            recipient,
            sender,
          },
        },
      });

    logger.info('Stored raw email in Cloud Storage', {
      familyId,
      rawEmailId,
      storagePath,
      recipient,
      sender,
      rawEmailBytes: rawBody.length,
    });

    await rawEmailRef.create({
      familyId,
      rawEmailId,
      storagePath,
      to: recipient,
      from: sender,
      subject,
      contentType,
      messageId,
      messageHash,
      rawEmailBytes: rawBody.length,
      status: 'received',
      receivedAt: FieldValue.serverTimestamp(),
      ingestedAt: FieldValue.serverTimestamp(),
    });

    logger.info('Stored raw email metadata in Firestore', {
      familyId,
      rawEmailId,
      messageId,
      messageHash,
    });

    const parsedReceipt = parseReceiptEmail({
      rawEmail: rawBody,
      subject,
    });

    await db.doc(`families/${familyId}/receipts/${rawEmailId}`).set({
      familyId,
      receiptId: rawEmailId,
      rawEmailId,
      parserVersion: 'dev-basic-v1',
      source: 'email',
      merchant: parsedReceipt.merchant,
      subject: parsedReceipt.subject,
      purchaseDateText: parsedReceipt.purchaseDate,
      currency: parsedReceipt.currency,
      total: parsedReceipt.total,
      status: parsedReceipt.status,
      confidence: parsedReceipt.confidence,
      warnings: parsedReceipt.warnings,
      textPreview: parsedReceipt.textPreview,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    logger.info('Stored parsed receipt in Firestore', {
      familyId,
      rawEmailId,
      parsedStatus: parsedReceipt.status,
      parsedMerchant: parsedReceipt.merchant,
      parsedTotal: parsedReceipt.total,
    });

    logger.info('Received raw email ingest request', {
      familyId,
      rawEmailId,
      messageId,
      messageHash,
      storagePath,
      recipient,
      sender,
      subject,
      contentType,
      rawEmailBytes: rawBody.length,
      parsedStatus: parsedReceipt.status,
      parsedMerchant: parsedReceipt.merchant,
      parsedTotal: parsedReceipt.total,
    });

    response.status(204).send();
  },
);
