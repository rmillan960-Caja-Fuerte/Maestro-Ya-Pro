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

interface ClientTableRowActionsProps<TData> {
  row: Row<TData>
}

export function ClientTableRowActions<TData>({
  row,
}: ClientTableRowActionsProps<TData>) {
  const { toast } = useToast();

  const handleEdit = () => {
    // Logic for editing a client
    toast({ title: "Próximamente", description: "La edición de clientes estará disponible pronto." });
  }

  const handleDelete = () => {
    // Logic for deleting a client
    toast({ variant: "destructive", title: "Próximamente", description: "La eliminación de clientes estará disponible pronto." });
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
        <DropdownMenuItem onClick={handleEdit}>Editar</DropdownMenuItem>
        <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
        <DropdownMenuItem>Crear Orden</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
