import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const fallbackConfig = {
  apiKey: 'missing-api-key',
  authDomain: 'missing-auth-domain',
  projectId: 'missing-project-id',
  storageBucket: 'missing-storage-bucket',
  messagingSenderId: 'missing-messaging-sender-id',
  appId: 'missing-app-id',
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const firebaseMissingKeys = missingKeys;
export const firebaseReady = missingKeys.length === 0;

if (!firebaseReady) {
  // Keep UI running and show a clear setup hint in console.
  console.error(`Firebase env missing: ${missingKeys.join(', ')}`);
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseReady ? firebaseConfig : fallbackConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
