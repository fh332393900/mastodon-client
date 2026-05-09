"use client"

import type React from "react"
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTranslations } from "next-intl"

export type ImageCropperHandle = {
  getCroppedBlob: () => Promise<Blob | null>
}

type OutputSize = {
  width: number
  height: number
}

type ImageCropperProps = {
  imageUrl: string
  aspect: number
  outputSize: OutputSize
  previewWidth?: number
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const ImageCropper = forwardRef<ImageCropperHandle, ImageCropperProps>(
  ({ imageUrl, aspect, outputSize, previewWidth = 360 }, ref) => {
    const t = useTranslations("settings")
    const containerRef = useRef<HTMLDivElement | null>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)
    const dragRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number } | null>(null)

    const [zoom, setZoom] = useState(1)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [imageSize, setImageSize] = useState({ width: 1, height: 1 })

    const previewHeight = useMemo(() => Math.round(previewWidth / aspect), [previewWidth, aspect])

    useEffect(() => {
      setZoom(1)
      setOffset({ x: 0, y: 0 })
    }, [imageUrl, aspect])

    useImperativeHandle(ref, () => ({
      getCroppedBlob: async () => {
        const container = containerRef.current
        const image = imageRef.current
        if (!container || !image) return null

        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight
        const { width: imgWidth, height: imgHeight } = imageSize

        const baseScale = Math.max(containerWidth / imgWidth, containerHeight / imgHeight)
        const scale = baseScale * zoom
        const displayWidth = imgWidth * scale
        const displayHeight = imgHeight * scale
        const imageX = (containerWidth - displayWidth) / 2 + offset.x
        const imageY = (containerHeight - displayHeight) / 2 + offset.y

        const sourceX = clamp((0 - imageX) / scale, 0, imgWidth)
        const sourceY = clamp((0 - imageY) / scale, 0, imgHeight)
        const sourceW = clamp(containerWidth / scale, 0, imgWidth - sourceX)
        const sourceH = clamp(containerHeight / scale, 0, imgHeight - sourceY)

        const canvas = document.createElement("canvas")
        canvas.width = outputSize.width
        canvas.height = outputSize.height

        const ctx = canvas.getContext("2d")
        if (!ctx) return null

        ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, 0, 0, outputSize.width, outputSize.height)

        return new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/png")
        })
      },
    }))

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.currentTarget
      target.setPointerCapture(event.pointerId)
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        offsetX: offset.x,
        offsetY: offset.y,
      }
    }

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return
      const nextX = dragRef.current.offsetX + (event.clientX - dragRef.current.startX)
      const nextY = dragRef.current.offsetY + (event.clientY - dragRef.current.startY)
      setOffset({ x: nextX, y: nextY })
    }

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.releasePointerCapture(event.pointerId)
      dragRef.current = null
    }

    return (
      <div className="space-y-4">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-xl border border-border bg-muted"
          style={{ width: previewWidth, height: previewHeight }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={t("media.cropPreviewAlt")}
            className={cn("absolute left-1/2 top-1/2 max-w-none", "select-none")}
            style={{
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            }}
            onLoad={(event) => {
              const target = event.currentTarget
              setImageSize({ width: target.naturalWidth || 1, height: target.naturalHeight || 1 })
            }}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t("media.zoom")}</span>
            <span>{zoom.toFixed(2)}x</span>
          </div>
          <input
            className="w-full"
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
          <p className="text-xs text-muted-foreground">{t("media.dragHint")}</p>
        </div>
      </div>
    )
  },
)
ImageCropper.displayName = "ImageCropper"

type ImageCropperDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  aspect: number
  outputSize: OutputSize
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: (blob: Blob) => void
}

export function ImageCropperDialog({
  open,
  onOpenChange,
  imageUrl,
  aspect,
  outputSize,
  title,
  description,
  confirmLabel,
  onConfirm,
}: ImageCropperDialogProps) {
  const t = useTranslations("settings")
  const cropperRef = useRef<ImageCropperHandle | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const confirmText = confirmLabel ?? t("media.useImage")

  const handleConfirm = async () => {
    if (!cropperRef.current) return
    setIsSaving(true)
    try {
      const blob = await cropperRef.current.getCroppedBlob()
      if (!blob) return
      onConfirm(blob)
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <ImageCropper
          ref={cropperRef}
          imageUrl={imageUrl}
          aspect={aspect}
          outputSize={outputSize}
          previewWidth={420}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("media.cancel")}
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isSaving}>
            {isSaving ? t("media.saving") : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
