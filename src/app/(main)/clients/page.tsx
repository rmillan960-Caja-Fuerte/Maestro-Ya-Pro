'use client';

import * as React from 'react';
import { collection, query, where, doc, CollectionReference } from 'firebase/firestore';
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
import { CountryFilter } from '@/components/country-filter';

export default function ClientsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const [selectedCountry, setSelectedCountry] = React.useState<string | 'all'>('all');
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{role: string, country?: string}>(userDocRef);

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !userProfile) return null;
    
    let q = collection(firestore, 'clients') as CollectionReference | query;

    if (userProfile.role === 'SUPER_ADMIN') {
        if (selectedCountry !== 'all') {
            q = query(q, where('country', '==', selectedCountry));
        }
    } else {
        q = query(q, where('country', '==', userProfile.country));
    }
    
    return q;
  }, [firestore, user?.uid, userProfile, selectedCountry]); 

  const { data: clients, isLoading: isDataLoading } = useCollection<Client>(clientsQuery, !!userProfile);

  const isLoading = isAuthLoading || isProfileLoading || (user && isDataLoading);

  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>
            Administra tus clientes y visualiza su información de contacto.
          </CardDescription>
        </div>
        {userProfile?.role === 'SUPER_ADMIN' && (
          <CountryFilter
            selectedCountry={selectedCountry}
            onCountryChange={setSelectedCountry}
          />
        )}
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
