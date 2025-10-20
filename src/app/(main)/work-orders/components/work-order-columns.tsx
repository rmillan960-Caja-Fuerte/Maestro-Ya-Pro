
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

import { workOrderSchema, statuses } from "../data/schema"
import { WorkOrderTableColumnHeader } from "./work-order-table-column-header"
import { WorkOrderTableRowActions } from "./work-order-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { Timestamp } from "firebase/firestore"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const isStale = (order: z.infer<typeof workOrderSchema>): boolean => {
    const staleStatuses = ["draft", "quote_sent"];
    if (!staleStatuses.includes(order.status)) {
        return false;
    }
    
    const orderDateValue = order.createdAt;
    const orderDate = orderDateValue instanceof Timestamp ? orderDateValue.toDate() : new Date(orderDateValue);

    const now = new Date();
    const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

    return hoursDiff > 24;
}

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
    cell: ({ row }) => {
        const order = row.original as z.infer<typeof workOrderSchema>;
        const stale = isStale(order);
        return (
            <div className="flex items-center gap-2 font-medium">
                {stale && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="relative flex h-3 w-3">
                                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
                                    <div className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Atención: esta orden tiene más de 24h sin actualizarse.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                {row.getValue("orderNumber")}
            </div>
        )
    },
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
      const dateValue = row.getValue("createdAt");
      return <div>{formatDate(dateValue as Date | Timestamp, 'short')}</div>;
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
          style={{ 
            backgroundColor: status.color ? status.color : undefined, 
            color: status.color ? 'white' : undefined 
          }}
          className={cn(status.color ? 'border-transparent' : '', 'whitespace-nowrap')}
          variant={status.variant as any}
        >
          {status.icon && <status.icon className="mr-2 h-3 w-3" />}
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
