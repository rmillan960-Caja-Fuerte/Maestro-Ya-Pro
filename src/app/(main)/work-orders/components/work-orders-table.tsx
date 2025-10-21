
"use client"

import * as React from "react"
import { 
    ColumnDef, 
    useReactTable, 
    getCoreRowModel, 
    flexRender,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    ColumnFiltersState,
    getFilteredRowModel,
    VisibilityState,
    getFacetedRowModel,
    getFacetedUniqueValues,
} from "@tanstack/react-table"

import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table"
import { WorkOrderTableToolbar } from "./work-order-table-toolbar" // Will be created next
import { WorkOrderTablePagination } from "./work-order-table-pagination" // Will be created next
import { getColumns } from "./columns"
import { Master } from "@/app/system/masters/data/schema"
import { Client } from "@/app/(main)/clients/data/schema"

interface WorkOrdersTableProps<TData, TValue> {
  data: TData[],
  masters?: Master[],
  clients?: Client[],
  // Remove columns from here, as we'll generate them internally
}

export function WorkOrdersTable<TData, TValue>({
  data,
  masters = [],
  clients = [],
}: WorkOrdersTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Generate columns internally based on the provided data context
  const columns = React.useMemo(() => getColumns(masters, clients), [masters, clients]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
    }
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
                        <TableHead key={header.id}>
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
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
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
    </div>
  )
}
