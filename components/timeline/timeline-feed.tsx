"use client"

import { useMemo, useState } from "react"
import { InfiniteScroller, LoadingSkeleton } from "@/components/mastodon/infinite-scroller"
import { StatusCard, StatusThread } from "@/components/mastodon/Status"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTimelineCache, type TimelineType } from "@/hooks/mastodon/useTimelineCache"
import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "@/components/auth/masto-provider"
import { groupThreadPosts } from "@/lib/mastodon/groupThreads"

export function TimelineFeed() {
  const { accessToken } = useMasto()
  const [timelineType, setTimelineType] = useState<TimelineType>(() => accessToken ? "home" : "local")

  const { posts, query, isReady, user } = useTimelineCache({ timelineType })
  const { isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = query

  const groupedPosts = useMemo(() => groupThreadPosts(posts), [posts])

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }

  const handleTimelineChange = (type: TimelineType) => {
    setTimelineType(type)
  }


  const timelineTitle = useMemo(() => {
    switch (timelineType) {
      case "home": return "Home Timeline"
      case "local": return "Local Community"
      case "public": return "Public Fediverse"
    }
  }, [timelineType])

  if (!isReady || isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Loading Timeline...</h1>
        {/* Initial loading skeleton */}
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">{timelineTitle}</h1>
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg border border-border/50 p-1">
            {(["public", "local", "home"] as const).map((type) => (
              <Button
                key={type}
                variant={timelineType === type ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTimelineChange(type)}
                className="capitalize text-xs"
                disabled={type === 'home' && !user}
              >
                {type}
              </Button>
            ))}
          </div>
          <Badge variant="outline" className="text-accent border-accent/50">
            {posts.length} posts
          </Badge>
        </div>
      </div>

      <InfiniteScroller
        onLoadMore={handleLoadMore}
        hasMore={!!hasNextPage}
        isLoadingMore={isFetchingNextPage}
        scrollCacheKey={`timeline:${timelineType}`}
        scrollThrottleMs={120}
      >
        <div className="space-y-6">
          {groupedPosts.map((group) =>
            group.length > 1 ? (
              <StatusThread key={group[0].id} statuses={group} />
            ) : (
              <StatusCard key={group[0].id} status={group[0]} />
            )
          )}
        </div>
      </InfiniteScroller>
    </div>
  )
}
