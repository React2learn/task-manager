"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("password", password)

    try {
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || "Invalid credentials")
        setLoading(false)
        return
      }

      localStorage.setItem("token", data.access_token)
      document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`
      router.replace("/dashboard")
    } catch (err) {
      setError("Failed to connect to server. Check if backend is running.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <a
                href="#"
                className="flex flex-col items-center gap-2 font-medium"
              >
                <div className="flex size-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <span className="sr-only">TaskFlow</span>
              </a>
              <h1 className="text-xl font-bold">Welcome to TaskFlow</h1>
              <FieldDescription>
                Don&apos;t have an account? <a href="/auth/register" className="underline hover:text-primary">Sign up</a>
              </FieldDescription>
            </div>

            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </Field>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}

            <Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : "Login"}
              </Button>
            </Field>


          </FieldGroup>
        </form>
        <FieldDescription className="mt-6 text-center">
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline hover:text-primary">Terms of Service</a>{" "}
          and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
        </FieldDescription>
      </div>
    </div>
  )
}