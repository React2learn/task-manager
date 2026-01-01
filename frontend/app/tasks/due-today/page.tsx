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
import { 
  Clock, 
  Circle, 
  CheckCircle2, 
  Loader2, 
  CalendarDays,
  AlertCircle 
} from "lucide-react"

interface Task {
  id: number
  title: string
  description: string
  due_date: string
  completed: boolean
}

export default function TodayTasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const token = localStorage.getItem("token")
        
        // Use the protected API endpoint
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
        
        const data: Task[] = await res.json()

        // Get local date string YYYY-MM-DD
        const todayStr = new Date().toLocaleDateString('en-CA') // Format: YYYY-MM-DD

        const todayTasks = data.filter(
          (task) => task.due_date.split("T")[0] === todayStr
        )
        setTasks(todayTasks)
      } catch (error) {
        console.error("Fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [router])

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch (e) {
      return "All Day"
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
                  <BreadcrumbPage>Due Today</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
        </header>

        <main className="flex flex-1 flex-col p-6 lg:p-10 max-w-5xl mx-auto w-full">
          {/* Page Title */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Today's Focus</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {!loading && tasks.length > 0 && (
              <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
                {tasks.filter(t => !t.completed).length} Tasks Remaining
              </Badge>
            )}
          </div>

          {/* Table Container */}
          <div className="rounded-xl border bg-background overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/40" />
                <span className="text-sm text-muted-foreground italic">Organizing your day...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold">You're all caught up!</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  No tasks are scheduled for today. Enjoy your free time or plan ahead.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground w-12">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Task Title</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground hidden sm:table-cell">Schedule</th>
                      <th className="h-12 px-6 text-right align-middle font-semibold text-muted-foreground">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr 
                        key={task.id} 
                        className="group border-b last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4 align-middle">
                          {task.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground/50" />
                          )}
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="flex flex-col gap-0.5">
                            <span className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {task.title}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {task.description || "No details added"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-middle hidden sm:table-cell">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(task.due_date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle text-right">
                          <Badge 
                            variant={task.completed ? "secondary" : "default"} 
                            className={task.completed ? "opacity-50" : "bg-orange-500 hover:bg-orange-600"}
                          >
                            {task.completed ? "Done" : "Due Today"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            <span>Authenticated Secure Session</span>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}