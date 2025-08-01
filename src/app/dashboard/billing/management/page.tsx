'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import BillingService, { BillingRecord } from '@/services/billing.service';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, CreditCard, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BillingManagement() {
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [billingTypeFilter, setBillingTypeFilter] = useState<string>('all');

  const fetchBillingRecords = async () => {
    try {
      setIsLoading(true);
      
      const filters: any = {};
      if (paymentFilter !== 'all') {
        filters.isPaid = paymentFilter === 'paid';
      }
      if (vehicleTypeFilter !== 'all') {
        filters.vehicleType = vehicleTypeFilter;
      }
      if (billingTypeFilter !== 'all') {
        filters.billingType = billingTypeFilter;
      }

      const data = await BillingService.getBillingRecords(filters);
      setBillingRecords(data);
    } catch (error) {
      console.error('Error fetching billing records:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load billing records');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentStatusChange = async (billingId: string, isPaid: boolean) => {
    try {
      await BillingService.updatePaymentStatus(billingId, isPaid);
      
      // Update local state
      setBillingRecords(prev => 
        prev.map(record => 
          record.id === billingId 
            ? { ...record, isPaid }
            : record
        )
      );
      
      toast.success(`Payment marked as ${isPaid ? 'paid' : 'unpaid'}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update payment status');
    }
  };

  const columns: ColumnDef<BillingRecord>[] = [
    {
      accessorKey: 'session.vehicle.numberPlate',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Vehicle
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const vehicle = row.original.session.vehicle;
        return (
          <div>
            <div className="font-medium">{vehicle.numberPlate}</div>
            <div className="text-sm text-muted-foreground">{vehicle.type}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'session.slot.location',
      header: 'Slot',
      cell: ({ row }) => {
        return (
          <Badge variant="outline">
            {row.original.session.slot.location}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Billing Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return (
          <Badge variant={type === 'DAY_PASS' ? 'default' : 'secondary'}>
            {type === 'DAY_PASS' ? 'Day Pass' : 'Hourly'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        return (
          <div className="font-medium">
            {BillingService.formatCurrency(amount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'session.entryTime',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Entry Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const entryTime = new Date(row.original.session.entryTime);
        return (
          <div>
            <div>{entryTime.toLocaleDateString()}</div>
            <div className="text-sm text-muted-foreground">
              {entryTime.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'session.exitTime',
      header: 'Exit Time',
      cell: ({ row }) => {
        const exitTime = row.original.session.exitTime;
        if (!exitTime) return <span className="text-muted-foreground">-</span>;
        
        const exit = new Date(exitTime);
        return (
          <div>
            <div>{exit.toLocaleDateString()}</div>
            <div className="text-sm text-muted-foreground">
              {exit.toLocaleTimeString()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'isPaid',
      header: 'Payment Status',
      cell: ({ row }) => {
        const isPaid = row.getValue('isPaid') as boolean;
        return (
          <Badge 
            variant={isPaid ? 'default' : 'destructive'}
            className="flex items-center gap-1 w-fit"
          >
            {isPaid ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Paid
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Unpaid
              </>
            )}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const billing = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={billing.isPaid ? 'outline' : 'default'}
              onClick={() => handlePaymentStatusChange(billing.id, !billing.isPaid)}
            >
              Mark as {billing.isPaid ? 'Unpaid' : 'Paid'}
            </Button>
          </div>
        );
      },
    },
  ];

  // Filter records based on search term
  const filteredRecords = billingRecords.filter(record => 
    record.session.vehicle.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.session.slot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.session.staff.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchBillingRecords();
  }, [paymentFilter, vehicleTypeFilter, billingTypeFilter]);

  const totalAmount = filteredRecords.reduce((sum, record) => sum + record.amount, 0);
  const paidAmount = filteredRecords.filter(r => r.isPaid).reduce((sum, record) => sum + record.amount, 0);
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Billing Management</h1>
        <p className="text-muted-foreground">
          Manage billing records and payment status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {BillingService.formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {filteredRecords.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {BillingService.formatCurrency(paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredRecords.filter(r => r.isPaid).length} paid transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Amount</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {BillingService.formatCurrency(unpaidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredRecords.filter(r => !r.isPaid).length} unpaid transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
          <CardDescription>Filter and search billing records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by vehicle, slot, or staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="unpaid">Unpaid Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Vehicle Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                <SelectItem value="CAR">Car</SelectItem>
                <SelectItem value="BIKE">Bike</SelectItem>
                <SelectItem value="EV">Electric Vehicle</SelectItem>
                <SelectItem value="HANDICAP_ACCESSIBLE">Handicap Accessible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={billingTypeFilter} onValueChange={setBillingTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Billing Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="HOURLY">Hourly</SelectItem>
                <SelectItem value="DAY_PASS">Day Pass</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Billing Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Records</CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} of {billingRecords.length} billing records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredRecords}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}