"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SectionCards } from "@/components/dashboard/section-cards"
import { SiteHeader } from "@/components/site-header"
import { VehiclesTable } from "@/components/tables/VehiclesTable"
import { SlotsTable } from "@/components/tables/SlotsTable"
import { SessionsTable } from "@/components/tables/SessionsTable"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { VehiclesService } from "@/services/vehicles.service"
import { SlotsService } from "@/services/slots.service"
import { SessionsService } from "@/services/sessions.service"
import { Vehicle, Slot, Session } from "@/types"

export default function Page() {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [slots, setSlots] = React.useState<Slot[]>([])
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [vehiclesLoading, setVehiclesLoading] = React.useState(true)
  const [slotsLoading, setSlotsLoading] = React.useState(true)
  const [sessionsLoading, setSessionsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await VehiclesService.getVehicles()
        setVehicles(data)
      } catch (error) {
        console.error('Error fetching vehicles:', error)
      } finally {
        setVehiclesLoading(false)
      }
    }

    const fetchSlots = async () => {
      try {
        const data = await SlotsService.getAllSlots()
        setSlots(data)
      } catch (error) {
        console.error('Error fetching slots:', error)
      } finally {
        setSlotsLoading(false)
      }
    }

    const fetchSessions = async () => {
      try {
        const data = await SessionsService.getSessions()
        setSessions(data)
      } catch (error) {
        console.error('Error fetching sessions:', error)
      } finally {
        setSessionsLoading(false)
      }
    }

    fetchVehicles()
    fetchSlots()
    fetchSessions()
  }, [])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="vehicles" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                    <TabsTrigger value="slots">Slots</TabsTrigger>
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="vehicles" className="mt-6">
                    <VehiclesTable vehicles={vehicles} loading={vehiclesLoading} />
                  </TabsContent>
                  <TabsContent value="slots" className="mt-6">
                    <SlotsTable slots={slots} loading={slotsLoading} />
                  </TabsContent>
                  <TabsContent value="sessions" className="mt-6">
                    <SessionsTable sessions={sessions} loading={sessionsLoading} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
