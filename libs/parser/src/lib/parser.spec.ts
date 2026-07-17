import { parseReceiptEmail } from './parser';

describe('parseReceiptEmail', () => {
  it('extracts basic Apple receipt data', () => {
    const result = parseReceiptEmail({
      rawEmail: [
        'Message-ID: <abc@example.com>',
        'Subject: Your receipt from Apple.',
        '',
        '<html><body>Apple Total $12.99 Jul 17, 2026</body></html>',
      ].join('\n'),
    });

    expect(result.merchant).toEqual('Apple');
    expect(result.total).toEqual(12.99);
    expect(result.currency).toEqual('USD');
    expect(result.purchaseDate).toEqual('Jul 17, 2026');
    expect(result.status).toEqual('parsed');
  });
});
