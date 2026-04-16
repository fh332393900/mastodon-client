"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { InfiniteScroller } from "@/components/mastodon/infinite-scroller"
import { StatusCard } from "@/components/mastodon/status-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { mastodon } from "masto"

type TimelineType = "public" | "home" | "local"

export function TimelineFeed() {
  const [timelineType, setTimelineType] = useState<TimelineType>("home")

  const { client, isReady: isMastoReady } = useMasto()
  const { user, isInitialized: isAuthReady } = useAuth()

  const isReady = isMastoReady && isAuthReady
  const limit = 20

  const queryKey = useMemo(() => ["timeline", timelineType, user ? "authed" : "public"] as const, [timelineType, user])

  const fetchPage = useCallback(
    async ({ pageParam }: { pageParam?: string }) => {
      if (!client) return [] as mastodon.v1.Status[]

      const params: any = { limit }
      if (pageParam) params.max_id = pageParam

      const timelineApi = client.v1.timelines
      let res: mastodon.v1.Status[] = []

      switch (timelineType) {
        case "home":
          if (user) res = await timelineApi.home.list(params)
          else res = await timelineApi.public.list({ ...params, local: true })
          break
        case "local":
          res = await timelineApi.public.list({ ...params, local: true })
          break
        case "public":
        default:
          res = await timelineApi.public.list(params)
          break
      }

      return res ?? []
    },
    [client, timelineType, user],
  )

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage({ pageParam }),
    enabled: isReady && !!client && (timelineType !== "home" || !!user),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < limit) return undefined
      return lastPage[lastPage.length - 1]?.id
    },
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })

  const posts = useMemo(() => {
    const pages = data?.pages ?? []
    // flatten + de-dup
    const seen = new Set<string>()
    const out: mastodon.v1.Status[] = []
    for (const page of pages) {
      for (const s of page) {
        if (!seen.has(s.id)) {
          seen.add(s.id)
          out.push(s)
        }
      }
    }
    return out
  }, [data])

  // Persist/restore scroll position per timelineType using sessionStorage.
  const restoringRef = useRef(false)
  const scrollPositionRef = useRef(0)
  useEffect(() => {
    if (!isReady) return

    const raw = sessionStorage.getItem(`timeline:scroll:${timelineType}`)
    scrollPositionRef.current =  raw ? Number(raw) || 0 : 0

    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY
      sessionStorage.setItem(`timeline:scroll:${timelineType}`, String(scrollPositionRef.current))
    }


    restoringRef.current = true
    requestAnimationFrame(() => {
      try {
        const raw = sessionStorage.getItem(`timeline:scroll:${timelineType}`)
        const y = raw ? Number(raw) || 0 : 0
        scrollPositionRef.current = y
        window.scrollTo({ top: y })
      } catch {
        // ignore
      } finally {
        restoringRef.current = false
      }
    })

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [timelineType, isReady])

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }

  const handleTimelineChange = (type: TimelineType) => {
    try {
      sessionStorage.setItem(`timeline:scroll:${timelineType}`, String(window.scrollY))
    } catch {
      // ignore
    }
    setTimelineType(type)
  }


  const timelineTitle = useMemo(() => {
    switch (timelineType) {
      case "home": return "Home Timeline"
      case "local": return "Local Community"
      case "public": return "Public Fediverse"
    }
  }, [timelineType])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Loading Timeline...</h1>
        {/* Initial loading skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-card/50 p-4 rounded-lg">
              <div className="h-4 bg-muted w-1/3 rounded"></div>
              <div className="h-4 bg-muted w-3/4 rounded mt-2"></div>
            </div>
          ))}
        </div>
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
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-xs">
            Refresh
          </Button>
        </div>
      </div>

      <InfiniteScroller
        onLoadMore={handleLoadMore}
        hasMore={!!hasNextPage}
        isLoadingMore={isFetchingNextPage}
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
