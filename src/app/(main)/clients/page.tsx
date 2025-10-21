
'use client'; // This directive marks the component as a Client Component

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { firestore, auth } from "@/firebase";
import { useAuthState } from 'react-firebase-hooks/auth'; // Using a hook for auth state
import { Client } from "@/app/(main)/clients/data/schema";
import { ClientsTable } from "./components/client-table";
import { columns } from "./components/columns";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

async function getClients(userId: string): Promise<Client[]> {
    const q = query(
        collection(firestore, "clients"), 
        where("ownerId", "==", userId),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const clients: Client[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        clients.push({ 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || null),
         } as Client);
    });
    return clients;
}

export default function ClientsPage() {
    const [user, loading, error] = useAuthState(auth);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getClients(user.uid)
                .then(setClients)
                .finally(() => setIsLoading(false));
        } else if (!loading) {
            setIsLoading(false);
        }
    }, [user, loading]);

    if (isLoading || loading) {
        return <div className="p-8"><Skeleton className="h-96 w-full" /></div>; // Show a loader
    }

    if (error || !user) {
        return <div className="p-8">Please sign in to view clients.</div>;
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
