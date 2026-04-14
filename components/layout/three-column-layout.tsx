"use client"

import type React from "react"
import { Sidebar } from "./sidebar"
import { RightPanel } from "./right-panel"

interface ThreeColumnLayoutProps {
  children: React.ReactNode
}

export function ThreeColumnLayout({ children }: ThreeColumnLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 min-w-0 overflow-hidden">
        <div className="h-full overflow-y-scroll">
          <div className="container mx-auto p-4 md:p-6 max-w-2xl">{children}</div>
        </div>
      </main>

      <RightPanel />
    </div>
  )
}
