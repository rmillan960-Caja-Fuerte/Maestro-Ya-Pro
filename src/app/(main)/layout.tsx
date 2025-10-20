import * as React from 'react';
import AppHeader from '@/components/layout/header';
import AppSidebar from '@/components/layout/sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <AppSidebar />
      <div className="flex flex-col flex-1">
        <AppHeader />
        <main className="flex-1 p-4 sm:px-6 sm:py-6 flex flex-col gap-4 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
