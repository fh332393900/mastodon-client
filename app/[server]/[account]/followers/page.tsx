"use client"

import { UsersRound } from "lucide-react"
import { useParams } from "next/navigation"

import { ProfileAccountListItem } from "@/components/mastodon/profile/ProfileAccountListItem"
import { InfiniteScroller } from "@/components/mastodon/infinite-scroller"
import { useProfileViewData } from "@/hooks/mastodon/useProfileViewData"
import { useProfileAccountsList } from "@/hooks/mastodon/useProfileAccountsList"

export default function ProfileFollowersPage() {
  const params = useParams()
  const serverParam = params?.server
  const accountParam = params?.account
  const server = Array.isArray(serverParam) ? serverParam[0] : serverParam
  const account = Array.isArray(accountParam) ? accountParam[0] : accountParam

  const { data: profile, query: profileQuery } = useProfileViewData({
    server,
    account,
  })
  const { data: accounts, query } = useProfileAccountsList({
    server,
    accountId: profile?.account.id,
    type: "followers",
  })

  const { isFetchingNextPage, fetchNextPage, hasNextPage } = query

  if (profileQuery.isLoading || query.isLoading) {
    return (
      <div className="rounded-3xl border border-dashed border-border/70 bg-card/70 p-10 text-center">
        <UsersRound className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold">{"Loading..."}</p>
      </div>
    )
  }

  if (!profile || query.isError) {
    return null
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/70 bg-card/70 p-10 text-center">
        <UsersRound className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold">No followers to display yet</p>
        <p className="mt-2 text-sm text-muted-foreground">If this user has hidden their follower list, this section may be empty.</p>
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
      scrollCacheKey={`profile:${server}:${profile.account.id}:followers`}
      scrollThrottleMs={120}
    >
      <div className="space-y-4">
        {accounts.map((account) => (
          <ProfileAccountListItem
            key={account.id}
            account={account}
            currentServer={server ?? ""}
          />
        ))}
      </div>
    </InfiniteScroller>
  )
}
