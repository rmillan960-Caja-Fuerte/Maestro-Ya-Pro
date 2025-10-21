'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect, DependencyList } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, getAuth } from 'firebase/auth';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { getFirebaseApp } from '@/firebase/index';

// --- Interfaces ---
export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// ... other interfaces remain the same
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult { 
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// --- Context ---
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

// --- Provider ---
export const FirebaseProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Defer initialization until client-side mount
  const [services, setServices] = useState<{
    app: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
    storage: FirebaseStorage;
  } | null>(null);

  const [userAuthState, setUserAuthState] = useState<{ user: User | null; isUserLoading: boolean; userError: Error | null; }>({ 
    user: null, 
    isUserLoading: true, // Start as true until we can check
    userError: null 
  });

  // This effect runs ONLY on the client after the component mounts.
  // This is the key to preventing build-time errors.
  useEffect(() => {
    const app = getFirebaseApp();
    setServices({
      app,
      firestore: getFirestore(app),
      auth: getAuth(app),
      storage: getStorage(app),
    });
  }, []); // Empty array ensures this runs only once on mount

  // This effect subscribes to auth changes, but only if the auth service is available.
  useEffect(() => {
    if (!services?.auth) {
      setUserAuthState({ user: null, isUserLoading: false, userError: null });
      return;
    }
    const unsubscribe = onAuthStateChanged(
      services.auth,
      (firebaseUser) => {
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("FirebaseProvider auth error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [services?.auth]);

  // The context value is memoized. It will be in a "loading" state on the server
  // and during the initial render on the client.
  const contextValue = useMemo((): FirebaseContextState => {
    const areServicesAvailable = !!services;
    return {
      areServicesAvailable,
      firebaseApp: services?.app ?? null,
      firestore: services?.firestore ?? null,
      auth: services?.auth ?? null,
      storage: services?.storage ?? null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [services, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {/* The error listener also only renders when services are ready */}
      {services && <FirebaseErrorListener />}
      {children}
    </FirebaseContext.Provider>
  );
};

// --- Hooks (remain mostly the same) ---
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  // This check now correctly handles the initial server/client render state
  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth || !context.storage) {
    throw new Error('Firebase services not yet available. This may be due to server-side rendering. Ensure you are handling this case appropriately.');
  }
  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    storage: context.storage,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useStorage = (): FirebaseStorage => {
    const { storage } = useFirebase();
    return storage;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  return memoized;
}

export const useUser = (): UserHookResult => {
  const context = useContext(FirebaseContext);
   if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider.');
  }
  const { user, isUserLoading, userError } = context;
  return { user, isUserLoading, userError };
};
