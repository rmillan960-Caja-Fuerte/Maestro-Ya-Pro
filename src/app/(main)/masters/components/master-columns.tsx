
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { masterSchema, statuses, quitoZones } from "../data/schema"
import { MasterTableColumnHeader } from "./master-table-column-header"
import { MasterTableRowActions } from "./master-table-row-actions"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<z.infer<typeof masterSchema>>[] = [
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
    accessorKey: "firstName",
    header: ({ column }) => (
      <MasterTableColumnHeader column={column} title="Nombre Completo" />
    ),
    cell: ({ row }) => {
      const name = `${row.original.firstName} ${row.original.lastName}`;
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <MasterTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <MasterTableColumnHeader column={column} title="Teléfono" />
    ),
    cell: ({ row }) => <div>{row.getValue("phone")}</div>,
  },
  {
    accessorKey: "specialties",
    header: ({ column }) => (
        <MasterTableColumnHeader column={column} title="Especialidades" />
    ),
    cell: ({ row }) => {
        const specialties = row.getValue("specialties") as string[];
        if (!specialties) return null;
        return (
            <div className="flex flex-wrap gap-1">
                {specialties.map(specialty => <Badge key={specialty} variant="secondary">{specialty}</Badge>)}
            </div>
        )
    }
  },
  {
    accessorKey: "coverageZones",
    header: ({ column }) => (
        <MasterTableColumnHeader column={column} title="Zonas de Cobertura" />
    ),
    cell: ({ row }) => {
        const zones = row.getValue("coverageZones") as string[];
        if (!zones) return null;
        return (
            <div className="flex flex-wrap gap-1 max-w-xs">
                {zones.map(zoneValue => {
                    const zoneLabel = quitoZones.find(z => z.value === zoneValue)?.label || zoneValue;
                    return <Badge key={zoneValue} variant="outline">{zoneLabel}</Badge>
                })}
            </div>
        )
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <MasterTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("status")
      )

      if (!status) return null

      return (
        <Badge variant={status.value === 'active' ? 'default' : status.value === 'inactive' ? 'destructive' : 'outline'}>
          {status.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "actions",
    cell: ({ row, table }) => <MasterTableRowActions row={row} table={table} />,
  },
]
