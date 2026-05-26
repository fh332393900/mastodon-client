"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { mastodon } from "masto"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverArrow,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperType } from "swiper"
import { MediaBlurhash } from "@/components/mastodon/media-blurhash"
import { useAppPreferences } from "@/hooks/mastodon/useAppPreferences"
import "swiper/css"

export type MediaAttachment = mastodon.v1.MediaAttachment

type MediaImageProps = {
  media: MediaAttachment
  index: number
  group?: MediaAttachment[]
}

export function MediaImage({ media, index, group }: MediaImageProps) {
  const t = useTranslations("settings.media")
  const { prefs } = useAppPreferences()
  const [showAlt, setShowAlt] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [current, setCurrent] = useState(index)
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  const [isLoaded, setIsLoaded] = useState(!prefs.dataSaver)

  const aspectRatio = useMemo(() => {
    const meta = media.meta as Record<string, { width?: number; height?: number; aspect?: number } | null | undefined> | undefined
    const source = meta?.small ?? meta?.original
    if (source?.aspect && source.aspect > 0) return source.aspect
    if (source?.width && source?.height && source.height > 0) return source.width / source.height
    return undefined
  }, [media.meta])

  useEffect(() => {
    setIsLoaded(!prefs.dataSaver)
  }, [media.url, media.previewUrl, prefs.dataSaver])

  const images = useMemo(() => {
    const list = group && group.length > 0 ? group : [media]
    return list.filter((item) => item.type === "image")
  }, [group, media])

  const currentImage = images[current] ?? media
  const altText = media.description || ""
  const canNavigate = images.length > 1
  const goNext = () => {
    if (!canNavigate || !swiper) return
    swiper.slideNext()
  }

  const goPrev = () => {
    if (!canNavigate || !swiper) return
    swiper.slidePrev()
  }

  const handleOpen = () => {
    setCurrent(index)
    setIsOpen(true)
  }

  useEffect(() => {
    if (!swiper) return
    if (!isOpen) return
    swiper.slideToLoop(index, 0)
  }, [index, isOpen, swiper])

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
      <button
        type="button"
        onClick={handleOpen}
        className="block w-full min-h-[200px] sm:min-h-[300px] relative overflow-hidden"
        style={aspectRatio ? { aspectRatio } : undefined}
        aria-label="预览图片"
      >
        <MediaBlurhash
          blurhash={media.blurhash}
          src={media.url || undefined}
          previewUrl={media.previewUrl || undefined}
          shouldLoad={isLoaded}
          alt={media.description || "media"}
        />
        {!isLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsLoaded(true)
              }}
              className="flex cursor-pointer items-center justify-center rounded-full bg-black/60 p-2.5 text-white hover:bg-black transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        )}
      </button>

      {altText ? (
        <Popover open={showAlt} onOpenChange={setShowAlt}>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
              }}
              className="absolute text-xs bottom-2 left-2 cursor-pointer rounded-xs bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
            >
              ALT
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={8}
            className="w-64 rounded-sm bg-white p-3 text-xs text-slate-900"
          >
            <PopoverArrow className="fill-white" />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setShowAlt(false)
              }}
              className="absolute cursor-pointer right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              aria-label="关闭"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="pr-6">
              <div className="text-[11px] font-semibold text-primary/70">{t("altDescription")}</div>
              <div className="mt-1 leading-relaxed">{altText}</div>
            </div>
          </PopoverContent>
        </Popover>
      ) : null}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogPortal>
          <DialogOverlay
            className="bg-black/60"
            onClick={() => setIsOpen(false)}
          />
          <DialogPrimitive.Content
            data-slot="image-dialog"
            className="fixed inset-0 z-50 flex items-center justify-center outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsOpen(false)
              }
            }}
            onEscapeKeyDown={() => setIsOpen(false)}
          >
            <DialogTitle className="sr-only">图片预览</DialogTitle>
            <div
              className="relative flex h-[90vh] w-[100vw] items-center justify-center"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  setIsOpen(false)
                }
              }}
            >
            {/* Image - no extra background or border */}
            <div className="relative w-[95vw] overflow-hidden">
              <Swiper
                className="h-full w-full"
                onSwiper={setSwiper}
                onSlideChange={(instance) => setCurrent(instance.realIndex)}
                loop={canNavigate}
                allowTouchMove={canNavigate}
                initialSlide={index}
              >
                {images.map((item, idx) => (
                  <SwiperSlide
                    key={`${item.id ?? idx}-${idx}`}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <img
                      src={item?.url || item?.previewUrl || undefined}
                      alt={item?.description || "media"}
                      className="max-h-[85vh] w-full object-contain"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Close button on the overlay background (top-right) */}
              <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute cursor-pointer right-4 top-4 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
              aria-label="关闭预览"
            >
              <X className="h-4 w-4" />
              </button>

            {/* Navigation buttons on overlay */}
              {canNavigate && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className={cn(
                      "absolute left-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60",
                      !canNavigate && "opacity-40 cursor-not-allowed",
                    )}
                    disabled={!canNavigate}
                    aria-label="上一张"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    className={cn(
                      "absolute right-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60",
                      !canNavigate && "opacity-40 cursor-not-allowed",
                    )}
                    disabled={!canNavigate}
                    aria-label="下一张"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

            {/* Bottom index and alt bar */}
              <div className="absolute -bottom-3 left-1/2 z-50 w-full md:max-w-[min(90%,600px)] -translate-x-1/2 px-4">
                {canNavigate && (
                  <div className="mb-2 text-center">
                    <span className="inline-flex items-center rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">
                      {`${current + 1}/${images.length}`}
                    </span>
                  </div>
                )}

                {currentImage?.description ? (
                  <div
                    className="line-clamp-1 rounded-full bg-black/60 px-3 py-1 text-xs/6 text-white"
                    title={currentImage.description}
                  >
                    {currentImage.description}
                  </div>
                ) : null}
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  )
}
