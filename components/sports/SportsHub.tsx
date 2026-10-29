"use client"

import { useMemo, useState, type CSSProperties } from "react"
import { useTranslations } from "next-intl"
import { ImageIcon } from "lucide-react"
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
import { useSportsNews } from "@/hooks/sports/useSportsNews"
import { FootballSection } from "./FootballSection"
import { F1Section } from "./F1Section"
import { SportsHeroCarousel } from "./SportsHeroCarousel"
import { SportsNews } from "./SportsNews"
import { SportsCommunity } from "./SportsCommunity"

export function SportsHub() {
  const t = useTranslations("sports")
  const [sport, setSport] = useState<SportId>("football")
  const [leagueCode, setLeagueCode] = useState(FOOTBALL_LEAGUES[0].code)
  const { background, setPreset, setImageUrl, reset } = useSportsBackground()
  const [draftUrl, setDraftUrl] = useState("")
  const { data: heroNews, isLoading: isHeroLoading } = useSportsNews(sport)

  const theme = SPORT_THEMES[sport]
  const activeLeague = useMemo(
    () => FOOTBALL_LEAGUES.find((league) => league.code === leagueCode),
    [leagueCode],
  )

  /** 轮播无配图时的兜底背景：自定义背景图 > 预设渐变 > 主题渐变 */
  const heroStyle = useMemo(() => {
    if (background.imageUrl) {
      return {
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 100%), url(${background.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } as CSSProperties
    }
    const preset = SPORTS_BACKGROUND_PRESETS.find((p) => p.id === background.presetId)
    return { background: preset?.css ?? theme.heroGradient } as CSSProperties
  }, [background, theme])

  return (
    <div className="space-y-6" style={{ "--sport-brand": theme.brandColor } as CSSProperties}>
      {/* ── 标题（紧凑单行，避免占用首屏高度） ─────────────────── */}
      <div className="flex min-w-0 items-baseline gap-2.5">
        <h1 className="shrink-0 text-xl font-black tracking-tight md:text-2xl">{t("title")}</h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">{t("subtitle")}</p>
      </div>

      {/* ── 头条轮播（足球 / F1 切换在轮播左下角） ─────────────── */}
      <SportsHeroCarousel
        key={sport}
        sport={sport}
        onSportChange={setSport}
        items={heroNews ?? []}
        isLoading={isHeroLoading}
        fallbackStyle={heroStyle}
        actions={
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-full bg-black/25 px-3 text-xs text-white backdrop-blur hover:bg-black/45 hover:text-white"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("background.customize")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">{t("background.presets")}</p>
              <div className="grid grid-cols-4 gap-2">
                {SPORTS_BACKGROUND_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    aria-label={preset.id}
                    onClick={() => setPreset(preset.id)}
                    className={cn(
                      "h-10 rounded-lg border-2 transition-transform hover:scale-105",
                      background.presetId === preset.id ? "border-primary" : "border-transparent",
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
        }
      />

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
