"use client"

import { useEffect, useRef } from "react"
import { MediaImage } from "@/components/mastodon/media-image"
import type { mastodon } from "masto"

interface StatusMediaProps {
  attachments: mastodon.v1.MediaAttachment[]
}

export function StatusMedia({ attachments }: StatusMediaProps) {
  if (attachments.length === 0) return null
  const hasVideo = attachments.some((item) => item.type === "video")
  const isSingleItem = attachments.length === 1

  return (
    <div
      className={`grid gap-3 ${hasVideo || isSingleItem ? "grid-cols-1" : "sm:grid-cols-2"}`}
    >
      {attachments.map((item, index) => (
        <div
          key={item.id}
          className={`overflow-hidden rounded-2xl border border-border/60 bg-muted/40 max-h-[100vh] ${
            item.type === "video" ? "sm:col-span-2" : ""
          }`}
        >
          {item.type === "image" ? (
            <MediaImage media={item} index={index} group={attachments} />
          ) : (
            <AutoPlayVideo src={item.url || undefined} />
          )}
        </div>
      ))}
    </div>
  )
}

function AutoPlayVideo({ src }: { src?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    const threshold = video.clientHeight > window.innerHeight ? 0.5 : 0.7

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          void video.play().catch(() => {
            // ignore autoplay failures
          })
        } else {
          video.pause()
        }
      },
      { threshold: [0, threshold, 1] },
    )

    observer.observe(video)
    return () => {
      observer.disconnect()
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      className="h-auto w-full max-h-[100vh] object-cover"
    />
  )
}
