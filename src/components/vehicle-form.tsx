"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, CreditCard, ParkingCircle, Loader2, CheckCircle, AlertCircle, User } from "lucide-react"
import { toast } from "sonner"
import { SectionCards } from "./dashboard/section-cards"
import { VehiclesService } from "@/services/vehicles.service"
import { StaffService } from "@/services/staff.service"
import { vehicleFormSchema, type VehicleFormData } from "@/schemas/vehicle.schema"
import { Staff, VehicleEntry } from "@/types"

export default function VehicleManagement() {
  const [formData, setFormData] = useState<VehicleFormData>({
    numberPlate: '',
    type: undefined as any,
    staffId: '',
    billingType: undefined,
    ownerName: '',
    ownerPhone: ''
  })
  
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStaff, setIsLoadingStaff] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Load staff members on component mount
  useEffect(() => {
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
  
  // Handle form field changes
  const handleFieldChange = (field: keyof VehicleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }
  
  // Validate form data
  const validateForm = (): boolean => {
    try {
      vehicleFormSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {}
      
      if (error.errors) {
        error.errors.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message
          }
        })
      }
      
      setErrors(fieldErrors)
      return false
    }
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Transform form data to match API expectations
      const vehicleEntry: VehicleEntry = {
        numberPlate: formData.numberPlate.toUpperCase().trim(),
        type: formData.type!,
        staffId: formData.staffId,
        ownerName: formData.ownerName || undefined,
        ownerPhone: formData.ownerPhone || undefined
      }
      
      const result = await VehiclesService.createVehicleEntry(vehicleEntry)
      
      // Success feedback
      toast.success(
        `Vehicle ${result.numberPlate} registered successfully!`,
        {
          description: 'The vehicle has been assigned a parking slot.',
          icon: <CheckCircle className="w-4 h-4" />
        }
      )
      
      // Reset form
      setFormData({
        numberPlate: '',
        type: undefined as any,
        staffId: '',
        billingType: undefined,
        ownerName: '',
        ownerPhone: ''
      })
      setErrors({})
      
    } catch (error: any) {
      console.error('Failed to register vehicle:', error)
      toast.error(
        'Failed to register vehicle',
        {
          description: error.message || 'Please try again later.',
          icon: <AlertCircle className="w-4 h-4" />
        }
      )
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle form reset
  const handleReset = () => {
    setFormData({
      numberPlate: '',
      type: undefined as any,
      staffId: '',
      billingType: undefined,
      ownerName: '',
      ownerPhone: ''
    })
    setErrors({})
  }
  
  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vehicle Registration</h1>
          <p className="text-muted-foreground">Enter vehicle details to register and assign a parking slot</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Registration Form */}
          <Card className="h-fit">
          <CardHeader className="text-center pb-6">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Car className="w-6 h-6 text-primary" />
              New Vehicle Entry
            </CardTitle>
            <CardDescription>Fill in the required information to register a new vehicle</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 p-6">
              {/* Number Plate */}
              <div className="space-y-2">
                <Label htmlFor="numberPlate" className="text-sm font-medium">
                  Number Plate <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="numberPlate"
                  value={formData.numberPlate}
                  onChange={(e) => handleFieldChange('numberPlate', e.target.value)}
                  placeholder="Enter number plate"
                  className={`font-mono text-center text-lg tracking-wider uppercase h-12 ${
                    errors.numberPlate ? 'border-destructive focus:border-destructive' : ''
                  }`}
                  disabled={isLoading}
                />
                {errors.numberPlate && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.numberPlate}
                  </p>
                )}
              </div>

              {/* Vehicle Type and Staff Member Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Vehicle Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleFieldChange('type', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      id="type"
                      className={`w-full h-11 ${
                        errors.type ? 'border-destructive focus:border-destructive' : ''
                      }`}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAR">Car</SelectItem>
                      <SelectItem value="BIKE">Bike</SelectItem>
                      <SelectItem value="EV">Electric Vehicle</SelectItem>
                      <SelectItem value="HANDICAP_ACCESSIBLE">Handicap Accessible</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.type}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffId" className="text-sm font-medium">
                    Staff Member <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.staffId}
                    onValueChange={(value) => handleFieldChange('staffId', value)}
                    disabled={isLoading || isLoadingStaff}
                  >
                    <SelectTrigger
                      id="staffId"
                      className={`w-full h-11 ${
                        errors.staffId ? 'border-destructive focus:border-destructive' : ''
                      }`}
                    >
                      <SelectValue placeholder={
                        isLoadingStaff ? 'Loading...' : 'Select staff'
                      } />
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
                  {errors.staffId && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.staffId}
                    </p>
                  )}
                </div>
              </div>

              {/* Billing Type */}
              <div className="space-y-2">
                <Label htmlFor="billingType" className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Billing Type <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Select
                  value={formData.billingType}
                  onValueChange={(value) => handleFieldChange('billingType', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="billingType" className="w-full h-11">
                    <SelectValue placeholder="Select billing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOURLY">Hourly Rate</SelectItem>
                    <SelectItem value="DAY_PASS">Day Pass</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 p-6 pt-0">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11"
                disabled={isLoading || isLoadingStaff}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering Vehicle...
                  </>
                ) : (
                  <>
                    <Car className="w-4 h-4 mr-2" />
                    Register Vehicle
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
          </Card>

          {/* Parking Slot Availability */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ParkingCircle className="w-6 h-6 text-primary" />
                Available Parking Slots
              </CardTitle>
              <CardDescription>Real-time parking slot availability and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <SectionCards />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
