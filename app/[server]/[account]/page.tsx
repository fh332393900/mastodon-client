"use client"

import { useMemo } from "react"
import { MessageCircleMore } from "lucide-react"
import { useParams } from "next/navigation"

import { InfiniteScroller } from "@/components/mastodon/infinite-scroller"
import { StatusCard, StatusThread } from "@/components/mastodon/Status"
import { useProfileViewData } from "@/hooks/mastodon/useProfileViewData"
import { useProfileStatuses } from "@/hooks/mastodon/useProfileStatuses"
import { groupThreadPosts } from "@/lib/mastodon/groupThreads"

export default function ProfilePostsPage() {
  const params = useParams()
  const serverParam = params?.server
  const accountParam = params?.account
  const server = Array.isArray(serverParam) ? serverParam[0] : serverParam
  const account = Array.isArray(accountParam) ? accountParam[0] : accountParam

  const { data: profile, query: profileQuery } = useProfileViewData({
    server,
    account,
  })
  const { data: statuses, query: statusQuery } = useProfileStatuses({
    server,
    accountId: profile?.account.id,
  })

  const { isFetchingNextPage, fetchNextPage, hasNextPage } = statusQuery

  const groupedStatuses = useMemo(() => groupThreadPosts(statuses), [statuses])

  if (profileQuery.isLoading || statusQuery.isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-border/70 bg-card/70 p-10 text-center">
        <MessageCircleMore className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    )
  }

  if (!profile || statusQuery.isError) {
    return null
  }

  if (statuses.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/70 bg-card/70 p-10 text-center">
        <MessageCircleMore className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold">No public posts yet</p>
        <p className="mt-2 text-sm text-muted-foreground">This account currently has no public posts to display.</p>
      </div>
    )
  }

  return (
    <InfiniteScroller
      onLoadMore={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
      }}
      hasMore={!!hasNextPage}
      isLoadingMore={isFetchingNextPage}
      scrollCacheKey={`profile:${server}:${profile.account.id}:statuses`}
      scrollThrottleMs={120}
    >
      <div className="space-y-4">
        {groupedStatuses.map((group) =>
          group.length > 1 ? (
            <StatusThread key={group[0].id} statuses={group} />
          ) : (
            <StatusCard key={group[0].id} status={group[0]} />
          )
        )}
      </div>
    </InfiniteScroller>
  )
}
