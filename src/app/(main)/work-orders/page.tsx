'use client';

import * as React from 'react';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
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

// This component now fetches work orders, clients, and masters,
// then combines them to display enriched data in the table.
export default function WorkOrdersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();

  // 1. Define stable queries for all needed collections
  const workOrdersQuery = useMemoFirebase(() => 
    !firestore || !user?.uid ? null : query(collection(firestore, 'work-orders'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc')),
    [firestore, user?.uid]
  );
  const clientsQuery = useMemoFirebase(() => 
    !firestore || !user?.uid ? null : query(collection(firestore, 'clients'), where('ownerId', '==', user.uid)),
    [firestore, user?.uid]
  );
  const mastersQuery = useMemoFirebase(() => 
    !firestore || !user?.uid ? null : query(collection(firestore, 'masters'), where('ownerId', '==', user.uid)),
    [firestore, user?.uid]
  );

  // 2. Fetch data from all collections in parallel
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useCollection<WorkOrder>(workOrdersQuery);
  const { data: clients, isLoading: isLoadingClients } = useCollection<Client>(clientsQuery);
  const { data: masters, isLoading: isLoadingMasters } = useCollection<Master>(mastersQuery);

  // Determine the overall loading state
  const isLoading = isAuthLoading || (user && (isLoadingWorkOrders || isLoadingClients || isLoadingMasters));


  // 3. Enrich the work orders with client and master names
  const enrichedWorkOrders = React.useMemo(() => {
    if (!workOrders || !clients || !masters) return [];

    const clientsMap = new Map(clients.map(c => [c.id, c.type === 'business' ? c.businessName : `${c.firstName} ${c.lastName}`]));
    const mastersMap = new Map(masters.map(m => [m.id, `${m.firstName} ${m.lastName}`]));

    return workOrders.map(wo => ({
      ...wo,
      clientName: clientsMap.get(wo.clientId) || 'Cliente Desconocido',
      masterName: wo.masterId ? (mastersMap.get(wo.masterId) || 'Maestro no encontrado') : 'No Asignado',
    }));
  }, [workOrders, clients, masters]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes de Trabajo</CardTitle>
        <CardDescription>
          Administra todas las órdenes de trabajo, desde la cotización hasta el pago.
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
          <WorkOrderTable
            columns={columns}
            data={enrichedWorkOrders}
            clients={clients || []}
            masters={masters || []}
            workOrdersCount={workOrders?.length || 0}
          />
        )}
      </CardContent>
    </Card>
  );
}
