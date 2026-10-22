"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { Flame, ImageIcon, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  FOOTBALL_LEAGUES,
  SPORT_THEMES,
  SPORTS_BACKGROUND_PRESETS,
  type SportId,
} from "@/lib/sports/config"
import { useSportsBackground } from "@/hooks/sports/useSportsBackground"
import { FootballSection } from "./FootballSection"
import { F1Section } from "./F1Section"
import { SportsNews } from "./SportsNews"
import { SportsCommunity } from "./SportsCommunity"

const SPORT_ICONS: Record<SportId, string> = { football: "⚽", f1: "🏎️" }

export function SportsHub() {
  const t = useTranslations("sports")
  const [sport, setSport] = useState<SportId>("football")
  const [leagueCode, setLeagueCode] = useState(FOOTBALL_LEAGUES[0].code)
  const { background, setPreset, setImageUrl, reset } = useSportsBackground()
  const [draftUrl, setDraftUrl] = useState("")

  const theme = SPORT_THEMES[sport]
  const activeLeague = useMemo(
    () => FOOTBALL_LEAGUES.find((league) => league.code === leagueCode),
    [leagueCode],
  )

  const heroStyle = useMemo(() => {
    if (background.imageUrl) {
      return {
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 100%), url(${background.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } as const
    }
    const preset = SPORTS_BACKGROUND_PRESETS.find((p) => p.id === background.presetId)
    return { background: preset?.css ?? theme.heroGradient }
  }, [background, theme])

  return (
    <div className="space-y-6" style={{ "--sport-brand": theme.brandColor } as React.CSSProperties}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-3xl border border-border/40 text-white shadow-lg"
        style={heroStyle}
      >
        <div className="relative flex flex-col gap-5 p-6 md:p-10">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur">
              <Zap className="h-3.5 w-3.5" />
              SportsPulse
            </span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 rounded-full bg-white/15 px-3 text-xs text-white hover:bg-white/25 hover:text-white"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  {t("background.customize")}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("background.presets")}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {SPORTS_BACKGROUND_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      aria-label={preset.id}
                      onClick={() => setPreset(preset.id)}
                      className={cn(
                        "h-10 rounded-lg border-2 transition-transform hover:scale-105",
                        background.presetId === preset.id
                          ? "border-primary"
                          : "border-transparent",
                      )}
                      style={{ background: preset.css }}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("background.imageUrlLabel")}
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={draftUrl}
                      onChange={(event) => setDraftUrl(event.target.value)}
                      placeholder={t("background.imageUrlPlaceholder")}
                      className="h-8 text-xs"
                    />
                    <Button
                      size="sm"
                      className="h-8 shrink-0"
                      onClick={() => {
                        setImageUrl(draftUrl)
                        setDraftUrl("")
                      }}
                      disabled={!draftUrl.trim()}
                    >
                      {t("background.apply")}
                    </Button>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={reset}>
                  {t("background.reset")}
                </Button>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight md:text-4xl">
              <Flame className="h-8 w-8 text-white/90" />
              {t("title")}
            </h1>
            <p className="max-w-xl text-sm text-white/85 md:text-base">{t("subtitle")}</p>
          </div>

          {/* 运动切换 */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SPORT_THEMES) as SportId[]).map((id) => {
              const isActive = sport === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSport(id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all",
                    isActive
                      ? "bg-white text-black shadow-md scale-105"
                      : "bg-white/15 text-white backdrop-blur hover:bg-white/25",
                  )}
                >
                  <span aria-hidden>{SPORT_ICONS[id]}</span>
                  {t(`switch.${id}`)}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 数据板块 ─────────────────────────────────────────── */}
      {sport === "football" ? (
        <FootballSection league={leagueCode} onLeagueChange={setLeagueCode} />
      ) : (
        <F1Section />
      )}

      {/* ── 资讯 + 社区 ─────────────────────────────────────── */}
      <SportsNews sport={sport} officialSites={theme.officialSites} />

      <SportsCommunity sport={sport} leagueHashtag={activeLeague?.hashtag} />
    </div>
  )
}
