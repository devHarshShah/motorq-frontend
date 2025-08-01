'use client';
import React from 'react';
import { useState } from 'react';
import { VehiclesTable } from '@/components/tables/VehiclesTable';
import { VehiclesService } from '@/services/vehicles.service';
import { Vehicle } from '@/types';

export default function Page() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
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

    fetchVehicles();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Vehicles</h1>
      <VehiclesTable vehicles={vehicles} loading={vehiclesLoading}/>
    </div>
  );
}
