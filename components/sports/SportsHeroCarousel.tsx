"use client"

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { useLocale, useTranslations } from "next-intl"
import { ChevronLeft, ChevronRight, ExternalLink, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { SPORT_THEMES, type SportId } from "@/lib/sports/config"
import { newsImage, type SportsNewsItem } from "@/lib/sports/news"

/** 精选条数 */
const MAX_SLIDES = 5
/** 自动轮播间隔 */
const AUTOPLAY_MS = 6000

/** 足球用 emoji；F1 用官方红色 logo（public/f1-logo.svg） */
const SPORT_ICONS: Record<SportId, { emoji?: string; logo?: string }> = {
  football: { emoji: "⚽" },
  f1: { logo: "/f1-logo.svg" },
}

interface SportsHeroCarouselProps {
  sport: SportId
  onSportChange: (sport: SportId) => void
  items: SportsNewsItem[]
  isLoading: boolean
  /** 无配图或加载中的兜底背景（主题渐变 / 自定义背景） */
  fallbackStyle: CSSProperties
  /** 右上角操作区（背景自定义入口） */
  actions?: ReactNode
}

function formatRelativeTime(value: string, locale: string): string {
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return ""
  const minutes = Math.round((timestamp - Date.now()) / 60_000)
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute")
  if (Math.abs(minutes) < 60 * 24) return formatter.format(Math.round(minutes / 60), "hour")
  return formatter.format(Math.round(minutes / 1440), "day")
}

/**
 * 体育首页头条轮播：精选 5 条资讯，自动轮播 + 左右切换 + 圆点指示 + 触摸滑动。
 * 左下角内嵌足球 / F1 切换，hover 或键盘聚焦时暂停自动播放。
 */
export function SportsHeroCarousel({
  sport,
  onSportChange,
  items,
  isLoading,
  fallbackStyle,
  actions,
}: SportsHeroCarouselProps) {
  const t = useTranslations("sports.hero")
  const tSwitch = useTranslations("sports.switch")
  const tNews = useTranslations("sports.news")
  const locale = useLocale()
  const slides = items.slice(0, MAX_SLIDES)
  const [rawIndex, setRawIndex] = useState(0)
  const index = slides.length === 0 ? 0 : Math.min(rawIndex, slides.length - 1)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const go = useCallback(
    (delta: number) => {
      if (slides.length === 0) return
      setRawIndex((current) => (Math.min(current, slides.length - 1) + delta + slides.length) % slides.length)
    },
    [slides.length],
  )

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const timer = window.setInterval(() => go(1), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [go, paused, slides.length])

  const activeSlide = slides[index]
  /** 只挂载当前与下一张的图片，首屏不必为 5 张大图买单 */
  const nextIndex = slides.length > 1 ? (index + 1) % slides.length : -1

  return (
    <section
      aria-roledescription="carousel"
      className="group/hero relative overflow-hidden rounded-3xl border border-border/40 shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return
        const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current
        touchStartX.current = null
        if (Math.abs(delta) > 40) go(delta > 0 ? -1 : 1)
      }}
    >
      <div className="relative h-[240px] sm:h-[260px] md:h-[300px]">
        {slides.map((item, slideIndex) => {
          const isActive = slideIndex === index
          const image = slideIndex === index || slideIndex === nextIndex ? newsImage(item.image, "hero") : null
          return (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={isActive ? 0 : -1}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 block transition-opacity duration-700",
                isActive ? "z-10 opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {image?.src ? (
                <img
                  src={image.src}
                  srcSet={image.srcSet}
                  sizes="(min-width: 768px) 640px, 100vw"
                  alt=""
                  loading={isActive ? "eager" : "lazy"}
                  fetchPriority={isActive ? "high" : "auto"}
                  decoding="async"
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-transform ease-out",
                    isActive ? "scale-105 duration-[7000ms]" : "scale-100 duration-700",
                  )}
                />
              ) : (
                <div className="absolute inset-0" style={fallbackStyle} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

              <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-4 pb-16 sm:p-5 sm:pb-[70px] md:pb-[74px]">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/80 sm:text-[11px]">
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-white backdrop-blur">
                    {t("featured")}
                  </span>
                  <span className="truncate">{item.source}</span>
                  {item.publishedAt && (
                    <span className="shrink-0">· {formatRelativeTime(item.publishedAt, locale)}</span>
                  )}
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                </div>
                <h2 className="line-clamp-2 max-w-2xl text-base font-black leading-snug text-white drop-shadow-sm sm:text-lg md:text-xl">
                  {item.title}
                </h2>
              </div>
            </a>
          )
        })}

        {/* 加载态：保留兜底背景 + 骨架屏 */}
        {isLoading && slides.length === 0 && (
          <div className="absolute inset-0" style={fallbackStyle}>
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-4 pb-16 sm:p-5">
              <div className="h-2.5 w-24 animate-pulse rounded-full bg-white/30" />
              <div className="h-5 w-4/5 animate-pulse rounded-lg bg-white/25" />
              <div className="h-5 w-2/5 animate-pulse rounded-lg bg-white/20" />
            </div>
          </div>
        )}

        {/* 无数据兜底 */}
        {!isLoading && slides.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={fallbackStyle}>
            <p className="rounded-full bg-black/25 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
              {tNews("empty")}
            </p>
          </div>
        )}

        {/* 顶部：品牌标识 + 操作区 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4 sm:p-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur">
            <Zap className="h-3.5 w-3.5" />
            SportsPulse
          </span>
          {actions && <div className="pointer-events-auto flex shrink-0 items-center gap-2">{actions}</div>}
        </div>

        {/* 左右切换 */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label={t("prev")}
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur transition-all hover:bg-black/45 md:opacity-0 md:group-hover/hero:opacity-100 md:focus-visible:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t("next")}
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur transition-all hover:bg-black/45 md:opacity-0 md:group-hover/hero:opacity-100 md:focus-visible:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* 底部：运动切换 + 轮播指示 */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 p-4 sm:p-5">
          <div className="inline-flex items-center gap-1 rounded-full bg-black/30 p-1 backdrop-blur">
            {(Object.keys(SPORT_THEMES) as SportId[]).map((id) => {
              const isActive = sport === id
              const icon = SPORT_ICONS[id]
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onSportChange(id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all",
                    isActive
                      ? "bg-white text-black shadow-sm"
                      : "text-white/85 hover:bg-white/15 hover:text-white",
                  )}
                >
                  {icon.logo ? (
                    <img src={icon.logo} alt="" aria-hidden="true" className="h-3 w-auto" />
                  ) : (
                    <span aria-hidden>{icon.emoji}</span>
                  )}
                  {tSwitch(id)}
                </button>
              )
            })}
          </div>

          {slides.length > 1 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {slides.map((item, slideIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`${slideIndex + 1} / ${slides.length}`}
                    aria-current={slideIndex === index}
                    onClick={() => setRawIndex(slideIndex)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      slideIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/45 hover:bg-white/75",
                    )}
                  />
                ))}
              </div>
              <span className="hidden text-[11px] font-semibold tabular-nums text-white/80 sm:inline">
                {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        {/* 屏幕阅读器播报当前头条 */}
        <p className="sr-only" aria-live="polite">
          {activeSlide?.title ?? ""}
        </p>
      </div>
    </section>
  )
}
