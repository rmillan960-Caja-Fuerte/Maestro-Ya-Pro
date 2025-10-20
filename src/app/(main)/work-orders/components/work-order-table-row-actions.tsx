
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
import { workOrderSchema } from "../data/schema"
import type { z } from "zod"

interface WorkOrderTableRowActionsProps<TData> {
  row: Row<TData>
  table: Table<TData>
}

export function WorkOrderTableRowActions<TData>({
  row,
  table,
}: WorkOrderTableRowActionsProps<TData>) {
  const { toast } = useToast();
  const workOrder = workOrderSchema.parse(row.original)
  const { openForm } = (table.options.meta as { openForm: (workOrder?: z.infer<typeof workOrderSchema>) => void });


  const handleDelete = async () => {
    toast({
        variant: "destructive",
        title: "Funcionalidad no implementada",
        description: "La eliminación de órdenes de trabajo se implementará pronto.",
      });
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
        <DropdownMenuItem onClick={() => openForm(workOrder)}>Editar / Ver Detalle</DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast({ title: "Próximamente" })}>Agendar</DropdownMenuItem>
        <DropdownMenuItem onClick={() => toast({ title: "Próximamente" })}>Registrar Pago</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
          Cancelar Orden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
