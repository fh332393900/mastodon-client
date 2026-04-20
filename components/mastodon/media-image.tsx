"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { mastodon } from "masto"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverArrow,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type MediaAttachment = mastodon.v1.MediaAttachment

type MediaImageProps = {
  media: MediaAttachment
  index: number
  group?: MediaAttachment[]
}

export function MediaImage({ media, index, group }: MediaImageProps) {
  const [showAlt, setShowAlt] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [current, setCurrent] = useState(index)

  const images = useMemo(() => {
    const list = group && group.length > 0 ? group : [media]
    return list.filter((item) => item.type === "image")
  }, [group, media])

  const currentImage = images[current] ?? media
  const altText = media.description || ""
  const canNavigate = images.length > 1

  const handleOpen = () => {
    setCurrent(index)
    setIsOpen(true)
  }

  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
      <button
        type="button"
        onClick={handleOpen}
        className="block w-full h-full"
        aria-label="预览图片"
      >
        <img
          src={ media.url || media.previewUrl || undefined}
          alt={media.description || "media"}
          className="h-full object-cover"
        />
      </button>

      {altText ? (
        <Popover open={showAlt} onOpenChange={setShowAlt}>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
              }}
              className="absolute text-xs bottom-2 left-2 cursor-pointer rounded-xs bg-black/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
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
              <div className="text-[11px] font-semibold text-slate-500">描述</div>
              <div className="mt-1 leading-relaxed">{altText}</div>
            </div>
          </PopoverContent>
        </Popover>
      ) : null}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-black/60" />
          <DialogPrimitive.Content
            data-slot="image-dialog"
            className="fixed inset-0 z-50 flex items-center justify-center outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          >
            <div className="relative flex h-[90vh] w-[100vw] items-center justify-center">
            {/* Image - no extra background or border */}
            <div className="flex max-h-full max-w-full items-center justify-center">
              <img
                src={currentImage?.url || currentImage?.previewUrl || undefined}
                alt={currentImage?.description || "media"}
                className="max-h-[85vh] max-w-[95vw] object-contain"
              />
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
                    onClick={() => setCurrent((prev) => Math.max(prev - 1, 0))}
                    className={cn(
                      "absolute left-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60",
                      current === 0 && "opacity-40 cursor-not-allowed",
                    )}
                    disabled={current === 0}
                    aria-label="上一张"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrent((prev) => Math.min(prev + 1, images.length - 1))}
                    className={cn(
                      "absolute right-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60",
                      current === images.length - 1 && "opacity-40 cursor-not-allowed",
                    )}
                    disabled={current === images.length - 1}
                    aria-label="下一张"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

            {/* Bottom index and alt bar */}
              <div className="absolute bottom-4 left-1/2 z-50 w-[min(90%,600px)] -translate-x-1/2 px-4">
                {canNavigate && (
                  <div className="mb-2 text-center">
                    <span className="inline-flex items-center rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">
                      {`${current + 1}/${images.length}`}
                    </span>
                  </div>
                )}

                {currentImage?.description ? (
                  <div
                    className="line-clamp-1 rounded-full bg-black/60 px-3 py-1 text-sm/6 text-white"
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
