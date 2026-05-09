---
name: mastodon-client
description: Mastodon list pages should reuse InfiniteScroller, fetch via client.v1 on the client, and use React Query for data + scroll position caching with clear examples.
---

# Mastodon Client Skill

Use this skill when creating or updating Mastodon-related pages, components, or hooks.

## Core Requirements

- **Client-side only:** Mastodon API requests must run in client components/hooks using `useMasto()` and `useAuth()`.
- **List pages:** Any list/feed page must reuse `InfiniteScroller` from `components/mastodon/infinite-scroller.tsx`.
- **React Query cache:** Use React Query (`useQuery`/`useInfiniteQuery`) and update cache instead of refetch where possible.
- **Scroll cache:** Always provide a stable `scrollCacheKey` to `InfiniteScroller` for list pages.
- **Examples:** Add or update examples showing `client.v1.xxx` calls.

## Patterns

### Hook pattern (client-side query)

- Gate fetch with `isReady` from `useMasto()` + `useAuth()`.
- Use `queryKey` that includes server, params, and list type.
- Prefer `staleTime` and `gcTime` for cache reuse.

### List page pattern

- Use `InfiniteScroller` with:
  - `onLoadMore` -> `fetchNextPage`
  - `hasMore` -> `hasNextPage`
  - `isLoadingMore` -> `isFetchingNextPage`
  - `scrollCacheKey` -> stable key like `"timeline:home"`

## Example

```tsx
"use client"

import { useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { InfiniteScroller } from "@/components/mastodon/infinite-scroller"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"

export function ExampleListPage() {
  const { client, isReady: isMastoReady, server } = useMasto()
  const { isInitialized } = useAuth()
  const isReady = isMastoReady && isInitialized

  const queryKey = useMemo(() => ["example-list", server] as const, [server])

  const query = useInfiniteQuery({
    queryKey,
    enabled: isReady && !!client,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      if (!client) return []
      const api = client.v1
      return api.statuses.list({ limit: 20, maxId: pageParam })
    },
    getNextPageParam: (lastPage) => lastPage?.at(-1)?.id,
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })

  const items = query.data?.pages.flat() ?? []

  return (
    <InfiniteScroller
      onLoadMore={() => query.fetchNextPage()}
      hasMore={!!query.hasNextPage}
      isLoadingMore={query.isFetchingNextPage}
      scrollCacheKey="example:list"
    >
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id}>{item.id}</div>
        ))}
      </div>
    </InfiniteScroller>
  )
}
```

## Cache Updates

- For mutations, update existing cached lists using `useQueryCacheTools()`.
- Avoid full refetch if the item can be inserted/updated in cached pages.

## Done Checklist

- List page uses `InfiniteScroller` and provides `scrollCacheKey`.
- API calls are `client.v1.xxx` in client hooks/components.
- Query cache is used for data and scroll position (via `InfiniteScroller`).
- Examples are updated and reflect current API usage.
