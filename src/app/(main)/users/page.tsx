
'use client';

import * as React from 'react';
import { collection, query, doc, where } from 'firebase/firestore';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function UsersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  
  // The user must be an OWNER to view this page.
  // This check is now performed using client-side data.
  const canFetchUsers = !isProfileLoading && userProfile?.role === 'OWNER';

  React.useEffect(() => {
    // Wait until profile is loaded to make a decision
    if (!isAuthLoading && !isProfileLoading && userProfile && userProfile?.role !== 'OWNER') {
      router.replace('/');
    }
  }, [isAuthLoading, isProfileLoading, userProfile, router]);


  const usersQuery = useMemoFirebase(() => {
    // Only execute the query if we have confirmed the user is a OWNER
    if (firestore && canFetchUsers) {
      return query(collection(firestore, 'users'));
    }
    return null;
  }, [firestore, canFetchUsers]);

  // The hook will not run if usersQuery is null. `useCollection` has a second argument to enable/disable it.
  const { data: users, isLoading: isDataLoading, error } = useCollection<UserProfile>(usersQuery, canFetchUsers);

  const isLoading = isAuthLoading || isProfileLoading || (canFetchUsers && isDataLoading);

  // If the user's role is not OWNER, show an access denied message.
  if (!isAuthLoading && !isProfileLoading && userProfile && userProfile?.role !== 'OWNER') {
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
        {error && (
            <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error de Permisos</AlertTitle>
                <AlertDescription>
                    <p>Las reglas de seguridad de Firestore impidieron la carga de usuarios. Esto es esperado si el usuario no tiene el rol de `OWNER`.</p>
                    <p className='mt-2 text-xs'>Error: {error.message}</p>
                </AlertDescription>
            </Alert>
        )}
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
