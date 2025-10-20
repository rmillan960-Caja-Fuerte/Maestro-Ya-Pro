
"use client"

import { Table } from "@tanstack/react-table"
import { X, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MasterTableViewOptions } from "./master-table-view-options"

import { statuses } from "../data/schema"
import { MasterTableFacetedFilter } from "./master-table-faceted-filter"

interface MasterTableToolbarProps<TData> {
  table: Table<TData>
}

export function MasterTableToolbar<TData>({
  table,
}: MasterTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter;
  const { openForm } = table.options.meta as { openForm: () => void };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Buscar por nombre, email, teléfono..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) =>
            table.setGlobalFilter(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <MasterTableFacetedFilter
            column={table.getColumn("status")}
            title="Estado"
            options={statuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter(undefined);
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <MasterTableViewOptions table={table} />
        <Button size="sm" className="h-8" onClick={() => openForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Maestro
        </Button>
      </div>
    </div>
  )
}
