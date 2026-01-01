"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Calendar, Trophy, Loader2, Archive } from "lucide-react"

interface Task {
  id: number
  title: string
  description: string
  due_date: string
  completed: boolean
}

export default function CompletedTasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const token = localStorage.getItem("token")

        // Updated to use the /api prefix and Authorization header
        const res = await fetch("http://localhost:8000/api/tasks", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })

        if (res.status === 401) {
          router.push("/login")
          return
        }

        if (!res.ok) throw new Error("Failed to fetch tasks")

        const data = await res.json()
        // Filter for only completed tasks
        const completedTasks = data.filter((task: Task) => task.completed)
        setTasks(completedTasks)
      } catch (error) {
        console.error("Error fetching completed tasks:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [router])

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateString))
    } catch (e) {
      return "N/A"
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
          <div className="flex flex-1 items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4 mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Completed Tasks</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
        </header>

        <main className="flex flex-1 flex-col p-6 lg:p-10 max-w-6xl mx-auto w-full">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-medium mb-1">
                <Archive className="h-4 w-4" />
                <span className="text-sm uppercase tracking-wider">Archive</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Completed Tasks</h1>
              <p className="text-muted-foreground text-sm">
                Everything you've successfully checked off your list.
              </p>
            </div>
          </div>

          {/* Table Container */}
          <div className="relative overflow-hidden rounded-xl border bg-background shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground">Syncing archive...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Trophy className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No completed tasks yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Tasks you finish will be moved here for your records.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground w-12">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground min-w-[200px]">Task</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground hidden md:table-cell">Description</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground w-40">Due Date</th>
                      <th className="h-12 px-6 text-right align-middle font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr
                        key={task.id}
                        className="group border-b last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4 align-middle">
                          <CheckCircle2 className="h-5 w-5 text-green-500 bg-green-50 rounded-full dark:bg-transparent" />
                        </td>
                        <td className="px-4 py-4 align-middle font-medium text-foreground">
                          {task.title}
                        </td>
                        <td className="px-4 py-4 align-middle text-muted-foreground hidden md:table-cell italic opacity-80">
                          {task.description || "No description provided"}
                        </td>
                        <td className="px-4 py-4 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(task.due_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle text-right">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900 pointer-events-none"
                          >
                            Finished
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <p className="text-xs text-muted-foreground">
              Showing {tasks.length} total completed {tasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}