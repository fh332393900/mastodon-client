"use client"

import type { CSSProperties } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ImageCropperDialog } from "@/components/mastodon/settings/image-cropper"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { UploadCloud } from "lucide-react"

export type CroppedImageValue = {
  file: File
  previewUrl: string
}

type OutputSize = {
  width: number
  height: number
}

type MediaUploadFieldProps = {
  label: string
  description?: string
  valueUrl?: string | null
  aspect: number
  outputSize: OutputSize
  previewWidth?: number
  previewHeight?: number
  disabled?: boolean
  resetKey?: number
  variant?: "stacked" | "overlay"
  showMeta?: boolean
  overlayPosition?: "top-right" | "bottom-right" | "center"
  className?: string
  frameClassName?: string
  onChange: (value: CroppedImageValue | null) => void
}

const createFileFromBlob = (blob: Blob, name: string) =>
  new File([blob], name, { type: blob.type || "image/png" })

export function MediaUploadField({
  label,
  description,
  valueUrl,
  aspect,
  outputSize,
  previewWidth,
  previewHeight,
  disabled,
  resetKey,
  variant = "stacked",
  showMeta,
  overlayPosition = "top-right",
  className,
  frameClassName,
  onChange,
}: MediaUploadFieldProps) {
  const t = useTranslations("settings")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>("image.png")

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [sourceUrl, previewUrl])

  useEffect(() => {
    if (resetKey === undefined) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }, [resetKey, previewUrl])

  const handleFileChange = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    const url = URL.createObjectURL(file)
    setSourceUrl(url)
    setFileName(file.name || "image.png")
    setCropOpen(true)
  }

  const handleConfirm = (blob: Blob) => {
    const file = createFileFromBlob(blob, fileName)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const nextPreview = URL.createObjectURL(file)
    setPreviewUrl(nextPreview)
    onChange({ file, previewUrl: nextPreview })
  }

  const handleCropOpenChange = (open: boolean) => {
    setCropOpen(open)
    if (!open && sourceUrl) {
      URL.revokeObjectURL(sourceUrl)
      setSourceUrl(null)
    }
  }

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    onChange(null)
  }

  const currentPreview = previewUrl || valueUrl || null
  const previewBoxHeight = previewWidth ? Math.round(previewWidth / aspect) : undefined
  const shouldShowMeta = showMeta ?? variant === "stacked"
  const previewStyle = useMemo<CSSProperties>(() => {
    if (previewWidth && previewHeight) {
      return { width: previewWidth, height: previewHeight }
    }
    if (previewWidth && !previewHeight && previewBoxHeight) {
      return { width: previewWidth, height: previewBoxHeight }
    }
    return { width: "100%", aspectRatio: `${aspect}` }
  }, [aspect, previewBoxHeight, previewHeight, previewWidth])
  const overlayPositionClass =
    overlayPosition === "center"
      ? "inset-0 flex items-center justify-center"
      : overlayPosition === "bottom-right"
        ? "bottom-3 right-3"
        : "top-3 right-3"

  return (
    <div className={cn("space-y-2", className)}>
      {shouldShowMeta && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>{label}</Label>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {variant === "stacked" && (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={disabled}
                onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                {t("media.upload")}
              </Button>
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border bg-muted",
          disabled && "opacity-60",
          frameClassName,
        )}
        style={previewStyle}
      >
        {currentPreview ? (
          <img
            src={currentPreview}
            alt={t("media.previewAlt", { label })}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {t("media.noImage")}
          </div>
        )}

        {variant === "overlay" && (
          <div className={cn("absolute", overlayPosition !== "center" && "flex flex-col gap-2", overlayPositionClass)}>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={disabled}
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              aria-label={t("media.upload")}
              className="h-10 w-10 rounded-full border border-border/60 bg-background/70 backdrop-blur hover:bg-background"
            >
              <UploadCloud className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {sourceUrl && (
        <ImageCropperDialog
          open={cropOpen}
          onOpenChange={handleCropOpenChange}
          imageUrl={sourceUrl}
          aspect={aspect}
          outputSize={outputSize}
          title={t("media.cropTitle", { label })}
          description={t("media.cropDescription")}
          confirmLabel={t("media.useImage")}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
