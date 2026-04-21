"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Users, Loader2, UserPlus, UserCheck, UserX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LoadingSkeleton } from "@/components/mastodon/infinite-scroller"
import { cn } from "@/lib/utils"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { getAccountProfileHref } from "@/lib/mastodon/account"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"
import { UserHoverCard } from "@/components/mastodon/user-hover-card"
import { useExploreSuggestedAccountsCache } from "@/hooks/mastodon/useExploreSuggestedAccountsCache"
import type { mastodon } from "masto"
import type { AccountSuggestion } from "@/hooks/mastodon/useExploreSuggestedAccountsCache"

// ── 推荐原因文案映射 ─────────────────────────────────────
const SOURCE_LABEL: Record<string, string> = {
  featured: "你关注的人推荐了 TA",
  most_followed: "热门关注账号",
  most_interactions: "互动频繁账号",
  similar_to_recently_followed: "与你最近关注的账号相似",
  friends_of_friends: "共同好友关注",
}

function sourceLabel(sources: string[]): string | null {
  if (!sources.length) return null
  return SOURCE_LABEL[sources[0]] ?? sources[0].replace(/_/g, " ")
}

// ── 单条推荐卡片 ─────────────────────────────────────────
function SuggestionCard({ suggestion, server }: { suggestion: AccountSuggestion; server?: string }) {
  const { client } = useMasto()
  const { user } = useAuth()
  const canInteract = !!client && !!user

  const a = suggestion.account
  const href = server ? getAccountProfileHref(a, server) : undefined
  const nameText = getDisplayNameText({ displayName: a.displayName, username: a.username })
  console.log(suggestion, 'suggestion.sources')
  const reason = sourceLabel(suggestion.sources)

  const [relationship, setRelationship] = useState<mastodon.v1.Relationship | null>(null)
  const [loadingRel, setLoadingRel] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // 初始加载 relationship
  useEffect(() => {
    if (!canInteract) return
    let cancelled = false
    setLoadingRel(true)
    ;(async () => {
      try {
        const rels = await client!.v1.accounts.relationships.fetch({ id: [a.id] })
        if (!cancelled) setRelationship(rels[0] ?? null)
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoadingRel(false)
      }
    })()
    return () => { cancelled = true }
  }, [canInteract, a.id])

  const isFollowing = !!relationship?.following
  const isRequested = !!relationship?.requested

  const handleToggleFollow = async () => {
    if (!client || !canInteract || isPending) return
    setIsPending(true)
    try {
      const next = isFollowing
        ? await client.v1.accounts.$select(a.id).unfollow()
        : await client.v1.accounts.$select(a.id).follow()
      setRelationship(next)
    } finally {
      setIsPending(false)
    }
  }

  const btnContent = () => {
    if (isPending || loadingRel) return <Loader2 className="h-4 w-4 animate-spin" />
    if (isFollowing) {
      return isHovering ? (
        <><UserX className="h-4 w-4" />取消关注</>
      ) : (
        <><UserCheck className="h-4 w-4" />已关注</>
      )
    }
    if (isRequested) return <><Loader2 className="h-4 w-4" />待审核</>
    return <><UserPlus className="h-4 w-4" />关注</>
  }

  return (
    <div className="rounded-3xl border border-border/70 bg-card/90 p-4 transition hover:border-border hover:bg-card">
      {reason && (
        <p className="mb-2 text-xs text-muted-foreground/70">{reason}</p>
      )}
      <div className="flex items-center gap-3">
        {/* 头像 */}
        <UserHoverCard account={a} profileHref={href} className="shrink-0">
          {href ? (
            <Link href={href}>
              <Avatar className="h-11 w-11 ring-2 ring-border/70 transition hover:ring-primary/60">
                <AvatarImage src={a.avatar} alt={nameText} />
                <AvatarFallback>{nameText.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-11 w-11 ring-2 ring-border/70">
              <AvatarImage src={a.avatar} alt={nameText} />
              <AvatarFallback>{nameText.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
        </UserHoverCard>

        {/* 名称 + acct */}
        <div className="min-w-0 flex-1">
          <UserHoverCard account={a} profileHref={href}>
            <div className="cursor-pointer">
              <div className="font-medium truncate leading-tight">
                {renderDisplayName({ displayName: a.displayName, username: a.username, emojis: a.emojis })}
              </div>
              <div className="text-sm text-muted-foreground truncate">@{a.acct}</div>
            </div>
          </UserHoverCard>
          {a.note && (
            <p
              className="mt-1 text-xs text-muted-foreground line-clamp-1"
              dangerouslySetInnerHTML={{ __html: a.note }}
            />
          )}
        </div>

        {/* 关注按钮 */}
        <Button
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          className={cn(
            "shrink-0 gap-1.5 transition-all rounded-full",
            isFollowing && isHovering && "border-destructive/60 text-destructive hover:bg-destructive/10",
            !canInteract && "opacity-50 cursor-not-allowed",
          )}
          disabled={!canInteract || isPending || loadingRel || isRequested}
          onClick={handleToggleFollow}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {btnContent()}
        </Button>
      </div>
    </div>
  )
}

// ── 页面 ─────────────────────────────────────────────────
export default function ExploreSuggestedPage() {
  const { suggestions, query, isReady } = useExploreSuggestedAccountsCache()
  const { server } = useMasto()
  const { isLoading } = query

  const title = useMemo(() => "Suggested", [])

  if (!isReady || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {title}
          </h2>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {title}
        </h2>
        <Badge variant="outline" className="text-accent border-accent/50">
          {suggestions.length} accounts
        </Badge>
      </div>

      {suggestions.length === 0 ? (
        <div className="rounded-3xl border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
          暂无推荐关注。
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <SuggestionCard key={s.account.id} suggestion={s} server={server} />
          ))}
        </div>
      )}
    </div>
  )
}
