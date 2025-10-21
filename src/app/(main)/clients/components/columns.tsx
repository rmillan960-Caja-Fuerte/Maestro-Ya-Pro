
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

import { Client, statuses, types } from "../data/schema"
import { Badge } from "@/components/ui/badge"

// This component will be created later
// import { ClientFormDialog } from "./client-form-dialog"

const CellActions: React.FC<{ row: any }> = ({ row }) => {
    const client = row.original as Client;
    const router = useRouter();
    // const [isFormOpen, setIsFormOpen] = React.useState(false);

    const handleViewHistory = () => {
        router.push(`/clients/${client.id}`);
    };

    return (
        <>
            {/* <ClientFormDialog isOpen={isFormOpen} onOpenChange={setIsFormOpen} client={client} onClientSaved={() => {}} /> */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleViewHistory}>
                        Ver Historial de Órdenes
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem onClick={() => setIsFormOpen(true)}>
                        Editar Cliente
                    </DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(client.id!)}
                    >
                        Copiar ID del Cliente
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const client = row.original
        const name = client.type === 'business' ? client.businessName : `${client.firstName} ${client.lastName}`
        return <div className="font-medium">{name}</div>
    }
  },
  {
    accessorKey: "primaryPhone",
    header: "Teléfono Principal",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
        const status = statuses.find(s => s.value === row.original.status)
        if (!status) return null
        return <Badge variant={status.value === 'active' ? 'default' : 'secondary'}>{status.label}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
        const type = types.find(t => t.value === row.original.type)
        if (!type) return null
        return <div>{type.label}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    cell: CellActions,
  },
]
