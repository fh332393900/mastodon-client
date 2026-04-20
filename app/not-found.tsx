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

  let title = "页面未找到"
  let desc = "抱歉，我们无法找到你要访问的页面。"
  let Icon = AlertCircle

  if (type === "user") {
    title = "用户不存在"
    desc = "找不到该用户，可能已被删除或用户名输入有误。"
    Icon = User
  } else if (type === "status" || type === "post") {
    title = "贴文不存在"
    desc = "该贴文可能已被删除或你没有权限查看。"
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
                <ArrowLeft className="mr-2 h-4 w-4" /> 返回
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
