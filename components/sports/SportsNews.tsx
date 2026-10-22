"use client"

import { useTranslations } from "next-intl"
import { ExternalLink, Newspaper } from "lucide-react"
import { useSportsNews } from "@/hooks/sports/useSportsNews"

/** 首屏展示的资讯条数。 */
const NEWS_COUNT = 6

interface SportsNewsProps {
  sport: string
  officialSites: { label: string; url: string }[]
}

function formatPublishedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date)
}

export function SportsNews({ sport, officialSites }: SportsNewsProps) {
  const t = useTranslations("sports.news")
  const { data, isLoading } = useSportsNews(sport)
  const news = (data ?? []).slice(0, NEWS_COUNT)

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Newspaper className="h-5 w-5 text-[var(--sport-brand)]" />
          {t("title")}
        </h2>
        {/* 官网链接以小字链接融入新闻区 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {officialSites.map((site) => (
            <a
              key={site.url}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-[var(--sport-brand)]"
            >
              {site.label} ↗
            </a>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/80 p-6 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-24 overflow-hidden rounded-2xl border border-border/60 bg-card/80 transition-all hover:border-[var(--sport-brand)]/50 hover:shadow-md"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-24 shrink-0 object-cover"
                />
              ) : (
                <div className="flex w-24 shrink-0 items-center justify-center bg-[var(--sport-brand)]/10">
                  <Newspaper className="h-6 w-6 text-[var(--sport-brand)]/50" />
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 p-3">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">{item.title}</p>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  {item.source}
                  {item.publishedAt ? ` · ${formatPublishedAt(item.publishedAt)}` : ""}
                  <ExternalLink className="ml-auto h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
