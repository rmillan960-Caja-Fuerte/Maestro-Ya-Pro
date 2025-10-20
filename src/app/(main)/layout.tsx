import * as React from 'react';
import AppHeader from '@/components/layout/header';
import AppSidebar from '@/components/layout/sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <AppSidebar />
      <div className="flex flex-col flex-1 sm:pl-14">
        <AppHeader />
        <main className="flex-1 p-4 sm:px-6 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
