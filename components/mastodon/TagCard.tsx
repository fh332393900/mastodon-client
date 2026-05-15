"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, Loader2 } from "lucide-react"
import type { mastodon } from "masto"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"

/* ─── mini sparkline ────────────────────────────────────────────── */
export function TagTrend({ tag }: { tag: mastodon.v1.Tag }) {
  const history = tag.history?.slice(0, 7).reverse() ?? []
  if (history.length < 2) return null

  const values = history.map((h) => Number(h.uses ?? 0))
  const max = Math.max(...values, 1)

  const W = 72
  const H = 28
  const pad = 2

  const pts = values.map((v, i) => [
    pad + (i / Math.max(values.length - 1, 1)) * (W - pad * 2),
    H - pad - (v / max) * (H - pad * 2),
  ])

  // Catmull-Rom → cubic bezier smooth path
  const linePath = pts.reduce((d, curr, i) => {
    if (i === 0) return `M ${curr[0].toFixed(1)},${curr[1].toFixed(1)}`
    const prev = pts[i - 1]!
    const next = pts[i + 1] ?? curr
    const prevPrev = pts[i - 2] ?? prev
    const cp1x = prev[0] + (curr[0] - prevPrev[0]) / 6
    const cp1y = prev[1] + (curr[1] - prevPrev[1]) / 6
    const cp2x = curr[0] - (next[0] - prev[0]) / 6
    const cp2y = curr[1] - (next[1] - prev[1]) / 6
    return `${d} C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${curr[0].toFixed(1)},${curr[1].toFixed(1)}`
  }, "")

  const lastPt = pts[pts.length - 1]!
  const firstPt = pts[0]!
  const areaPath = `${linePath} L ${lastPt[0].toFixed(1)},${H} L ${firstPt[0].toFixed(1)},${H} Z`

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="shrink-0 text-primary/70"
      aria-hidden
    >
      <path d={areaPath} className="fill-primary/20" stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ─── TagCard ────────────────────────────────────────────────────── */
export interface TagCardProps {
  tag: mastodon.v1.Tag
  /** 外部传入的初始 following 状态（可选，未传时视为未关注） */
  initialFollowing?: boolean
  /** 服务器名，用于构造 tag 链接 */
  server: string
}

export function TagCard({ tag, initialFollowing = false, server }: TagCardProps) {
  const { client } = useMasto()
  const { user } = useAuth()
  const t = useTranslations("common")
  const canInteract = !!user

  const [following, setFollowing] = useState(tag.following ?? initialFollowing)
  const [isPending, setIsPending] = useState(false)

  const handleStar = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!canInteract || isPending) return
    setIsPending(true)
    try {
      if (following) {
        await (client.v1.tags as any).$select(tag.name).unfollow()
      } else {
        await (client.v1.tags as any).$select(tag.name).follow()
      }
      setFollowing((f) => !f)
    } catch {
      // ignore
    } finally {
      setIsPending(false)
    }
  }

  const accounts = tag.history?.[0]?.accounts ?? 0
  const days = 2

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-foreground/5 transition-colors group">
      {/* Star button */}
      <button
        type="button"
        onClick={handleStar}
        disabled={!canInteract || isPending}
        aria-label={following ? t("tag.unfollowTag") : t("tag.followTag")}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors cursor-pointer",
          "hover:bg-foreground/8 disabled:opacity-40 disabled:cursor-not-allowed",
          following ? "text-yellow-400" : "text-muted-foreground",
        )}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Star
            className="h-4 w-4"
            fill={following ? "currentColor" : "none"}
          />
        )}
      </button>

      {/* Main content — clickable */}
      <Link
        href={`/${server}/tags/${encodeURIComponent(tag.name)}`}
        className="flex flex-1 items-center gap-3 min-w-0"
      >
        {/* Text info */}
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
            #{tag.name}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {t("tag.recentActivity", { accounts, days })}
          </div>
        </div>

        {/* Sparkline */}
        <TagTrend tag={tag} />
      </Link>
    </div>
  )
}
