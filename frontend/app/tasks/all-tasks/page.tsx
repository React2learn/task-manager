"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation" // Added for redirection
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
  Calendar,
  CheckCircle2,
  Circle,
  Loader2,
  ListTodo,
  AlertTriangle,
} from "lucide-react"

interface Task {
  id: number
  title: string
  description: string
  due_date: string
  completed: boolean
}

export default function AllTasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks() {
      try {
        // 1. Get the token from storage
        const token = localStorage.getItem("token")

        // 2. Fetch from /api/tasks with Authorization header
        const res = await fetch("http://localhost:8000/api/tasks", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })

        if (res.status === 401) {
          // Redirect if not logged in
          router.push("/login")
          return
        }

        if (!res.ok) throw new Error("Failed to fetch tasks")

        const data = await res.json()
        setTasks(data)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [router])

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(new Date(dateString))
    } catch (e) {
      return "Invalid Date"
    }
  }

  const isOverdue = (dateString: string, completed: boolean) => {
    if (completed) return false
    const taskDate = new Date(dateString)
    const now = new Date()
    return taskDate < now
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <div className="flex flex-1 items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4 mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>All Tasks</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
        </header>

        <main className="flex flex-1 flex-col p-6 lg:p-10 max-w-6xl mx-auto w-full">
          {/* Header Section */}
          <div className="flex items-end justify-between mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-600 font-medium mb-1">
                <ListTodo className="h-4 w-4" />
                <span className="text-xs uppercase tracking-widest">Master List</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">All Tasks</h1>
              <p className="text-muted-foreground text-sm">
                A central view of your entire workflow and deadlines.
              </p>
            </div>
            {!loading && (
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Total</p>
                  <p className="text-xl font-semibold">{tasks.length}</p>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter text-orange-600">Active</p>
                  <p className="text-xl font-semibold">{tasks.filter(t => !t.completed).length}</p>
                </div>
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/30" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                <Circle className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-medium">No tasks found</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">
                  Start organizing your life by adding your first task to the list.
                </p>
              </div>
            ) : (
              <div
                className="overflow-x-auto"
              >
                <table className="w-full text-sm border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="h-12 px-6 text-left align-middle font-semibold text-muted-foreground w-[100px]">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground">Task Details</th>
                      <th className="h-12 px-4 text-left align-middle font-semibold text-muted-foreground w-48">Due Date</th>
                      <th className="h-12 px-6 text-right align-middle font-semibold text-muted-foreground w-32">Label</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => {
                      const overdue = isOverdue(task.due_date, task.completed);
                      return (
                        <tr
                          key={task.id}
                          className="group border-b last:border-0 hover:bg-muted/10 transition-colors"
                        >
                          <td className="px-6 py-5 align-middle text-center">
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            ) : overdue ? (
                              <AlertTriangle className="h-5 w-5 text-destructive mx-auto" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-5 align-middle">
                            <div className="flex flex-col gap-1">
                              <span className={`font-medium text-base tracking-tight ${task.completed ? 'text-muted-foreground/60' : 'text-foreground'}`}>
                                {task.title}
                              </span>
                              <span className="text-xs text-muted-foreground/70 line-clamp-1 max-w-md">
                                {task.description || "No description provided"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-5 align-middle">
                            <div className={`flex items-center gap-2 ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                              <Calendar className="h-3.5 w-3.5" />
                              <span className="text-xs">{formatDate(task.due_date)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-middle text-right">
                            {task.completed ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2.5">
                                Finished
                              </Badge>
                            ) : overdue ? (
                              <Badge variant="destructive" className="animate-pulse">
                                Overdue
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground border-muted-foreground/20 font-normal">
                                Pending
                              </Badge>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-8 flex items-center justify-between py-4 px-2 border-t border-dashed">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Done
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Overdue
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400" /> Upcoming
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/40 uppercase font-bold">
              Auth-Protected Stream
            </p>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}