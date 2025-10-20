
'use client';

import * as React from 'react';
import { collection, query, doc } from 'firebase/firestore';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
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

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{role: string}>(userDocRef);

  // Redirect if user is not SUPER_ADMIN
  React.useEffect(() => {
    if (!isAuthLoading && !isProfileLoading && userProfile?.role !== 'SUPER_ADMIN') {
        router.replace('/'); // Redirect to a safe page
    }
  }, [userProfile, isAuthLoading, isProfileLoading, router]);


  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !userProfile || userProfile.role !== 'SUPER_ADMIN') return null;
    return query(collection(firestore, 'users'));
  }, [firestore, user?.uid, userProfile]);

  const { data: users, isLoading: isDataLoading } = useCollection<UserProfile>(usersQuery, !!userProfile);

  const isLoading = isAuthLoading || isProfileLoading || (user && isDataLoading);
  
  // Render nothing or a loading state until redirection check is complete
  if (!userProfile || userProfile.role !== 'SUPER_ADMIN') {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Acceso Denegado</CardTitle>
                <CardDescription>No tienes permiso para ver esta página.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Serás redirigido a la página principal.</p>
            </CardContent>
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
