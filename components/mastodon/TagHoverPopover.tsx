"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import type { mastodon } from "masto"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Loader2, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { TagTrend } from "@/components/mastodon/TagCard"

export default function TagHoverPopover({
  tagName,
  children,
}: {
  tagName: string
  children: React.ReactNode
}) {
  const { client, server } = useMasto()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [tag, setTag] = useState<mastodon.v1.Tag | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const openTimer = useRef<number | null>(null)
  const closeTimer = useRef<number | null>(null)
  const canInteract = !!user

  const fetchTag = async () => {
    if (!client) return
    setIsFetching(true)
    try {
      const result = await (client.v1.tags as any).$select(tagName).fetch()
      setTag(result)
      setIsLoaded(true)
    } catch {
      setTag(null)
      setIsLoaded(true)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    if (!open || isLoaded || !client) return
    fetchTag()
  }, [open, isLoaded, client])

  const scheduleOpen = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current)
    if (closeTimer.current) window.clearTimeout(closeTimer.current)

    openTimer.current = window.setTimeout(() => setOpen(true), 120)
  }

  const scheduleClose = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current)
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpen(false), 150)
  }

  useEffect(() => {
    return () => {
      if (openTimer.current) window.clearTimeout(openTimer.current)
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    }
  }, [])

  const isFollowing = !!tag?.following

  const handleToggleFollow = async () => {
    if (!client || !canInteract || !tag || isPending) return
    setIsPending(true)
    try {
      const next = isFollowing
        ? await (client.v1.tags as any).$select(tagName).unfollow()
        : await (client.v1.tags as any).$select(tagName).follow()
      setTag(next)
    } catch {
      // ignore
    } finally {
      setIsPending(false)
    }
  }

  const topTrend = tag?.history?.length ? (
    <TagTrend tag={tag} />
  ) : (
    <div className="h-7 w-16 rounded-full bg-muted/40" />
  )

  const baseHref = server ? `/${server}/tags/${encodeURIComponent(tagName)}` : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          onFocus={scheduleOpen}
          onBlur={scheduleClose}
          title={`#${tagName}`}
          className="hover:underline cursor-pointer text-primary"
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="w-80 rounded-xl border border-border bg-card p-4 shadow-lg"
        onMouseEnter={() => {
          if (closeTimer.current) window.clearTimeout(closeTimer.current)
        }}
        onMouseLeave={scheduleClose}
      >
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "h-9 w-9 rounded-full p-0 transition-colors",
              canInteract ? "" : "opacity-50 cursor-not-allowed",
            )}
            onClick={handleToggleFollow}
            disabled={!canInteract || !tag || isPending}
            aria-label={isFollowing ? "取消收藏话题" : "收藏话题"}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Star
                className={cn(
                  "h-4 w-4",
                  isFollowing ? "text-yellow-400" : "text-muted-foreground",
                )}
                fill={isFollowing ? "currentColor" : "none"}
              />
            )}
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground truncate">#{tagName}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {isFetching
                ? "加载话题信息..."
                : tag?.history?.[0]
                ? `最近${2}天 ${tag.history[0].accounts ?? 0} 人访问`
                : "该话题的详情暂不可用"}
            </div>
          </div>

          <div className="shrink-0">{topTrend}</div>
        </div>

        {baseHref ? (
          <Link
            href={baseHref}
            className="mt-4 block rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-center text-sm text-primary hover:bg-muted transition-colors"
          >
            查看话题页面
          </Link>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
