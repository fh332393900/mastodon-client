"use client"

import { useMemo, useState } from "react"
import { InfiniteScroller, LoadingSkeleton } from "@/components/mastodon/infinite-scroller"
import { StatusCard } from "@/components/mastodon/StatusCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTimelineCache, type TimelineType } from "@/hooks/mastodon/useTimelineCache"

export function TimelineFeed() {
  const [timelineType, setTimelineType] = useState<TimelineType>("home")

  const { posts, query, isReady, user } = useTimelineCache({ timelineType })
  const { isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = query

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
          {posts.map((post) => (
            <StatusCard key={post.id} status={post} />
          ))}
        </div>
      </InfiniteScroller>
    </div>
  )
}
