"use client"

import { useEffect, useState, useMemo } from "react"
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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Filter, 
  ArrowUpDown, 
  Pencil, 
  Check, 
  Trash2, 
  Plus,
  LogOut // Imported for the logout button
} from "lucide-react"

interface Task {
  id: number
  title: string
  description: string
  due_date: string
  completed: boolean
}

type FilterType = "all" | "completed" | "pending" | "overdue"
type SortType = "due_date_asc" | "due_date_desc" | "title_asc" | "title_desc"

export default function AllTasksPage() {
  const router = useRouter()
  
  // State declarations
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>("all")
  const [sort, setSort] = useState<SortType>("due_date_asc")
  
  // Edit dialog state
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDueDate, setEditDueDate] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  
  // Delete confirmation state
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Create dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newDueDate, setNewDueDate] = useState("")

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    // Clear the token cookie by setting expiration to the past
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    // Redirect to login page
    router.push("/auth/login")
  }

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]
    
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  // Fetch tasks function
  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/tasks", {
        headers: getAuthHeaders()
      })
      
      if (res.status === 401) {
        router.push("/login")
        return
      }

      if (!res.ok) throw new Error("Failed to fetch tasks")
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const formatDateTimeForInput = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const isOverdue = (dateString: string, completed: boolean) => {
    if (completed) return false
    return new Date(dateString) < new Date()
  }

  const completeTask = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${id}/complete`, { 
        method: "PATCH",
        headers: getAuthHeaders()
      })
      if (res.ok) fetchTasks()
    } catch (error) {
      console.error("Error completing task:", error)
    }
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setEditTitle(task.title)
    setEditDescription(task.description)
    setEditDueDate(formatDateTimeForInput(task.due_date))
    setIsEditDialogOpen(true)
  }

  const updateTask = async () => {
    if (!editingTask) return
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          due_date: editDueDate,
        }),
      })
      if (res.ok) {
        setIsEditDialogOpen(false)
        setEditingTask(null)
        fetchTasks()
      }
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const openDeleteDialog = (taskId: number) => {
    setDeletingTaskId(taskId)
    setIsDeleteDialogOpen(true)
  }

  const deleteTask = async () => {
    if (!deletingTaskId) return
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${deletingTaskId}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      })
      if (res.ok) {
        setIsDeleteDialogOpen(false)
        setDeletingTaskId(null)
        fetchTasks()
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const createTask = async () => {
    if (!newTitle || !newDueDate) return
    try {
      const res = await fetch("http://localhost:8000/api/tasks", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          due_date: newDueDate,
        }),
      })
      if (res.ok) {
        setIsCreateDialogOpen(false)
        setNewTitle("")
        setNewDescription("")
        setNewDueDate("")
        fetchTasks()
      }
    } catch (error) {
      console.error("Error creating task:", error)
    }
  }

  const getFilterLabel = (filterType: FilterType) => {
    switch (filterType) {
      case "all": return "All Tasks"
      case "completed": return "Completed"
      case "pending": return "Pending"
      case "overdue": return "Overdue"
    }
  }

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks]
    switch (filter) {
      case "completed": 
        filtered = filtered.filter(task => task.completed)
        break
      case "pending": 
        filtered = filtered.filter(task => !task.completed)
        break
      case "overdue": 
        filtered = filtered.filter(task => isOverdue(task.due_date, task.completed))
        break
    }
    filtered.sort((a, b) => {
      switch (sort) {
        case "due_date_asc": return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        case "due_date_desc": return new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
        case "title_asc": return a.title.localeCompare(b.title)
        case "title_desc": return b.title.localeCompare(a.title)
        default: return 0
      }
    })
    return filtered
  }, [tasks, filter, sort])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Updated Header with Logout Button */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">All Tasks</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
              <p className="text-muted-foreground mt-1">Manage and track all your tasks</p>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="hidden md:inline">{getFilterLabel(filter)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
                    <DropdownMenuRadioItem value="all">All Tasks</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="overdue">Overdue</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="hidden md:inline">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as SortType)}>
                    <DropdownMenuRadioItem value="due_date_asc">Due Date (Earliest)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="due_date_desc">Due Date (Latest)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="title_asc">Title (A-Z)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="title_desc">Title (Z-A)</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>Fill in the task details below.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-title">Title</Label>
                      <Input id="new-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-description">Description</Label>
                      <Textarea id="new-description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-due-date">Due Date</Label>
                      <Input id="new-due-date" type="datetime-local" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={createTask}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            {filteredAndSortedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Circle className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No tasks found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {filter !== "all" ? "Try adjusting your filters to see more tasks" : "Get started by creating your first task"}
                </p>
              </div>
            ) : (
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-12">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Task</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Description</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-40">Due Date</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedTasks.map((task) => (
                      <tr key={task.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          {task.completed ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                        </td>
                        <td className="p-4 align-middle">
                          <div className={`font-medium ${task.completed ? 'text-muted-foreground' : ''}`}>{task.title}</div>
                          <div className="text-sm text-muted-foreground md:hidden mt-1">{task.description}</div>
                        </td>
                        <td className="p-4 align-middle hidden md:table-cell">
                          <div className="text-sm text-muted-foreground max-w-md line-clamp-1">{task.description}</div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(task.due_date)}</span>
                          </div>
                          <div className="mt-1">
                            {task.completed ? (
                              <Badge variant="secondary" className="text-xs">Completed</Badge>
                            ) : isOverdue(task.due_date, task.completed) ? (
                              <Badge variant="destructive" className="text-xs">Overdue</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Pending</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(task)} title="Edit task">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {!task.completed && (
                              <Button variant="ghost" size="sm" onClick={() => completeTask(task.id)} title="Mark as complete">
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openDeleteDialog(task.id)} 
                              title="Delete task" 
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-due-date">Due Date</Label>
              <Input id="edit-due-date" type="datetime-local" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={updateTask}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingTaskId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteTask} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}