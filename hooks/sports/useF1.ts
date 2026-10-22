"use client"

import { useQuery } from "@tanstack/react-query"
import type {
  F1ConstructorStanding,
  F1DriverStanding,
  F1RaceDetail,
  F1Race,
} from "@/lib/sports/f1"

async function fetchF1<T>(query: string, key: string): Promise<T> {
  const response = await fetch(`/api/sports/f1?${query}`)
  if (!response.ok) throw new Error("f1 fetch failed")
  const payload = (await response.json()) as Record<string, T>
  return payload[key]
}

const sharedOptions = {
  staleTime: 30 * 60_000,
  gcTime: 60 * 60_000,
  refetchOnWindowFocus: false,
} as const

/** 本赛季 F1 赛历。 */
export function useF1Schedule() {
  return useQuery({
    queryKey: ["sports", "f1", "schedule"] as const,
    queryFn: () => fetchF1<F1Race[]>("type=schedule", "races"),
    ...sharedOptions,
  })
}

/** 指定轮次大奖赛结果（不传为最近一场），含轮胎策略/天气细节。 */
export function useF1RaceResults(round?: number) {
  return useQuery({
    queryKey: ["sports", "f1", "results", round ?? "last"] as const,
    queryFn: () =>
      fetchF1<F1RaceDetail | null>(
        round ? `type=results&round=${round}` : "type=results",
        "race",
      ),
    ...sharedOptions,
  })
}

/** 车手积分榜。 */
export function useF1DriverStandings() {
  return useQuery({
    queryKey: ["sports", "f1", "drivers"] as const,
    queryFn: () => fetchF1<F1DriverStanding[]>("type=drivers", "standings"),
    ...sharedOptions,
  })
}

/** 车队积分榜。 */
export function useF1ConstructorStandings() {
  return useQuery({
    queryKey: ["sports", "f1", "teams"] as const,
    queryFn: () => fetchF1<F1ConstructorStanding[]>("type=teams", "standings"),
    ...sharedOptions,
  })
}
