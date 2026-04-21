"use client"

import { MediaImage } from "@/components/mastodon/media-image"
import type { mastodon } from "masto"

interface StatusMediaProps {
  attachments: mastodon.v1.MediaAttachment[]
}

export function StatusMedia({ attachments }: StatusMediaProps) {
  if (attachments.length === 0) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {attachments.map((item, index) => (
        <div
          key={item.id}
          className="overflow-hidden rounded-2xl border border-border/60 bg-muted/40"
        >
          {item.type === "image" ? (
            <MediaImage media={item} index={index} group={attachments} />
          ) : (
            <video src={item.url || undefined} controls className="h-full w-full" />
          )}
        </div>
      ))}
    </div>
  )
}
