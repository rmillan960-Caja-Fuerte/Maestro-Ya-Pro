
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { firestore } from "@/firebase";
import { Client } from "@/app/(main)/clients/data/schema";
import { WorkOrder } from "@/app/(main)/work-orders/data/schema";
import { notFound } from "next/navigation";
import { WorkOrdersTable } from "@/app/(main)/work-orders/components/work-orders-table";
import { ClientDetailsCard } from "./components/client-details-card";
import { getColumns } from "@/app/(main)/work-orders/components/columns"; // Corrected import

interface ClientDetailPageProps {
    params: { clientId: string };
}

async function getClient(id: string): Promise<Client | null> {
    const docRef = doc(firestore, "clients", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return null;
    }
    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
    } as Client;
}

async function getWorkOrders(clientId: string): Promise<WorkOrder[]> {
    const q = query(
        collection(firestore, "work-orders"),
        where("clientId", "==", clientId),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const workOrders: WorkOrder[] = [];
    querySnapshot.forEach(doc => {
        const data = doc.data();
        workOrders.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
        } as WorkOrder);
    });
    return workOrders;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
    const client = await getClient(params.clientId);

    if (!client) {
        notFound();
    }

    const workOrders = await getWorkOrders(params.clientId);
    const workOrderColumns = getColumns([], []); // Call the function to get the columns

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
