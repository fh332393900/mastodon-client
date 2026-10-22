/**
 * football-data.org 赛程/积分榜数据:只在服务端调用，避免把 token 暴露给浏览器。
 * 需配置 FOOTBALL_DATA_TOKEN；未配置或请求失败时返回空数组，由调用方降级。
 */

const API_BASE = "https://api.football-data.org/v4"
/** 往前取多少天已结束的比赛，用于展示近期赛程。 */
const DAYS_BACK = 10
/** 往后取多少天未开始的比赛，用于展示未来赛程。 */
const DAYS_AHEAD = 21
/** 服务端缓存时长，免费额度只有 10 次/分钟。 */
const REVALIDATE_SECONDS = 300

export interface FootballTeam {
  id: number | null
  name: string
  shortName: string
  tla: string
  crest: string
}

export interface FootballFixture {
  id: number
  utcDate: string
  /** SCHEDULED / TIMED / IN_PLAY / PAUSED / FINISHED */
  status: string
  matchday: number | null
  home: FootballTeam
  away: FootballTeam
  homeScore: number | null
  awayScore: number | null
  /** 半场比分，未结束或无数据时为 null */
  halfTimeHome: number | null
  halfTimeAway: number | null
}

export interface FootballStandingEntry {
  position: number
  team: FootballTeam
  playedGames: number
  won: number
  draw: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  /** 最近 5 场战绩，如 ["W","D","L"]（旧→新） */
  form: string[]
}

interface RawTeam {
  id?: number | null
  name?: string | null
  shortName?: string | null
  tla?: string | null
  crest?: string | null
}

interface RawMatch {
  id?: number
  utcDate?: string
  status?: string
  matchday?: number | null
  homeTeam?: RawTeam
  awayTeam?: RawTeam
  score?: {
    fullTime?: { home?: number | null; away?: number | null } | null
    halfTime?: { home?: number | null; away?: number | null } | null
  } | null
}

function toTeam(raw?: RawTeam): FootballTeam {
  const name = raw?.name ?? "TBD"
  return {
    id: raw?.id ?? null,
    name,
    shortName: raw?.shortName ?? name,
    tla: raw?.tla ?? "",
    crest: raw?.crest ?? "",
  }
}

function toFixture(match: RawMatch): FootballFixture {
  return {
    id: match.id ?? 0,
    utcDate: match.utcDate ?? "",
    status: match.status ?? "SCHEDULED",
    matchday: match.matchday ?? null,
    home: toTeam(match.homeTeam),
    away: toTeam(match.awayTeam),
    homeScore: match.score?.fullTime?.home ?? null,
    awayScore: match.score?.fullTime?.away ?? null,
    halfTimeHome: match.score?.halfTime?.home ?? null,
    halfTimeAway: match.score?.halfTime?.away ?? null,
  }
}

function toDateParam(offsetDays: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

interface RawStandingRow {
  position?: number
  team?: RawTeam
  playedGames?: number
  won?: number
  draw?: number
  lost?: number
  goalsFor?: number
  goalsAgainst?: number
  goalDifference?: number
  points?: number
  form?: string | null
}

/**
 * 拉取指定联赛「近期结果 + 未来赛程」窗口内的比赛，按开赛时间升序返回。
 * 未配置 token 或请求失败时返回空数组，由调用方决定降级表现。
 */
export async function fetchFootballFixtures(competition: string): Promise<FootballFixture[]> {
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return []

  const params = new URLSearchParams({
    dateFrom: toDateParam(-DAYS_BACK),
    dateTo: toDateParam(DAYS_AHEAD),
  })

  try {
    const response = await fetch(
      `${API_BASE}/competitions/${competition}/matches?${params.toString()}`,
      {
        headers: { "X-Auth-Token": token },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    )
    if (!response.ok) return []

    const payload = (await response.json()) as { matches?: RawMatch[] }
    return (payload.matches ?? [])
      .map(toFixture)
      .filter((fixture) => fixture.utcDate && fixture.home.tla && fixture.away.tla)
      .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
  } catch {
    return []
  }
}

/** 英超赛程（Explore 页顶部赛程条沿用）。 */
export function fetchPremierLeagueFixtures(): Promise<FootballFixture[]> {
  return fetchFootballFixtures("PL")
}

/** 拉取指定联赛积分榜（TOTAL 表）。失败或未配置 token 时返回空数组。 */
export async function fetchFootballStandings(competition: string): Promise<FootballStandingEntry[]> {
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return []

  try {
    const response = await fetch(`${API_BASE}/competitions/${competition}/standings`, {
      headers: { "X-Auth-Token": token },
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!response.ok) return []

    const payload = (await response.json()) as {
      standings?: { type?: string; table?: RawStandingRow[] }[]
    }
    const total =
      payload.standings?.find((standing) => standing.type === "TOTAL") ??
      payload.standings?.[0]

    return (total?.table ?? []).map((row) => ({
      position: row.position ?? 0,
      team: toTeam(row.team),
      playedGames: row.playedGames ?? 0,
      won: row.won ?? 0,
      draw: row.draw ?? 0,
      lost: row.lost ?? 0,
      goalsFor: row.goalsFor ?? 0,
      goalsAgainst: row.goalsAgainst ?? 0,
      goalDifference: row.goalDifference ?? 0,
      points: row.points ?? 0,
      form: (row.form ?? "").split(",").map((v) => v.trim()).filter(Boolean),
    }))
  } catch {
    return []
  }
}
