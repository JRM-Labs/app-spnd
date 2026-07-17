import { setGlobalOptions } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';

const ingestSharedSecret = defineSecret('INGEST_SHARED_SECRET');

setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
});

export const ingestEmail = onRequest(
  {
    cors: false,
    invoker: 'public',
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

    logger.info('Received raw email ingest request', {
      recipient: request.header('x-appspnd-recipient') ?? null,
      sender: request.header('x-appspnd-sender') ?? null,
      subject: request.header('x-appspnd-subject') ?? null,
      contentType: request.header('content-type') ?? null,
      rawEmailBytes: rawBody.length,
    });

    response.status(204).send();
  }
);
