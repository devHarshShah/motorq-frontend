"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Session } from "@/types"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"

const formatDuration = (minutes?: number) => {
  if (!minutes) return "N/A"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

const columns: ColumnDef<Session>[] = [
  {
    accessorKey: "id",
    header: "Session ID",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("id")}</div>
    ),
  },
  {
    id: "vehicleNumberPlate",
    header: "Vehicle",
    accessorFn: (row) => row.vehicle?.numberPlate,
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.vehicle?.numberPlate || "N/A"}
      </div>
    ),
  },
  {
    id: "slotLocation",
    header: "Slot",
    accessorFn: (row) => row.slot?.location,
    cell: ({ row }) => (
      <div>{row.original.slot?.location || "N/A"}</div>
    ),
  },
  {
    accessorKey: "entryTime",
    header: "Start Time",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("entryTime")).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "exitTime",
    header: "End Time",
    cell: ({ row }) => {
      const exitTime = row.getValue("exitTime") as string
      return <div>{exitTime ? new Date(exitTime).toLocaleString() : "Active"}</div>
    },
  },
  {
    header: "Duration",
    cell: ({ row }) => {
      const entryTime = new Date(row.original.entryTime)
      const exitTime = row.original.exitTime ? new Date(row.original.exitTime) : new Date()
      const durationMs = exitTime.getTime() - entryTime.getTime()
      const durationMinutes = Math.floor(durationMs / (1000 * 60))
      return <div>{formatDuration(durationMinutes)}</div>
    },
  },
  {
    header: "Cost",
    cell: ({ row }) => {
      const amount = row.original.billing?.amount
      return <div>{amount ? `$${amount.toFixed(2)}` : "N/A"}</div>
    },
  },
  {
    accessorKey: "billingType",
    header: "Billing Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {(row.getValue("billingType") as string).toLowerCase().replace('_', ' ')}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = 
        status === "ACTIVE" ? "default" : 
        status === "COMPLETED" ? "secondary" : 
        "destructive"
      
      return (
        <Badge variant={variant} className="capitalize">
          {status.toLowerCase()}
        </Badge>
      )
    },
  },
]

interface SessionsTableProps {
  sessions: Session[]
  loading?: boolean
  onFiltersChange?: (filters: Record<string, string>) => void
}

export function SessionsTable({ sessions, loading, onFiltersChange }: SessionsTableProps) {
  const filters = [
    {
      key: "status",
      title: "Status",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Completed", value: "COMPLETED" },
      ],
    },
    {
      key: "billingType",
      title: "Billing Type",
      options: [
        { label: "Hourly", value: "HOURLY" },
        { label: "Day Pass", value: "DAY_PASS" },
      ],
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={sessions}
      searchKey="vehicleNumberPlate"
      searchPlaceholder="Search by vehicle number plate..."
      filters={filters}
      onFiltersChange={onFiltersChange}
      loading={loading}
    />
  )
}