
"use client"

import { Row, Table } from "@tanstack/react-table"
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
import { masterSchema } from "../data/schema"
import { doc, deleteDoc } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import type { z } from "zod"

interface MasterTableRowActionsProps<TData> {
  row: Row<TData>
  table: Table<TData>
}

export function MasterTableRowActions<TData>({
  row,
  table,
}: MasterTableRowActionsProps<TData>) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { openForm } = (table.options.meta as { openForm: (master?: z.infer<typeof masterSchema>) => void });
  const master = masterSchema.parse(row.original)

  const handleDelete = async () => {
    try {
      if (!master.id) throw new Error("ID del maestro no encontrado");
      await deleteDoc(doc(firestore, "masters", master.id));
      toast({
        title: "Maestro eliminado",
        description: "El maestro ha sido eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error deleting master:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el maestro. Inténtalo de nuevo.",
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
        <DropdownMenuItem onClick={() => openForm(master)}>Editar</DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast({ title: "Próximamente", description: "La vista de perfil de maestro estará disponible pronto." })}>
          Ver Perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
