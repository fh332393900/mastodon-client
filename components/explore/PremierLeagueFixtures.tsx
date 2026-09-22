"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FootballFixture, FootballTeam } from "@/lib/football-data"
import { usePremierLeagueFixtures } from "@/hooks/mastodon/usePremierLeagueFixtures"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const

/** 单张卡片宽度（w-[168px]）加间距（gap-3），用于按整卡翻页。 */
const CARD_STEP = 180

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** 卡片右上角的时间标签：Today / Yesterday / Tomorrow / 星期 / 月日。 */
function formatDayLabel(utcDate: string): string {
  const date = new Date(utcDate)
  if (Number.isNaN(date.getTime())) return ""

  const diffDays = Math.round((startOfDay(date) - startOfDay(new Date())) / 86_400_000)
  if (diffDays === 0) return "Today"
  if (diffDays === -1) return "Yesterday"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays > 1 && diffDays < 7) return WEEKDAYS[date.getDay()]
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}

function formatKickoffTime(utcDate: string): string {
  const date = new Date(utcDate)
  if (Number.isNaN(date.getTime())) return ""
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

interface FixtureStatusLabel {
  text: string
  isLive: boolean
}

/** 卡片左上角的状态标签：Final / Live / HT / 开赛时间。 */
function getStatusLabel(fixture: FootballFixture): FixtureStatusLabel {
  switch (fixture.status) {
    case "IN_PLAY":
      return { text: "Live", isLive: true }
    case "PAUSED":
      return { text: "HT", isLive: true }
    case "FINISHED":
      return { text: "Final", isLive: false }
    default:
      return { text: formatKickoffTime(fixture.utcDate), isLive: false }
  }
}

interface TeamRowProps {
  team: FootballTeam
  score: number | null
  showScore: boolean
  isWinner: boolean
}

function TeamRow({ team, score, showScore, isWinner }: TeamRowProps) {
  return (
    <div className="flex items-center gap-2">
      {team.crest ? (
        <Image
          src={team.crest}
          alt={team.name}
          width={20}
          height={20}
          unoptimized
          className="size-5 shrink-0 object-contain"
        />
      ) : (
        <span className="size-5 shrink-0 rounded-full bg-muted" />
      )}
      <span className="truncate text-sm font-semibold tracking-wide text-foreground">
        {team.tla || team.shortName}
      </span>
      {showScore && (
        <span
          className={cn(
            "ml-auto text-sm font-bold tabular-nums",
            isWinner ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {score ?? "-"}
        </span>
      )}
    </div>
  )
}

function FixtureCard({ fixture }: { fixture: FootballFixture }) {
  const status = getStatusLabel(fixture)
  const showScore = status.isLive || fixture.status === "FINISHED"
  const homeWins = showScore && fixture.homeScore !== null && fixture.awayScore !== null && fixture.homeScore > fixture.awayScore
  const awayWins = showScore && fixture.homeScore !== null && fixture.awayScore !== null && fixture.awayScore > fixture.homeScore

  return (
    <article
      className={cn(
        "w-[168px] shrink-0 snap-start rounded-2xl border border-border/60 bg-card/70 p-3 backdrop-blur-sm",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5",
        status.isLive && "border-destructive/40 bg-destructive/5",
      )}
    >
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span
          className={cn(
            "flex items-center gap-1",
            status.isLive ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {status.isLive && (
            <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
          )}
          {status.text}
        </span>
        <span className="text-muted-foreground">{formatDayLabel(fixture.utcDate)}</span>
      </div>

      <div className="my-2 border-t border-dashed border-border/60" />

      <div className="space-y-1.5">
        <TeamRow
          team={fixture.home}
          score={fixture.homeScore}
          showScore={showScore}
          isWinner={homeWins}
        />
        <TeamRow
          team={fixture.away}
          score={fixture.awayScore}
          showScore={showScore}
          isWinner={awayWins}
        />
      </div>
    </article>
  )
}

function FixturesRailSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[104px] w-[168px] shrink-0 animate-pulse rounded-2xl border border-border/60 bg-border/60 dark:bg-muted-foreground/40"
        />
      ))}
    </div>
  )
}

