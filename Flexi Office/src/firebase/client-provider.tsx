'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<{
    firebaseApp: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
  } | null>(null);

  useEffect(() => {
    const initialized = initializeFirebase();
    setServices(initialized);
  }, []);

  // During SSR or before initialization, we provide a placeholder context
  // but still render children to avoid blank pages and hydration mismatches.
  return (
    <FirebaseProvider
      firebaseApp={services?.firebaseApp as FirebaseApp}
      firestore={services?.firestore as Firestore}
      auth={services?.auth as Auth}
    >
      <div className={!services ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
        {children}
      </div>
    </FirebaseProvider>
  );
}
