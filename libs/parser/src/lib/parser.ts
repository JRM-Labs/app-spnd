export interface ParsedReceiptEmail {
  merchant: string | null;
  subject: string | null;
  purchaseDate: string | null;
  currency: string | null;
  total: number | null;
  status: 'parsed' | 'needsReview';
  confidence: number;
  warnings: string[];
  textPreview: string;
}

export interface ParseReceiptEmailInput {
  rawEmail: Buffer | string;
  subject?: string | null;
}

const currencySymbols: Record<string, string> = {
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
};

export function parseReceiptEmail(input: ParseReceiptEmailInput): ParsedReceiptEmail {
  const rawEmail = Buffer.isBuffer(input.rawEmail)
    ? input.rawEmail.toString('utf8')
    : input.rawEmail;
  const decoded = decodeEmailText(rawEmail);
  const subject = input.subject ?? extractHeader(rawEmail, 'subject');
  const text = htmlToText(decoded);
  const merchant = detectMerchant(subject, text);
  const totalMatch = extractTotal(text);
  const purchaseDate = extractPurchaseDate(text);
  const warnings: string[] = [];

  if (!merchant) {
    warnings.push('merchant_not_found');
  }

  if (!totalMatch) {
    warnings.push('total_not_found');
  }

  if (!purchaseDate) {
    warnings.push('purchase_date_not_found');
  }

  const confidence = Math.max(
    0.2,
    [merchant, totalMatch, purchaseDate].filter(Boolean).length / 3
  );

  return {
    merchant,
    subject,
    purchaseDate,
    currency: totalMatch?.currency ?? null,
    total: totalMatch?.total ?? null,
    status: merchant && totalMatch ? 'parsed' : 'needsReview',
    confidence,
    warnings,
    textPreview: text.slice(0, 1000),
  };
}

function extractHeader(rawEmail: string, headerName: string): string | null {
  const headerText = rawEmail.slice(0, Math.min(rawEmail.length, 16_384));
  const headerEnd = headerText.search(/\r?\n\r?\n/);
  const headers = headerEnd === -1 ? headerText : headerText.slice(0, headerEnd);
  const pattern = new RegExp(`^${escapeRegExp(headerName)}:\\s*(.+(?:\\r?\\n[ \\t].+)*)$`, 'im');
  const match = headers.match(pattern);

  if (!match) {
    return null;
  }

  return match[1].replace(/\r?\n[ \t]+/g, ' ').trim();
}

function decodeEmailText(value: string): string {
  return value
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9a-fA-F]{2})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    );
}

function htmlToText(value: string): string {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectMerchant(subject: string | null, text: string): string | null {
  const source = `${subject ?? ''} ${text}`.toLowerCase();

  if (source.includes('apple')) {
    return 'Apple';
  }

  return null;
}

function extractTotal(text: string): { total: number; currency: string } | null {
  const patterns = [
    /\b(?:total|amount charged|order total|grand total)\b[^$€£0-9]{0,40}([$€£])\s*([0-9]+(?:[.,][0-9]{2})?)/i,
    /([$€£])\s*([0-9]+(?:[.,][0-9]{2})?)\s+\b(?:total|amount charged|order total|grand total)\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (!match) {
      continue;
    }

    return {
      total: Number(match[2].replace(',', '.')),
      currency: currencySymbols[match[1]] ?? 'USD',
    };
  }

  return null;
}

function extractPurchaseDate(text: string): string | null {
  const match = text.match(
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{1,2},\s+\d{4}\b/i
  );

  return match?.[0] ?? null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
