"use client"

import { Pin } from "lucide-react"
import type { mastodon } from "masto"

import { Badge } from "@/components/ui/badge"
import { UserHoverCard } from "@/components/mastodon/user-hover-card"
import { cn } from "@/lib/utils"
import { StatusMoreActions } from "./StatusMoreActions"

type StatusHeaderRowProps = {
  account: mastodon.v1.Account
  profileHref?: string
  timeLabel: string
  timeTitle: string
  isPinned: boolean
  status: mastodon.v1.Status
  className?: string
}

export function StatusHeaderRow({
  account,
  profileHref,
  timeLabel,
  timeTitle,
  isPinned,
  status,
  className,
}: StatusHeaderRowProps) {
  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      <div className="min-w-0">
        <UserHoverCard
          account={account}
          profileHref={profileHref}
          className=""
          triggerClassName="min-w-0 inline-flex"
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-sm text-muted-foreground shrink-0 whitespace-nowrap"
          title={timeTitle}
        >
          {timeLabel}
        </span>
        <StatusMoreActions status={status} />
      </div>
      {isPinned ? (
        <Badge variant="outline" className="shrink-0">
          <Pin className="mr-1 h-3 w-3" />置顶
        </Badge>
      ) : null}
    </div>
  )
}
