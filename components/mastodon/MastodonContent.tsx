"use client"

import { useMemo } from "react"
import { useMasto } from "@/components/auth/masto-provider"
import { contentToReactNode } from '@/lib/mastodon/contentToReactNode'
import { useCustomEmojis } from "@/hooks/mastodon/useCustomEmojis"
import type { mastodon } from "masto"

export default function MastodonContent({
  content,
  emojis,
}: {
  content: string
  emojis?: mastodon.v1.CustomEmoji[]
}) {
  const { server } = useMasto()
  const serverEmojis = useCustomEmojis()

  // Merge: server-wide emojis as base, prop emojis override (e.g. status-specific animated variants)
  const mergedEmojis = useMemo(() => {
    if (!serverEmojis.length) return emojis ?? []
    if (!emojis?.length) return serverEmojis

    const map = new Map(serverEmojis.map((e) => [e.shortcode, e]))
    for (const e of emojis) {
      map.set(e.shortcode, e)
    }
    return Array.from(map.values())
  }, [serverEmojis, emojis])

  return (
    <div className="prose max-w-none break-words text-small content-rich">
      {contentToReactNode(content, mergedEmojis, server)}
    </div>
  )
}
