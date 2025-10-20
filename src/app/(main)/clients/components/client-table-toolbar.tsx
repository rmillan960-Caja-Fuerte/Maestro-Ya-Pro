
"use client"

import { Table } from "@tanstack/react-table"
import { X, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClientTableViewOptions } from "./client-table-view-options"

import { statuses, types } from "../data/schema"
import { ClientTableFacetedFilter } from "./client-table-faceted-filter"

interface ClientTableToolbarProps<TData> {
  table: Table<TData>
}

export function ClientTableToolbar<TData>({
  table,
}: ClientTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const { openForm } = table.options.meta as { openForm: (client?: any) => void };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filtrar por nombre..."
          value={(table.getColumn("businessName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("businessName")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <ClientTableFacetedFilter
            column={table.getColumn("status")}
            title="Estado"
            options={statuses}
          />
        )}
        {table.getColumn("type") && (
          <ClientTableFacetedFilter
            column={table.getColumn("type")}
            title="Tipo"
            options={types}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <ClientTableViewOptions table={table} />
        <Button size="sm" className="h-8" onClick={() => openForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Cliente
        </Button>
      </div>
    </div>
  )
}
