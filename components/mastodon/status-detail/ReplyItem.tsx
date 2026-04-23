"use client"

import Link from "next/link"
import type { mastodon } from "masto"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import MastodonContent from "@/components/mastodon/MastodonContent"
import { UserHoverCard } from "@/components/mastodon/user-hover-card"
import { formatRelativeTime, formatFullDate } from "@/lib/utils"
import { getDisplayNameText } from "@/lib/mastodon/contentToReactNode"
import { getAccountProfileHref } from "@/lib/mastodon/account"
import { useMasto } from "@/components/auth/masto-provider"
import { useStatusActions } from "@/hooks/mastodon/useStatusActions"
import { StatusActions } from "@/components/mastodon/Status/StatusActions"
import { StatusMedia } from "@/components/mastodon/Status/StatusMedia"
import { StatusPoll } from "@/components/mastodon/Status/StatusPoll"
import { StatusPreviewCard } from "@/components/mastodon/Status/StatusPreviewCard"

export function ReplyItem({
  status,
  showThreadLine,
}: {
  status: mastodon.v1.Status
  showThreadLine?: boolean
}) {
  const { server } = useMasto()
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

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          {profileHref ? (
            <UserHoverCard account={author} profileHref={profileHref}>
              <Link href={profileHref}>
                <Avatar className="h-10 w-10 ring-2 ring-border/70 shrink-0">
                  <AvatarImage src={author.avatar} alt={authorNameText} />
                  <AvatarFallback>{authorNameText.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            </UserHoverCard>
          ) : (
            <Avatar className="h-10 w-10 ring-2 ring-border/70 shrink-0">
              <AvatarImage src={author.avatar} alt={authorNameText} />
              <AvatarFallback>{authorNameText.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          {showThreadLine ? (
            <div className="mt-2 w-0.5 flex-1 min-h-4 bg-border/60 rounded-full" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {detailHref ? (
            <Link href={detailHref} className="block group">
              <div className="flex gap-2 md:gap-4 justify-between items-center">
                <UserHoverCard account={author} profileHref={profileHref} className="" />
                <span
                  className="text-xs text-muted-foreground shrink-0 whitespace-nowrap group-hover:text-primary transition-colors"
                  title={formatFullDate(renderedStatus.createdAt)}
                >
                  {formatRelativeTime(renderedStatus.createdAt)}
                </span>
              </div>

              {renderedStatus.spoilerText ? (
                <div className="rounded-2xl bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
                  {renderedStatus.spoilerText}
                </div>
              ) : null}

              <div className="[&_.prose]:max-w-none [&_.prose]:text-sm [&_.prose_a]:text-primary [&_.prose_p]:my-2">
                <MastodonContent content={renderedStatus.content} emojis={renderedStatus.emojis} />
              </div>

              {renderedStatus.poll ? (
                <StatusPoll poll={renderedStatus.poll} />
              ) : null}

              <StatusMedia attachments={renderedStatus.mediaAttachments} />

              {renderedStatus.card ? (
                <StatusPreviewCard card={renderedStatus.card} />
              ) : null}
            </Link>
          ) : null}

          <StatusActions
            renderedStatus={renderedStatus}
            isLoading={isLoading}
            canReblog={canReblog}
            toggleReblog={toggleReblog}
            toggleFavourite={toggleFavourite}
            toggleBookmark={toggleBookmark}
          />
        </div>
      </div>
    </div>
  )
}
