
'use client';

import * as React from 'react';
import { collection, query, doc } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { columns } from './components/user-columns';
import { UserTable } from './components/user-table';
import type { UserProfile } from './data/schema';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  
  // This state will tell us when it's safe to run the main query.
  const canFetchUsers = !isProfileLoading && userProfile?.role === 'SUPER_ADMIN';

  React.useEffect(() => {
    // Wait until profile is loaded to make a decision
    if (!isAuthLoading && !isProfileLoading && userProfile?.role !== 'SUPER_ADMIN') {
      router.replace('/');
    }
  }, [isAuthLoading, isProfileLoading, userProfile, router]);


  const usersQuery = useMemoFirebase(() => {
    // Only execute the query if we have confirmed the user is a SUPER_ADMIN
    if (firestore && canFetchUsers) {
      return query(collection(firestore, 'users'));
    }
    return null;
  }, [firestore, canFetchUsers]);

  // The hook will not run if usersQuery is null.
  const { data: users, isLoading: isDataLoading } = useCollection<UserProfile>(usersQuery, canFetchUsers);

  const isLoading = isAuthLoading || isProfileLoading || (canFetchUsers && isDataLoading);

  if (!isAuthLoading && !isProfileLoading && userProfile?.role !== 'SUPER_ADMIN') {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Acceso Denegado</CardTitle>
                <CardDescription>No tienes permiso para ver esta página. Serás redirigido.</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
        <CardDescription>
          Añade, edita y gestiona los miembros de tu equipo y sus roles.
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
          <UserTable columns={columns} data={users || []} />
        )}
      </CardContent>
    </Card>
  );
}
