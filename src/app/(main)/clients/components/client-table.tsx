
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
  getGlobalFilteredRowModel,
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

import { ClientTableToolbar } from "./client-table-toolbar"
import { ClientTablePagination } from "./client-table-pagination"
import { clientSchema, type Client } from "../data/schema"
import { doc, setDoc, addDoc, collection } from "firebase/firestore"
import { useFirestore, useUser } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import { ClientFormDialog } from "./client-form-dialog"
import type { z } from "zod"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

const globalFilterFn: FilterFn<any> = (row, columnId, value, addMeta) => {
    const rowValues = [
      row.original.firstName,
      row.original.lastName,
      row.original.businessName,
      row.original.email,
      row.original.primaryPhone,
    ].filter(Boolean).join(" ").toLowerCase();

    return rowValues.includes(String(value).toLowerCase());
};


export function ClientTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ globalFilter: false, name: false })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<z.infer<typeof clientSchema> | null>(null);

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleSaveClient = async (clientData: Omit<Client, 'id'>) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Error de autenticación",
            description: "Debes iniciar sesión para guardar un cliente.",
        });
        return;
    }

    const dataToSave = { ...clientData, ownerId: user.uid };

    try {
      if (selectedClient && selectedClient.id) {
        // Update existing client
        const clientRef = doc(firestore, "clients", selectedClient.id);
        setDoc(clientRef, dataToSave, { merge: true }).catch(err => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: clientRef.path,
                operation: 'update',
                requestResourceData: dataToSave,
            }))
        });
        toast({
          title: "Cliente actualizado",
          description: "La información del cliente ha sido actualizada.",
        });
      } else {
        // Create new client
        addDoc(collection(firestore, "clients"), dataToSave).catch(err => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: 'clients',
                operation: 'create',
                requestResourceData: dataToSave,
            }))
        });
        toast({
          title: "Cliente creado",
          description: "El nuevo cliente ha sido añadido a tu lista.",
        });
      }
      setIsFormOpen(false);
      setSelectedClient(null);
    } catch (error) {
      // This catch block is kept as a fallback, but specific permission errors are handled above.
      console.error("Error saving client:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el cliente. Inténtalo de nuevo.",
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
      openForm: (client?: z.infer<typeof clientSchema>) => {
        setSelectedClient(client || null);
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
    getGlobalFilteredRowModel: getGlobalFilteredRowModel(),
  })


  return (
    <div className="space-y-4">
      <ClientTableToolbar table={table as ReactTable<any>} />
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
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ClientTablePagination table={table as ReactTable<any>} />
      <ClientFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveClient}
        client={selectedClient}
      />
    </div>
  )
}
