"use client"

import { useEffect, useRef, useState } from "react"
import { decode } from "blurhash"
import { cn } from "@/lib/utils"

interface MediaBlurhashProps {
  blurhash?: string | null
  src?: string
  alt?: string
  shouldLoad?: boolean
  className?: string
}

const CANVAS_RES = 32

function renderBlurhash(canvas: HTMLCanvasElement, hash: string) {
  const pixels = decode(hash, CANVAS_RES, CANVAS_RES)
  canvas.width = CANVAS_RES
  canvas.height = CANVAS_RES
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  const imageData = ctx.createImageData(CANVAS_RES, CANVAS_RES)
  imageData.data.set(pixels)
  ctx.putImageData(imageData, 0, 0)
}

export function MediaBlurhash({
  blurhash,
  src,
  alt = "",
  shouldLoad = true,
  className = "",
}: MediaBlurhashProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (shouldLoad) return
    if (!blurhash || !canvasRef.current) {
      setIsReady(false)
      return
    }
    setIsReady(false)
    try {
      renderBlurhash(canvasRef.current, blurhash)
      setIsReady(true)
    } catch {
      setIsReady(false)
    }
  }, [blurhash, shouldLoad])

  if (shouldLoad && src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
      />
    )
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {blurhash ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          aria-hidden
        />
      ) : (
        <div className="absolute inset-0 bg-muted/60" />
      )}
      {!isReady && <div className="absolute inset-0 bg-muted/60" />}
    </div>
  )
}
