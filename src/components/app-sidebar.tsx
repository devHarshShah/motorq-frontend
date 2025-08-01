'use client';

import * as React from 'react';
import {
  IconCar,
  IconPlus,
  IconLogout,
  IconParking,
  IconEdit,
  IconUserCheck,
  IconClockPause,
  IconReceipt2,
  IconInnerShadowTop,
  IconAnalyze,
  IconChartBar,
  IconSettings,
  IconCashBanknote,
  IconList,
  IconEye
} from '@tabler/icons-react';

import { NavDocuments } from '@/components/nav-documents';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { NavMain } from './nav-main';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  vehicleGroup: {
    groupName: 'Vehicle',
    items: [
      { name: 'View All Vehicles', url: '/dashboard/vehicles', icon: IconCar },
      { name: 'Create Entry', url: '/dashboard/vehicles/create-entry', icon: IconPlus },
      { name: 'Vehicle Checkout', url: '/dashboard/checkout', icon: IconLogout }
    ]
  },
  slotGroup: {
    groupName: 'Slot',
    items: [
      { name: 'View All Slots', url: '/dashboard/slots', icon: IconParking },
      { name: 'Slot Management', url: '/dashboard/slots', icon: IconEdit },
    ]
  },
  sessionGroup: {
    groupName: 'Session',
    items: [
      { name: 'Active Sessions', url: '/dashboard/sessions', icon: IconEye },
      { name: 'End Session', url: '/dashboard/checkout', icon: IconClockPause }
    ]
  },
  billingGroup: {
    groupName: 'Billing',
    items: [
      { name: 'Revenue Dashboard', url: '/dashboard/billing', icon: IconChartBar },
      { name: 'Billing Management', url: '/dashboard/billing/management', icon: IconReceipt2 }
    ]
  }
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Vehicle Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={[
            {
              title: 'Dashboard',
              url: '/dashboard',
              icon: IconAnalyze
            }
          ]}
        />

        <NavDocuments groupName={data.vehicleGroup.groupName} items={data.vehicleGroup.items} />
        <NavDocuments groupName={data.slotGroup.groupName} items={data.slotGroup.items} />
        <NavDocuments groupName={data.sessionGroup.groupName} items={data.sessionGroup.items} />
        <NavDocuments groupName={data.billingGroup.groupName} items={data.billingGroup.items} />
      </SidebarContent>
    </Sidebar>
  );
}
