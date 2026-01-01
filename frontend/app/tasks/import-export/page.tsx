"use client";

import { useEffect, useState, useRef } from "react"
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
import { Button } from "@/components/ui/button"
import { Upload, Download, Loader2, FileSpreadsheet } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Task {
  id: number
  title: string
  description: string
  due_date: string
  completed: boolean
}

function Badge({ children, variant }: { children: React.ReactNode, variant: "secondary" | "outline" }) {
  const styles = variant === "secondary" 
    ? "bg-secondary text-secondary-foreground" 
    : "border text-muted-foreground"
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${styles}`}>
      {children}
    </span>
  )
}

export default function TasksPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // ALL STATE FIRST
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [importFile, setImportFile] = useState<File | null>(null)

  const getAuthHeaders = () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]
    
    return {
      "Authorization": `Bearer ${token}`
    }
  }

  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/tasks", {
        headers: getAuthHeaders()
      })

      if (!res.ok) throw new Error("Fetch failed")

      const data = await res.json()
      setTasks(data)
    } catch (err) {
      console.error("Fetch failed", err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch tasks on mount - middleware already checked auth
  useEffect(() => {
    fetchTasks()
  }, [])

  const exportTasks = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/tasks/export", {
        headers: getAuthHeaders()
      })

      if (!res.ok) throw new Error("Export failed")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "tasks.xlsx"
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export failed", err)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
    }
  }

  const importTasks = async () => {
    if (!importFile) return
    
    const formData = new FormData()
    formData.append("file", importFile)

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      const res = await fetch("http://localhost:8000/api/tasks/import", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      })
      
      if (res.ok) {
        setImportFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setLoading(true)
        await fetchTasks()
      } else {
        const errorData = await res.json()
        console.error("Import error details:", errorData)
        alert("Import failed: " + (errorData.detail || "Unknown error"))
      }
    } catch (err) {
      console.error("Import failed", err)
      alert("Import failed. Check console for details.")
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
          <div className="flex flex-1 items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Manage Tasks</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={exportTasks} variant="outline" size="sm" className="h-8">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            
            <Input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button 
              onClick={handleImportClick}
              variant="outline" 
              size="sm" 
              className="h-8"
              type="button"
            >
              <Upload className="mr-2 h-4 w-4" /> 
              {importFile ? importFile.name : "Import"}
            </Button>
            
            {importFile && (
              <Button onClick={importTasks} size="sm" className="h-8" type="button">
                Confirm Upload
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Tasks Archive</h1>
              <div className="text-sm text-muted-foreground">
                Total: {tasks.length}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No tasks in the database.</p>
                <p className="text-sm text-muted-foreground/60">Import an Excel file to get started.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex flex-col gap-1 border bg-card p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <span className={`font-semibold ${task.completed ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </span>
                      <Badge variant={task.completed ? "secondary" : "outline"}>
                        {task.completed ? "Done" : "Pending"}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description || "No description"}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t text-[11px] text-muted-foreground uppercase font-medium tracking-wider">
                      <span className="flex items-center gap-1">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                      <span>ID: #{task.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}