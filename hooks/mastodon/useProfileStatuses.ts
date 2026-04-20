"use client"

import { useQuery } from "@tanstack/react-query"
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

  const query = useQuery<mastodon.v1.Status[]>({
    queryKey: ["profile", server, accountId, "statuses"],
    enabled: isReady && !!client && !!server && !!accountId,
    queryFn: async () => {
      if (!client || !accountId) return []

      return client.v1.accounts.$select(accountId).statuses.list({
        limit,
        excludeReplies: false,
      })
    },
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  })

  return {
    query,
    data: query.data ?? [],
  }
}
