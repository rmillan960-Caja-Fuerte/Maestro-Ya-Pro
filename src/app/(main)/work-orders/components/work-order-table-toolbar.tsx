
"use client"

import { Table } from "@tanstack/react-table"
import { X, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WorkOrderTableViewOptions } from "./work-order-table-view-options"

import { statuses } from "../data/schema"
import { WorkOrderTableFacetedFilter } from "./work-order-table-faceted-filter"

interface WorkOrderTableToolbarProps<TData> {
  table: Table<TData>
}

export function WorkOrderTableToolbar<TData>({
  table,
}: WorkOrderTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filtrar por cliente..."
          value={(table.getColumn("clientName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("clientName")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <WorkOrderTableFacetedFilter
            column={table.getColumn("status")}
            title="Estado"
            options={statuses}
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
        <WorkOrderTableViewOptions table={table} />
        <Button size="sm" className="h-8" onClick={() => {}}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Orden
        </Button>
      </div>
    </div>
  )
}

    