"use client"

import { useMemo } from "react"
import { InfiniteScroller, LoadingSkeleton } from "@/components/mastodon/infinite-scroller"
import { StatusCard } from "@/components/mastodon/StatusCard"
import { Badge } from "@/components/ui/badge"
import { useExplorePostsCache } from "@/hooks/mastodon/useExplorePostsCache"
import type { mastodon } from "masto"

export default function ExplorePostsPage() {
  const { posts, query, isReady } = useExplorePostsCache()
  const { isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = query

  const title = useMemo(() => "Trending Posts", [])

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }

  if (!isReady || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Badge variant="outline" className="text-accent border-accent/50">
          {posts.length} posts
        </Badge>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
          暂无热门贴文。
        </div>
      ) : (
        <InfiniteScroller
          onLoadMore={handleLoadMore}
          hasMore={!!hasNextPage}
          isLoadingMore={isFetchingNextPage}
          scrollCacheKey="explore:posts"
          scrollThrottleMs={120}
        >
          <div className="space-y-6">
            {posts.map((post: mastodon.v1.Status) => (
              <StatusCard key={post.id} status={post} />
            ))}
          </div>
        </InfiniteScroller>
      )}
    </div>
  )
}
