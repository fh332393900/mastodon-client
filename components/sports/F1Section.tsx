"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import {
  CalendarDays,
  ChevronDown,
  CloudRain,
  Crown,
  Droplets,
  Flag,
  Gauge,
  Loader2,
  MapPin,
  Sun,
  Thermometer,
  Trophy,
  Users,
  Wind,
  Wrench,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  F1DriverStanding,
  F1RaceDetail,
  F1RaceResult,
  F1Weather,
} from "@/lib/sports/f1"
import { F1_COUNTRY_FLAGS } from "@/lib/sports/config"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TyreStintBar } from "./TyreStintBar"
import {
  useF1ConstructorStandings,
  useF1DriverStandings,
  useF1RaceResults,
  useF1Schedule,
} from "@/hooks/sports/useF1"

type F1View = "schedule" | "results" | "drivers" | "teams"

const VIEW_ICONS = {
  schedule: CalendarDays,
  results: Flag,
  drivers: Trophy,
  teams: Users,
} as const

export function F1Section() {
  const t = useTranslations("sports")
  const [view, setView] = useState<F1View>("schedule")

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(VIEW_ICONS) as F1View[]).map((key) => {
          const Icon = VIEW_ICONS[key]
          const isActive = view === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--sport-brand)] text-white shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {t(`tabs.${key}`)}
            </button>
          )
        })}
      </div>

      {view === "schedule" && <ScheduleList />}
      {view === "results" && <RaceResults />}
      {view === "drivers" && <DriverStandings />}
      {view === "teams" && <ConstructorStandings />}
    </section>
  )
}

function formatRaceDate(date: string, time?: string): string {
  if (!date) return ""
  const value = time ? new Date(`${date}T${time}`) : new Date(date)
  if (Number.isNaN(value.getTime())) return date
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    ...(time ? { hour: "2-digit", minute: "2-digit" as const } : {}),
  }).format(value)
}

function countryFlag(country: string): string {
  return F1_COUNTRY_FLAGS[country] ? `${F1_COUNTRY_FLAGS[country]} ` : ""
}

function ScheduleList() {
  const t = useTranslations("sports")
  const { data, isLoading } = useF1Schedule()
  const races = data ?? []

  const nextRound = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return races.find((race) => race.date >= today)?.round ?? null
  }, [races])

  if (isLoading) return <Loading />
  if (races.length === 0) return <Empty text={t("empty.f1")} />

  return (
    <div className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-card/80">
      {races.map((race) => {
        const isNext = race.round === nextRound
        const isPast = !isNext && nextRound !== null && race.round < nextRound
        const row = (
          <div
            className={cn(
              "flex items-center gap-4 px-4 py-3",
              isNext && "bg-[var(--sport-brand)]/10",
              isPast && "opacity-55",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black",
                isNext
                  ? "bg-[var(--sport-brand)] text-white"
                  : "bg-muted/60 text-muted-foreground",
              )}
            >
              R{race.round}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {countryFlag(race.country)}
                {race.raceName}
                {isNext ? (
                  <span className="ml-2 rounded-full bg-[var(--sport-brand)] px-2 py-0.5 text-xs font-bold uppercase text-white">
                    Next
                  </span>
                ) : null}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {race.circuitName} · {race.locality}, {race.country}
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {formatRaceDate(race.date, race.time)}
            </span>
          </div>
        )
        return race.url ? (
          <a key={race.round} href={race.url} target="_blank" rel="noopener noreferrer" className="block transition-colors hover:bg-muted/30">
            {row}
          </a>
        ) : (
          <div key={race.round}>{row}</div>
        )
      })}
    </div>
  )
}

