"use client"

import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { useTranslations } from "next-intl"
import { Eye, EyeOff } from "lucide-react"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import MastodonContent from "@/components/mastodon/MastodonContent"
import { UserHoverCard } from "@/components/mastodon/user-hover-card"
import { useFormat } from "@/hooks/format"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { getAccountProfileHref } from "@/lib/mastodon/account"
import { useStatusActions } from "@/hooks/mastodon/useStatusActions"
import { StatusHeaderRow } from "./StatusHeaderRow"

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
  const t = useTranslations("settings")
  const { server } = useMasto()
  const router = useRouter()
  const { formatRelativeTime, formatFullDate } = useFormat()
  const [showSpoiler, setShowSpoiler] = useState(false)
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

  const hasSpoiler = !!renderedStatus.spoilerText

  const handleSpoilerClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setShowSpoiler((prev) => !prev)
  }

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
    <article className="rounded-3xl border border-border/70 bg-card/90 p-3 md:p-4 shadow-sm">
      {status.reblog && server ? (
        <StatusRepostHeader account={status.account} server={server} />
      ) : null}

      <div className="block md:flex md:gap-4">
        {profileHref ? (
          <div className="flex min-w-0 items-center gap-3 md:block md:mb-0">
            <UserHoverCard account={author} profileHref={profileHref}>
              <Link href={profileHref}>
                <Avatar className="h-12 w-12 ring-2 ring-border/70">
                  <AvatarImage src={author.avatar} alt={authorNameText} />
                  <AvatarFallback>{authorNameText.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            </UserHoverCard>
            <StatusHeaderRow
              account={author}
              profileHref={profileHref}
              timeLabel={formatRelativeTime(renderedStatus.createdAt)}
              timeTitle={formatFullDate(renderedStatus.createdAt)}
              isPinned={renderedStatus.pinned}
              status={status}
              className="flex flex-1 min-w-0 items-center justify-between gap-2 md:hidden"
            />
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-3 md:block md:mb-0">
            <Avatar className="h-12 w-12 ring-2 ring-border/70">
              <AvatarImage src={author.avatar} alt={authorNameText} />
              <AvatarFallback>{authorNameText.charAt(0)}</AvatarFallback>
            </Avatar>
            <StatusHeaderRow
              account={author}
              profileHref={profileHref}
              timeLabel={formatRelativeTime(renderedStatus.createdAt)}
              timeTitle={formatFullDate(renderedStatus.createdAt)}
              isPinned={renderedStatus.pinned}
              status={status}
              className="flex flex-1 min-w-0 items-center justify-between gap-2 md:hidden"
            />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-3">
          <StatusHeaderRow
            account={author}
            profileHref={profileHref}
            timeLabel={formatRelativeTime(renderedStatus.createdAt)}
            timeTitle={formatFullDate(renderedStatus.createdAt)}
            isPinned={renderedStatus.pinned}
            status={status}
            className="hidden items-center justify-between gap-2 md:flex md:gap-4"
          />

          {hasSpoiler ? (
            <button
              type="button"
              onClick={handleSpoilerClick}
              className="w-full rounded-2xl mt-2 bg-muted/70 px-4 py-3 text-left text-sm font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  
                  <MastodonContent content={renderedStatus.spoilerText} emojis={renderedStatus.emojis} />
                </span>
                <span className="shrink-0 flex text-xs font-bold text-primary">
                  <span className="mr-2">{showSpoiler ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</span>
                  {showSpoiler ? t("status.spoilerHide") : t("status.spoilerShow")}
                </span>
              </span>
            </button>
          ) : null}

          {(!hasSpoiler || showSpoiler) && (
            <>
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

              <StatusMedia
                attachments={renderedStatus.mediaAttachments}
                spoilered={hasSpoiler && !showSpoiler}
              />

              {renderedStatus.card ? (
                <StatusPreviewCard card={renderedStatus.card} hasMedia={(renderedStatus.mediaAttachments?.length ?? 0) > 0} />
              ) : null}
            </>
          )}

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
