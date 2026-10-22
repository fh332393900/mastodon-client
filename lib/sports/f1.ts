/**
 * F1 数据：Jolpica-F1（Ergast 兼容）免费 API，无需 token。
 * 只在服务端调用，结果经 Next.js fetch 缓存。
 */

const API_BASE = "https://api.jolpi.ca/ergast/f1"
/** OpenF1 提供车手头像与车队配色（免费，无需 key）。 */
const OPENF1_BASE = "https://api.openf1.org/v1"
/** F1 数据变化频率低，缓存 1 小时。 */
const REVALIDATE_SECONDS = 3600

export interface F1Race {
  round: number
  raceName: string
  circuitName: string
  locality: string
  country: string
  date: string
  time: string
  url: string
}

export interface F1RaceResult {
  position: number
  driver: string
  driverCode: string
  team: string
  points: number
  /** 完赛时间/差距；未完赛时为空 */
  time: string
  status: string
  /** 发车位 */
  grid: number
  /** 完成圈数 */
  laps: number
  /** 最快圈信息，无则 null */
  fastestLap: { rank: number; time: string } | null
  /** 换胎统计，无数据时 null */
  pitStops: { count: number; totalSeconds: number } | null
}

export interface F1LastRace {
  raceName: string
  round: number
  date: string
  results: F1RaceResult[]
}

export interface F1DriverStanding {
  position: number
  driver: string
  driverCode: string
  nationality: string
  team: string
  points: number
  wins: number
  /** 车手头像（OpenF1），可能为 null */
  headshot: string | null
  /** 车队主题色（OpenF1，不含 #），可能为 null */
  teamColor: string | null
}

export interface F1ConstructorStanding {
  position: number
  team: string
  nationality: string
  points: number
  wins: number
}

async function fetchJson(path: string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    } as RequestInit)
    if (!response.ok) {
      console.warn(`[sports/f1] Jolpica ${path} responded ${response.status}`)
      return null
    }
    return await response.json()
  } catch (error) {
    console.warn(`[sports/f1] Jolpica ${path} failed:`, error)
    return null
  }
}

/** 本赛季完整赛历，按轮次升序。 */
export async function fetchF1Schedule(): Promise<F1Race[]> {
  const payload = await fetchJson("/current.json")
  const races = payload?.MRData?.RaceTable?.Races
  if (!Array.isArray(races)) return []

  return races.map((race: any) => ({
    round: Number(race.round) || 0,
    raceName: race.raceName ?? "",
    circuitName: race.Circuit?.circuitName ?? "",
    locality: race.Circuit?.Location?.locality ?? "",
    country: race.Circuit?.Location?.country ?? "",
    date: race.date ?? "",
    time: race.time ?? "",
    url: race.url ?? "",
  }))
}

/** 汇总最近一场正赛的换胎数据：driverId → 次数与总耗时（秒）。 */
async function fetchLastPitStops(): Promise<Map<string, { count: number; totalSeconds: number }>> {
  const map = new Map<string, { count: number; totalSeconds: number }>()
  const payload = await fetchJson("/current/last/pitstops.json")
  const stops = payload?.MRData?.RaceTable?.Races?.[0]?.PitStops
  if (!Array.isArray(stops)) return map

  for (const stop of stops) {
    const driverId = stop.driverId
    if (!driverId) continue
    const duration = Number.parseFloat(stop.duration ?? "0") || 0
    const entry = map.get(driverId) ?? { count: 0, totalSeconds: 0 }
    entry.count += 1
    entry.totalSeconds += duration
    map.set(driverId, entry)
  }
  return map
}

/** 最近一场已完赛大奖赛结果（含发车位、最快圈、换胎细节）。 */
export async function fetchF1LastResults(): Promise<F1LastRace | null> {
  const [payload, pitStops] = await Promise.all([
    fetchJson("/current/last/results.json"),
    fetchLastPitStops(),
  ])
  const race = payload?.MRData?.RaceTable?.Races?.[0]
  if (!race) return null

  const results: F1RaceResult[] = (race.Results ?? []).map((entry: any) => {
    const driverId: string = entry.Driver?.driverId ?? ""
    const pit = pitStops.get(driverId) ?? null
    return {
      position: Number(entry.position) || 0,
      driver: `${entry.Driver?.givenName ?? ""} ${entry.Driver?.familyName ?? ""}`.trim(),
      driverCode: entry.Driver?.code ?? "",
      team: entry.Constructor?.name ?? "",
      points: Number(entry.points) || 0,
      time: entry.Time?.time ?? "",
      status: entry.status ?? "",
      grid: Number(entry.grid) || 0,
      laps: Number(entry.laps) || 0,
      fastestLap: entry.FastestLap
        ? {
            rank: Number(entry.FastestLap.rank) || 0,
            time: entry.FastestLap.Time?.time ?? "",
          }
        : null,
      pitStops: pit,
    }
  })

  return {
    raceName: race.raceName ?? "",
    round: Number(race.round) || 0,
    date: race.date ?? "",
    results,
  }
}

/** OpenF1 车手档案：code（三字母缩写）→ 头像与车队色。 */
async function fetchDriverProfiles(): Promise<
  Map<string, { headshot: string | null; teamColor: string | null }>
> {
  const map = new Map<string, { headshot: string | null; teamColor: string | null }>()
  try {
    const response = await fetch(`${OPENF1_BASE}/drivers?session_key=latest`, {
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!response.ok) return map
    const drivers = (await response.json()) as any[]
    for (const driver of Array.isArray(drivers) ? drivers : []) {
      const code = String(driver.name_acronym ?? "").toUpperCase()
      if (!code) continue
      map.set(code, {
        headshot: driver.headshot_url ?? null,
        teamColor: driver.team_colour ?? null,
      })
    }
  } catch {
    // 忽略，头像为可选项
  }
  return map
}

/** 当前车手积分榜（含头像与车队色）。 */
export async function fetchF1DriverStandings(): Promise<F1DriverStanding[]> {
  const [payload, profiles] = await Promise.all([
    fetchJson("/current/driverstandings.json"),
    fetchDriverProfiles(),
  ])
  const list = payload?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings
  if (!Array.isArray(list)) return []

  return list.map((entry: any) => {
    const code = String(entry.Driver?.code ?? "").toUpperCase()
    const profile = profiles.get(code)
    return {
      position: Number(entry.position) || 0,
      driver: `${entry.Driver?.givenName ?? ""} ${entry.Driver?.familyName ?? ""}`.trim(),
      driverCode: entry.Driver?.code ?? "",
      nationality: entry.Driver?.nationality ?? "",
      team: entry.Constructors?.[0]?.name ?? "",
      points: Number(entry.points) || 0,
      wins: Number(entry.wins) || 0,
      headshot: profile?.headshot ?? null,
      teamColor: profile?.teamColor ?? null,
    }
  })
}

/** 当前车队积分榜。 */
export async function fetchF1ConstructorStandings(): Promise<F1ConstructorStanding[]> {
  const payload = await fetchJson("/current/constructorstandings.json")
  const list = payload?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings
  if (!Array.isArray(list)) return []

  return list.map((entry: any) => ({
    position: Number(entry.position) || 0,
    team: entry.Constructor?.name ?? "",
    nationality: entry.Constructor?.nationality ?? "",
    points: Number(entry.points) || 0,
    wins: Number(entry.wins) || 0,
  }))
}
