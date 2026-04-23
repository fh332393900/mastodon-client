"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"

const getScrollKey = (server: string, statusId: string) => `scroll:status:${server}:${statusId}`

export function useStatusDetail(server: string | undefined, statusId: string | undefined) {
  const { client, isReady } = useMasto()

  const queryKey = ["status-detail", server, statusId]

  const query = useQuery({
    queryKey,
    enabled: isReady && !!client && !!server && !!statusId,
    queryFn: async () => {
      if (!client || !statusId) return null
      const fetched = await client.v1.statuses.$select(statusId).fetch()
      const context = await client.v1.statuses.$select(statusId).context.fetch()
      return {
        status: fetched,
        replies: context?.descendants ?? [],
      }
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })

  useEffect(() => {
    if (!server || !statusId) return
    const key = getScrollKey(server, statusId)
    const saved = sessionStorage.getItem(key)
    if (saved) {
      const y = Number(saved)
      if (!Number.isNaN(y)) {
        window.scrollTo({ top: y, behavior: "auto" })
      }
    }

    const onScroll = () => {
      sessionStorage.setItem(key, String(window.scrollY))
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [server, statusId])

  return query
}
