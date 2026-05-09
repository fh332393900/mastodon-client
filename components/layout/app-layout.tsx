"use client"

import type React from "react"
import { useMemo } from "react"
import { usePathname } from "next/navigation"

import { Sidebar } from "./sidebar"
import { RightPanel } from "./right-panel"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const isSettings = useMemo(() => pathname?.includes("/settings"), [pathname])

  return (
    <main className="container mx-auto max-w-4xl lg:max-w-7xl flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="h-full">
          <div className="container">{children}</div>
        </div>
      </div>
      {!isSettings && <RightPanel />}
    </main>
  )
}
