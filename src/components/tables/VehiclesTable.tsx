"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Vehicle } from "@/types"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"

const columns: ColumnDef<Vehicle>[] = [
  {
    accessorKey: "numberPlate",
    header: "Number Plate",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("numberPlate")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Vehicle Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {(row.getValue("type") as string).toLowerCase().replace('_', ' ')}
      </Badge>
    ),
  },
  {
    header: "Entry Time",
    cell: ({ row }) => {
      const activeSessions = row.original.sessions?.filter(session => session.status === 'ACTIVE')
      const entryTime = activeSessions?.[0]?.entryTime
      return (
        <div>{entryTime ? new Date(entryTime).toLocaleString() : 'N/A'}</div>
      )
    },
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => {
      const hasActiveSessions = row.sessions?.some(session => session.status === 'ACTIVE')
      return hasActiveSessions ? 'PARKED' : 'NOT_PARKED'
    },
    cell: ({ row }) => {
      const hasActiveSessions = row.original.sessions?.some(session => session.status === 'ACTIVE')
      const status = hasActiveSessions ? 'PARKED' : 'NOT_PARKED'
      return (
        <Badge variant={status === "PARKED" ? "default" : "secondary"}>
          {status.replace('_', ' ')}
        </Badge>
      )
    },
  },
]

interface VehiclesTableProps {
  vehicles: Vehicle[]
  loading?: boolean
  onFiltersChange?: (filters: Record<string, string>) => void
}

export function VehiclesTable({ vehicles, loading, onFiltersChange }: VehiclesTableProps) {
  const filters = [
    {
      key: "type",
      title: "Type",
      options: [
        { label: "Car", value: "CAR" },
        { label: "Bike", value: "BIKE" },
        { label: "Electric Vehicle", value: "EV" },
        { label: "Handicap Accessible", value: "HANDICAP_ACCESSIBLE" },
      ],
    },
    {
      key: "status",
      title: "Status",
      options: [
        { label: "Parked", value: "PARKED" },
        { label: "Not Parked", value: "NOT_PARKED" },
      ],
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={vehicles}
      searchKey="numberPlate"
      searchPlaceholder="Search by number plate..."
      filters={filters}
      onFiltersChange={onFiltersChange}
      loading={loading}
    />
  )
}