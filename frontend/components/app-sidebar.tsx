"use client"

import * as React from "react"
import {
  Calendar,
  Home,
  Inbox,
  MessageCircleQuestion,
  Search,
  Settings2,
  Trash2,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

/* ------------------------------
   Sidebar Data (Task Manager)
-------------------------------- */

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "All Tasks",
      url: "/tasks/all-tasks",
      icon: Inbox,
    },
    {
      title: "Completed",
      url: "/tasks/completed",
      icon: CheckCircle2,
    },
    {
      title: "Due Today",
      url: "/tasks/due-today",
      icon: Clock,
    },
    {
      title: "Task Import/Export",
      url: "/tasks/import-export",
      icon: FileText,
    },
  ],

}

/* ------------------------------
   Sidebar Component
-------------------------------- */

export function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <NavMain items={data.navMain} />
      </SidebarHeader>

      <SidebarContent>

      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
