"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (server: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (server: string) => {
    const res = await fetch(`/api/${server}/login`, {
      method: 'POST',
      body: JSON.stringify({
        origin: location.origin,
      })
    })
    const { authUrl } = await res.json()
    location.href = authUrl
  }

  const refreshUser = async () => {}

  const logout = async () => {}

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
