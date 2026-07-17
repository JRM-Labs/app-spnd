import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import {Component, DestroyRef, OnInit, inject, signal, effect} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReceiptsService } from './receipts/receipts.service';

@Component({
  imports: [CurrencyPipe, DecimalPipe, NgClass],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly receiptsService = inject(ReceiptsService);

  protected readonly title = 'AppSpnd';
  protected readonly receipts = signal<ReceiptViewModel[]>([]);
  protected readonly familyId = signal('dev-family');
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      console.log(this.familyId());
      console.log(this.receipts());
    });
  }

  async ngOnInit(): Promise<void> {
    this.loadReceipts();
  }

  protected refresh(): void {
    this.loadReceipts();
  }

  private loadReceipts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.receiptsService
      .watchFamilyReceipts(this.familyId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (receipts) => {
          this.receipts.set(
            receipts.map((receipt) => ({
              ...receipt,
              createdAtLabel: formatTimestamp(receipt.createdAt),
              updatedAtLabel: formatTimestamp(receipt.updatedAt),
            }))
          );
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(
            error instanceof Error ? error.message : 'Unable to load receipts'
          );
          this.loading.set(false);
        },
      });
  }
}

interface Receipt {
  id: string;
  merchant: string | null;
  subject: string | null;
  purchaseDateText: string | null;
  currency: string | null;
  total: number | null;
  status: 'parsed' | 'needsReview' | string;
  confidence: number | null;
  warnings: string[] | null;
  textPreview: string | null;
  createdAt?: FirestoreTimestampLike | null;
  updatedAt?: FirestoreTimestampLike | null;
}

interface ReceiptViewModel extends Receipt {
  createdAtLabel: string;
  updatedAtLabel: string;
}

interface FirestoreTimestampLike {
  _seconds?: number;
  _nanoseconds?: number;
  seconds?: number;
  nanoseconds?: number;
}

function formatTimestamp(value: FirestoreTimestampLike | null | undefined): string {
  const seconds = value?.seconds ?? value?._seconds;

  if (!seconds) {
    return 'Pending';
  }

  return new Date(seconds * 1000).toLocaleString();
}
