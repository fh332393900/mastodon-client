"use client"

import Link from "next/link"
import { Repeat2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"
import type { mastodon } from "masto"

type StatusRepostHeaderProps = {
  account: mastodon.v1.Account
  server: string
}

export function StatusRepostHeader({ account, server }: StatusRepostHeaderProps) {
  const nameText = getDisplayNameText({
    displayName: account.displayName,
    username: account.username,
  })

  return (
    <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
      <Repeat2 className="h-5 w-5 shrink-0 text-green-500" />
      <Link
        href={`/${server}/${account.acct}`}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary"
      >
        <Avatar className="h-7 w-7 ring-2 ring-border/70">
          <AvatarImage src={account.avatar} alt={nameText} />
          <AvatarFallback>{nameText.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="inline-flex flex-wrap items-center gap-1">
          <span className="font-bold">
            {renderDisplayName({
              displayName: account.displayName,
              username: account.username,
              emojis: account.emojis,
            })}
          </span>
          <span>Reposted this status</span>
        </span>
      </Link>
    </div>
  )
}
