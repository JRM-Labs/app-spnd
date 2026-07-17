export const firebaseConfig = {
  apiKey: "AIzaSyDKZ1XEgssc9dFDg9uFflo3SZ_qSjLTrSk",
  authDomain: "app-spnd-dev.firebaseapp.com",
  projectId: "app-spnd-dev",
  storageBucket: "app-spnd-dev.firebasestorage.app",
  messagingSenderId: "61898329222",
  appId: "1:61898329222:web:eb3ca5e961a8d6f1049507"
};

export function isFirebaseConfigured(): boolean {
  return Object.values(firebaseConfig).every(
    (value) => typeof value === 'string' && value.length > 0 && value !== 'REPLACE_ME'
  );
}
