"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"

export function useProfileStatuses({
  server,
  accountId,
  limit = 20,
}: {
  server?: string
  accountId?: string
  limit?: number
}) {
  const { client, isReady: isMastoReady } = useMasto()
  const { isInitialized } = useAuth()

  const isReady = isMastoReady && isInitialized

  const query = useInfiniteQuery({
    queryKey: ["profile", server, accountId, "statuses"],
    enabled: isReady && !!client && !!server && !!accountId,
    queryFn: async ({ pageParam }) => {
      if (!client || !accountId) return [] as mastodon.v1.Status[]

      const params: { limit: number; max_id?: string; excludeReplies: boolean } = {
        limit,
        excludeReplies: false,
      }

      if (pageParam) params.max_id = pageParam as string

      return client.v1.accounts.$select(accountId).statuses.list(params)
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      if (!lastPage || lastPage.length === 0) return undefined
      const lastId = lastPage[lastPage.length - 1]?.id
      if (!lastId) return undefined
      if (lastPageParam && lastId === lastPageParam) return undefined
      return lastId
    },
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  })

  const data = query.data?.pages?.flat().filter(
    (status, index, arr) => arr.findIndex((s) => s.id === status.id) === index,
  ) ?? []

  return {
    query,
    data,
  }
}
