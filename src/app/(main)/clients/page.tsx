'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase"; // Correctly import hooks
import { Client } from "@/app/(main)/clients/data/schema";
import { ClientsTable } from "./components/client-table";
import { columns } from "./components/columns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsPage() {
    // Use our robust hooks to get user state and Firestore instance
    const { user, isUserLoading, userError } = useUser();
    const firestore = useFirestore();
    
    const [clients, setClients] = useState<Client[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // useCallback to memoize the data fetching function
    const getClients = useCallback(async (userId: string) => {
        setIsDataLoading(true);
        try {
            const q = query(
                collection(firestore, "clients"), 
                where("ownerId", "==", userId),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const clientsData: Client[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                clientsData.push({ 
                    id: doc.id, 
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || null),
                 } as Client);
            });
            setClients(clientsData);
        } catch (e) {
            console.error("Failed to fetch clients:", e);
            // Optionally set an error state to show in the UI
        } finally {
            setIsDataLoading(false);
        }
    }, [firestore]); // Dependency on the firestore instance from our hook

    useEffect(() => {
        if (user) {
            getClients(user.uid);
        } else if (!isUserLoading) {
            // If there's no user and we have checked, stop loading.
            setIsDataLoading(false);
            setClients([]); // Ensure no stale data is shown
        }
    }, [user, isUserLoading, getClients]);

    // Combined loading state
    const isLoading = isUserLoading || isDataLoading;

    if (isLoading) {
        return <div className="p-8"><Skeleton className="h-96 w-full" /></div>; // Show a loader
    }

    if (userError || !user) {
        return <div className="p-8 text-center text-muted-foreground">Por favor, inicia sesión para ver tus clientes.</div>;
    }

    return (
        <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
                    <p className="text-muted-foreground">
                        Aquí tienes la lista de todos tus clientes.
                    </p>
                </div>
            </div>
            <ClientsTable data={clients} columns={columns} />
        </div>
    );
}
