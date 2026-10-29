"use client"

import { Fragment, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { CalendarDays, ChevronDown, ListOrdered, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FootballFixture, FootballStandingEntry } from "@/lib/football-data"
import { FOOTBALL_LEAGUES, FOOTBALL_ZONE_STYLES, type FootballZoneRange } from "@/lib/sports/config"
import { useFootballFixtures, useFootballStandings } from "@/hooks/sports/useFootball"

type FootballView = "fixtures" | "standings"

interface FootballSectionProps {
  league: string
  onLeagueChange: (league: string) => void
}

export function FootballSection({ league, onLeagueChange }: FootballSectionProps) {
  const t = useTranslations("sports")
  const [view, setView] = useState<FootballView>("fixtures")

  return (
    <section className="space-y-4">
      {/* 联赛切换 */}
      <div className="flex flex-wrap gap-2">
        {FOOTBALL_LEAGUES.map((item) => {
          const isActive = item.code === league
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => onLeagueChange(item.code)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all",
                isActive
                  ? "border-transparent text-white shadow-md"
                  : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
              )}
              style={isActive ? { backgroundColor: item.brandColor } : undefined}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md bg-white ring-1 transition-shadow",
                  isActive ? "ring-white/60" : "ring-black/10",
                )}
              >
                <img
                  src={item.emblem}
                  alt={item.name}
                  className="h-5 w-5 object-contain"
                  loading="lazy"
                />
              </span>
              {item.name}
            </button>
          )
        })}
      </div>

      {/* 视图切换 */}
      <div className="flex gap-2">
        <ViewTab
          active={view === "fixtures"}
          onClick={() => setView("fixtures")}
          icon={<CalendarDays className="h-4 w-4" />}
          label={t("tabs.fixtures")}
        />
        <ViewTab
          active={view === "standings"}
          onClick={() => setView("standings")}
          icon={<ListOrdered className="h-4 w-4" />}
          label={t("tabs.standings")}
        />
      </div>

      {view === "fixtures" ? (
        <FixturesList league={league} />
      ) : (
        // key 保证切换联赛时重置展开状态
        <StandingsTable key={league} league={league} />
      )}
    </section>
  )
}

function ViewTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[var(--sport-brand)] text-white shadow-sm"
          : "bg-muted/50 text-muted-foreground hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function formatKickoff(utcDate: string): string {
  const date = new Date(utcDate)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatKickoffFull(utcDate: string): string {
  const date = new Date(utcDate)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function StatusBadge({ fixture }: { fixture: FootballFixture }) {
  const t = useTranslations("sports.status")
  if (fixture.status === "IN_PLAY" || fixture.status === "PAUSED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-500">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
        {fixture.status === "PAUSED" ? t("halftime") : t("live")}
      </span>
    )
  }
  if (fixture.status === "FINISHED") {
    return (
      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
        {t("finished")}
      </span>
    )
  }
  return (
    <span className="rounded-full bg-[var(--sport-brand)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--sport-brand)]">
      {t("upcoming")}
    </span>
  )
}

function FixtureRow({
  fixture,
  expanded,
  onToggle,
}: {
  fixture: FootballFixture
  expanded: boolean
  onToggle: () => void
}) {
  const t = useTranslations("sports")
  const played = fixture.homeScore !== null && fixture.awayScore !== null
  const hasHalfTime = fixture.halfTimeHome !== null && fixture.halfTimeAway !== null

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:gap-4"
      >
        <div className="flex w-full items-center justify-between gap-2 sm:w-36 sm:shrink-0 sm:flex-col sm:items-start sm:gap-1">
          <span className="text-xs text-muted-foreground">{formatKickoff(fixture.utcDate)}</span>
          <StatusBadge fixture={fixture} />
        </div>

        <div className="flex flex-1 items-center gap-3">
          <div className="flex flex-1 items-center justify-end gap-2 text-right">
            <span className="truncate text-sm font-medium">{fixture.home.shortName}</span>
            {fixture.home.crest ? (
              <img src={fixture.home.crest} alt={fixture.home.tla} className="h-6 w-6 object-contain" loading="lazy" />
            ) : null}
          </div>
          <div className="w-16 shrink-0 text-center">
            {played ? (
              <span className="text-base font-black tabular-nums">
                {fixture.homeScore} - {fixture.awayScore}
              </span>
            ) : (
              <span className="text-sm font-bold text-muted-foreground">VS</span>
            )}
          </div>
          <div className="flex flex-1 items-center gap-2">
            {fixture.away.crest ? (
              <img src={fixture.away.crest} alt={fixture.away.tla} className="h-6 w-6 object-contain" loading="lazy" />
            ) : null}
            <span className="truncate text-sm font-medium">{fixture.away.shortName}</span>
          </div>
        </div>

        <span className="flex shrink-0 items-center justify-end gap-1 text-xs text-muted-foreground sm:w-20">
          {fixture.matchday ? t("matchday", { matchday: fixture.matchday }) : null}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </span>
      </button>

      {expanded ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-border/40 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatKickoffFull(fixture.utcDate)}
          </span>
          {fixture.matchday ? <span>{t("matchday", { matchday: fixture.matchday })}</span> : null}
          {hasHalfTime ? (
            <span className="font-semibold">
              {t("detail.halfTime")} {fixture.halfTimeHome} - {fixture.halfTimeAway}
            </span>
          ) : null}
          <span className="font-medium">{fixture.home.name} vs {fixture.away.name}</span>
        </div>
      ) : null}
    </div>
  )
}

