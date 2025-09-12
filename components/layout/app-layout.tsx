"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { motion } from "framer-motion"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-hidden md:ml-0"
      >
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6 max-w-4xl">{children}</div>
        </div>
      </motion.main>
    </div>
  )
}
