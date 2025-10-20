'use client';

import * as React from 'react';
import { collection, query, where, doc, setDoc, type CollectionReference, type Query } from 'firebase/firestore';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { LayoutGrid, List } from 'lucide-react';

import { columns } from './components/client-columns';
import { ClientTable } from './components/client-table';
import { type Client, clientSchema } from './data/schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CountryFilter } from '@/components/country-filter';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ClientKanbanView } from './components/client-kanban-view';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export default function ClientsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = React.useState<string | 'all'>('all');
  const [view, setView] = React.useState('table');
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{role: string, country?: string}>(userDocRef);

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || !userProfile) return null;
    
    let q: CollectionReference | Query;

    // The OWNER can see all clients. They can also filter by country.
    if (userProfile.role === 'OWNER') {
      q = collection(firestore, 'clients');
      if (selectedCountry !== 'all') {
        q = query(q, where('country', '==', selectedCountry));
      }
    // Other roles only see clients they own.
    } else {
      q = query(collection(firestore, 'clients'), where('ownerId', '==', user.uid));
    }
    
    return q;
  }, [firestore, user?.uid, userProfile, selectedCountry]);

  const { data: clients, isLoading: isDataLoading, error } = useCollection<Client>(clientsQuery, !!userProfile);

  const handleStatusChange = async (clientId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    const clientRef = doc(firestore, "clients", clientId);
    setDoc(clientRef, { status: newStatus }, { merge: true }).then(() => {
        toast({
            title: "Estado actualizado",
            description: "El estado del cliente ha sido cambiado.",
        });
    }).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: clientRef.path,
            operation: 'update',
            requestResourceData: { status: newStatus },
        }));
        toast({
            variant: "destructive",
            title: "Error de Permiso",
            description: "No tienes permiso para actualizar este cliente.",
        });
    });
  };

  const isLoading = isAuthLoading || isProfileLoading || (user && isDataLoading);

  return (
    <Card>
      <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>
            Administra los perfiles y la información de tus clientes.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
            {userProfile?.role === 'OWNER' && (
                <CountryFilter
                    selectedCountry={selectedCountry}
                    onCountryChange={setSelectedCountry}
                />
            )}
            <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value)} aria-label="View mode">
                <ToggleGroupItem value="table" aria-label="Table view">
                    <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="kanban" aria-label="Kanban view">
                    <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
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
        ) : view === 'table' ? (
          <ClientTable columns={columns} data={clients || []} />
        ) : (
          <ClientKanbanView clients={clients || []} onStatusChange={handleStatusChange} />
        )}
      </CardContent>
    </Card>
  );
}
