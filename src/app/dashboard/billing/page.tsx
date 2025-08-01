'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BillingService, { BillingStatistics, RevenueOverTime, UnpaidBillsSummary, PeakHourData } from '@/services/billing.service';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { IndianRupee, CreditCard, TrendingUp, AlertCircle, Calendar, Users, Car } from 'lucide-react';
import { Label } from '@/components/ui/label';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function BillingDashboard() {
  const [statistics, setStatistics] = useState<BillingStatistics | null>(null);
  const [revenueOverTime, setRevenueOverTime] = useState<RevenueOverTime[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<UnpaidBillsSummary | null>(null);
  const [peakHourData, setPeakHourData] = useState<PeakHourData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const fetchBillingData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statisticsData, revenueData, unpaidData] = await Promise.all([
        BillingService.getBillingStatistics(),
        BillingService.getRevenueOverTime(timePeriod, 30),
        BillingService.getUnpaidBills(),
      ]);

      setStatistics(statisticsData);
      setRevenueOverTime(revenueData.reverse()); // Show chronological order
      setUnpaidBills(unpaidData);
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError('Failed to load billing data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPeakHourData = async () => {
    try {
      const peakData = await BillingService.getPeakHourAnalysis(selectedDate);
      setPeakHourData(peakData);
    } catch (err) {
      console.error('Error fetching peak hour data:', err);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [timePeriod]);

  useEffect(() => {
    fetchPeakHourData();
  }, [selectedDate]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-red-600">{error}</p>
              <Button onClick={fetchBillingData} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!statistics) return null;

  const collectionRate = statistics.totalBills > 0 
    ? (statistics.paidBills / statistics.totalBills) * 100 
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
        <p className="text-muted-foreground">
          Track billing, payments, and revenue analytics
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {BillingService.formatCurrency(statistics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {statistics.totalBills} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {statistics.paidBills} of {statistics.totalBills} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Bills</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {BillingService.formatCurrency(unpaidBills?.totalUnpaidAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {unpaidBills?.count || 0} outstanding bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {BillingService.formatCurrency(
                statistics.totalBills > 0 ? statistics.totalRevenue / statistics.totalBills : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Average per session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="peak-hours">Peak Hours</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid Bills</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>Track revenue trends and payment patterns</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={timePeriod === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimePeriod('day')}
                  >
                    Daily
                  </Button>
                  <Button
                    variant={timePeriod === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimePeriod('week')}
                  >
                    Weekly
                  </Button>
                  <Button
                    variant={timePeriod === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimePeriod('month')}
                  >
                    Monthly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      BillingService.formatCurrency(value),
                      name === 'revenue' ? 'Total Revenue' : 'Paid Revenue'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="paidRevenue"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Billing Type</CardTitle>
                <CardDescription>Hourly vs Day Pass revenue distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statistics.revenueByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ billingType, revenue }) => `${billingType}: ${BillingService.formatCurrency(revenue)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {statistics.revenueByType.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => BillingService.formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Vehicle Type</CardTitle>
                <CardDescription>Performance across vehicle categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statistics.revenueByVehicleType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vehicleType" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => BillingService.formatCurrency(value)} />
                    <Bar dataKey="totalRevenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Type Performance</CardTitle>
              <CardDescription>Detailed breakdown by vehicle category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statistics.revenueByVehicleType.map((vehicleData) => (
                  <Card key={vehicleData.vehicleType}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        {vehicleData.vehicleType}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <div className="text-lg font-bold">
                          {BillingService.formatCurrency(vehicleData.totalRevenue)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total Revenue
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Bills: {vehicleData.totalBills}</span>
                        <span>Paid: {vehicleData.paidBills}</span>
                      </div>
                      <Badge 
                        variant={vehicleData.paidBills === vehicleData.totalBills ? 'default' : 'secondary'}
                        className="w-full justify-center"
                      >
                        {vehicleData.totalBills > 0 
                          ? `${((vehicleData.paidBills / vehicleData.totalBills) * 100).toFixed(0)}% Collected`
                          : '0% Collected'
                        }
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peak-hours" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Peak Hour Analysis</h3>
              <p className="text-sm text-muted-foreground">Hourly traffic patterns and revenue</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="date-picker" className="text-sm">Date:</Label>
              <input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Entries & Exits</CardTitle>
                <CardDescription>Vehicle traffic throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={peakHourData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(hour: number) => `${hour}:00`}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(hour: number) => `${hour}:00 - ${hour + 1}:00`}
                      formatter={(value: number, name: string) => [
                        value,
                        name === 'entriesCount' ? 'Entries' : 'Exits'
                      ]}
                    />
                    <Bar dataKey="entriesCount" fill="#8884d8" name="Entries" />
                    <Bar dataKey="exitsCount" fill="#82ca9d" name="Exits" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hourly Revenue</CardTitle>
                <CardDescription>Revenue generated by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={peakHourData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(hour: number) => `${hour}:00`}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(hour: number) => `${hour}:00 - ${hour + 1}:00`}
                      formatter={(value: number) => [BillingService.formatCurrency(value), 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Summary</CardTitle>
              <CardDescription>Busiest times and occupancy patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {peakHourData
                  .sort((a, b) => b.entriesCount - a.entriesCount)
                  .slice(0, 4)
                  .map((hour) => (
                    <Card key={hour.hour}>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {hour.hour}:00
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">Peak Hour</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Entries:</span>
                              <span className="font-semibold">{hour.entriesCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Revenue:</span>
                              <span className="font-semibold">
                                {BillingService.formatCurrency(hour.revenue)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Occupancy:</span>
                              <span className="font-semibold">{hour.avgOccupancy}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unpaid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Outstanding Bills ({unpaidBills?.count || 0})
              </CardTitle>
              <CardDescription>
                Total unpaid amount: {BillingService.formatCurrency(unpaidBills?.totalUnpaidAmount || 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unpaidBills && unpaidBills.unpaidBills.length > 0 ? (
                <div className="space-y-2">
                  {unpaidBills.unpaidBills.slice(0, 10).map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {bill.session.vehicle.numberPlate} • {bill.session.slot.location}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(bill.session.entryTime).toLocaleDateString()} • {bill.type}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-600">
                          {BillingService.formatCurrency(bill.amount)}
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          Unpaid
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {unpaidBills.unpaidBills.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground pt-4">
                      ... and {unpaidBills.unpaidBills.length - 10} more unpaid bills
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-green-600">All bills are paid!</p>
                  <p className="text-muted-foreground">No outstanding payments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}