'use client';
import React from 'react';
import { useState } from 'react';
import { SlotsService } from '@/services/slots.service';
import { Slot } from '@/types';
import { SlotsTable } from '@/components/tables/SlotsTable';

export default function Page() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  
  const fetchSlots = React.useCallback(async () => {
    setSlotsLoading(true);
    try {
      const data = await SlotsService.getAllSlots();
      setSlots(data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Slots</h1>
      <SlotsTable slots={slots} loading={slotsLoading} onSlotsUpdate={fetchSlots} />
    </div>
  );
}