/** 天气指标卡：F1 官网风格的深色数据块 */
function WeatherGrid({ weather }: { weather: F1Weather }) {
  const t = useTranslations("sports.detail")
  const items = [
    {
      icon: weather.rainfall ? CloudRain : Sun,
      label: t("weather"),
      value: weather.rainfall ? t("rain") : t("noRain"),
      accent: weather.rainfall ? "text-sky-300" : "text-amber-300",
    },
    {
      icon: Thermometer,
      label: t("airTemp"),
      value: `${weather.airTemp}°C`,
      accent: "text-white",
    },
    {
      icon: Gauge,
      label: t("trackTemp"),
      value: `${weather.trackTemp}°C`,
      accent: "text-[var(--sport-brand)]",
    },
    {
      icon: Droplets,
      label: t("humidity"),
      value: `${weather.humidity}%`,
      accent: "text-white",
    },
    {
      icon: Wind,
      label: t("wind"),
      value: `${weather.windSpeed} m/s`,
      accent: "text-white",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm"
        >
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-white/60">
            <item.icon className={cn("h-3 w-3", item.accent)} />
            {item.label}
          </p>
          <p className={cn("mt-0.5 text-sm font-bold tabular-nums", item.accent)}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

/** 赛事头部：轮次 / 分站名 / 赛道 / 地点 / 圈数 / 天气 */
function RaceHeader({ race }: { race: F1RaceDetail }) {
  const t = useTranslations("sports")

  return (
    <div className="relative overflow-hidden bg-[#101010] text-white">
      {/* 品牌红晕 + 斜纹底 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(225,6,0,0.55)_0%,rgba(225,6,0,0.12)_38%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_2px,transparent_2px,transparent_9px)]" />

      <div className="relative space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
          <span className="rounded-sm bg-[var(--sport-brand)] px-1.5 py-0.5 text-white">
            R{race.round}
          </span>
          <span>{formatRaceDate(race.date)}</span>
        </div>

        <div>
          <h3 className="flex flex-wrap items-center gap-2 text-xl font-black uppercase italic leading-none tracking-tight sm:text-2xl">
            <span className="not-italic">{countryFlag(race.country)}</span>
            {race.raceName}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/70">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="h-3.5 w-3.5 text-[var(--sport-brand)]" />
              {race.circuitName}
            </span>
            <span className="text-white/25">•</span>
            <span>
              {race.locality}
              {race.locality && race.country ? ", " : ""}
              {race.country}
            </span>
            {race.totalLaps > 0 ? (
              <>
                <span className="text-white/25">•</span>
                <span className="flex items-center gap-1">
                  <Flag className="h-3.5 w-3.5" />
                  {t("detail.lapsTotal", { laps: race.totalLaps })}
                </span>
              </>
            ) : null}
          </div>
        </div>

        {race.weather ? <WeatherGrid weather={race.weather} /> : null}
      </div>
    </div>
  )
}

function ResultRow({ result, totalLaps }: { result: F1RaceResult; totalLaps: number }) {
  const t = useTranslations("sports")
  const [open, setOpen] = useState(false)
  // 发车位与完赛名次之差：正数表示上升
  const gained = result.grid > 0 ? result.grid - result.position : 0

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/30"
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black",
            result.position === 1 && "bg-yellow-400 text-black",
            result.position === 2 && "bg-slate-300 text-black",
            result.position === 3 && "bg-amber-600 text-white",
            result.position > 3 && "bg-muted/60 text-muted-foreground",
          )}
        >
          P{result.position}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {result.driver}
            {result.driverCode ? (
              <span className="ml-1.5 text-xs font-bold text-muted-foreground">
                {result.driverCode}
              </span>
            ) : null}
          </p>
          <p className="truncate text-xs text-muted-foreground">{result.team}</p>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {result.time || result.status}
        </span>
        <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums">
          {result.points}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-border/40 bg-muted/20 px-4 py-3">
          {/* 轮胎策略时间轴（F1 官方转播风格） */}
          <TyreStintBar
            stints={result.stints}
            pits={result.pits}
            totalLaps={totalLaps || result.laps}
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <DetailItem
              icon={<Flag className="h-3.5 w-3.5" />}
              label={t("detail.grid")}
              value={`P${result.grid}`}
              extra={
                gained > 0 ? (
                  <span className="font-bold text-emerald-500">▲{gained}</span>
                ) : gained < 0 ? (
                  <span className="font-bold text-red-500">▼{-gained}</span>
                ) : undefined
              }
            />
            <DetailItem
              icon={<Gauge className="h-3.5 w-3.5" />}
              label={t("detail.laps")}
              value={String(result.laps)}
            />
            {result.fastestLap ? (
              <DetailItem
                icon={<Zap className="h-3.5 w-3.5 text-yellow-500" />}
                label={t("detail.fastestLap")}
                value={result.fastestLap.time}
                extra={`P${result.fastestLap.rank}`}
              />
            ) : null}
            {result.pitStops ? (
              <DetailItem
                icon={<Wrench className="h-3.5 w-3.5 text-[var(--sport-brand)]" />}
                label={t("detail.pitStops")}
                value={`${result.pitStops.count}×`}
                extra={`${result.pitStops.totalSeconds.toFixed(1)}s`}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function DetailItem({
  icon,
  label,
  value,
  extra,
}: {
  icon: React.ReactNode
  label: string
  value: string
  extra?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/70 px-3 py-2">
      <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold tabular-nums">
        {value}
        {extra ? <span className="ml-1.5 text-xs">{extra}</span> : null}
      </p>
    </div>
  )
}

function RaceResults() {
  const t = useTranslations("sports")
  const { data: schedule, isLoading: scheduleLoading } = useF1Schedule()
  const [round, setRound] = useState<number | null>(null)

  // 已完成的分站（按轮次倒序），第一项即最近完赛一场
  const completedRounds = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return (schedule ?? [])
      .filter((race) => race.date && race.date <= today)
      .slice()
      .sort((a, b) => b.round - a.round)
  }, [schedule])

  const activeRound = round ?? completedRounds[0]?.round
  const { data, isLoading, isFetching } = useF1RaceResults(activeRound, {
    enabled: !scheduleLoading,
  })
  const loading = scheduleLoading || (!data && (isLoading || isFetching))

  // 赛历缺失时至少保留当前已加载的分站，避免下拉为空
  const roundOptions = useMemo(() => {
    if (completedRounds.length > 0) return completedRounds
    return data
      ? [
          {
            round: data.round,
            raceName: data.raceName,
            country: data.country,
            date: data.date,
          },
        ]
      : []
  }, [completedRounds, data])

  return (
    <div className="space-y-3">
      {/* 分站筛选：下拉定位最近完赛一场 */}
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 shrink-0 text-[var(--sport-brand)]" />
        <Select
          value={activeRound != null ? String(activeRound) : undefined}
          onValueChange={(value) => setRound(Number(value))}
        >
          <SelectTrigger className="h-11 flex-1 rounded-xl border-border/60 bg-card/80 text-sm font-semibold">
            <SelectValue placeholder={t("detail.selectRound")} />
          </SelectTrigger>
          <SelectContent className="max-h-72 rounded-xl border-border/60">
            {roundOptions.map((race) => (
              <SelectItem
                key={race.round}
                value={String(race.round)}
                className="cursor-pointer py-2"
              >
                <span className="flex items-center gap-2">
                  <span className="w-9 shrink-0 rounded bg-muted px-1 py-0.5 text-center text-xs font-bold text-muted-foreground">
                    R{race.round}
                  </span>
                  <span className="truncate font-medium">
                    {countryFlag(race.country)}
                    {race.raceName}
                  </span>
                  <span className="ml-1 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {formatRaceDate(race.date)}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Loading />
      ) : !data ? (
        <Empty text={t("empty.f1")} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/80">
          <RaceHeader race={data} />
          <div className="divide-y divide-border/50">
            {data.results.map((result) => (
              <ResultRow
                key={result.position}
                result={result}
                totalLaps={data.totalLaps}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const PODIUM_STYLE = {
  1: {
    bar: "bg-gradient-to-t from-yellow-500/90 to-yellow-300",
    barText: "text-yellow-900",
    height: "h-20",
  },
  2: {
    bar: "bg-gradient-to-t from-slate-400/80 to-slate-200",
    barText: "text-slate-700",
    height: "h-14",
  },
  3: {
    bar: "bg-gradient-to-t from-amber-700/90 to-amber-500",
    barText: "text-amber-950",
    height: "h-10",
  },
} as const

function PodiumCard({ entry, rank }: { entry: F1DriverStanding; rank: 1 | 2 | 3 }) {
  const t = useTranslations("sports")
  const style = PODIUM_STYLE[rank]

  return (
    <div className="flex w-28 flex-col sm:w-36">
      <div
        className={cn(
          "relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl border bg-card/90 p-3 text-center",
          rank === 1
            ? "border-yellow-400/50 shadow-lg shadow-yellow-500/10"
            : "border-border/60",
        )}
      >
        {/* 车队色顶条 */}
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{
            backgroundColor: entry.teamColor ? `#${entry.teamColor}` : "var(--sport-brand)",
          }}
        />
        {rank === 1 ? <Crown className="mt-0.5 h-4 w-4 text-yellow-400" /> : null}
        {entry.headshot ? (
          <img
            src={entry.headshot}
            alt={entry.driver}
            loading="lazy"
            className={cn(
              "rounded-full bg-muted/50 object-cover object-top",
              rank === 1 ? "h-20 w-20" : "h-14 w-14",
            )}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-muted/60 font-black text-muted-foreground",
              rank === 1 ? "h-20 w-20 text-xl" : "h-14 w-14 text-sm",
            )}
          >
            {entry.driverCode || entry.driver.slice(0, 2).toUpperCase()}
          </div>
        )}
        <p className="w-full truncate text-sm font-bold">{entry.driver}</p>
        <p className="w-full truncate text-xs font-medium text-muted-foreground">{entry.team}</p>
        <p className="text-lg font-black leading-none text-[var(--sport-brand)]">
          {entry.points}
          <span className="ml-1 text-xs font-semibold text-muted-foreground">
            {t("table.points")}
          </span>
        </p>
      </div>
      {/* 领奖台底座 */}
      <div
        className={cn(
          "mt-1 flex items-start justify-center rounded-t-xl pt-1",
          style.bar,
          style.height,
        )}
      >
        <span className={cn("text-lg font-black", style.barText)}>P{rank}</span>
      </div>
    </div>
  )
}

function DriverStandings() {
  const t = useTranslations("sports")
  const { data, isLoading } = useF1DriverStandings()
  const standings = data ?? []

  if (isLoading) return <Loading />
  if (standings.length === 0) return <Empty text={t("empty.f1")} />

  const podium = standings.slice(0, 3)
  const rest = standings.slice(3)

  return (
    <div className="space-y-3">
      {/* 领奖台：P2 - P1 - P3 */}
      <div className="flex items-end justify-center gap-2 pt-2 sm:gap-4">
        {podium[1] ? <PodiumCard entry={podium[1]} rank={2} /> : null}
        {podium[0] ? <PodiumCard entry={podium[0]} rank={1} /> : null}
        {podium[2] ? <PodiumCard entry={podium[2]} rank={3} /> : null}
      </div>

      {rest.length > 0 ? (
        <div className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-card/80">
          {rest.map((entry) => (
            <div key={entry.position} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-6 shrink-0 text-center text-xs font-bold text-muted-foreground">
                {entry.position}
              </span>
              <span
                className="h-8 w-1 shrink-0 rounded-full"
                style={{
                  backgroundColor: entry.teamColor ? `#${entry.teamColor}` : "var(--sport-brand)",
                }}
              />
              {entry.headshot ? (
                <img
                  src={entry.headshot}
                  alt={entry.driver}
                  loading="lazy"
                  className="h-9 w-9 shrink-0 rounded-full bg-muted/50 object-cover object-top"
                />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60 text-xs font-black text-muted-foreground">
                  {entry.driverCode || entry.driver.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {entry.driver}
                  <span className="ml-1.5 text-xs font-bold text-muted-foreground">
                    {entry.driverCode}
                  </span>
                </p>
                <p className="truncate text-xs text-muted-foreground">{entry.team}</p>
              </div>
              {entry.wins > 0 ? (
                <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-500">
                  <Trophy className="h-3.5 w-3.5" />
                  {entry.wins}
                </span>
              ) : null}
              <span className="w-12 shrink-0 text-right text-sm font-bold tabular-nums">
                {entry.points}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ConstructorStandings() {
  const t = useTranslations("sports")
  const { data, isLoading } = useF1ConstructorStandings()
  const standings = data ?? []

  if (isLoading) return <Loading />
  if (standings.length === 0) return <Empty text={t("empty.f1")} />

  const maxPoints = Math.max(...standings.map((entry) => entry.points), 1)

  return (
    <div className="space-y-2 rounded-2xl border border-border/60 bg-card/80 p-4">
      {standings.map((entry) => (
        <div key={entry.position} className="flex items-center gap-3">
          <span className="w-6 text-center text-xs font-bold text-muted-foreground">
            {entry.position}
          </span>
          <span className="w-28 shrink-0 truncate text-sm font-semibold sm:w-40">
            {entry.team}
          </span>
          <div className="h-5 flex-1 overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full bg-[var(--sport-brand)] transition-all"
              style={{ width: `${Math.max((entry.points / maxPoints) * 100, 2)}%` }}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-sm font-bold tabular-nums">
            {entry.points}
          </span>
        </div>
      ))}
    </div>
  )
}

/** 统一的加载态：固定容器高度 + 居中转圈，避免骨架屏闪烁与布局跳动 */
function Loading() {
  const t = useTranslations("sports")
  return (
    <div
      className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card/80"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-6 w-6 animate-spin text-[var(--sport-brand)]" />
      <p className="text-xs font-medium text-muted-foreground">{t("loading")}</p>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}
