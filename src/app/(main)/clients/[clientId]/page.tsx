'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Client } from "@/app/(main)/clients/data/schema";
import { WorkOrder } from "@/app/(main)/work-orders/data/schema";
import { WorkOrdersTable } from "@/app/(main)/work-orders/components/work-orders-table";
import { ClientDetailsCard } from "./components/client-details-card";
import { getColumns } from "@/app/(main)/work-orders/components/columns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDetailPage() {
    const params = useParams();
    const clientId = params.clientId as string;
    const firestore = useFirestore();

    const [client, setClient] = useState<Client | null>(null);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!clientId || !firestore) {
            // Firestore service might not be available on the very first render.
            // The hook will re-trigger once it is.
            return;
        }

        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Fetch client details
                const docRef = doc(firestore, "clients", clientId);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    setError("Cliente no encontrado."); // This will be used to show a message
                    return; // Stop execution if client not found
                }
                const clientData = docSnap.data();
                setClient({
                    id: docSnap.id,
                    ...clientData,
                    createdAt: clientData.createdAt?.toDate ? clientData.createdAt.toDate() : null,
                } as Client);

                // 2. Fetch work orders for that client
                const q = query(
                    collection(firestore, "work-orders"),
                    where("clientId", "==", clientId),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const orders: WorkOrder[] = [];
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    orders.push({
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
                    } as WorkOrder);
                });
                setWorkOrders(orders);

            } catch (e: any) {
                console.error("Error fetching client page data:", e);
                setError("No se pudieron cargar los datos del cliente.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [clientId, firestore]); // Effect depends on clientId and firestore instance

    const workOrderColumns = useMemo(() => getColumns([], []), []);

    if (loading) {
        return (
             <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (error || !client) {
        // If there was an error or the client wasn't found after loading
        return <div className="p-8 text-center text-muted-foreground">{error || "Cliente no encontrado."}</div>;
    }

    return (
        <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {client.type === 'business' ? client.businessName : `${client.firstName} ${client.lastName}`}
                    </h2>
                    <p className="text-muted-foreground">
                        Historial completo y detalles del cliente.
                    </p>
                </div>
            </div>

            <ClientDetailsCard client={client} />

            <div className="mt-8">
                 <h3 className="text-xl font-bold tracking-tight mb-4">Órdenes de Trabajo</h3>
                 <WorkOrdersTable data={workOrders} columns={workOrderColumns} masters={[]} clients={[]} />
            </div>
        </div>
    );
}
