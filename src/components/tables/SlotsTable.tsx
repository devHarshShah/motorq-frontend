"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Slot } from "@/types"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"

const columns: ColumnDef<Slot>[] = [
  {
    accessorKey: "location",
    header: "Slot Number",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("location")}</div>
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = 
        status === "AVAILABLE" ? "default" : 
        status === "OCCUPIED" ? "secondary" : 
        "destructive"
      
      return (
        <Badge variant={variant} className="capitalize">
          {status.toLowerCase()}
        </Badge>
      )
    },
  },
  {
    header: "Occupied By",
    cell: ({ row }) => {
      const activeSessions = row.original.sessions?.filter(session => session.status === 'ACTIVE')
      const vehicleNumberPlate = activeSessions?.[0]?.vehicle?.numberPlate
      return (
        <div className="font-mono text-sm">
          {vehicleNumberPlate || "N/A"}
        </div>
      )
    },
  },
]

interface SlotsTableProps {
  slots: Slot[]
  loading?: boolean
  onFiltersChange?: (filters: Record<string, string>) => void
}

export function SlotsTable({ slots, loading, onFiltersChange }: SlotsTableProps) {
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
        { label: "Available", value: "AVAILABLE" },
        { label: "Occupied", value: "OCCUPIED" },
        { label: "Maintenance", value: "MAINTENANCE" },
      ],
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={slots}
      searchKey="location"
      searchPlaceholder="Search by slot location..."
      filters={filters}
      onFiltersChange={onFiltersChange}
      loading={loading}
    />
  )
}