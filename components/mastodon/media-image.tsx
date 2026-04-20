"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { mastodon } from "masto"
import { Dialog, DialogContent } from "@/components/ui/dialog"
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
  const altText = media.description || "图片说明"
  const canNavigate = images.length > 1

  const handleOpen = () => {
    setCurrent(index)
    setIsOpen(true)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
      <button
        type="button"
        onClick={handleOpen}
        className="block w-full"
        aria-label="预览图片"
      >
        <img
          src={media.previewUrl || media.url || undefined}
          alt={media.description || "media"}
          className="h-full w-full object-cover"
        />
      </button>

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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-w-5xl border-none p-0"
          showCloseButton
        >
          <div className="relative flex h-[90vh] items-center justify-center">
            <img
              src={currentImage?.url || currentImage?.previewUrl || undefined}
              alt={currentImage?.description || "media"}
              className="max-h-full object-cover"
            />

            {canNavigate && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
                <button
                  type="button"
                  onClick={() => setCurrent((prev) => Math.max(prev - 1, 0))}
                  className={cn(
                    "pointer-events-auto rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80",
                    current === 0 && "opacity-40 cursor-not-allowed",
                  )}
                  disabled={current === 0}
                  aria-label="上一张"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrent((prev) => Math.min(prev + 1, images.length - 1))
                  }
                  className={cn(
                    "pointer-events-auto rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80",
                    current === images.length - 1 && "opacity-40 cursor-not-allowed",
                  )}
                  disabled={current === images.length - 1}
                  aria-label="下一张"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
