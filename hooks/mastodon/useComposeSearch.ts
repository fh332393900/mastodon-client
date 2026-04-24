"use client"

import { useEffect, useMemo, useState } from "react"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"

type SearchType = "accounts" | "hashtags"

type SearchState = {
  accounts: mastodon.v1.Account[]
  hashtags: mastodon.v1.Tag[]
}

export function useComposeSearch(query: string, type: SearchType | null) {
  const { client, isReady: isMastoReady } = useMasto()
  const { isInitialized } = useAuth()
  const [data, setData] = useState<SearchState>({ accounts: [], hashtags: [] })
  const [isLoading, setIsLoading] = useState(false)

  const isReady = isMastoReady && isInitialized
  const normalizedQuery = useMemo(() => query.trim(), [query])

  useEffect(() => {
    if (!isReady || !client || !type || normalizedQuery.length === 0) {
      setData({ accounts: [], hashtags: [] })
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    const timer = setTimeout(async () => {
      try {
        if (!client) throw new Error("Mastodon client not ready")

        if (type === "accounts") {
          const result = await client.v2.search.list({
            q: normalizedQuery,
            type: "accounts",
            resolve: true,
            limit: 5,
          })

          if (!cancelled) {
            setData({ accounts: result.accounts ?? [], hashtags: [] })
          }

          return
        }

        const result = await client.v2.search.list({
          q: normalizedQuery,
          type: "hashtags",
          resolve: true,
          limit: 5,
        })

        if (!cancelled) {
          setData({ accounts: [], hashtags: result.hashtags ?? [] })
        }
      } catch {
        if (!cancelled) {
          setData({ accounts: [], hashtags: [] })
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [client, isReady, normalizedQuery, type])

  return {
    isLoading,
    accounts: data.accounts,
    hashtags: data.hashtags,
  }
}
