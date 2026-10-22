"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Hash, MessagesSquare, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { InfiniteScroller, LoadingSkeleton } from "@/components/mastodon/infinite-scroller"
import { StatusCard } from "@/components/mastodon/Status"
import { ComposeEditor, type ComposeEditorHandle } from "@/components/mastodon/compose-editor"
import { useMasto } from "@/components/auth/masto-provider"
import { useTagTimelineCache } from "@/hooks/mastodon/useTagTimelineCache"
import { SPORT_THEMES, type SportId } from "@/lib/sports/config"

interface SportsCommunityProps {
  sport: SportId
  /** 足球模式下当前选中联赛的话题，排在话题列表首位 */
  leagueHashtag?: string
}

export function SportsCommunity({ sport, leagueHashtag }: SportsCommunityProps) {
  const t = useTranslations("sports.community")

  const tags = useMemo(() => {
    const base = SPORT_THEMES[sport].hashtags
    const list = leagueHashtag ? [leagueHashtag, ...base] : [...base]
    return Array.from(new Set(list))
  }, [sport, leagueHashtag])

  const [activeTag, setActiveTag] = useState(tags[0])
  useEffect(() => {
    setActiveTag(tags[0])
  }, [tags])

  return (
    <section className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <MessagesSquare className="h-5 w-5 text-[var(--sport-brand)]" />
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* 话题切换 */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={cn(
              "flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all",
              activeTag === tag
                ? "bg-[var(--sport-brand)] text-white shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Hash className="h-3.5 w-3.5" />
            {tag}
          </button>
        ))}
      </div>

      <QuickCompose key={activeTag} activeTag={activeTag} tags={tags} />

      <TagTimeline tag={activeTag} />
    </section>
  )
}

function QuickCompose({ activeTag, tags }: { activeTag: string; tags: string[] }) {
  const t = useTranslations("sports.community")
  const router = useRouter()
  const { server } = useMasto()
  const [text, setText] = useState("")
  const editorRef = useRef<ComposeEditorHandle | null>(null)

  const appendToken = (token: string) => {
    editorRef.current?.insertText(`${token} `)
  }

  const handleSubmit = () => {
    const body = text.trim()
    const tagToken = `#${activeTag}`
    const finalText = body.includes(tagToken) ? body : `${body} ${tagToken}`.trim()
    const target = `/${server}/compose?text=${encodeURIComponent(finalText)}`
    router.push(target)
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-card/80 p-4">
      {/* 复用完整 compose 编辑器：自带 # 话题 / @ 账号自动查询 */}
      <ComposeEditor
        value={text}
        onChange={setText}
        placeholder={t("quickPostPlaceholder")}
        editorRef={editorRef}
      />
      <div className="flex flex-wrap items-center gap-2">
        {tags.slice(0, 4).map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => appendToken(`#${tag}`)}
            className="rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-[var(--sport-brand)]/15 hover:text-[var(--sport-brand)]"
          >
            #{tag}
          </button>
        ))}
        <Button
          type="button"
          size="sm"
          className="ml-auto h-8 gap-1.5 bg-[var(--sport-brand)] text-white hover:opacity-90"
          onClick={handleSubmit}
          disabled={!text.trim()}
        >
          <Send className="h-3.5 w-3.5" />
          {t("quickPostAction")}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t("autocompleteHint")}</p>
    </div>
  )
}

function TagTimeline({ tag }: { tag: string }) {
  const t = useTranslations("sports.community")
  const { posts, query } = useTagTimelineCache({ tag })
  const { isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = query

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }

  if (isLoading) return <LoadingSkeleton />

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/80 p-6 text-center text-sm text-muted-foreground">
        {t("emptyPosts")}
      </div>
    )
  }

  return (
    <InfiniteScroller
      onLoadMore={handleLoadMore}
      hasMore={!!hasNextPage}
      isLoadingMore={isFetchingNextPage}
      scrollCacheKey={`sports:community:${tag}`}
      scrollThrottleMs={120}
    >
      <div className="space-y-4">
        {posts.map((status) => (
          <StatusCard key={status.id} status={status} />
        ))}
      </div>
    </InfiniteScroller>
  )
}
