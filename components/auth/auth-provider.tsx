"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useMasto } from "./masto-provider"
import type { mastodon } from "masto"

type User = mastodon.v1.AccountCredentials

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  /** Has attempted to resolve auth at least once (success or failure). */
  isInitialized: boolean
  login: (server: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const { client, isReady, accessToken } = useMasto()

  useEffect(() => {
    if (!isReady) return

    // 没有 token，无需请求个人信息，直接标记初始化完成
    if (!accessToken) {
      setIsInitialized(true)
      return
    }

    // In dev StrictMode this effect can run twice; guard to avoid duplicate verify calls.
    let cancelled = false

    const checkAuth = async () => {
      try {
        await refreshUser()
      } finally {
        if (!cancelled) setIsInitialized(true)
      }
    }

    checkAuth()
    return () => {
      cancelled = true
    }
  }, [client, isReady])

  const login = async (server: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/${server}/login`, {
        method: 'POST',
        body: JSON.stringify({
          origin: location.origin,
        })
      })
      const { authUrl } = await res.json()
      setIsLoading(false)
      location.href = authUrl
    } catch (error) {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const res = await client?.v1.accounts.verifyCredentials()
      setUser(res ?? null)
    } catch {
      setUser(null)
    }
  }

  const logout = async () => {
    await fetch(`/api/logout`, {
      method: 'POST'
    })
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isInitialized, login, logout, refreshUser }}>
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
