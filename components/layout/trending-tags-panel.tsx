"use client"

import Link from "next/link"
import { Hash, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TagTrend } from "@/components/mastodon/TagCard"
import { useExploreTagsCache } from "@/hooks/mastodon/useExploreTagsCache"
import { useMasto } from "@/components/auth/masto-provider"
import { useTranslations } from "next-intl"

export function TrendingTagsPanel() {
  const { server } = useMasto()
  const t = useTranslations()
  const { tags, query } = useExploreTagsCache({ limit: 5 })

  return (
    <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-border/50 shadow-lg shadow-primary/5 overflow-hidden">
      <CardHeader className="pb-2 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5 text-primary" />
          {t("common.trendingTopics")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-0 pb-0 flex flex-col min-h-0">
        <div className="min-h-0 flex-1 overflow-y-auto">
        {query.isLoading ? (
          <div className="space-y-3 px-4 pb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-4 w-24 bg-border/60 dark:bg-muted-foreground/40 rounded" />
                <div className="ml-auto h-7 w-16 bg-border/60 dark:bg-muted-foreground/40 rounded" />
              </div>
            ))}
          </div>
        ) : tags.length === 0 ? (
          <p className="px-4 pb-3 text-xs text-muted-foreground">No trending topics</p>
        ) : (
          <div className="divide-y divide-border/40">
            {tags.map((tag) => {
              const todayUses = Number(tag.history?.[0]?.uses ?? 0)
              const accounts = Number(tag.history?.[0]?.accounts ?? 0)
              return (
                <Link
                  key={tag.name}
                  href={server ? `/${server}/tags/${encodeURIComponent(tag.name)}` : "#"}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-foreground/5 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                      #{tag.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Recently {accounts} People · {todayUses} Uses
                    </div>
                  </div>
                  <TagTrend tag={tag} />
                </Link>
              )
            })}
          </div>
        )}
        </div>
        <div className="border-t border-border/40 px-4 py-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="group/more w-full text-xs text-muted-foreground hover:text-primary justify-center"
          >
            <Link href={server ? `/${server}/explore/tag` : "/explore/tag"}>
              {t("common.viewMoreTrendingTags")}
              <ArrowRight className="ml-1 transition-transform duration-300 ease-out group-hover/more:translate-x-1.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
