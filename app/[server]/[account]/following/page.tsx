"use client"

import { Users } from "lucide-react"
import { useParams } from "next/navigation"

import { ProfileAccountListItem } from "@/components/mastodon/profile/ProfileAccountListItem"
import { useProfileViewData } from "@/hooks/mastodon/useProfileViewData"
import { useProfileAccountsList } from "@/hooks/mastodon/useProfileAccountsList"

export default function ProfileFollowingPage() {
  const params = useParams()
  const serverParam = params?.server
  const accountParam = params?.account
  const server = Array.isArray(serverParam) ? serverParam[0] : serverParam
  const account = Array.isArray(accountParam) ? accountParam[0] : accountParam

  const { data: profile, query: profileQuery } = useProfileViewData({
    server,
    account,
  })
  const { data: accounts, query } = useProfileAccountsList({
    server,
    accountId: profile?.account.id,
    type: "following",
  })

  if (profileQuery.isLoading || query.isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-border/70 bg-card/70 p-10 text-center">
        <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold">{"\u52a0\u8f7d\u4e2d..."}</p>
      </div>
    )
  }

  if (!profile || query.isError) {
    return null
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/70 bg-card/70 p-10 text-center">
        <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold">{"\u6682\u65f6\u6ca1\u6709\u5173\u6ce8\u4efb\u4f55\u8d26\u53f7"}</p>
        <p className="mt-2 text-sm text-muted-foreground">{"\u5982\u679c\u8fd9\u4e2a\u7528\u6237\u9690\u85cf\u4e86\u5173\u6ce8\u5217\u8868\uff0c\u8fd9\u91cc\u4e5f\u53ef\u80fd\u4e3a\u7a7a\u3002"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <ProfileAccountListItem
          key={account.id}
          account={account}
          currentServer={server ?? ""}
        />
      ))}
    </div>
  )
}
