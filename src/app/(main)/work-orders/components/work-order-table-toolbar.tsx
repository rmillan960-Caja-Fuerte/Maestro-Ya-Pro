
"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { PlusCircle, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/data-table-view-options"
import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import { statuses, priorities } from "../data/schema"

// The toolbar is now simpler. It no longer manages the dialog state.
// It receives a function `onAdd` to be called when the user wants to add a new order.
interface WorkOrderTableToolbarProps<TData> {
  table: Table<TData>
  onAdd: () => void // New prop to signal the parent to open the dialog
}

export function WorkOrderTableToolbar<TData>({ table, onAdd }: WorkOrderTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Buscar por cliente, maestro, N° o título..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[300px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Estado"
            options={statuses}
          />
        )}
        {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Prioridad"
            options={priorities}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <SlidersHorizontal className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} />
        {/* The button now calls the onAdd function passed from the parent */}
        <Button className="h-8" onClick={onAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Orden
        </Button>
      </div>
    </div>
  )
}
