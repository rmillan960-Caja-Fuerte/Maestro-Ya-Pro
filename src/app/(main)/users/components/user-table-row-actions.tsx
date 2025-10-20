
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
import { userProfileSchema } from "../data/schema"
import { doc, updateDoc } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import type { z } from "zod"

interface UserTableRowActionsProps<TData> {
  row: Row<TData>
  table: Table<TData>
}

export function UserTableRowActions<TData>({
  row,
  table,
}: UserTableRowActionsProps<TData>) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const meta = table.options.meta as { openForm: (user?: z.infer<typeof userProfileSchema>) => void } | undefined;
  const user = userProfileSchema.parse(row.original);

  const handleToggleActive = async () => {
    try {
      if (!user.uid) throw new Error("ID del usuario no encontrado");
      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, { isActive: !user.isActive });
      toast({
        title: "Estado del usuario actualizado",
        description: `El usuario ha sido ${user.isActive ? 'desactivado' : 'activado'}.`,
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cambiar el estado del usuario. Inténtalo de nuevo.",
      });
    }
  }

  const openForm = () => {
    if (meta?.openForm) {
      meta.openForm(user);
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
        <DropdownMenuItem onClick={() => toast({ title: "Próximamente", description: "La suplantación de identidad estará disponible pronto." })}>
          Iniciar sesión como
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleActive} className={user.isActive ? "text-destructive focus:text-destructive focus:bg-destructive/10" : ""}>
          {user.isActive ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
