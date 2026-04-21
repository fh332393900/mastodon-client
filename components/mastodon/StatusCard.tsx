"use client"

import Link from "next/link"
import { MessageCircle, Repeat2, Heart, Pin, Bookmark } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import MastodonContent from "@/components/mastodon/MastodonContent"
import { MediaImage } from "@/components/mastodon/media-image"
import { UserHoverCard } from "@/components/mastodon/user-hover-card"
import { StatusPoll } from "@/components/mastodon/StatusPoll"
import { cn } from "@/lib/utils"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"
import type { mastodon } from "masto"
import { useMasto } from "../auth/masto-provider"
import { getAccountProfileHref } from "@/lib/mastodon/account"
import { useStatusActions } from "@/hooks/mastodon/useStatusActions"

type Status = mastodon.v1.Status

type StatusCardProps = {
  status: Status
  /** Optional: profile server context so we can link to account pages if desired */
  server?: string
  /** Optional: pass false to hide action buttons */
  showActions?: boolean
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function StatusCard({ status, showActions = true }: StatusCardProps) {
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
  const reblogAuthorNameText = getDisplayNameText({
    displayName: status.account.displayName,
    username: status.account.username,
  })

  const profileHref = server ? getAccountProfileHref(author, server) : undefined

  return (
    <article className="rounded-3xl border border-border/70 bg-card/90 p-4 shadow-sm">
      {status.reblog ? (
        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Repeat2 className="h-5 w-5 text-accent" />
          <Link href={`/${server}/${status.account.acct}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary">
            <Avatar className="h-7 w-7 ring-2 ring-border/70">
              <AvatarImage src={status.account.avatar} alt={reblogAuthorNameText} />
              <AvatarFallback>{reblogAuthorNameText.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="inline-flex flex-wrap items-center gap-1">
              {renderDisplayName({
                displayName: status.account.displayName,
                username: status.account.username,
                emojis: status.account.emojis,
              })}
              <span>转发了这条贴文</span>
            </span>
          </Link>
        </div>
      ) : null}

      <div className="flex gap-4">
        {profileHref ? (
          <div>
            <UserHoverCard
              account={author}
              profileHref={profileHref}
            >
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
            <UserHoverCard
              account={author}
              profileHref={profileHref}
              className=""
            >
            </UserHoverCard>
            <span className="text-sm text-muted-foreground shrink-0 whitespace-nowrap">{formatDate(renderedStatus.createdAt)}</span>
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

          <div className="[&_.prose]:max-w-none [&_.prose]:text-sm [&_.prose_a]:text-primary [&_.prose_p]:my-2">
            <MastodonContent content={renderedStatus.content} emojis={renderedStatus.emojis} />
          </div>

          {renderedStatus.poll ? (
            <StatusPoll poll={renderedStatus.poll} />
          ) : null}

          {renderedStatus.mediaAttachments.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {renderedStatus.mediaAttachments.map((item, index) => (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
                  {item.type === "image" ? (
                    <MediaImage
                      media={item}
                      index={index}
                      group={renderedStatus.mediaAttachments}
                    />
                  ) : (
                    <video src={item.url || undefined} controls className="h-full w-full" />
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {showActions ? (
            <div className="flex w-full items-center justify-between border-t border-border pt-3 mt-2 gap-4 text-sm text-muted-foreground">
              <div className="flex w-full justify-between gap-4">
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1.5 transition-colors cursor-pointer",
                    "hover:text-primary",
                  )}
                >
                  <MessageCircle className="h-5 w-5" />
                  {renderedStatus.repliesCount}
                </button>

                <button
                  type="button"
                  onClick={toggleReblog}
                  disabled={!canReblog || isLoading.reblogged}
                  className={cn(
                    "inline-flex items-center gap-1.5 transition-colors cursor-pointer",
                    renderedStatus.reblogged ? "text-green-500" : "hover:text-green-500",
                    (!canReblog || isLoading.reblogged) && "opacity-60 cursor-not-allowed",
                  )}
                >
                  <Repeat2 className="h-5 w-5" />
                  {renderedStatus.reblogsCount}
                </button>

                <button
                  type="button"
                  onClick={toggleFavourite}
                  disabled={isLoading.favourited}
                  className={cn(
                    "inline-flex items-center gap-1.5 transition-colors cursor-pointer",
                    renderedStatus.favourited ? "text-red-500" : "hover:text-red-500",
                    isLoading.favourited && "opacity-60 cursor-not-allowed",
                  )}
                >
                  <Heart className={cn("h-5 w-5", renderedStatus.favourited && "fill-current")} />
                  {renderedStatus.favouritesCount}
                </button>

                <button
                  type="button"
                  onClick={toggleBookmark}
                  disabled={isLoading.bookmarked}
                  className={cn(
                    "inline-flex items-center gap-1.5 transition-colors cursor-pointer",
                    renderedStatus.bookmarked ? "text-yellow-500" : "hover:text-yellow-500",
                    isLoading.bookmarked && "opacity-60 cursor-not-allowed",
                  )}
                >
                  <Bookmark className={cn("h-5 w-5", renderedStatus.bookmarked && "fill-current")} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
