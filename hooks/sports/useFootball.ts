"use client"

import { useQuery } from "@tanstack/react-query"
import type { FootballFixture, FootballStandingEntry } from "@/lib/football-data"

async function fetchJson<T>(url: string, key: string): Promise<T[]> {
  const response = await fetch(url)
  if (!response.ok) return []
  const payload = (await response.json()) as Record<string, T[] | undefined>
  return payload[key] ?? []
}

/** 指定联赛「近期赛果 + 未来赛程」。 */
export function useFootballFixtures(league: string) {
  return useQuery({
    queryKey: ["sports", "football", "fixtures", league] as const,
    queryFn: () =>
      fetchJson<FootballFixture>(
        `/api/sports/football?league=${league}&type=fixtures`,
        "fixtures",
      ),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })
}

/** 指定联赛积分榜。 */
export function useFootballStandings(league: string) {
  return useQuery({
    queryKey: ["sports", "football", "standings", league] as const,
    queryFn: () =>
      fetchJson<FootballStandingEntry>(
        `/api/sports/football?league=${league}&type=standings`,
        "standings",
      ),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })
}
