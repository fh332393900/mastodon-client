"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useExploreNewsCache } from "@/hooks/mastodon/useExploreNewsCache"
import type { ExploreTrendingLink } from "@/hooks/mastodon/useExploreNewsCache"

function NewsCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-3xl border border-border/70 bg-card/90 px-4 py-3 animate-pulse">
      {/* 左侧方形封面 */}
      <div className="shrink-0 w-20 h-20 rounded-xl bg-muted/60 dark:bg-muted-foreground/40" />
      {/* 右侧文字区 */}
      <div className="flex flex-1 flex-col gap-2 pb-2 min-w-0">
        {/* 标题 */}
        <div className="h-5 w-2/5 rounded bg-muted/60 dark:bg-muted-foreground/40" />
        {/* 正文三行 */}
        <div className="h-4 w-full rounded bg-muted/60 dark:bg-muted-foreground/40" />
        <div className="h-4 w-4/5 rounded bg-muted/60 dark:bg-muted-foreground/40" />
        <div className="h-4 w-2/5 rounded bg-muted/60 dark:bg-muted-foreground/40" />
      </div>
    </div>
  )
}

export default function ExploreNewsPage() {
  const { links, query, isReady } = useExploreNewsCache()
  const { isLoading } = query

  const title = useMemo(() => "Trending Links", [])

  if (!isReady || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Badge variant="outline" className="text-accent border-accent/50">
          {links.length} links
        </Badge>
      </div>

      {links.length === 0 ? (
        <div className="rounded-3xl border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
          暂无热门链接。
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((item: ExploreTrendingLink) => (
            <Link
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group flex gap-3 rounded-3xl border border-border/70 bg-card/90 p-4 transition hover:border-border hover:bg-card"
            >
              {/* 封面图 */}
              <div className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-muted">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.imageDescription || item.title || ""}
                    fill
                    sizes="80px"
                    className="object-cover transition group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                    <ExternalLink className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* 文字区 */}
              <div className="min-w-0 flex-1 flex flex-col justify-between gap-1">
                <div>
                  <p className="font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title || item.url}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* 来源行 */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {item.providerName && (
                    <>
                      <span className="font-medium truncate max-w-[120px]">{item.providerName}</span>
                      {item.authorName && <span>·</span>}
                    </>
                  )}
                  {item.authorName && (
                    <span className="truncate max-w-[120px]">{item.authorName}</span>
                  )}
                  <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
