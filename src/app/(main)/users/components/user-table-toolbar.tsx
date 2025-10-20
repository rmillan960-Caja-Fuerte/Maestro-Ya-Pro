
"use client"

import { Table } from "@tanstack/react-table"
import { X, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserTableViewOptions } from "./user-table-view-options"
import { roleOptions, statusOptions } from "../data/schema"
import { UserTableFacetedFilter } from "./user-table-faceted-filter"
import { allCountries } from "../../masters/data/zones"


interface UserTableToolbarProps<TData> {
  table: Table<TData>
}

export function UserTableToolbar<TData>({
  table,
}: UserTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter;
  const { openForm } = table.options.meta as { openForm: () => void };
  const countryOptions = allCountries.map(c => ({ label: c.name, value: c.code }));

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Buscar por nombre, email..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) =>
            table.setGlobalFilter(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("role") && (
          <UserTableFacetedFilter
            column={table.getColumn("role")}
            title="Rol"
            options={roleOptions}
          />
        )}
        {table.getColumn("country") && (
          <UserTableFacetedFilter
            column={table.getColumn("country")}
            title="País"
            options={countryOptions}
          />
        )}
         {table.getColumn("isActive") && (
          <UserTableFacetedFilter
            column={table.getColumn("isActive")}
            title="Estado"
            options={statusOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter(undefined);
            }}
            className="h-8 px-2 lg:px-3"
          >
            Limpiar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <UserTableViewOptions table={table} />
        <Button size="sm" className="h-8" onClick={() => openForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Usuario
        </Button>
      </div>
    </div>
  )
}
