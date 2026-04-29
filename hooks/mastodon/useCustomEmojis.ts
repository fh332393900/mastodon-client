"use client"

import { useQuery } from "@tanstack/react-query"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import type { mastodon } from "masto"

/**
 * Fetch and cache the full list of custom emojis for the current server.
 * Results are cached for 10 minutes and shared across all components via React Query.
 */
export function useCustomEmojis(): mastodon.v1.CustomEmoji[] {
  const { client, isReady: isMastoReady, server } = useMasto()
  const { isInitialized } = useAuth()

  const isReady = isMastoReady && isInitialized

  const { data } = useQuery<mastodon.v1.CustomEmoji[]>({
    queryKey: ["custom-emojis", server],
    enabled: isReady && !!client,
    queryFn: async () => {
      if (!client) return []
      return client.v1.customEmojis.list()
    },
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    // Never throw — gracefully return empty list on error
    retry: false,
  })

  return data ?? []
}
