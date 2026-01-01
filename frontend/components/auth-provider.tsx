"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthContextType {
    isAuthenticated: boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
})

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check if current path requires auth
        const protectedPaths = ['/dashboard', '/tasks']
        const isProtectedPage = protectedPaths.some(path => pathname.startsWith(path))

        if (!isProtectedPage) {
            setIsLoading(false)
            return
        }

        // Check for token
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1]

        if (!token) {
            router.push('/auth/login')
            return
        }

        setIsAuthenticated(true)
        setIsLoading(false)
    }, [pathname, router])

    // Show loading screen only on initial auth check
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

// Helper hook to get auth headers
export function useAuthHeaders() {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    }
}