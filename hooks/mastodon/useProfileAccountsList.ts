"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"

export function useProfileAccountsList({
  server,
  accountId,
  type,
  limit = 40,
}: {
  server?: string
  accountId?: string
  type: "followers" | "following"
  limit?: number
}) {
  const { client, isReady: isMastoReady } = useMasto()
  const { isInitialized } = useAuth()

  const isReady = isMastoReady && isInitialized

  const query = useInfiniteQuery({
    queryKey: ["profile", server, accountId, type],
    enabled: isReady && !!client && !!server && !!accountId,
    queryFn: async ({ pageParam }) => {
      if (!client || !accountId) return [] as mastodon.v1.Account[]

      const params: { limit: number; max_id?: string } = { limit }
      if (pageParam) params.max_id = pageParam as string

      return client.v1.accounts.$select(accountId)[type].list(params)
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
    (account, index, arr) => arr.findIndex((a) => a.id === account.id) === index,
  ) ?? []

  return {
    query,
    data,
  }
}
