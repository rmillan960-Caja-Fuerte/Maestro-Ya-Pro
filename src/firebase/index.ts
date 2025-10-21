
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

let app: FirebaseApp;
if (!getApps().length) {
    try {
        app = initializeApp();
    } catch (e) {
        if (process.env.NODE_ENV === 'production') {
            console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
        }
        app = initializeApp(firebaseConfig);
    }
} else {
    app = getApp();
}

export const firebaseApp = app;
export const firestore: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// Re-export other utilities if they are still needed
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

// The original initializeFirebase function might not be needed anymore
// but other parts of the app might rely on it, so I'll keep it but simplified.
// It can also be removed if it's not used anywhere else. For now, I'll just return the initialized sdks.
export function initializeFirebase() {
  return { firebaseApp, auth, firestore, storage };
}

export function getSdks(app: FirebaseApp) {
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app)
  };
}
