"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type { FootballFixture } from "@/lib/football-data"

const EMPTY_FIXTURES: FootballFixture[] = []
/** 赛程条一屏展示的卡片数量。 */
const VISIBLE_COUNT = 12
/** 首屏保留的「近期结果」卡片数量，其余位置留给未来赛程。 */
const RECENT_COUNT = 2

async function fetchFixtures(): Promise<FootballFixture[]> {
  const response = await fetch("/api/fixtures")
  if (!response.ok) return EMPTY_FIXTURES
  const payload = (await response.json()) as { fixtures?: FootballFixture[] }
  return payload.fixtures ?? EMPTY_FIXTURES
}

/**
 * 从「近期 + 未来」窗口里截取靠近当前时间的片段，
 * 让首屏既能看到刚结束的比赛，也能看到接下来要踢的比赛。
 */
function pickVisibleFixtures(fixtures: FootballFixture[]): FootballFixture[] {
  if (fixtures.length <= VISIBLE_COUNT) return fixtures

  const now = Date.now()
  const upcomingIndex = fixtures.findIndex(
    (fixture) => new Date(fixture.utcDate).getTime() >= now,
  )
  const start =
    upcomingIndex === -1
      ? fixtures.length - VISIBLE_COUNT
      : Math.max(0, upcomingIndex - RECENT_COUNT)

  return fixtures.slice(start, start + VISIBLE_COUNT)
}

/** 英超赛程条数据源（Explore 页顶部）。 */
export function usePremierLeagueFixtures() {
  const query = useQuery({
    queryKey: ["explore", "premier-league-fixtures"] as const,
    queryFn: fetchFixtures,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })

  const fixtures = useMemo(
    () => pickVisibleFixtures(query.data ?? EMPTY_FIXTURES),
    [query.data],
  )

  return { fixtures, query }
}
