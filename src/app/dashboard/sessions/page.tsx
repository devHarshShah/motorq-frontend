'use client';
import React from 'react';
import { useState } from 'react';
import { SessionsService } from '@/services/sessions.service';
import { Session } from '@/types';
import { SessionsTable } from '@/components/tables/SessionsTable';

export default function Page() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  React.useEffect(() => {
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

    fetchSessions();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sessions</h1>
      <SessionsTable sessions={sessions} loading={sessionsLoading}/>
    </div>
  );
}
