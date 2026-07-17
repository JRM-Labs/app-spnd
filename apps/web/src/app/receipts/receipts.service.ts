import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  collection,
  limit,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import { isFirebaseConfigured } from '../firebase/firebase.config';

export interface ReceiptRecord {
  id: string;
  familyId: string;
  receiptId: string;
  rawEmailId: string;
  parserVersion: string;
  source: string;
  merchant: string | null;
  subject: string | null;
  purchaseDateText: string | null;
  currency: string | null;
  total: number | null;
  status: string;
  confidence: number | null;
  warnings: string[];
  textPreview: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

@Injectable({
  providedIn: 'root',
})
export class ReceiptsService {
  watchFamilyReceipts(familyId: string): Observable<ReceiptRecord[]> {
    return new Observable<ReceiptRecord[]>((subscriber) => {
      if (!isFirebaseConfigured() || !firestore) {
        subscriber.error(
          new Error(
            'Firebase web config is missing. Add the Firebase app config in apps/web/src/app/firebase/firebase.config.ts.'
          )
        );
        return undefined;
      }

      const receiptsQuery = query(
        collection(firestore, 'families', familyId, 'receipts'),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        receiptsQuery,
        (snapshot) => {
          subscriber.next(snapshot.docs.map(mapReceiptDoc));
        },
        (error) => subscriber.error(error)
      );

      return () => unsubscribe();
    });
  }
}

function mapReceiptDoc(doc: QueryDocumentSnapshot): ReceiptRecord {
  const data = doc.data() as Omit<ReceiptRecord, 'id'>;

  return {
    id: doc.id,
    ...data,
    warnings: Array.isArray(data.warnings) ? data.warnings : [],
  };
}
