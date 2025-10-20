
"use client"

import { Row, Table } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { clientSchema } from "../data/schema"
import { doc, deleteDoc } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import type { z } from "zod"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

interface ClientTableRowActionsProps<TData> {
  row: Row<TData>
  table: Table<TData>
}

export function ClientTableRowActions<TData>({
  row,
  table,
}: ClientTableRowActionsProps<TData>) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const meta = table.options.meta as { openForm: (client?: z.infer<typeof clientSchema>) => void } | undefined;
  const client = clientSchema.parse(row.original);

  const handleDelete = async () => {
    if (!client.id) {
        toast({ variant: "destructive", title: "Error", description: "ID del cliente no encontrado." });
        return;
    }
    const clientRef = doc(firestore, "clients", client.id);
    deleteDoc(clientRef).then(() => {
        toast({
            title: "Cliente eliminado",
            description: "El cliente ha sido eliminado correctamente.",
        });
    }).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: clientRef.path,
            operation: 'delete',
        }));
    });
  }

  const handleCreateOrder = () => {
    router.push(`/work-orders?clientId=${client.id}`);
  }

  const openForm = () => {
    if (meta?.openForm) {
      meta.openForm(client);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={openForm}>Editar</DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast({ title: "Próximamente", description: "La vista de perfil de cliente estará disponible pronto." })}>
          Ver Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCreateOrder}>
          Crear Orden
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
