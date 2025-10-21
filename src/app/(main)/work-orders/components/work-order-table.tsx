
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { WorkOrderFormDialog } from './work-order-form-dialog';
import type { WorkOrder } from "../data/schema"
import type { Client } from "@/app/(main)/clients/data/schema"
import type { Master } from "@/app/(main)/masters/data/schema"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  clients: Client[]
  masters: Master[]
  workOrdersCount: number
  initialClientId?: string | null;
  onWorkOrderSaved?: () => void;
}

const dateBetweenFilterFn: FilterFn<any> = (row, columnId, value) => {
  const date = row.getValue(columnId) as Date;
  const [start, end] = value as [Date, Date];
  if (!date) return false;
  const startTime = start.getTime();
  const endTime = end.getTime();
  const rowTime = date.getTime();
  return rowTime >= startTime && rowTime <= endTime;
};

const globalFilterFn: FilterFn<any> = (row, columnId, value) => {
    const rowValues = [
      row.original.clientName,
      row.original.masterName,
      row.original.orderNumber,
      row.original.title,
    ].filter(Boolean).join(" ").toLowerCase();

    return rowValues.includes(String(value).toLowerCase());
};

export function WorkOrderTable<TData extends { id: string }, TValue>({
  columns,
  data,
  clients,
  masters,
  initialClientId,
  onWorkOrderSaved
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [globalFilter, setGlobalFilter] = React.useState('');
  
  // Centralized state for the dialog
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = React.useState<WorkOrder | undefined>(undefined);

  // Unified function to open the dialog for editing or creating
  const openForm = React.useCallback((workOrder?: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsFormOpen(true);
  }, []);

  // Effect to handle the initial opening from a client page
  React.useEffect(() => {
    if (initialClientId) {
        const wo = { clientId: initialClientId } as WorkOrder;
        openForm(wo);
    }
  }, [initialClientId, openForm]);

  // Centralized handler for closing the dialog
  const handleDialogClose = (open: boolean) => {
      if(!open) {
          setSelectedWorkOrder(undefined);
      }
      setIsFormOpen(open);
  }

  const handleSaveSuccess = () => {
    handleDialogClose(false); 
    if (onWorkOrderSaved) {
      onWorkOrderSaved(); 
    } else {
      router.refresh(); 
    }
  };

  const table = useReactTable({
    data,
    columns,
    filterFns: { dateBetween: dateBetweenFilterFn },
    globalFilterFn,
    state: { sorting, columnVisibility, rowSelection, columnFilters, globalFilter },
    meta: { openForm }, // Pass openForm to be used by the column actions
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
      {/* Pass the openForm function to the toolbar */}
      <WorkOrderTableToolbar table={table} onAdd={() => openForm()} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron órdenes de trabajo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <WorkOrderTablePagination table={table} />
      {/* The single, centralized dialog */}
       <WorkOrderFormDialog
        isOpen={isFormOpen}
        onOpenChange={handleDialogClose}
        workOrder={selectedWorkOrder}
        onWorkOrderSaved={handleSaveSuccess}
        clients={clients}
        masters={masters}
      />
    </div>
  )
}
