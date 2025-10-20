
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
  FilterFn,
  getGlobalFilteredRowModel,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WorkOrderTableToolbar } from "./work-order-table-toolbar"
import { WorkOrderTablePagination } from "./work-order-table-pagination"
import { doc, setDoc, addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore"
import { useFirestore, useUser } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import { workOrderSchema, type WorkOrder } from "../data/schema"
import { generateOrderNumber } from "@/lib/utils"
import { Client } from "@/app/(main)/clients/data/schema"
import { Master } from "@/app/(main)/masters/data/schema"
import { WorkOrderFormDialog } from "./work-order-form-dialog"
import type { z } from "zod"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  clients: Client[]
  masters: Master[]
  workOrdersCount: number
  initialClientId?: string | null;
}

const dateBetweenFilterFn: FilterFn<any> = (row, columnId, value, addMeta) => {
  const date = row.getValue(columnId) as Date | Timestamp;
  const [start, end] = value as [Date, Date];

  const d = date instanceof Timestamp ? date.toDate() : date;

  if (!d) return false;
  
  const startTime = start.getTime();
  const endTime = end.getTime();
  const rowTime = d.getTime();

  return rowTime >= startTime && rowTime <= endTime;
};

const globalFilterFn: FilterFn<any> = (row, columnId, value, addMeta) => {
    const rowValues = [
      row.original.clientName,
      row.original.masterName,
      row.original.orderNumber,
      row.original.title,
    ].filter(Boolean).join(" ").toLowerCase();

    return rowValues.includes(String(value).toLowerCase());
};

export function WorkOrderTable<TData, TValue>({
  columns,
  data,
  clients,
  masters,
  workOrdersCount,
  initialClientId,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ globalFilter: false, title: false })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true }
  ])
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = React.useState<z.infer<typeof workOrderSchema> | null>(null);
  
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleSaveWorkOrder = async (workOrderData: Omit<WorkOrder, 'id' | 'orderNumber' | 'createdAt'>) => {
    try {
      if (selectedWorkOrder) {
        // Update existing work order
        const workOrderRef = doc(firestore, "work-orders", selectedWorkOrder.id);
        await setDoc(workOrderRef, { ...workOrderData, updatedAt: serverTimestamp() }, { merge: true });
        toast({
          title: "Orden actualizada",
          description: "La orden de trabajo ha sido actualizada.",
        });
      } else {
        // Create new work order
        if (!user) throw new Error("Usuario no autenticado.");
        const newOrderNumber = generateOrderNumber(workOrdersCount);
        const newWorkOrder = {
          ...workOrderData,
          ownerId: user.uid,
          orderNumber: newOrderNumber,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
        await addDoc(collection(firestore, "work-orders"), newWorkOrder);
        toast({
          title: "Orden creada",
          description: "La nueva orden de trabajo ha sido creada.",
        });
      }
      setIsFormOpen(false);
      setSelectedWorkOrder(null);
    } catch (error) {
      console.error("Error saving work order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la orden de trabajo. Inténtalo de nuevo.",
      });
    }
  };

  const openForm = React.useCallback((workOrder?: z.infer<typeof workOrderSchema>, clientId?: string | null) => {
    let wo = workOrder || null;
    if (!wo && clientId) {
      // Create a partial work order object with just the client ID
      wo = { clientId } as z.infer<typeof workOrderSchema>;
    }
    setSelectedWorkOrder(wo);
    setIsFormOpen(true);
  }, []);

  React.useEffect(() => {
    if (initialClientId) {
      openForm(undefined, initialClientId);
    }
  }, [initialClientId, openForm]);

  const table = useReactTable({
    data,
    columns,
    filterFns: {
        dateBetween: dateBetweenFilterFn,
    },
    globalFilterFn,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    meta: {
      openForm: (workOrder?: z.infer<typeof workOrderSchema>) => openForm(workOrder)
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
      <WorkOrderTableToolbar table={table} />
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
                  No se encontraron órdenes de trabajo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <WorkOrderTablePagination table={table} />
       <WorkOrderFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveWorkOrder}
        workOrder={selectedWorkOrder}
        clients={clients}
        masters={masters}
      />
    </div>
  )
}
