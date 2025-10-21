
"use client"

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, onSnapshot, query, orderBy, getDocs } from "firebase/firestore";
import { useFirestore } from '@/firebase';

import { ProFlow } from './components/pro-flow';
import { WorkOrderTable } from './components/work-order-table';
import { getColumns } from './components/columns';
import { Client } from '@/app/(main)/clients/data/schema';
import { Master } from '@/app/(main)/masters/data/schema';
import { WorkOrder } from './data/schema';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { LayoutGrid, List } from 'lucide-react';

function WorkOrdersDisplay() {
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const initialClientId = searchParams.get('clientId');

    const [view, setView] = useState('table');
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [masters, setMasters] = useState<Master[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore) return;
        setLoading(true);

        const fetchStaticData = async () => {
            const clientsSnapshot = await getDocs(collection(firestore, "clients"));
            setClients(clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[]);
            const mastersSnapshot = await getDocs(collection(firestore, "masters"));
            setMasters(mastersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Master[]);
        };

        const q = query(collection(firestore, "work-orders"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const woData = querySnapshot.docs.map(doc => {
                 const data = doc.data();
                const toDate = (ts: any) => ts?.toDate ? ts.toDate() : ts;
                return { 
                    id: doc.id, 
                    ...data,
                    createdAt: toDate(data.createdAt), 
                    updatedAt: toDate(data.updatedAt),
                    scheduledDate: toDate(data.scheduledDate),
                    completionDate: toDate(data.completionDate),
                } as WorkOrder
            });
            setWorkOrders(woData);
            if(loading) setLoading(false);
        });

        fetchStaticData();

        return () => unsubscribe();
    }, [firestore]);

    const columns = getColumns(masters, clients);

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Órdenes de Trabajo</h2>
                    <p className="text-muted-foreground">
                        Aquí tienes la lista de todas las órdenes de trabajo.
                    </p>
                </div>
                <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value)} defaultValue="table">
                    <ToggleGroupItem value="flow" aria-label="Toggle flow">
                        <LayoutGrid className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="table" aria-label="Toggle table">
                        <List className="h-4 w-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {view === 'flow' ? (
                <ProFlow />
            ) : (
                <WorkOrderTable 
                    columns={columns} 
                    data={workOrders} 
                    clients={clients} 
                    masters={masters}
                    workOrdersCount={workOrders.length}
                    initialClientId={initialClientId}
                />
            )}
        </div>
    );
}

export default function WorkOrdersPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <WorkOrdersDisplay />
        </Suspense>
    )
}
