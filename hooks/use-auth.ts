"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthState } from "@/lib/auth"
import { mockLogin, mockLogout } from "@/lib/auth"

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true })
        try {
          const user = await mockLogin(username, password)
          if (user) {
            set({ user, isAuthenticated: true, isLoading: false })
            return true
          } else {
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await mockLogout()
          set({ user: null, isAuthenticated: false, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