function FixturesList({ league }: { league: string }) {
  const t = useTranslations("sports")
  const { data, isLoading } = useFootballFixtures(league)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const fixtures = useMemo(() => {
    const list = data ?? []
    // 近期赛果倒序 + 未来赛程正序，以“现在”为界拼接
    const now = Date.now()
    const past = list
      .filter((f) => new Date(f.utcDate).getTime() < now && f.status === "FINISHED")
      .slice(-5)
      .reverse()
    const live = list.filter((f) => f.status === "IN_PLAY" || f.status === "PAUSED")
    const upcoming = list
      .filter((f) => f.status === "SCHEDULED" || f.status === "TIMED")
      .slice(0, 12)
    return [...live, ...past, ...upcoming]
  }, [data])

  if (isLoading) return <Loading />
  if (fixtures.length === 0) {
    return <EmptyHint text={t("empty.fixtures")} />
  }

  return (
    <div className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60 bg-card/80">
      {fixtures.map((fixture) => (
        <FixtureRow
          key={fixture.id}
          fixture={fixture}
          expanded={expandedId === fixture.id}
          onToggle={() =>
            setExpandedId((prev) => (prev === fixture.id ? null : fixture.id))
          }
        />
      ))}
    </div>
  )
}

/** 积分榜默认只展示前 12 名，其余通过底部箭头展开 */
const STANDINGS_PREVIEW_COUNT = 12

function StandingsTable({ league }: { league: string }) {
  const t = useTranslations("sports")
  const { data, isLoading } = useFootballStandings(league)
  const [expanded, setExpanded] = useState(false)

  if (isLoading) return <Loading />

  const standings = data ?? []
  if (standings.length === 0) {
    return <EmptyHint text={t("empty.standings")} />
  }

  const zones = FOOTBALL_LEAGUES.find((item) => item.code === league)?.zones ?? []
  const zoneOf = (position: number): FootballZoneRange | null =>
    zones.find((zone) => position >= zone.from && position <= zone.to) ?? null
  const collapsible = standings.length > STANDINGS_PREVIEW_COUNT
  const visibleStandings =
    collapsible && !expanded ? standings.slice(0, STANDINGS_PREVIEW_COUNT) : standings

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/80">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2.5 font-medium">{t("table.rank")}</th>
              <th className="px-3 py-2.5 font-medium">{t("table.team")}</th>
              <th className="px-3 py-2.5 text-center font-medium">{t("table.played")}</th>
              <th className="px-3 py-2.5 text-center font-medium">{t("table.win")}</th>
              <th className="px-3 py-2.5 text-center font-medium">{t("table.draw")}</th>
              <th className="px-3 py-2.5 text-center font-medium">{t("table.loss")}</th>
              <th className="px-3 py-2.5 text-center font-medium">{t("table.goalDiff")}</th>
              <th className="hidden px-3 py-2.5 text-center font-medium md:table-cell">{t("table.form")}</th>
              <th className="px-3 py-2.5 text-center font-medium">{t("table.points")}</th>
            </tr>
          </thead>
          <tbody>
            {visibleStandings.map((entry: FootballStandingEntry, index) => {
              const zone = zoneOf(entry.position)
              const zoneStyle = zone ? FOOTBALL_ZONE_STYLES[zone.id] : null
              const nextPosition = visibleStandings[index + 1]?.position
              const nextZone = nextPosition === undefined ? null : zoneOf(nextPosition)
              // 资格区结束时追加一行浅灰分割线，并在线上标注该资格区
              const isZoneEnd = Boolean(zoneStyle) && nextZone?.id !== zone?.id
              return (
                <Fragment key={entry.team.id ?? entry.position}>
                  <tr
                    className={cn(
                      "transition-colors",
                      isZoneEnd ? "border-b-0" : "border-b border-border/40 last:border-0",
                      zoneStyle && zoneStyle.bgClassName,
                      zoneStyle ? zoneStyle.hoverClassName : "hover:bg-muted/30",
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-muted-foreground">
                        {entry.position}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-2 font-medium">
                        {entry.team.crest ? (
                          <img
                            src={entry.team.crest}
                            alt={entry.team.tla}
                            className="h-5 w-5 object-contain"
                            loading="lazy"
                          />
                        ) : null}
                        <span className="hidden sm:inline">{entry.team.shortName}</span>
                        <span className="sm:hidden">{entry.team.tla}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center tabular-nums">{entry.playedGames}</td>
                    <td className="px-3 py-2.5 text-center tabular-nums">{entry.won}</td>
                    <td className="px-3 py-2.5 text-center tabular-nums">{entry.draw}</td>
                    <td className="px-3 py-2.5 text-center tabular-nums">{entry.lost}</td>
                    <td className="px-3 py-2.5 text-center tabular-nums">
                      {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                    </td>
                    <td className="hidden px-3 py-2.5 md:table-cell">
                      <span className="flex items-center justify-center gap-1">
                        {entry.form.map((result, formIndex) => (
                          <span
                            key={formIndex}
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-sm text-[9px] font-black text-white",
                              result === "W" && "bg-emerald-500",
                              result === "D" && "bg-slate-400",
                              result === "L" && "bg-red-500",
                            )}
                          >
                            {result}
                          </span>
                        ))}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold tabular-nums">{entry.points}</td>
                  </tr>

                  {isZoneEnd ? (
                    <tr>
                      <td
                        colSpan={9}
                        className={cn(
                          "border-b border-border/60 px-3 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
                          zoneStyle?.bgClassName,
                        )}
                      >
                        {zone ? t(`standings.zones.${zone.id}`) : null}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {collapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-center gap-1.5 border-t border-border/60 px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          {expanded
            ? t("standings.showLess")
            : t("standings.showAll", { count: standings.length })}
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
          />
        </button>
      ) : null}
    </div>
  )
}

/** 与 F1 板块一致的加载态：固定容器高度 + 居中转圈，避免布局跳动 */
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

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}
