"use client"

import { useMemo } from "react"
import { Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LoadingSkeleton } from "@/components/mastodon/infinite-scroller"
import { useExploreTagsCache } from "@/hooks/mastodon/useExploreTagsCache"
import { TagCard } from "@/components/mastodon/TagCard"
import { useMasto } from "@/components/auth/masto-provider"
import type { mastodon } from "masto"

export default function ExploreTagsPage() {
  const { tags, query, isReady } = useExploreTagsCache()
  const { isLoading } = query
  const { server } = useMasto()

  const title = useMemo(() => "热门话题", [])

  if (!isReady || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <Badge variant="outline" className="text-muted-foreground border-border">
          {tags.length} 个话题
        </Badge>
      </div>

      {tags.length === 0 ? (
        <div className="rounded-3xl border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
          暂无热门标签。
        </div>
      ) : (
        <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card/90">
          {tags.map((tag: mastodon.v1.Tag) => (
            <TagCard key={tag.name} tag={tag} server={server} />
          ))}
        </div>
      )}
    </div>
  )
}
