'use client';

import { useMemo } from 'react';
import { collection, query, where, doc } from 'firebase/firestore';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';

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
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{role: string}>(userDocRef);

  const clientsQuery = useMemoFirebase(() => {
    // Wait until we have the user and their profile
    if (!firestore || !user?.uid || !userProfile) return null;

    const clientsCollection = collection(firestore, 'clients');
    
    // If user is SUPER_ADMIN, fetch all clients. Otherwise, fetch only their own.
    if (userProfile.role === 'SUPER_ADMIN') {
      return query(clientsCollection);
    } else {
      return query(clientsCollection, where('ownerId', '==', user.uid));
    }
  }, [firestore, user?.uid, userProfile]); 

  const { data: clients, isLoading: isDataLoading } = useCollection<Client>(clientsQuery, !!userProfile);

  const isLoading = isAuthLoading || isProfileLoading || (user && isDataLoading);

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
