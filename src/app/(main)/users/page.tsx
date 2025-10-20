
'use client';

import * as React from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
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
import { getAuth, onIdTokenChanged } from 'firebase/auth';

export default function UsersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.replace('/');
      return;
    }

    const auth = getAuth();
    const unsubscribe = onIdTokenChanged(auth, async (userWithClaims) => {
      if (userWithClaims) {
        try {
          const idTokenResult = await userWithClaims.getIdTokenResult(true); // Force refresh
          const isAdmin = idTokenResult.claims.role === 'SUPER_ADMIN';
          setIsSuperAdmin(isAdmin);
          if (!isAdmin) {
            router.replace('/');
          }
        } catch (error) {
          console.error("Error getting ID token result:", error);
          setIsSuperAdmin(false);
          router.replace('/');
        }
      } else {
        setIsSuperAdmin(false);
        router.replace('/');
      }
    });

    return () => unsubscribe();
  }, [user, isAuthLoading, router]);

  const usersQuery = useMemoFirebase(() => {
    // Only execute the query if we have confirmed the user is a SUPER_ADMIN
    if (firestore && isSuperAdmin === true) {
      return query(collection(firestore, 'users'));
    }
    return null;
  }, [firestore, isSuperAdmin]);

  // The hook will not run if usersQuery is null.
  const { data: users, isLoading: isDataLoading } = useCollection<UserProfile>(usersQuery, isSuperAdmin === true);

  const isLoading = isAuthLoading || isSuperAdmin === null || (isSuperAdmin === true && isDataLoading);

  if (isSuperAdmin === null) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>Verificando permisos...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-[250px]" />
                    </div>
                    <div className="rounded-md border">
                        <div className="space-y-2 p-4">
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  }

  if (!isSuperAdmin) {
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
