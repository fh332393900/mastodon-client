"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MediaImage } from "@/components/mastodon/media-image"
import { MediaBlurhash } from "@/components/mastodon/media-blurhash"
import { useTranslations } from "next-intl"
import type { mastodon } from "masto"
import { useAppPreferences } from "@/hooks/mastodon/useAppPreferences"

interface StatusMediaProps {
  attachments: mastodon.v1.MediaAttachment[]
  spoilered?: boolean
}

export function StatusMedia({ attachments, spoilered = false }: StatusMediaProps) {
  const t = useTranslations("settings")
  const { prefs } = useAppPreferences()
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
              <AutoPlayVideo src={item.url || undefined} blurhash={item.blurhash} previewUrl={item.previewUrl} autoPlay={prefs.autoPlayVideo} dataSaver={prefs.dataSaver} meta={item.meta as Record<string, { width?: number; height?: number; aspect?: number } | null | undefined> | null | undefined} />
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

function AutoPlayVideo({ src, blurhash, previewUrl, autoPlay = true, dataSaver = false, meta }: { src?: string; blurhash?: string | null; previewUrl?: string | null; autoPlay?: boolean; dataSaver?: boolean; meta?: Record<string, { width?: number; height?: number; aspect?: number } | null | undefined> | null }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(!dataSaver)

  const aspectRatio = useMemo(() => {
    const source = (meta as Record<string, { width?: number; height?: number; aspect?: number } | null | undefined> | undefined)?.small
      ?? (meta as Record<string, { width?: number; height?: number; aspect?: number } | null | undefined> | undefined)?.original
    if (source?.aspect && source.aspect > 0) return source.aspect
    if (source?.width && source?.height && source.height > 0) return source.width / source.height
    return undefined
  }, [meta])

  useEffect(() => {
    setIsLoaded(!dataSaver)
  }, [src, dataSaver])

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

        if (!autoPlay) return

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
  }, [src, autoPlay])

  return (
    <div
      className="relative w-full min-h-[200px] sm:min-h-[300px] overflow-hidden"
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {isLoaded ? (
        <video
          ref={videoRef}
          src={src}
          controls
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <>
          <MediaBlurhash
            blurhash={blurhash}
            previewUrl={previewUrl || undefined}
            shouldLoad={false}
            alt=""
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsLoaded(true)
              }}
              className="flex cursor-pointer items-center justify-center rounded-full bg-black/60 p-2.5 text-white hover:bg-black transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
