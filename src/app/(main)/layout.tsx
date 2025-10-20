'use client';

import * as React from 'react';
import AppHeader from '@/components/layout/header';
import AppSidebar from '@/components/layout/sidebar';
import { IntelligentAssistant } from '@/components/ai/intelligent-assistant';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

function MainLayoutContent({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(
        () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
        [firestore, user]
    );
    
    const { data: userProfile } = useDoc<{role?: string}>(userDocRef);

    return (
        <div className="flex min-h-screen w-full bg-muted/40">
          <AppSidebar userRole={userProfile?.role} />
          <div className="flex flex-col flex-1">
            <AppHeader />
            <main className="flex-1 p-4 sm:px-6 sm:py-6 flex flex-col gap-4 md:gap-8">
              {children}
            </main>
          </div>
          <IntelligentAssistant />
        </div>
    )
}


export default function MainLayout({ children }: { children: React.ReactNode }) {
  // This outer component can remain a Server Component if it doesn't use client hooks.
  // We wrap the part that uses hooks in a 'use client' component.
  return (
    <MainLayoutContent>
      {children}
    </MainLayoutContent>
  );
}
