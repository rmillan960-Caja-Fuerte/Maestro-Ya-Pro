
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

import { userProfileSchema } from "../data/schema"
import { UserTableColumnHeader } from "./user-table-column-header"
import { UserTableRowActions } from "./user-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { ROLES } from "@/lib/permissions"
import { allCountries } from "../../masters/data/zones"
import type { z } from "zod"

const getRoleName = (roleValue: string) => {
    const roleKey = Object.keys(ROLES).find(key => key === roleValue);
    return roleKey ? ROLES[roleKey as keyof typeof ROLES].name : roleValue;
}

const getCountryName = (countryCode: string) => {
    return allCountries.find(c => c.code === countryCode)?.name || countryCode;
}


export const columns: ColumnDef<z.infer<typeof userProfileSchema>>[] = [
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
    accessorKey: "name",
    header: ({ column }) => (
      <UserTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      const name = `${row.original.firstName} ${row.original.lastName}`;
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <UserTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return <div className="text-muted-foreground">{row.getValue("email")}</div>
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <UserTableColumnHeader column={column} title="Rol" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <Badge variant="secondary">{getRoleName(role)}</Badge>
    },
     filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "country",
    header: ({ column }) => (
      <UserTableColumnHeader column={column} title="País" />
    ),
    cell: ({ row }) => {
      const country = row.getValue("country") as string;
      if (!country) return <Badge variant="outline">Global</Badge>
      return <div>{getCountryName(country)}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <UserTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <Badge variant={isActive ? 'default' : 'destructive'}>
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
        const rowValue = row.getValue(id) ? 'active' : 'inactive';
        return value.includes(rowValue);
    }
  },
  {
    accessorKey: "globalFilter",
    // This is a virtual column for global search. It's not rendered.
    cell: () => null,
    header: () => null,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row, table }) => <UserTableRowActions row={row} table={table} />,
  },
]
