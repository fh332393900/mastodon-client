"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Sidebar } from "./sidebar"
import { RightPanel } from "./right-panel"

interface ThreeColumnLayoutProps {
  children: React.ReactNode
}

export function ThreeColumnLayout({ children }: ThreeColumnLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Fixed width */}
      <Sidebar />

      {/* Main Content - Flexible width */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-w-0 overflow-hidden"
      >
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 max-w-2xl">{children}</div>
        </div>
      </motion.main>

      {/* Right Panel - Fixed width */}
      <RightPanel />
    </div>
  )
}
