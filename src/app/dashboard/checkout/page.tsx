'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Car, Clock, CreditCard, MapPin, User, Calculator, CheckCircle } from 'lucide-react';
import BillingService, { BillingPreview } from '@/services/billing.service';
import { SessionsService } from '@/services/sessions.service';
import { VehicleSearchPopover } from '@/components/vehicle-search-popover';
import { VehicleSearchResult } from '@/services/vehicles.service';
import { Session } from '@/types';
import { toast } from 'sonner';

interface CheckoutSession extends Session {
  billingPreview?: {
    preview: BillingPreview;
    currentTime: string;
    entryTime: string;
  };
}

export default function CheckoutPage() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<CheckoutSession | null>(null);
  const [useSlabPricing, setUseSlabPricing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const fetchActiveSessions = async () => {
    try {
      setIsLoading(true);
      const sessions = await SessionsService.getActiveSessions();
      setActiveSessions(sessions);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load active sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleSelect = async (vehicle: VehicleSearchResult) => {
    if (!vehicle.isActive) {
      toast.error('This vehicle does not have an active parking session');
      setSelectedSession(null);
      return;
    }

    const session = activeSessions.find(
      s => s.vehicle.numberPlate.toLowerCase() === vehicle.numberPlate.toLowerCase()
    );

    if (!session) {
      toast.error('No active session found for this vehicle');
      setSelectedSession(null);
      return;
    }

    setVehicleNumber(vehicle.numberPlate);
    setSelectedSession(session);
    await loadBillingPreview(session);
  };

  const searchVehicle = async () => {
    if (!vehicleNumber.trim()) {
      toast.error('Please enter a vehicle number');
      return;
    }

    const session = activeSessions.find(
      s => s.vehicle.numberPlate.toLowerCase() === vehicleNumber.toLowerCase()
    );

    if (!session) {
      toast.error('No active session found for this vehicle');
      setSelectedSession(null);
      return;
    }

    setSelectedSession(session);
    await loadBillingPreview(session);
  };

  const loadBillingPreview = async (session: Session) => {
    try {
      setIsLoadingPreview(true);
      const previewData = await BillingService.calculateBillingPreview(session.id, useSlabPricing);
      
      setSelectedSession(prev => prev ? {
        ...prev,
        billingPreview: previewData
      } : null);
    } catch (error) {
      console.error('Error loading billing preview:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to calculate billing preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleSlabPricingChange = async (enabled: boolean) => {
    setUseSlabPricing(enabled);
    if (selectedSession) {
      await loadBillingPreview(selectedSession);
    }
  };

  const processCheckout = async () => {
    if (!selectedSession) return;

    try {
      setIsProcessingCheckout(true);
      
      const result = await SessionsService.endParkingSession(selectedSession.id, { useSlabPricing });
      
      toast.success('Vehicle checked out successfully!');
      
      // Reset form
      setVehicleNumber('');
      setSelectedSession(null);
      setShowConfirmDialog(false);
      
      // Refresh active sessions
      await fetchActiveSessions();
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process checkout');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const formatDuration = (entryTime: string, currentTime: string) => {
    const entry = new Date(entryTime);
    const current = new Date(currentTime);
    const durationMs = current.getTime() - entry.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    return BillingService.formatDuration(durationHours);
  };

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Vehicle Checkout</h1>
        <p className="text-muted-foreground">
          Process vehicle exit and billing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Section */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Find Vehicle
              </CardTitle>
              <CardDescription>
                Enter vehicle number to process checkout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <VehicleSearchPopover
                  onVehicleSelect={handleVehicleSelect}
                  placeholder="Enter vehicle number plate"
                  value={vehicleNumber}
                  disabled={isLoading}
                  includeActive={true}
                />
              </div>
              
              <Button 
                onClick={searchVehicle}
                className="w-full"
                disabled={isLoading || !vehicleNumber.trim()}
              >
                Search Vehicle
              </Button>

              <div className="flex items-center space-x-2">
                <Switch
                  id="slab-pricing"
                  checked={useSlabPricing}
                  onCheckedChange={handleSlabPricingChange}
                />
                <Label htmlFor="slab-pricing" className="text-sm">
                  Use slab pricing (₹50, ₹100, ₹150, ₹200)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                vehicles currently parked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Session Details and Billing */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="space-y-4">
              {/* Session Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Session Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Vehicle</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {selectedSession.vehicle.numberPlate}
                        </Badge>
                        <Badge variant="secondary">
                          {selectedSession.vehicle.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Slot</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedSession.slot.location}</span>
                        <Badge variant="outline">{selectedSession.slot.type}</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Entry Time</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{new Date(selectedSession.entryTime).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(selectedSession.entryTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Staff</Label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{selectedSession.staff.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedSession.staff.employeeId}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Badge 
                      variant={selectedSession.billingType === 'DAY_PASS' ? 'default' : 'secondary'}
                      className="text-sm"
                    >
                      {selectedSession.billingType === 'DAY_PASS' ? 'Day Pass' : 'Hourly Billing'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Billing Preview
                  </CardTitle>
                  <CardDescription>
                    Real-time billing calculation based on current time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPreview ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">Calculating billing...</p>
                    </div>
                  ) : selectedSession.billingPreview ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold">
                                {formatDuration(
                                  selectedSession.billingPreview.entryTime,
                                  selectedSession.billingPreview.currentTime
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">Duration</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <CreditCard className="h-8 w-8 text-green-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold">
                                {BillingService.formatCurrency(selectedSession.billingPreview.preview.amount)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {useSlabPricing ? 'Slab Rate' : 'Calculated Amount'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <Badge 
                                variant={selectedSession.billingPreview.preview.billingType === 'DAY_PASS' ? 'default' : 'secondary'}
                                className="mb-2"
                              >
                                {selectedSession.billingPreview.preview.billingType === 'DAY_PASS' ? 'Day Pass' : 'Hourly'}
                              </Badge>
                              <div className="text-lg font-semibold">
                                {selectedSession.billingPreview.preview.vehicleType}
                              </div>
                              <p className="text-sm text-muted-foreground">Vehicle Type</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Billing Details</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedSession.billingType === 'DAY_PASS' 
                                ? `Day pass rate for ${selectedSession.billingPreview.preview.vehicleType} vehicles`
                                : useSlabPricing
                                  ? `Slab-based pricing: ${selectedSession.billingPreview.preview.durationHours.toFixed(2)} hours`
                                  : `Hourly rate: ${selectedSession.billingPreview.preview.durationHours.toFixed(2)} hours × rate`
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setShowConfirmDialog(true)}
                        className="w-full"
                        size="lg"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Proceed to Checkout
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Unable to calculate billing preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Vehicle Selected</h3>
                <p className="text-muted-foreground">
                  Enter a vehicle number to view session details and process checkout
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Checkout Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Vehicle Checkout</DialogTitle>
            <DialogDescription>
              Please review the billing details before proceeding with checkout.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession?.billingPreview && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Vehicle:</p>
                    <p>{selectedSession.vehicle.numberPlate}</p>
                  </div>
                  <div>
                    <p className="font-medium">Slot:</p>
                    <p>{selectedSession.slot.location}</p>
                  </div>
                  <div>
                    <p className="font-medium">Duration:</p>
                    <p>{formatDuration(
                      selectedSession.billingPreview.entryTime,
                      selectedSession.billingPreview.currentTime
                    )}</p>
                  </div>
                  <div>
                    <p className="font-medium">Amount:</p>
                    <p className="text-lg font-bold">
                      {BillingService.formatCurrency(selectedSession.billingPreview.preview.amount)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                This will end the parking session and generate a bill for the calculated amount.
                The slot will be marked as available for new assignments.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={isProcessingCheckout}
            >
              Cancel
            </Button>
            <Button 
              onClick={processCheckout}
              disabled={isProcessingCheckout}
            >
              {isProcessingCheckout ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Checkout
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}