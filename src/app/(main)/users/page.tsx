
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
  
  // Client-side check to see if the user has the OWNER role.
  // This is used to decide whether to even attempt the Firestore query.
  const canFetchUsers = !isProfileLoading && userProfile?.role === 'OWNER';

  React.useEffect(() => {
    // If, after loading, the user is confirmed NOT to be an owner, redirect them.
    if (!isAuthLoading && !isProfileLoading && userProfile && userProfile?.role !== 'OWNER') {
      console.log("Redirecting non-owner user.");
      router.replace('/');
    }
  }, [isAuthLoading, isProfileLoading, userProfile, router]);


  const usersQuery = useMemoFirebase(() => {
    // Only build the query if we have confirmed the user is an OWNER.
    if (firestore && canFetchUsers) {
      return query(collection(firestore, 'users'));
    }
    return null;
  }, [firestore, canFetchUsers]);

  // The hook will not run if usersQuery is null, preventing a permission error for non-owners.
  const { data: users, isLoading: isDataLoading, error } = useCollection<UserProfile>(usersQuery, canFetchUsers);

  const isLoading = isAuthLoading || isProfileLoading || (canFetchUsers && isDataLoading);

  // While loading, or if the user is a non-owner, we might not have a definitive answer,
  // so we show a loading state or an empty card until redirection happens.
  if (!canFetchUsers && !isLoading) {
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
                <AlertTitle>Error de Permisos de Firestore</AlertTitle>
                <AlertDescription>
                    <p>Tus reglas de seguridad impidieron la carga de usuarios. Esto es esperado si tu rol no es `OWNER` o si los Custom Claims no están configurados correctamente en tu proyecto de Firebase para el rol de Propietario.</p>
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
