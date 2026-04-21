"use client"

import { useMemo } from "react"
import { Heart } from "lucide-react"
import { InfiniteScroller, LoadingSkeleton } from "@/components/mastodon/infinite-scroller"
import { StatusCard } from "@/components/mastodon/Status"
import { Badge } from "@/components/ui/badge"
import { useFavoritesCache } from "@/hooks/mastodon/useFavoritesCache"

export default function FavoritesPage() {
  const { posts, query, isReady, user } = useFavoritesCache()
  const { isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = query

  const headerTitle = useMemo(() => (user ? "Favorites" : "Sign in to view favorites"), [user])

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }

  if (!isReady || isLoading) {
    return (
      <div className="space-y-6 px-4 py-6">
        <div className="flex items-center space-x-3 border-b border-border pb-4">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold">Favorites</h1>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="flex items-center space-x-3 border-b border-border pb-4">
        <Heart className="w-8 h-8 text-red-500" />
        <h1 className="text-3xl font-bold">{headerTitle}</h1>
        <Badge variant="outline" className="ml-auto text-accent border-accent/50">
          {posts.length} posts
        </Badge>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
          {user
            ? "Your favorite posts will appear here once you start liking content."
            : "Please sign in to view your favorite posts."}
        </div>
      ) : (
        <InfiniteScroller
          onLoadMore={handleLoadMore}
          hasMore={!!hasNextPage}
          isLoadingMore={isFetchingNextPage}
          scrollCacheKey="favorites"
          scrollThrottleMs={120}
        >
          <div className="space-y-6">
            {posts.map((post) => (
              <StatusCard key={post.id} status={post} />
            ))}
          </div>
        </InfiniteScroller>
      )}
    </div>
  )
}
