"use client"

import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"

import Link from "next/link"
import { Pin } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import MastodonContent from "@/components/mastodon/MastodonContent"
import { UserHoverCard } from "@/components/mastodon/user-hover-card"
import { cn } from "@/lib/utils"
import { formatRelativeTime, formatFullDate } from "@/lib/utils"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { getAccountProfileHref } from "@/lib/mastodon/account"
import { useStatusActions } from "@/hooks/mastodon/useStatusActions"
import { StatusMoreActions } from "./StatusMoreActions"

import { StatusPoll } from "./StatusPoll"
import { StatusMedia } from "./StatusMedia"
import { StatusActions } from "./StatusActions"
import { StatusRepostHeader } from "./StatusRepostHeader"
import { StatusPreviewCard } from "./StatusPreviewCard"

type Status = mastodon.v1.Status

type StatusCardProps = {
  status: Status
  showActions?: boolean
}

export function StatusCard({ status, showActions = true }: StatusCardProps) {
  const { server } = useMasto()
  const router = useRouter()
  const {
    renderedStatus,
    isLoading,
    canReblog,
    toggleReblog,
    toggleFavourite,
    toggleBookmark,
  } = useStatusActions({ status })

  const author = renderedStatus.account
  const authorNameText = getDisplayNameText({
    displayName: author.displayName,
    username: author.username,
  })

  const profileHref = server ? getAccountProfileHref(author, server) : undefined
  const detailHref = server ? `/${server}/@${author.username}/${renderedStatus.id}` : undefined

  const handleContentClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!detailHref) return
    const target = event.target as HTMLElement
    const interaction = target.closest("a, button, [data-clickable]")
    if (interaction && interaction !== event.currentTarget) return
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) return
    router.push(detailHref)
  }

  return (
    <article className="rounded-3xl border border-border/70 bg-card/90 p-4 shadow-sm">
      {status.reblog && server ? (
        <StatusRepostHeader account={status.account} server={server} />
      ) : null}

      <div className="flex gap-4">
        {profileHref ? (
          <div>
            <UserHoverCard account={author} profileHref={profileHref}>
              <Link href={profileHref}>
                <Avatar className="h-12 w-12 ring-2 ring-border/70">
                  <AvatarImage src={author.avatar} alt={authorNameText} />
                  <AvatarFallback>{authorNameText.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            </UserHoverCard>
          </div>
        ) : (
          <Avatar className="h-12 w-12 ring-2 ring-border/70">
            <AvatarImage src={author.avatar} alt={authorNameText} />
            <AvatarFallback>{authorNameText.charAt(0)}</AvatarFallback>
          </Avatar>
        )}

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex gap-2 md:gap-4 justify-between items-center">
            <UserHoverCard account={author} profileHref={profileHref} className="" />
            <div className="flex items-center gap-2">
              <span
                className="text-sm text-muted-foreground shrink-0 whitespace-nowrap"
                title={formatFullDate(renderedStatus.createdAt)}
              >
                {formatRelativeTime(renderedStatus.createdAt)}
              </span>
              <StatusMoreActions status={status} />
            </div>
            {renderedStatus.pinned ? (
              <Badge variant="outline">
                <Pin className="mr-1 h-3 w-3" />置顶
              </Badge>
            ) : null}
          </div>

          {renderedStatus.spoilerText ? (
            <div className="rounded-2xl bg-muted/70 px-4 py-3 text-sm text-muted-foreground">
              {renderedStatus.spoilerText}
            </div>
          ) : null}

          <div
            role={detailHref ? "link" : undefined}
            tabIndex={detailHref ? 0 : -1}
            className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 [&_.prose]:max-w-none [&_.prose]:text-sm [&_.prose_a]:text-primary [&_.prose_p]:my-2"
            onClick={handleContentClick}
            onKeyDown={(event) => {
              if (!detailHref) return
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                router.push(detailHref)
              }
            }}
          >
            <MastodonContent content={renderedStatus.content} emojis={renderedStatus.emojis} />
          </div>

          {renderedStatus.poll ? (
            <StatusPoll poll={renderedStatus.poll} />
          ) : null}

          <StatusMedia attachments={renderedStatus.mediaAttachments} />

          {renderedStatus.card ? (
            <StatusPreviewCard card={renderedStatus.card} />
          ) : null}

          {showActions ? (
            <StatusActions
              renderedStatus={renderedStatus}
              isLoading={isLoading}
              canReblog={canReblog}
              toggleReblog={toggleReblog}
              toggleFavourite={toggleFavourite}
              toggleBookmark={toggleBookmark}
            />
          ) : null}
        </div>
      </div>
    </article>
  )
}
