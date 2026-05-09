"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ImageCropperDialog } from "@/components/mastodon/settings/image-cropper"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

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
  disabled?: boolean
  resetKey?: number
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
  previewWidth = 220,
  disabled,
  resetKey,
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
  const previewHeight = Math.round(previewWidth / aspect)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label>{label}</Label>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
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
          {currentPreview && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={disabled}>
              {t("media.remove")}
            </Button>
          )}
        </div>
      </div>
      <div
        className={cn("overflow-hidden rounded-xl border border-border bg-muted", disabled && "opacity-60")}
        style={{ width: previewWidth, height: previewHeight }}
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