/** 横向滚动轨道：左右渐变遮罩 + 圆形箭头，卡片支持触控滑动。 */
function FixturesRail({ fixtures }: { fixtures: FootballFixture[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const syncScrollState = useCallback(() => {
    const element = scrollerRef.current
    if (!element) return
    setCanScrollLeft(element.scrollLeft > 4)
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const element = scrollerRef.current
    if (!element) return

    syncScrollState()
    element.addEventListener("scroll", syncScrollState, { passive: true })
    const observer = new ResizeObserver(syncScrollState)
    observer.observe(element)

    return () => {
      element.removeEventListener("scroll", syncScrollState)
      observer.disconnect()
    }
  }, [syncScrollState, fixtures.length])

  // 按整卡翻页，并精确夹到 0 / 最大滚动量，避免左箭头回不到起点。
  const scrollRail = (direction: -1 | 1) => {
    const element = scrollerRef.current
    if (!element) return

    const cardsPerPage = Math.max(1, Math.floor(element.clientWidth / CARD_STEP))
    const step = cardsPerPage * CARD_STEP
    const maxScrollLeft = element.scrollWidth - element.clientWidth
    const target =
      direction === 1
        ? Math.min(element.scrollLeft + step, maxScrollLeft)
        : Math.max(element.scrollLeft - step, 0)

    element.scrollTo({ left: target, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 -left-4 z-10 w-8 bg-gradient-to-r from-background to-transparent transition-opacity duration-200",
          canScrollLeft ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 -right-4 z-10 w-8 bg-gradient-to-l from-background to-transparent transition-opacity duration-200",
          canScrollRight ? "opacity-100" : "opacity-0",
        )}
      />

      <button
        type="button"
        onClick={() => scrollRail(-1)}
        disabled={!canScrollLeft}
        aria-label="Previous matches"
        className={cn(
          "absolute ml-1 -left-4 top-1/2 z-20 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground shadow-md backdrop-blur transition-all duration-200 hover:bg-primary hover:text-primary-foreground",
          !canScrollLeft && "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollRail(1)}
        disabled={!canScrollRight}
        aria-label="Next matches"
        className={cn(
          "absolute mr-1 -right-4 top-1/2 z-20 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground shadow-md backdrop-blur transition-all duration-200 hover:bg-primary hover:text-primary-foreground",
          !canScrollRight && "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight className="size-4" />
      </button>

      <div
        ref={scrollerRef}
        className="-mx-4 py-1 flex snap-x gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {fixtures.map((fixture) => (
          <FixtureCard key={fixture.id} fixture={fixture} />
        ))}
      </div>
    </div>
  )
}

/** Explore 页 Trending Posts 上方的英超赛程条。 */
export function PremierLeagueFixtures() {
  const { fixtures, query } = usePremierLeagueFixtures()

  if (!query.isPending && fixtures.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-[#37003c] dark:text-[#e4cbea]">
          {/* 官方狮子 logo：浅色用品牌紫，深色用白色（与 premierleague.com 一致） */}
          <span
            aria-hidden="true"
            className="h-8 w-8 shrink-0 bg-[url(/pl-lion-purple.svg)] bg-contain bg-center bg-no-repeat dark:bg-[url(/pl-lion-white.svg)]"
          />
          Premier League
        </h2>
        {fixtures.some((fixture) => fixture.status === "IN_PLAY" || fixture.status === "PAUSED") && (
          <span className="flex items-center gap-1.5 rounded-full border border-destructive/50 px-2 py-0.5 text-xs font-semibold text-destructive">
            <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
            LIVE
          </span>
        )}
      </div>

      {query.isPending ? <FixturesRailSkeleton /> : <FixturesRail fixtures={fixtures} />}
    </section>
  )
}
