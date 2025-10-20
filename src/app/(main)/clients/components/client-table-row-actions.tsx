
"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

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

interface ClientTableRowActionsProps<TData> {
  row: Row<TData>
}

export function ClientTableRowActions<TData>({
  row,
}: ClientTableRowActionsProps<TData>) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { openForm } = (table.options.meta as { openForm: (client?: z.infer<typeof clientSchema>) => void });

  const handleDelete = async () => {
    try {
      const client = row.original as z.infer<typeof clientSchema>;
      await deleteDoc(doc(firestore, "clients", client.id));
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el cliente. Inténtalo de nuevo.",
      });
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
        <DropdownMenuItem onClick={() => openForm(row.original as z.infer<typeof clientSchema>)}>Editar</DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast({ title: "Próximamente", description: "La vista de perfil de cliente estará disponible pronto." })}>
          Ver Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast({ title: "Próximamente", description: "La creación de órdenes desde aquí estará disponible pronto." })}>
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
