/**
 * football-data.org 英超赛程数据：只在服务端调用，避免把 token 暴露给浏览器。
 */

const API_BASE = "https://api.football-data.org/v4"
const COMPETITION = "PL"
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
  }
}

function toDateParam(offsetDays: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

/**
 * 拉取英超「近期结果 + 未来赛程」窗口内的比赛，按开赛时间升序返回。
 * 未配置 token 或请求失败时返回空数组，由调用方决定降级表现。
 */
export async function fetchPremierLeagueFixtures(): Promise<FootballFixture[]> {
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return []

  const params = new URLSearchParams({
    dateFrom: toDateParam(-DAYS_BACK),
    dateTo: toDateParam(DAYS_AHEAD),
  })

  try {
    const response = await fetch(
      `${API_BASE}/competitions/${COMPETITION}/matches?${params.toString()}`,
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
