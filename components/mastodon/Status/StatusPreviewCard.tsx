"use client"

import { ExternalLink } from "lucide-react"
import type { mastodon } from "masto"
import { ProviderIcon } from "./ProviderIcon"

interface StatusPreviewCardProps {
  card: mastodon.v1.PreviewCard
}

/** Detect GitHub URLs and extract user/repo/issue meta */
function parseGitHubMeta(card: mastodon.v1.PreviewCard) {
  const path = card.url.split("https://github.com/")[1]
  if (!path) return null

  const segments = path.split("/")
  const [user, repo, section, number] = segments

  // skip top-level reserved routes (explore, topics, etc.)
  const reservedRoutes = ["explore", "topics", "collections", "marketplace", "sponsors", "trending"]
  if (!user || reservedRoutes.includes(user)) return null

  let type: "user" | "repo" | "issue" | "pull" = repo ? "repo" : "user"

  if (repo && section === "issues" && number) type = "issue"
  else if (repo && section === "pull" && number) type = "pull"

  let details = (card.title ?? "").replace("GitHub - ", "").split(" · ")[0]
  if (repo) details = details.replace(`${user}/${repo}: `, "")

  return {
    type,
    user,
    repo,
    number,
    details,
    titleUrl: `https://github.com/${user}${repo ? `/${repo}` : ""}`,
    avatar: `https://github.com/${user}.png?size=256`,
    authorAvatar: card.authorName ? `https://github.com/${card.authorName}.png?size=64` : null,
    authorName: card.authorName || null,
  }
}

function GitHubCard({ card }: StatusPreviewCardProps) {
  const meta = parseGitHubMeta(card)
  if (!meta) return <NormalCard card={card} />

  return (
    <a
      href={card.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full overflow-hidden rounded-2xl border border-border/60 bg-card hover:border-border transition-colors no-underline"
    >
      <div className="flex flex-col justify-between min-h-36 p-4 sm:px-6">
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            {/* Title: user / repo */}
            <div className="text-base sm:text-lg font-semibold leading-tight flex flex-wrap gap-0.5 items-baseline">
              {meta.repo ? (
                <>
                  <span className="text-muted-foreground">{meta.user}</span>
                  <span className="text-muted-foreground mx-0.5">/</span>
                  <span className="text-foreground">{meta.repo}</span>
                </>
              ) : (
                <span className="text-foreground">{meta.user}</span>
              )}
            </div>

            {/* Detail / issue / PR */}
            <div className="text-sm text-muted-foreground leading-snug">
              {(meta.type === "issue" || meta.type === "pull") && (
                <span className="text-primary mr-1.5 font-medium">
                  {meta.type === "pull" ? "PR " : ""}#{meta.number}
                </span>
              )}
              <span>{meta.details}</span>
            </div>
          </div>

          {/* GitHub avatar */}
          <div className="shrink-0">
            <img
              src={meta.avatar}
              alt={meta.user}
              width={56}
              height={56}
              className="rounded-xl w-12 h-12 sm:w-14 sm:h-14 object-cover"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          {meta.authorAvatar && meta.authorName ? (
            <div className="flex items-center gap-2">
              <img
                src={meta.authorAvatar}
                alt={meta.authorName}
                width={24}
                height={24}
                className="rounded-full w-6 h-6 object-cover"
              />
              <span className="text-xs text-primary">@{meta.authorName}</span>
            </div>
          ) : (
            <span />
          )}
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-muted-foreground fill-current" aria-label="GitHub">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
          </svg>
        </div>
      </div>
    </a>
  )
}

function NormalCard({ card }: StatusPreviewCardProps) {
  const hasImage = !!card.image
  const isVideo = card.type === "video" || card.type === "rich"

  // Hostname for display
  let hostname = ""
  try { hostname = new URL(card.url).hostname } catch {}

  if (hasImage) {
    return (
      <a
        href={card.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex overflow-hidden rounded-2xl border border-border/60 bg-card hover:border-border transition-colors no-underline group"
      >
        {/* Thumbnail */}
        <div className="relative shrink-0 w-28 sm:w-36 bg-muted overflow-hidden">
          <img
            src={card.image ?? undefined}
            alt={card.title ?? ""}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between min-w-0 flex-1 p-3">
          <div className="space-y-1 min-w-0">
            {card.title && (
              <div className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                {card.title}
              </div>
            )}
            {card.description && (
              <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {card.description}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <ProviderIcon url={card.url} providerName={card.providerName} className="h-3 w-3" />
            <span className="truncate">{card.providerName || hostname}</span>
          </div>
        </div>
      </a>
    )
  }

  // No image — compact text card
  return (
    <a
      href={card.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card hover:border-border transition-colors no-underline px-4 py-3"
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        {card.title && (
          <div className="text-sm font-semibold text-foreground truncate">{card.title}</div>
        )}
        {card.description && (
          <div className="text-xs text-muted-foreground line-clamp-1">{card.description}</div>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-0.5">
          <ProviderIcon url={card.url} providerName={card.providerName} className="h-3 w-3" />
          <span className="truncate">{card.providerName || hostname}</span>
        </div>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
    </a>
  )
}

export function StatusPreviewCard({ card }: StatusPreviewCardProps) {
  if (!card?.url) return null

  const isGitHub = card.url.startsWith("https://github.com/")

  if (isGitHub) return <GitHubCard card={card} />
  return <NormalCard card={card} />
}
