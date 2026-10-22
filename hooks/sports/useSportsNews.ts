"use client"

import { useQuery } from "@tanstack/react-query"
import type { SportsNewsItem } from "@/lib/sports/news"

const EMPTY_NEWS: SportsNewsItem[] = []

/** 指定运动方向的最新资讯（RSS）。 */
export function useSportsNews(sport: string) {
  return useQuery({
    queryKey: ["sports", "news", sport] as const,
    queryFn: async () => {
      const response = await fetch(`/api/sports/news?sport=${sport}`)
      if (!response.ok) return EMPTY_NEWS
      const payload = (await response.json()) as { news?: SportsNewsItem[] }
      return payload.news ?? EMPTY_NEWS
    },
    staleTime: 15 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: EMPTY_NEWS,
  })
}
