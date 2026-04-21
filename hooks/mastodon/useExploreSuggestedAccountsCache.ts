"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"

export interface UseExploreSuggestedAccountsCacheOptions {
  limit?: number
}

export type AccountSuggestion = {
  account: mastodon.v1.Account
  sources: string[]
}

/** Suggested accounts (Explore -> Suggested). */
export function useExploreSuggestedAccountsCache({ limit = 20 }: UseExploreSuggestedAccountsCacheOptions = {}) {
  const { client, isReady: isMastoReady } = useMasto()
  const { isInitialized: isAuthReady, user } = useAuth()

  const isReady = isMastoReady && isAuthReady
  const queryKey = useMemo(() => ["explore", "suggested", user ? "authed" : "guest", limit] as const, [user, limit])

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!client) return [] as AccountSuggestion[]
      const api: any = client.v2 as any

      // Mastodon suggests are usually for authenticated users.
      const res = (await api?.suggestions?.list?.({ limit })) as any[] | undefined
      const arr = res ?? []

      return arr.map((x: any) => ({
        account: (x?.account ?? x) as mastodon.v1.Account,
        sources: Array.isArray(x?.sources) ? x.sources : [],
      })) as AccountSuggestion[]
    },
    enabled: isReady && !!client,
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })

  const suggestions = query.data ?? ([] as AccountSuggestion[])
  // backwards compat
  const accounts = suggestions.map((s) => s.account)

  return {
    queryKey,
    suggestions,
    accounts,
    query,
    isReady,
    user,
  }
}
