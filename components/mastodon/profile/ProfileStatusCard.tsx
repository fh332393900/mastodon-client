import Link from "next/link"
import { Globe, MessageCircle, Repeat2, Heart, Pin } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import MastodonContent from "@/components/mastodon/MastodonContent"
import { getAccountProfileHref, type MastodonStatus } from "@/lib/mastodon/profile"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function ProfileStatusCard({
  status,
  server,
}: {
  status: MastodonStatus
  server: string
}) {
  const renderedStatus = status.reblog ?? status
  const author = renderedStatus.account
  const profileHref = getAccountProfileHref(author, server)

  return (
    <article className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
      {status.reblog ? (
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Repeat2 className="h-3.5 w-3.5" />
          <span>{status.account.displayName || status.account.username} {"\u8f6c\u53d1\u4e86\u8fd9\u6761\u8d34\u6587"}</span>
        </div>
      ) : null}

      <div className="flex gap-4">
        <Link href={profileHref}>
          <Avatar className="h-12 w-12 ring-2 ring-border/70">
            <AvatarImage src={author.avatar} alt={author.displayName} />
            <AvatarFallback>{author.displayName?.charAt(0) || author.username.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={profileHref} className="font-semibold text-foreground hover:text-primary">
              {author.displayName || author.username}
            </Link>
            <span className="text-sm text-muted-foreground">@{author.acct}</span>
            <span className="text-sm text-muted-foreground">- {formatDate(renderedStatus.createdAt)}</span>
            <Badge variant="outline" className="capitalize">
              <Globe className="mr-1 h-3 w-3" />
              {renderedStatus.visibility}
            </Badge>
            {renderedStatus.pinned ? <Badge variant="outline"><Pin className="mr-1 h-3 w-3" />{"\u7f6e\u9876"}</Badge> : null}
          </div>

          {renderedStatus.spoilerText ? (
            <div className="rounded-2xl bg-muted/70 px-4 py-3 text-sm text-muted-foreground">
              {renderedStatus.spoilerText}
            </div>
          ) : null}

          <div className="[&_.prose]:max-w-none [&_.prose]:text-sm [&_.prose_a]:text-primary [&_.prose_p]:my-2">
            <MastodonContent content={renderedStatus.content} />
          </div>

          {renderedStatus.mediaAttachments.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {renderedStatus.mediaAttachments.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
                  {item.type === "image" ? (
                    <img
                      src={item.previewUrl || item.url || undefined}
                      alt={item.description || "media"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video src={item.url || undefined} controls className="h-full w-full" />
                  )}
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              {renderedStatus.repliesCount}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Repeat2 className="h-4 w-4" />
              {renderedStatus.reblogsCount}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              {renderedStatus.favouritesCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
