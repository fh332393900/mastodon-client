/**
 * F1 数据：Jolpica-F1（Ergast 兼容）免费 API，无需 token。
 * 只在服务端调用，结果经 Next.js fetch 缓存。
 */

import { f1DriverHeadshot, f1TeamMeta } from "./f1-teams"

const API_BASE = "https://api.jolpi.ca/ergast/f1"
/** OpenF1 提供车手头像与车队配色（免费，无需 key）。 */
const OPENF1_BASE = "https://api.openf1.org/v1"
/** F1 数据变化频率低，缓存 1 小时。 */
const REVALIDATE_SECONDS = 3600

export interface F1Race {
  /** 赛季（如 2026） */
  season: string
  round: number
  raceName: string
  /** Jolpica 赛道 ID，用于匹配赛道缩略图 */
  circuitId: string
  circuitName: string
  locality: string
  country: string
  date: string
  time: string
  url: string
}

export type F1Compound = "SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET" | "UNKNOWN"

export interface F1Stint {
  compound: F1Compound
  lapStart: number
  lapEnd: number
  tyreAgeAtStart: number
}

export interface F1Pit {
  lap: number
  /** 进站耗时（秒），无数据时 null */
  duration: number | null
}

export interface F1Weather {
  airTemp: number
  trackTemp: number
  humidity: number
  rainfall: boolean
  windSpeed: number
}

export interface F1RaceResult {
  position: number
  driver: string
  driverCode: string
  team: string
  /** 车队 ID，用于徽标与配色 */
  constructorId: string
  /** 车队主色（不含 #） */
  teamColor: string | null
  /** 车手头像（F1 官方当季定妆照） */
  headshot: string | null
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
  /** 换胎统计（Jolpica pitstops），无数据时 null */
  pitStops: { count: number; totalSeconds: number } | null
  /** 轮胎策略（OpenF1 stints），无数据时为空数组 */
  stints: F1Stint[]
  /** 进站记录（OpenF1 pit），无数据时为空数组 */
  pits: F1Pit[]
}

export interface F1RaceDetail {
  /** 赛季（如 2026） */
  season: string
  raceName: string
  round: number
  date: string
  /** Jolpica 赛道 ID，用于匹配赛道缩略图 */
  circuitId: string
  circuitName: string
  locality: string
  country: string
  /** 冠军完成圈数，即本场总圈数 */
  totalLaps: number
  /** 比赛期间天气（OpenF1），无数据时 null */
  weather: F1Weather | null
  results: F1RaceResult[]
}

/** 兼容旧命名。 */
export type F1LastRace = F1RaceDetail

export interface F1DriverStanding {
  position: number
  driver: string
  driverCode: string
  nationality: string
  team: string
  /** 车队 ID，用于徽标与配色 */
  constructorId: string
  points: number
  wins: number
  /** 车手头像（F1 官方当季定妆照，回退 OpenF1），可能为 null */
  headshot: string | null
  /** 车队主题色（OpenF1，不含 #），可能为 null */
  teamColor: string | null
}

export interface F1ConstructorStanding {
  position: number
  team: string
  /** 车队 ID，用于徽标与配色 */
  constructorId: string
  nationality: string
  points: number
  wins: number
  /** 车队主色（不含 #），可能为 null */
  teamColor: string | null
  /** 车队徽标（本地静态资源），可能为 null */
  logo: string | null
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
    season: String(race.season ?? payload?.MRData?.RaceTable?.season ?? ""),
    round: Number(race.round) || 0,
    raceName: race.raceName ?? "",
    circuitId: race.Circuit?.circuitId ?? "",
    circuitName: race.Circuit?.circuitName ?? "",
    locality: race.Circuit?.Location?.locality ?? "",
    country: race.Circuit?.Location?.country ?? "",
    date: race.date ?? "",
    time: race.time ?? "",
    url: race.url ?? "",
  }))
}

