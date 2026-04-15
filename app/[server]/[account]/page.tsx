import { MessageCircleMore } from "lucide-react"

import { ProfileStatusCard } from "@/components/mastodon/profile/ProfileStatusCard"
import { getProfileStatuses, getProfileViewData, normalizeAccountParam } from "@/lib/mastodon/profile"

export default async function ProfilePostsPage({
  params,
}: {
  params: Promise<{ server: string; account: string }>
}) {
  const { server, account } = await params
  const normalizedAccount = normalizeAccountParam(account)
  const profile = await getProfileViewData(server, normalizedAccount)
  const statuses = await getProfileStatuses(server, profile.account.id)

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
        <ProfileStatusCard key={status.id} status={status} server={server} />
      ))}
    </div>
  )
}
