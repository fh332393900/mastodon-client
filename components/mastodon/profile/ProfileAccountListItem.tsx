import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import MastodonContent from "@/components/mastodon/MastodonContent"
import type { MastodonAccount } from "@/lib/mastodon/profile"
import { getAccountProfileHref } from "@/lib/mastodon/profile"

export function ProfileAccountListItem({
  account,
  currentServer,
}: {
  account: MastodonAccount
  currentServer: string
}) {
  const href = getAccountProfileHref(account, currentServer)

  return (
    <Link
      href={href}
      className="block rounded-3xl border border-border/70 bg-card/80 p-4 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex gap-4">
        <Avatar className="h-14 w-14 ring-2 ring-border/70">
          <AvatarImage src={account.avatar} alt={account.displayName} />
          <AvatarFallback>{account.displayName?.charAt(0) || account.username.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{account.displayName || account.username}</p>
            {account.bot ? <Badge variant="outline">Bot</Badge> : null}
            {account.locked ? <Badge variant="outline">{"\u5df2\u9501\u5b9a"}</Badge> : null}
          </div>

          <p className="text-sm text-muted-foreground">@{account.acct}</p>

          {account.note ? (
            <div className="line-clamp-3 text-sm text-foreground/90 [&_.prose]:max-w-none [&_.prose]:text-sm">
              <MastodonContent content={account.note} />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>{account.statusesCount} {"\u8d34\u6587"}</span>
            <span>{account.followingCount} {"\u6b63\u5728\u5173\u6ce8"}</span>
            <span>{account.followersCount} {"\u5173\u6ce8\u8005"}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
