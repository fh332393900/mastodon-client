"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { TimelineFeed } from "@/components/timeline/timeline-feed"
import { useAuth } from "@/components/auth/auth-provider"

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold">Home Timeline</h1>
        <p className="text-muted-foreground">Latest posts from your network</p>
      </div>
      <TimelineFeed />
    </div>
  )
}
