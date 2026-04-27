"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, User, FileText, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/layout/app-layout"

export default function NotFoundPage() {
  const router = useRouter()
  const params = useSearchParams()
  const type = params?.get("type")

  let title = "Not Found"
  let desc = "Sorry, we couldn't find the page you're looking for."
  let Icon = AlertCircle

  if (type === "user") {
    title = "User Not Found"
    desc = "The user could not be found. They may have been deleted or the username is incorrect."
    Icon = User
  } else if (type === "status" || type === "post") {
    title = "Post Not Found"
    desc = "The post may have been deleted or you do not have permission to view it."
    Icon = FileText
  }

  return (
    <AppLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 pt-20">
        <div className="w-full max-w-2xl rounded-2xl">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/60 dark:bg-muted/50">
              <Icon className="h-10 w-10 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
