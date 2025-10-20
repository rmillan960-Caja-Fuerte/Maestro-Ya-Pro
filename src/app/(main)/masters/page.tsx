
'use client';

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';

import { columns } from './components/master-columns';
import { MasterTable } from './components/master-table';
import { type Master } from './data/schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function MastersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  
  const mastersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'masters');
  }, [firestore, user?.uid]);

  const { data: masters, isLoading: isDataLoading } = useCollection<Master>(mastersQuery);

  const isLoading = isAuthLoading || (user && isDataLoading);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maestros</CardTitle>
        <CardDescription>
          Administra los perfiles y la información de tus profesionales.
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
          <MasterTable columns={columns} data={masters || []} />
        )}
      </CardContent>
    </Card>
  );
}
