import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { firebaseConfig, isFirebaseConfigured } from './firebase.config';

export const firebaseApp = isFirebaseConfigured()
  ? initializeApp(firebaseConfig)
  : null;

export const firestore = firebaseApp ? getFirestore(firebaseApp) : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const functions = firebaseApp ? getFunctions(firebaseApp, 'us-central1') : null;
