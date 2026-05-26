"use client"

import { useEffect, useRef, useState } from "react"
import { MediaImage } from "@/components/mastodon/media-image"
import { useTranslations } from "next-intl"
import type { mastodon } from "masto"

interface StatusMediaProps {
  attachments: mastodon.v1.MediaAttachment[]
  spoilered?: boolean
}

export function StatusMedia({ attachments, spoilered = false }: StatusMediaProps) {
  const t = useTranslations("settings")
  if (attachments.length === 0) return null
  const hasVideo = attachments.some((item) => item.type === "video")
  const isSingleItem = attachments.length === 1

  return (
    <div
      className={`relative grid gap-3 ${hasVideo || isSingleItem ? "grid-cols-1" : "sm:grid-cols-2"}`}
    >
      {attachments.map((item, index) => (
        <div
          key={item.id}
          className={`overflow-hidden rounded-2xl border border-border/60 bg-muted/40 max-h-[100vh] ${
            item.type === "video" ? "sm:col-span-2" : ""
          }`}
        >
          <div className={spoilered ? "blur-[20px] scale-105" : ""}>
            {item.type === "image" ? (
              <MediaImage media={item} index={index} group={attachments} />
            ) : (
              <AutoPlayVideo src={item.url || undefined} />
            )}
          </div>
        </div>
      ))}
      {spoilered && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-sm">
          <span className="text-sm font-bold text-foreground/80">
            {t("status.spoilerMediaReveal")}
          </span>
        </div>
      )}
    </div>
  )
}

function AutoPlayVideo({ src }: { src?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement === video ||
        (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement === video
      )
      video.style.objectFit = isFullscreen ? "contain" : "cover"
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)

    const threshold = video.clientHeight > window.innerHeight ? 0.5 : 0.7

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return

        if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
          void video.play().catch(() => {
            // ignore autoplay failures (e.g. browser policy)
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
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
    }
  }, [src])

  return (
    <div className="relative min-h-[200px]">
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/60 animate-pulse rounded-2xl">
          <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        controls
        muted
        playsInline
        preload="metadata"
        className="h-auto w-full max-h-[90vh] object-cover"
        onLoadedMetadata={() => setReady(true)}
      />
    </div>
  )
}
