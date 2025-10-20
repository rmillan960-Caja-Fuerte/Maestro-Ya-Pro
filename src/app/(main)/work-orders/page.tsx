'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, orderBy, where, doc, type CollectionReference, type Query } from 'firebase/firestore';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkOrderTable } from './components/work-order-table';
import { columns } from './components/work-order-columns';
import type { WorkOrder } from './data/schema';
import type { Client } from '@/app/(main)/clients/data/schema';
import type { Master } from '@/app/(main)/masters/data/schema';
import { CountryFilter } from '@/components/country-filter';

// This component now fetches work orders, clients, and masters,
// then combines them to display enriched data in the table.
export default function WorkOrdersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const searchParams = useSearchParams();
  const clientIdFromUrl = searchParams.get('clientId');
  const [selectedCountry, setSelectedCountry] = React.useState<string | 'all'>('all');

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{role: string, country?: string}>(userDocRef);

  // 1. Define stable queries for all needed collections, ensuring user UID and profile exist.
  const workOrdersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !userProfile) return null;
    
    let q: CollectionReference | Query;
    
    if (userProfile.role === 'OWNER') {
      q = collection(firestore, 'work-orders');
      if (selectedCountry !== 'all') {
        q = query(q, where('country', '==', selectedCountry));
      }
    } else {
      q = query(collection(firestore, 'work-orders'), where('ownerId', '==', user.uid));
    }
    
    return query(q, orderBy('createdAt', 'desc'));
  }, [firestore, user?.uid, userProfile, selectedCountry]);
  
  const clientsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !userProfile) return null;
    let q: CollectionReference | Query;
    if (userProfile.role === 'OWNER') {
      q = collection(firestore, 'clients');
    } else {
      q = query(collection(firestore, 'clients'), where('ownerId', '==', user.uid));
    }
    return q;
  }, [firestore, user?.uid, userProfile]);
  
  const mastersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !userProfile) return null;
    let q: CollectionReference | Query;
     if (userProfile.role === 'OWNER') {
      q = collection(firestore, 'masters');
    } else {
      q = query(collection(firestore, 'masters'), where('ownerId', '==', user.uid));
    }
    return q;
  }, [firestore, user?.uid, userProfile]);

  // 2. Fetch data from all collections in parallel. useCollection will handle null queries.
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useCollection<WorkOrder>(workOrdersQuery, !!userProfile);
  const { data: clients, isLoading: isLoadingClients } = useCollection<Client>(clientsQuery, !!userProfile);
  const { data: masters, isLoading: isLoadingMasters } = useCollection<Master>(mastersQuery, !!userProfile);

  // Determine the overall loading state
  const isLoading = isAuthLoading || isProfileLoading || (user && (isLoadingWorkOrders || isLoadingClients || isLoadingMasters));


  // 3. Enrich the work orders with client and master names once all data is loaded
  const enrichedWorkOrders = React.useMemo(() => {
    if (isLoading || !workOrders || !clients || !masters) return [];

    const clientsMap = new Map(clients.map(c => [c.id, c.type === 'business' ? c.businessName : `${c.firstName} ${c.lastName}`]));
    const mastersMap = new Map(masters.map(m => [m.id, `${m.firstName} ${m.lastName}`]));

    return workOrders.map(wo => ({
      ...wo,
      clientName: clientsMap.get(wo.clientId) || 'Cliente Desconocido',
      masterName: wo.masterId ? (mastersMap.get(wo.masterId) || 'Maestro no encontrado') : 'No Asignado',
    }));
  }, [isLoading, workOrders, clients, masters]);


  return (
    <Card>
      <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Órdenes de Trabajo</CardTitle>
          <CardDescription>
            Administra todas las órdenes de trabajo, desde la cotización hasta el pago.
          </CardDescription>
        </div>
        {userProfile?.role === 'OWNER' && (
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
          <WorkOrderTable
            columns={columns}
            data={enrichedWorkOrders}
            clients={clients || []}
            masters={masters || []}
            workOrdersCount={workOrders?.length || 0}
            initialClientId={clientIdFromUrl}
          />
        )}
      </CardContent>
    </Card>
  );
}
