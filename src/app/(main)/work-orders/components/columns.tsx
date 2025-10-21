
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

import { WorkOrder, statuses, priorities } from "../data/schema"
import { Badge } from "@/components/ui/badge"
import { Master } from "@/app/system/masters/data/schema"
import { Client } from "@/app/(main)/clients/data/schema"

// This approach allows the component to be reusable in contexts where masters/clients lists are not available
const getClientName = (clients: Client[], clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return clientId; // Fallback to ID
    return client.type === 'business' ? client.businessName : `${client.firstName} ${client.lastName}`;
};

const getMasterName = (masters: Master[], masterId: string) => {
    const master = masters.find(m => m.id === masterId);
    return master ? `${master.firstName} ${master.lastName}` : masterId; // Fallback to ID
};

const CellActions: React.FC<{ row: any }> = ({ row }) => {
    const workOrder = row.original as WorkOrder;
    const router = useRouter();

    const handleViewDetails = () => {
        // This will be the future route for work order details
        // router.push(`/work-orders/${workOrder.id}`);
        console.log("Navigate to work order", workOrder.id)
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleViewDetails}>
                    Ver Detalles
                </DropdownMenuItem>
                <DropdownMenuItem>
                    Editar Orden
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// The list of masters and clients are passed as optional props
export const getColumns = (masters: Master[] = [], clients: Client[] = []): ColumnDef<WorkOrder>[] => [
  {
    accessorKey: "title",
    header: "Título",
  },
  {
    accessorKey: "clientId",
    header: "Cliente",
    cell: ({ row }) => getClientName(clients, row.getValue("clientId"))
  },
  {
    accessorKey: "masterId",
    header: "Maestro",
    cell: ({ row }) => getMasterName(masters, row.getValue("masterId"))
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
        const status = statuses.find(s => s.value === row.original.status)
        if (!status) return null
        return <Badge variant={status.value === 'completed' ? 'default' : 'secondary'}>{status.label}</Badge>
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "priority",
    header: "Prioridad",
    cell: ({ row }) => {
        const priority = priorities.find(p => p.value === row.original.priority)
        if (!priority) return null
        return <div>{priority.label}</div>
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "actions",
    cell: CellActions,
  },
];
