
"use client"

import { Table } from "@tanstack/react-table"
import { X, PlusCircle } from "lucide-react"
import { DateRange } from "react-day-picker"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WorkOrderTableViewOptions } from "./work-order-table-view-options"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { statuses } from "../data/schema"
import { WorkOrderTableFacetedFilter } from "./work-order-table-faceted-filter"

interface WorkOrderTableToolbarProps<TData> {
  table: Table<TData>
}

export function WorkOrderTableToolbar<TData>({
  table,
}: WorkOrderTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter;
  const { openForm } = table.options.meta as { openForm: () => void };
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    const createdAtColumn = table.getColumn("createdAt");
    if (createdAtColumn) {
      if (dateRange?.from && dateRange?.to) {
        // Set the end of the day for the 'to' date
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        createdAtColumn.setFilterValue([dateRange.from, toDate]);
      } else {
        createdAtColumn.setFilterValue(undefined);
      }
    }
  }, [dateRange, table]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Buscar por cliente, título, maestro..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) =>
            table.setGlobalFilter(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <DateRangePicker date={dateRange} onDateChange={setDateRange} className="h-8"/>
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
            onClick={() => {
                table.resetColumnFilters()
                table.setGlobalFilter(undefined);
                setDateRange(undefined)
            }}
            className="h-8 px-2 lg:px-3"
          >
            Limpiar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <WorkOrderTableViewOptions table={table} />
        <Button size="sm" className="h-8" onClick={() => openForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Orden
        </Button>
      </div>
    </div>
  )
}
