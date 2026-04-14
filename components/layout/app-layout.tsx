"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { RightPanel } from "./right-panel"
// import { motion } from "framer-motion"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <main className="container mx-auto max-w-4xl lg:max-w-7xl flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <div className="h-full">
          <div className="container p-4 md:p-6">{children}</div>
        </div>
      </div>
      <RightPanel />
    </main>
  )
}
