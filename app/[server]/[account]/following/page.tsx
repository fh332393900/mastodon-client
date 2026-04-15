import { Users } from "lucide-react"

import { ProfileAccountListItem } from "@/components/mastodon/profile/ProfileAccountListItem"
import { getProfileAccountsList, getProfileViewData, normalizeAccountParam } from "@/lib/mastodon/profile"

export default async function ProfileFollowingPage({
  params,
}: {
  params: Promise<{ server: string; account: string }>
}) {
  const { server, account } = await params
  const normalizedAccount = normalizeAccountParam(account)
  const profile = await getProfileViewData(server, normalizedAccount)
  const accounts = await getProfileAccountsList(server, profile.account.id, "following")

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
          currentServer={server}
        />
      ))}
    </div>
  )
}
