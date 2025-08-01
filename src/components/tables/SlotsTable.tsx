"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Slot, Staff } from "@/types"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Wrench, UserCheck, User } from "lucide-react"
import { SlotsService } from "@/services/slots.service"
import { StaffService } from "@/services/staff.service"
import { VehiclesService } from "@/services/vehicles.service"
import { toast } from "sonner"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const createColumns = (
  onMaintenanceToggle: (slotId: string, currentStatus: string) => Promise<void>,
  onManualAssign: (slotId: string) => Promise<void>,
  onOverrideAssign: (slotId: string) => Promise<void>,
  loadingSlots: Set<string>
): ColumnDef<Slot>[] => [
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const slot = row.original
      const isLoading = loadingSlots.has(slot.id)
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {slot.status === 'AVAILABLE' && (
              <DropdownMenuItem
                onClick={() => onManualAssign(slot.id)}
                disabled={isLoading}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Vehicle Entry
              </DropdownMenuItem>
            )}
            {slot.status === 'OCCUPIED' && (
              <DropdownMenuItem
                onClick={() => onOverrideAssign(slot.id)}
                disabled={isLoading}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Override Assignment
              </DropdownMenuItem>
            )}
            {slot.status !== 'MAINTENANCE' ? (
              <DropdownMenuItem
                onClick={() => onMaintenanceToggle(slot.id, slot.status)}
                disabled={isLoading}
              >
                <Wrench className="mr-2 h-4 w-4" />
                Mark as Maintenance
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => onMaintenanceToggle(slot.id, slot.status)}
                disabled={isLoading}
              >
                <Wrench className="mr-2 h-4 w-4" />
                Mark as Available
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface SlotsTableProps {
  slots: Slot[]
  loading?: boolean
  onFiltersChange?: (filters: Record<string, string>) => void
  onSlotsUpdate?: () => void
}

export function SlotsTable({ slots, loading, onFiltersChange, onSlotsUpdate }: SlotsTableProps) {
  const [loadingSlots, setLoadingSlots] = React.useState<Set<string>>(new Set())
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedSlotId, setSelectedSlotId] = React.useState<string>("")
  const [isOverrideMode, setIsOverrideMode] = React.useState(false)
  const [staff, setStaff] = React.useState<Staff[]>([])
  const [isLoadingStaff, setIsLoadingStaff] = React.useState(true)
  const [formData, setFormData] = React.useState({
    vehicleNumberPlate: "",
    vehicleType: "CAR" as "CAR" | "BIKE" | "EV" | "HANDICAP_ACCESSIBLE",
    staffId: "",
    billingType: "HOURLY" as "HOURLY" | "DAY_PASS",
    overrideSlotId: ""
  })

  // Load staff members when component mounts
  React.useEffect(() => {
    const loadStaff = async () => {
      try {
        const staffData = await StaffService.getStaff()
        setStaff(staffData)
      } catch (error) {
        console.error('Failed to load staff:', error)
        toast.error('Failed to load staff members')
      } finally {
        setIsLoadingStaff(false)
      }
    }
    
    loadStaff()
  }, [])

  const handleMaintenanceToggle = async (slotId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE'
    
    setLoadingSlots(prev => new Set(prev).add(slotId))
    
    try {
      await SlotsService.updateSlotMaintenanceStatus(slotId, newStatus)
      toast.success(`Slot marked as ${newStatus.toLowerCase()}`)
      onSlotsUpdate?.() // Refresh the slots data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update slot status')
    } finally {
      setLoadingSlots(prev => {
        const updated = new Set(prev)
        updated.delete(slotId)
        return updated
      })
    }
  }

  const handleManualAssign = async (slotId: string) => {
    setSelectedSlotId(slotId)
    setIsOverrideMode(false)
    // Reset form for new vehicle entry
    setFormData({
      vehicleNumberPlate: "",
      vehicleType: "CAR",
      staffId: "",
      billingType: "HOURLY",
      overrideSlotId: ""
    })
    setIsModalOpen(true)
  }

  const handleOverrideAssign = async (slotId: string) => {
    setSelectedSlotId(slotId)
    setIsOverrideMode(true)
    
    // Find the slot and its active session to autofill the form
    const selectedSlot = slots.find(slot => slot.id === slotId)
    if (selectedSlot?.sessions && selectedSlot.sessions.length > 0) {
      const activeSession = selectedSlot.sessions[0]
      setFormData(prev => ({
        ...prev,
        vehicleNumberPlate: activeSession.vehicle?.numberPlate || "",
        vehicleType: activeSession.vehicle?.type || selectedSlot.type,
        staffId: activeSession.staffId || "",
        billingType: activeSession.billingType || "HOURLY",
        overrideSlotId: ""
      }))
    }
    
    setIsModalOpen(true)
  }

  const handleSubmitAssignment = async () => {
    if (!formData.vehicleNumberPlate || !formData.staffId) {
      toast.error('Vehicle number plate and staff ID are required')
      return
    }

    if (isOverrideMode && !formData.overrideSlotId) {
      const availableCompatibleSlots = slots.filter(slot => 
        slot.status === 'AVAILABLE' && 
        slot.type === formData.vehicleType
      )
      
      if (availableCompatibleSlots.length === 0) {
        toast.error(`No available ${formData.vehicleType} slots for override`)
        return
      }
      
      toast.error('Override slot selection is required')
      return
    }

    setLoadingSlots(prev => new Set(prev).add(selectedSlotId))
    
    try {
      if (isOverrideMode) {
        // Override mode: use existing slot assignment logic
        await SlotsService.manuallyAssignSlotToSession(
          selectedSlotId, 
          formData.vehicleNumberPlate, 
          formData.staffId, 
          formData.billingType,
          formData.overrideSlotId
        )
      } else {
        // New vehicle entry: use vehicle entry endpoint
        await VehiclesService.createVehicleEntry({
          numberPlate: formData.vehicleNumberPlate,
          type: formData.vehicleType,
          staffId: formData.staffId,
          billingType: formData.billingType
        })
      }
      toast.success('Slot successfully assigned to session')
      setIsModalOpen(false)
      setFormData({
        vehicleNumberPlate: "",
        vehicleType: "CAR",
        staffId: "",
        billingType: "HOURLY",
        overrideSlotId: ""
      })
      onSlotsUpdate?.() // Refresh the slots data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to assign slot to session')
    } finally {
      setLoadingSlots(prev => {
        const updated = new Set(prev)
        updated.delete(selectedSlotId)
        return updated
      })
    }
  }

  const columns = React.useMemo(
    () => createColumns(handleMaintenanceToggle, handleManualAssign, handleOverrideAssign, loadingSlots),
    [loadingSlots]
  )
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
    <>
      <DataTable
        columns={columns}
        data={slots}
        searchKey="location"
        searchPlaceholder="Search by slot location..."
        filters={filters}
        onFiltersChange={onFiltersChange}
        loading={loading}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isOverrideMode ? 'Override Slot Assignment' : 'Assign Slot to Session'}</DialogTitle>
            <DialogDescription>
              {isOverrideMode 
                ? 'Select a new slot to move the existing vehicle to, then assign this slot to the new vehicle.'
                : 'Enter the vehicle and staff details to manually assign this slot to a session.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleNumberPlate">
                Vehicle Number Plate <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vehicleNumberPlate"
                value={formData.vehicleNumberPlate}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumberPlate: e.target.value.toUpperCase() }))}
                placeholder="Enter vehicle number plate"
                className="font-mono text-center tracking-wider uppercase"
              />
            </div>

            {!isOverrideMode && (
              <div className="space-y-2">
                <Label htmlFor="vehicleType">
                  Vehicle Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value: "CAR" | "BIKE" | "EV" | "HANDICAP_ACCESSIBLE") => 
                    setFormData(prev => ({ ...prev, vehicleType: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR">Car</SelectItem>
                    <SelectItem value="BIKE">Bike</SelectItem>
                    <SelectItem value="EV">Electric Vehicle</SelectItem>
                    <SelectItem value="HANDICAP_ACCESSIBLE">Handicap Accessible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="staffId">
                Staff Member <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.staffId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, staffId: value }))}
                disabled={isLoadingStaff}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingStaff ? 'Loading staff...' : 'Select staff member'} />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{member.name}</span>
                        <span className="text-muted-foreground text-xs">({member.employeeId})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billingType">Billing Type</Label>
              <Select
                value={formData.billingType}
                onValueChange={(value: "HOURLY" | "DAY_PASS") => 
                  setFormData(prev => ({ ...prev, billingType: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select billing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOURLY">Hourly Rate</SelectItem>
                  <SelectItem value="DAY_PASS">Day Pass</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isOverrideMode && (
              <div className="space-y-2">
                <Label htmlFor="overrideSlot">
                  Move Existing Vehicle To <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.overrideSlotId}
                  onValueChange={(value: string) => 
                    setFormData(prev => ({ ...prev, overrideSlotId: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select available slot for existing vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {slots
                      .filter(slot => 
                        slot.status === 'AVAILABLE' && 
                        slot.type === formData.vehicleType
                      )
                      .length === 0 ? (
                        <SelectItem value="" disabled>
                          No available {formData.vehicleType} slots
                        </SelectItem>
                      ) : (
                        slots
                          .filter(slot => 
                            slot.status === 'AVAILABLE' && 
                            slot.type === formData.vehicleType
                          )
                          .map((slot) => (
                            <SelectItem key={slot.id} value={slot.id}>
                              {slot.location} ({slot.type})
                            </SelectItem>
                          ))
                      )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleSubmitAssignment}
              disabled={loadingSlots.has(selectedSlotId) || isLoadingStaff}
              className="flex-1"
            >
              {loadingSlots.has(selectedSlotId) 
                ? (isOverrideMode ? "Overriding..." : "Assigning...") 
                : (isOverrideMode ? "Override Assignment" : "Assign Slot")
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}