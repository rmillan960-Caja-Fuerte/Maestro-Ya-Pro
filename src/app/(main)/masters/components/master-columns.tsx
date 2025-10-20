
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { masterSchema, statuses } from "../data/schema"
import { quitoZones } from "../data/zones"
import { MasterTableColumnHeader } from "./master-table-column-header"
import { MasterTableRowActions } from "./master-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import type { z } from "zod"

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
        if (!specialties || specialties.length === 0) return null;
        return (
            <div className="flex flex-wrap gap-1 max-w-xs">
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
        if (!zones || zones.length === 0) return <div className="text-muted-foreground">Sin especificar</div>;
        
        const zoneLabels = zones.map(zoneValue => {
            const zone = quitoZones.find(z => z.value === zoneValue);
            return zone ? zone.label : zoneValue;
        });

        return (
            <div className="flex flex-wrap gap-1 max-w-xs">
                {zoneLabels.map(label => <Badge key={label} variant="outline">{label}</Badge>)}
            </div>
        )
    }
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <MasterTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number | undefined;
      if (!rating) return <div className="text-muted-foreground text-center">-</div>;
      return (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          {rating.toFixed(1)}
        </div>
      );
    },
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
