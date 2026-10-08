/** Firebase client config for the temple app (sri-durga-parameshwari). */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCQZJFtbYyj4pUF32dLyOioYe2Hi4sfAf8",
  authDomain: "sri-durga-parameshwari.firebaseapp.com",
  projectId: "sri-durga-parameshwari",
  storageBucket: "sri-durga-parameshwari.firebasestorage.app",
  messagingSenderId: "252458164999",
  appId: "1:252458164999:web:e67c040981b80b0e17dba2",
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function getDb(): Firestore | null {
  if (db) return db;
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    return db;
  } catch {
    return null;
  }
}
