"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

import { clientSchema, statuses, types } from "../data/schema"
import { ClientTableColumnHeader } from "./client-table-column-header"
import { ClientTableRowActions } from "./client-table-row-actions"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<z.infer<typeof clientSchema>>[] = [
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
    accessorKey: "businessName",
    header: ({ column }) => (
      <ClientTableColumnHeader column={column} title="Nombre / Razón Social" />
    ),
    cell: ({ row }) => {
      const name = row.original.type === 'business' ? row.original.businessName : `${row.original.firstName} ${row.original.lastName}`;
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <ClientTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return <div className="text-muted-foreground">{row.getValue("email")}</div>
    },
  },
  {
    accessorKey: "primaryPhone",
    header: ({ column }) => (
      <ClientTableColumnHeader column={column} title="Teléfono" />
    ),
    cell: ({ row }) => {
      return <div>{row.getValue("primaryPhone")}</div>
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <ClientTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) {
        return null
      }

      return (
        <Badge variant={status.value === 'active' ? 'default' : status.value === 'inactive' ? 'destructive' : 'outline'}>
          {status.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <ClientTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const type = types.find(
        (type) => type.value === row.getValue("type")
      )

      if (!type) {
        return null
      }

      return (
        <div className="flex items-center">
          <type.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{type.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ClientTableRowActions row={row} />,
  },
]
