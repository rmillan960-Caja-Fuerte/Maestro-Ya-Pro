import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { firebaseConfig } from './config';

// Lazy initialization for the Firebase app
const getFirebaseApp = (): FirebaseApp => {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
};

// Export the lazy app initializer
export { getFirebaseApp };

// Export hooks and context from the client-side provider
export * from './provider';