/** 汇总正赛换胎数据：driverId → 次数与总耗时（秒）。 */
async function fetchLastPitStops(
  round?: number,
): Promise<Map<string, { count: number; totalSeconds: number }>> {
  const map = new Map<string, { count: number; totalSeconds: number }>()
  const path = round ? `/current/${round}/pitstops.json` : "/current/last/pitstops.json"
  const payload = await fetchJson(path)
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

function normalizeCompound(value: string | undefined): F1Compound {
  const compound = (value ?? "").toUpperCase()
  if (compound === "SOFT" || compound === "MEDIUM" || compound === "HARD") return compound
  if (compound === "INTERMEDIATE") return "INTERMEDIATE"
  if (compound === "WET") return "WET"
  return "UNKNOWN"
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 合并相邻同配方 stint（仅当后一段不是新胎）。
 * OpenF1 偶尔会把一段连续使用同配方轮胎拆成两段，后一段的 tyre_age_at_start 会延续计数；
 * 如果后一段是新胎（age=0），说明是真的换了同配方的新胎，必须保留，否则会吞掉一次进站。
 */
function mergeSameCompoundStints(list: F1Stint[]): F1Stint[] {
  const merged: F1Stint[] = []
  for (const stint of list) {
    const prev = merged[merged.length - 1]
    if (prev && prev.compound === stint.compound && stint.tyreAgeAtStart > 0) {
      prev.lapEnd = Math.max(prev.lapEnd, stint.lapEnd)
      continue
    }
    merged.push({ ...stint })
  }
  return merged
}

/**
 * 进站记录以 stint 换胎点为锚，避免 OpenF1 pit 表与 stints 错位时多出/漏掉换胎点。
 * 耗时从 pit 表中就近（±1 圈）匹配。
 */
function buildStintPits(stints: F1Stint[], rawPits: F1Pit[]): F1Pit[] {
  const markers: F1Pit[] = []
  for (let index = 1; index < stints.length; index += 1) {
    const lap = stints[index].lapStart - 1
    const match = rawPits.find((pit) => Math.abs(pit.lap - lap) <= 1)
    markers.push({ lap, duration: match?.duration ?? null })
  }
  return markers
}


/** OpenF1 免费层限流 3 req/s，这里串行调用方自行控制节奏。 */
async function fetchOpenF1(path: string): Promise<any[] | null> {
  try {
    const response = await fetch(`${OPENF1_BASE}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!response.ok) return null
    const json = await response.json()
    return Array.isArray(json) ? json : null
  } catch {
    return null
  }
}

interface OpenF1RaceExtras {
  weather: F1Weather | null
  stintsByDriver: Map<number, F1Stint[]>
  pitsByDriver: Map<number, F1Pit[]>
}

/** 按正赛日期匹配 OpenF1 session，拉取轮胎策略/进站/天气。失败时返回空。 */
async function fetchOpenF1RaceExtras(raceDate: string): Promise<OpenF1RaceExtras> {
  const empty: OpenF1RaceExtras = {
    weather: null,
    stintsByDriver: new Map(),
    pitsByDriver: new Map(),
  }
  if (!raceDate) return empty

  const sessions = await fetchOpenF1("/sessions?session_name=Race")
  const session = sessions?.find(
    (item) => String(item.date_start ?? "").slice(0, 10) === raceDate,
  )
  if (!session?.session_key) return empty

  const key = session.session_key
  // OpenF1 限流 3 req/s，串行 + 间隔
  await sleep(350)
  const stints = await fetchOpenF1(`/stints?session_key=${key}`)
  await sleep(350)
  const pits = await fetchOpenF1(`/pit?session_key=${key}`)
  await sleep(350)
  const weatherRows = await fetchOpenF1(`/weather?session_key=${key}`)

  for (const stint of stints ?? []) {
    const num = Number(stint.driver_number)
    if (!num) continue
    const lapStart = Number(stint.lap_start) || 0
    const lapEnd = Number(stint.lap_end) || 0
    // 丢弃非法区间，避免时间轴出现 0 圈或倒挂的色块
    if (lapStart < 1 || lapEnd < lapStart) continue
    const list = empty.stintsByDriver.get(num) ?? []
    list.push({
      compound: normalizeCompound(stint.compound),
      lapStart,
      lapEnd,
      tyreAgeAtStart: Number(stint.tyre_age_at_start) || 0,
    })
    empty.stintsByDriver.set(num, list)
  }
  for (const [num, list] of empty.stintsByDriver) {
    list.sort((a, b) => a.lapStart - b.lapStart)
    empty.stintsByDriver.set(num, mergeSameCompoundStints(list))
  }

  for (const pit of pits ?? []) {
    const num = Number(pit.driver_number)
    if (!num) continue
    const list = empty.pitsByDriver.get(num) ?? []
    list.push({
      lap: Number(pit.lap_number) || 0,
      duration:
        pit.pit_duration != null
          ? Number(pit.pit_duration)
          : pit.stop_duration != null
            ? Number(pit.stop_duration)
            : null,
    })
    empty.pitsByDriver.set(num, list)
  }
  for (const list of empty.pitsByDriver.values()) {
    list.sort((a, b) => a.lap - b.lap)
  }

  // 取全场天气均值作为代表；只要任一次采样有降雨即视为雨战
  const validRows = (weatherRows ?? []).filter(
    (row) => Number.isFinite(Number(row?.air_temperature)),
  )
  if (validRows.length > 0) {
    const avg = (pick: (row: any) => number) =>
      validRows.reduce((sum, row) => sum + (Number(pick(row)) || 0), 0) / validRows.length
    empty.weather = {
      airTemp: Math.round(avg((row) => row.air_temperature)),
      trackTemp: Math.round(avg((row) => row.track_temperature)),
      humidity: Math.round(avg((row) => row.humidity)),
      rainfall: validRows.some((row) => Number(row.rainfall) > 0),
      windSpeed: Math.round(avg((row) => row.wind_speed) * 10) / 10,
    }
  }

  return empty
}

/**
 * 指定轮次的正赛结果（不传则取最近一场）。
 * 合并 Jolpica 赛果与 OpenF1 轮胎策略/进站/天气。
 */
export async function fetchF1RaceResults(round?: number): Promise<F1RaceDetail | null> {
  const resultsPath = round ? `/current/${round}/results.json` : "/current/last/results.json"
  const [payload, pitStops] = await Promise.all([
    fetchJson(resultsPath),
    fetchLastPitStops(round),
  ])
  const race = payload?.MRData?.RaceTable?.Races?.[0]
  if (!race) return null

  const extras = await fetchOpenF1RaceExtras(race.date ?? "")

  const totalLaps = (race.Results ?? []).reduce(
    (max: number, entry: any) => Math.max(max, Number(entry.laps) || 0),
    0,
  )

  const results: F1RaceResult[] = (race.Results ?? []).map((entry: any) => {
    const driverId: string = entry.Driver?.driverId ?? ""
    const driverNumber = Number(entry.Driver?.permanentNumber) || 0
    const constructorId: string = entry.Constructor?.constructorId ?? ""
    const team = f1TeamMeta(constructorId)
    const pit = pitStops.get(driverId) ?? null
    // 越界圈数裁到本场总圈数，避免出现超出终点的色块
    const stints = (extras.stintsByDriver.get(driverNumber) ?? []).map((stint) =>
      totalLaps > 0 ? { ...stint, lapEnd: Math.min(stint.lapEnd, totalLaps) } : stint,
    )
    const pits = buildStintPits(stints, extras.pitsByDriver.get(driverNumber) ?? [])
    return {
      position: Number(entry.position) || 0,
      driver: `${entry.Driver?.givenName ?? ""} ${entry.Driver?.familyName ?? ""}`.trim(),
      driverCode: entry.Driver?.code ?? "",
      team: entry.Constructor?.name ?? "",
      constructorId,
      teamColor: team?.color ?? null,
      headshot: f1DriverHeadshot(
        entry.Driver?.givenName ?? "",
        entry.Driver?.familyName ?? "",
        constructorId,
      ),
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
      stints,
      pits,
    }
  })

  return {
    season: String(race.season ?? payload?.MRData?.RaceTable?.season ?? ""),
    raceName: race.raceName ?? "",
    round: Number(race.round) || 0,
    date: race.date ?? "",
    circuitId: race.Circuit?.circuitId ?? "",
    circuitName: race.Circuit?.circuitName ?? "",
    locality: race.Circuit?.Location?.locality ?? "",
    country: race.Circuit?.Location?.country ?? "",
    totalLaps,
    weather: extras.weather,
    results,
  }
}

/** 最近一场已完赛大奖赛结果（含轮胎策略等细节）。 */
export function fetchF1LastResults(): Promise<F1RaceDetail | null> {
  return fetchF1RaceResults()
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
    const constructorId: string = entry.Constructors?.[0]?.constructorId ?? ""
    const team = f1TeamMeta(constructorId)
    return {
      position: Number(entry.position) || 0,
      driver: `${entry.Driver?.givenName ?? ""} ${entry.Driver?.familyName ?? ""}`.trim(),
      driverCode: entry.Driver?.code ?? "",
      nationality: entry.Driver?.nationality ?? "",
      team: entry.Constructors?.[0]?.name ?? "",
      constructorId,
      points: Number(entry.points) || 0,
      wins: Number(entry.wins) || 0,
      // 官方当季定妆照优先，缺失时回退 OpenF1 头像
      headshot:
        f1DriverHeadshot(
          entry.Driver?.givenName ?? "",
          entry.Driver?.familyName ?? "",
          constructorId,
        ) ?? profile?.headshot ?? null,
      teamColor: profile?.teamColor ?? team?.color ?? null,
    }
  })
}

/** 当前车队积分榜。 */
export async function fetchF1ConstructorStandings(): Promise<F1ConstructorStanding[]> {
  const payload = await fetchJson("/current/constructorstandings.json")
  const list = payload?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings
  if (!Array.isArray(list)) return []

  return list.map((entry: any) => {
    const constructorId: string = entry.Constructor?.constructorId ?? ""
    const team = f1TeamMeta(constructorId)
    return {
      position: Number(entry.position) || 0,
      team: entry.Constructor?.name ?? "",
      constructorId,
      nationality: entry.Constructor?.nationality ?? "",
      points: Number(entry.points) || 0,
      wins: Number(entry.wins) || 0,
      teamColor: team?.color ?? null,
      logo: team?.logo ?? null,
    }
  })
}
