
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
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MasterTableToolbar } from "./master-table-toolbar"
import { MasterTablePagination } from "./master-table-pagination"
import { MasterFormDialog } from "./master-form-dialog"
import { doc, setDoc, addDoc, collection } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import { masterSchema, type Master } from "../data/schema"
import type { z } from "zod"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function MasterTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedMaster, setSelectedMaster] = React.useState<z.infer<typeof masterSchema> | null>(null);

  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSaveMaster = async (masterData: Omit<Master, 'id'>) => {
    try {
      if (selectedMaster && selectedMaster.id) {
        const masterRef = doc(firestore, "masters", selectedMaster.id);
        await setDoc(masterRef, masterData, { merge: true });
        toast({
          title: "Maestro actualizado",
          description: "La información del maestro ha sido actualizada.",
        });
      } else {
        await addDoc(collection(firestore, "masters"), masterData);
        toast({
          title: "Maestro creado",
          description: "El nuevo maestro ha sido añadido a tu lista.",
        });
      }
      setIsFormOpen(false);
      setSelectedMaster(null);
    } catch (error) {
      console.error("Error saving master:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el maestro. Inténtalo de nuevo.",
      });
    }
  };
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    meta: {
      openForm: (master?: z.infer<typeof masterSchema>) => {
        setSelectedMaster(master || null);
        setIsFormOpen(true);
      }
    },
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
      <MasterTableToolbar table={table} />
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
                  No se encontraron maestros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <MasterTablePagination table={table} />
      <MasterFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveMaster}
        master={selectedMaster}
      />
    </div>
  )
}
