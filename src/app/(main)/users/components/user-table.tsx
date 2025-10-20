
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as ReactTable,
  FilterFn,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { UserTableToolbar } from "./user-table-toolbar"
import { UserTablePagination } from "./user-table-pagination"
import { userProfileSchema } from "../data/schema"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import { UserFormDialog } from "./user-form-dialog"
import type { z } from "zod"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { useAuth } from "@/firebase"
import { ROLES } from "@/lib/permissions"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

const globalFilterFn: FilterFn<any> = (row, columnId, value, addMeta) => {
    const rowValues = [
      row.original.firstName,
      row.original.lastName,
      row.original.email,
    ].filter(Boolean).join(" ").toLowerCase();

    return rowValues.includes(String(value).toLowerCase());
};


export function UserTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ globalFilter: false })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<z.infer<typeof userProfileSchema> | null>(null);

  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const handleSaveUser = async (userData: Omit<z.infer<typeof userProfileSchema>, 'uid' | 'createdAt' | 'permissions'>, password?: string) => {
    try {
      if (selectedUser && selectedUser.uid) {
        // Update existing user
        const userRef = doc(firestore, "users", selectedUser.uid);
        const roleInfo = ROLES[userData.role as keyof typeof ROLES];
        await setDoc(userRef, {...userData, permissions: roleInfo.permissions }, { merge: true });
        toast({
          title: "Usuario actualizado",
          description: "La información del usuario ha sido actualizada.",
        });
      } else {
        // Create new user
        if (!password) {
            toast({ variant: "destructive", title: "Error", description: "La contraseña es obligatoria para nuevos usuarios."});
            return;
        }

        // WARNING: This is a temporary admin action. In a real production app,
        // you would create a Cloud Function to handle user creation to avoid
        // needing the currently logged-in user to have special auth privileges.
        // This function would securely create the user and their Firestore profile.
        // For this prototype, we create the user on the client.
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
        const newUser = userCredential.user;

        const roleInfo = ROLES[userData.role as keyof typeof ROLES];
        const userRef = doc(firestore, "users", newUser.uid);
        await setDoc(userRef, {
            ...userData,
            uid: newUser.uid,
            permissions: roleInfo.permissions,
            createdAt: serverTimestamp(),
        });

        toast({
          title: "Usuario creado",
          description: "El nuevo usuario ha sido añadido al equipo.",
        });
      }
      setIsFormOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error("Error saving user:", error);
      let description = "No se pudo guardar el usuario. Inténtalo de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
        description = 'Este correo electrónico ya está en uso.';
      } else if (error.code === 'auth/weak-password') {
        description = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      }
      toast({
        variant: "destructive",
        title: "Error",
        description,
      });
    }
  };
  
  const table = useReactTable({
    data,
    columns,
    globalFilterFn,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    meta: {
      openForm: (user?: z.infer<typeof userProfileSchema>) => {
        setSelectedUser(user || null);
        setIsFormOpen(true);
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })


  return (
    <div className="space-y-4">
      <UserTableToolbar table={table as ReactTable<any>} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <UserTablePagination table={table as ReactTable<any>} />
      <UserFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </div>
  )
}
