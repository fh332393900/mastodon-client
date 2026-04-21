"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Star } from "lucide-react"
import { InfiniteScroller, LoadingSkeleton } from "@/components/mastodon/infinite-scroller"
import { StatusCard } from "@/components/mastodon/Status"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "@/components/auth/masto-provider"
import { useTagTimelineCache } from "@/hooks/mastodon/useTagTimelineCache"

export default function TagPage() {
  const params = useParams()
  const tag = Array.isArray(params.tag) ? params.tag[0] : params.tag
  const tagName = decodeURIComponent(tag ?? "")

  const { client } = useMasto()
  const { user } = useAuth()
  const canInteract = !!client && !!user
  const [following, setFollowing] = useState(false)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (!canInteract || !tagName) return
    let cancelled = false
    ;(async () => {
      try {
        const tagInfo = await (client!.v1.tags as any).$select(tagName).fetch()
        if (!cancelled) {
          setFollowing(Boolean(tagInfo?.following))
        }
      } catch {
        if (!cancelled) {
          setFollowing(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [canInteract, client, tagName])

  const handleToggleFollow = async () => {
    if (!canInteract || isPending || !tagName) return
    setIsPending(true)
    try {
      if (following) {
        await (client!.v1.tags as any).$select(tagName).unfollow()
      } else {
        await (client!.v1.tags as any).$select(tagName).follow()
      }
      setFollowing((prev) => !prev)
    } catch {
      // ignore
    } finally {
      setIsPending(false)
    }
  }

  const { posts, query, isReady } = useTagTimelineCache({ tag: tagName, limit: 20 })
  const { isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = query

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }

  const headerTitle = useMemo(() => `#${tagName}`, [tagName])

  if (!isReady || isLoading) {
    return (
      <div className="space-y-6">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/80 px-1 py-3 backdrop-blur">
          <h1 className="text-2xl font-bold text-primary">{headerTitle}</h1>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Star className="h-4 w-4" />
          </Button>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/80 px-1 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-primary">{headerTitle}</h1>
          <Badge variant="outline" className="text-accent border-accent/50">
            {posts.length} posts
          </Badge>
        </div>
        <Button
          variant={following ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-9 w-9 rounded-full p-0 transition-colors",
            following ? "bg-yellow-400 text-white hover:bg-yellow-500" : "text-muted-foreground",
          )}
          onClick={handleToggleFollow}
          disabled={!canInteract || isPending}
          aria-label={following ? "取消收藏话题" : "收藏话题"}
        >
          <Star className="h-4 w-4" />
        </Button>
      </div>

      <InfiniteScroller
        onLoadMore={handleLoadMore}
        hasMore={!!hasNextPage}
        isLoadingMore={isFetchingNextPage}
        scrollCacheKey={`tag:${tagName}`}
        scrollThrottleMs={120}
      >
        <div className="space-y-6 px-4 pb-2">
          {posts.map((post) => (
            <StatusCard key={post.id} status={post} />
          ))}
        </div>
      </InfiniteScroller>
    </div>
  )
}
