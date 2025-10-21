'use client';

import React, { useContext } from 'react';
import AppHeader from '@/components/layout/header';
import AppSidebar from '@/components/layout/sidebar';
import { IntelligentAssistant } from '@/components/ai/intelligent-assistant';
import { FirebaseContext, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

function LayoutSkeleton() {
    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            {/* Skeleton for Sidebar */}
            <div className="hidden md:flex md:w-64 flex-col gap-4 border-r bg-background p-4">
                <Skeleton className="h-8 w-3/4" />
                <div className="flex flex-col gap-2 mt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <div className="flex flex-col flex-1">
                {/* Skeleton for Header */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
                    <Skeleton className="h-8 w-1/2" />
                    <div className="relative ml-auto flex-1 md:grow-0">
                         <Skeleton className="h-8 w-full" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                </header>
                {/* Skeleton for Main Content */}
                <main className="flex-1 p-4 sm:px-6 sm:py-6">
                    <Skeleton className="h-full w-full" />
                </main>
            </div>
        </div>
    );
}

function MainLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, firestore } = useContext(FirebaseContext)!;

    // This component now only runs when user and firestore are available.
    const userDocRef = useMemoFirebase(
        () => (user ? doc(firestore!, 'users', user.uid) : null),
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
    const firebaseContext = useContext(FirebaseContext);

    // If services are not yet available or user is loading, show a full-page skeleton.
    // This is the crucial check that prevents server-side rendering errors.
    if (!firebaseContext || !firebaseContext.areServicesAvailable || firebaseContext.isUserLoading) {
        return <LayoutSkeleton />;
    }

    // We have services, but maybe no logged-in user. 
    // The header and other components are designed to handle this.
    // We can now safely render the main content.
    return (
        <MainLayoutContent>
            {children}
        </MainLayoutContent>
    );
}
