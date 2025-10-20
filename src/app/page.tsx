'use client';

import * as React from 'react';
import MainLayout from './(main)/layout';
import DashboardPage from './(main)/page';


export default function Page() {
  return (
    <MainLayout>
      <DashboardPage />
    </MainLayout>
  );
}
