"use client"

import { MessageCircleMore } from "lucide-react"
import { useParams } from "next/navigation"

import { StatusCard } from "@/components/mastodon/StatusCard"
import { useProfileViewData } from "@/hooks/mastodon/useProfileViewData"
import { useProfileStatuses } from "@/hooks/mastodon/useProfileStatuses"

export default function ProfilePostsPage() {
  const params = useParams()
  const serverParam = params?.server
  const accountParam = params?.account
  const server = Array.isArray(serverParam) ? serverParam[0] : serverParam
  const account = Array.isArray(accountParam) ? accountParam[0] : accountParam

  const { data: profile, query: profileQuery } = useProfileViewData({
    server,
    account,
  })
  const { data: statuses, query: statusQuery } = useProfileStatuses({
    server,
    accountId: profile?.account.id,
  })

  if (profileQuery.isLoading || statusQuery.isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-border/70 bg-card/70 p-10 text-center">
        <MessageCircleMore className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold">{"\u52a0\u8f7d\u4e2d..."}</p>
      </div>
    )
  }

  if (!profile || statusQuery.isError) {
    return null
  }

  if (statuses.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/70 bg-card/70 p-10 text-center">
        <MessageCircleMore className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold">{"\u8fd8\u6ca1\u6709\u516c\u5f00\u8d34\u6587"}</p>
        <p className="mt-2 text-sm text-muted-foreground">{"\u8fd9\u4e2a\u8d26\u53f7\u76ee\u524d\u6ca1\u6709\u53ef\u5c55\u793a\u7684\u516c\u5f00\u5185\u5bb9\u3002"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {statuses.map((status) => (
        <StatusCard key={status.id} status={status} server={server ?? ""} />
      ))}
    </div>
  )
}
