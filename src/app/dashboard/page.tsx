'use client';

import * as React from 'react';
import { SectionCards } from '@/components/dashboard/section-cards';
import { VehiclesTable } from '@/components/tables/VehiclesTable';
import { SlotsTable } from '@/components/tables/SlotsTable';
import { SessionsTable } from '@/components/tables/SessionsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehiclesService } from '@/services/vehicles.service';
import { SlotsService } from '@/services/slots.service';
import { Vehicle, Slot, Session } from '@/types';
import { SessionsService } from '@/services/sessions.service';

export default function Page() {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [slots, setSlots] = React.useState<Slot[]>([])
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [vehiclesLoading, setVehiclesLoading] = React.useState(true);
  const [slotsLoading, setSlotsLoading] = React.useState(true);
  const [sessionsLoading, setSessionsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await VehiclesService.getVehicles();
        setVehicles(data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setVehiclesLoading(false);
      }
    };

    const fetchSlots = async () => {
      try {
        const data = await SlotsService.getAllSlots();
        setSlots(data);
      } catch (error) {
        console.error('Error fetching slots:', error);
      } finally {
        setSlotsLoading(false);
      }
    };

    const fetchSessions = async () => {
      try {
        const data = await SessionsService.getSessions();
        setSessions(data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchVehicles();
    fetchSlots();
    fetchSessions();
  }, []);

  return (
    <div>
      <SectionCards />

      <Tabs defaultValue="vehicles" className="mt-6 w-full">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="slots">Slots</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <VehiclesTable vehicles={vehicles} loading={vehiclesLoading} />
        </TabsContent>
        <TabsContent value="slots">
          <SlotsTable slots={slots} loading={slotsLoading} />
        </TabsContent>
        <TabsContent value="sessions">
          <SessionsTable sessions={sessions} loading={sessionsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
