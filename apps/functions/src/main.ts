import { setGlobalOptions } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { createHash, randomUUID } from 'node:crypto';
import { parseReceiptEmail } from '../../../libs/parser/src/lib/parser';

const ingestSharedSecret = defineSecret('INGEST_SHARED_SECRET');
const devRecipientFamilyIds = new Map<string, string>([
  ['test@app-spnd.jrm-labs.com', 'dev-family'],
]);

initializeApp();

setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
});

function normalizeEmail(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

function extractMessageId(rawBody: Buffer): string | null {
  const headerText = rawBody.toString('utf8', 0, Math.min(rawBody.length, 16_384));
  const headerEnd = headerText.search(/\r?\n\r?\n/);
  const headers = headerEnd === -1 ? headerText : headerText.slice(0, headerEnd);
  const match = headers.match(/^message-id:\s*(.+(?:\r?\n[ \t].+)*)$/im);

  if (!match) {
    return null;
  }

  return match[1].replace(/\r?\n[ \t]+/g, ' ').trim();
}

function createMessageHash(rawBody: Buffer): string {
  return createHash('sha256')
    .update(rawBody)
    .digest('hex');
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
    const familyId = devRecipientFamilyIds.get(recipient);

    if (!familyId) {
      logger.warn('Rejected email ingest request for unknown recipient', {
        recipient,
        sender,
        subject,
      });
      response.status(404).send('Unknown recipient');
      return;
    }

    const messageId = extractMessageId(rawBody);
    const messageHash = createMessageHash(rawBody);
    const rawEmailId = createRawEmailId(messageHash);
    const storagePath = createStoragePath(familyId, rawEmailId);
    const db = getFirestore();
    const familyRef = db.doc(`families/${familyId}`);
    const rawEmailRef = db.doc(`families/${familyId}/rawEmails/${rawEmailId}`);

    await familyRef.set(
      {
        familyId,
        activeForwardingAddress: recipient,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await getStorage().bucket().file(storagePath).save(rawBody, {
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
  }
);
