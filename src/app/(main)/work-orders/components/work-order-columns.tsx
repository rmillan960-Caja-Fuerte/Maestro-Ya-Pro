
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

import { workOrderSchema, statuses } from "../data/schema"
import { WorkOrderTableColumnHeader } from "./work-order-table-column-header"
import { WorkOrderTableRowActions } from "./work-order-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"

export const columns: ColumnDef<z.infer<typeof workOrderSchema>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderNumber",
    header: ({ column }) => (
      <WorkOrderTableColumnHeader column={column} title="Nro. Orden" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("orderNumber")}</div>,
  },
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <WorkOrderTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => <div>{row.getValue("clientName")}</div>,
  },
  {
    accessorKey: "masterName",
    header: ({ column }) => (
      <WorkOrderTableColumnHeader column={column} title="Maestro" />
    ),
    cell: ({ row }) => <div>{row.getValue("masterName")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <WorkOrderTableColumnHeader column={column} title="Fecha Creación" />
    ),
    cell: ({ row }) => {
      return <div>{formatDate(row.getValue("createdAt"), 'short')}</div>;
    },
    sortingFn: 'datetime',
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <WorkOrderTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (s) => s.value === row.getValue("status")
      )

      if (!status) {
        return null
      }

      return (
        <Badge 
            variant={status.variant as any} 
            className="flex items-center gap-2 whitespace-nowrap"
            style={{ 
                backgroundColor: status.color, 
                color: status.color ? 'white' : undefined 
            }}
        >
          <status.icon className="h-3 w-3" />
          {status.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
    {
    accessorKey: "total",
    header: ({ column }) => (
      <WorkOrderTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total"));
        return <div className="text-right font-medium">{formatCurrency(amount)}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => <WorkOrderTableRowActions row={row} table={table} />,
  },
]
