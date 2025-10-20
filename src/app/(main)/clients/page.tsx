
'use client';

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';

import { columns } from './components/client-columns';
import { ClientTable } from './components/client-table';
import { type Client } from './data/schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  
  const clientsQuery = useMemoFirebase(() => {
    // Wait until the user is authenticated before creating the query.
    if (!firestore || !user) return null;
    return collection(firestore, 'clients');
  }, [firestore, user]);

  const { data: clients, isLoading: isDataLoading } = useCollection<Client>(clientsQuery);

  const isLoading = isAuthLoading || (user && isDataLoading);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
        <CardDescription>
          Administra tus clientes y visualiza su información de contacto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-[250px]" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-[70px]" />
                <Skeleton className="h-8 w-[120px]" />
              </div>
            </div>
            <div className="rounded-md border">
              <div className="space-y-2 p-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <ClientTable columns={columns} data={clients || []} />
        )}
      </CardContent>
    </Card>
  );
}
