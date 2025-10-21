// This file acts as a central hub for all Firebase-related exports.

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { firebaseConfig } from './config';

// Lazy initialization for the Firebase app, ensuring it's created only once.
const getFirebaseApp = (): FirebaseApp => {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
};

// Export the lazy app initializer
export { getFirebaseApp };

// Export all hooks, providers, and context from the client-side provider module.
// This includes useFirebase, useAuth, useFirestore, useUser, FirebaseProvider, etc.
export * from './provider';

// Export the custom hooks for Firestore collections and documents.
export * from './firestore/use-collection';
export * from './firestore/use-doc';
