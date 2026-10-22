"use client"

import { useTranslations } from "next-intl"
import { Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import type { F1Compound, F1Pit, F1Stint } from "@/lib/sports/f1"

/** 轮胎配方视觉规范（与 F1 官方转播一致：红软/黄中/白硬/绿半雨/蓝全雨，已压低明度避免刺眼） */
export const COMPOUND_STYLE: Record<F1Compound, { color: string; letter: string }> = {
  SOFT: { color: "#b30f2a", letter: "S" },
  MEDIUM: { color: "#ffd12e", letter: "M" },
  HARD: { color: "#e8e8e8", letter: "H" },
  INTERMEDIATE: { color: "#43b02a", letter: "I" },
  WET: { color: "#0067ad", letter: "W" },
  UNKNOWN: { color: "#8b8b8b", letter: "?" },
}

/** 官方 Pirelli 配方轮胎图（本地 96px，取自 Pirelli F1 官网素材） */
const COMPOUND_IMAGE: Record<F1Compound, string | null> = {
  SOFT: "/f1-tyres/soft.png",
  MEDIUM: "/f1-tyres/medium.png",
  HARD: "/f1-tyres/hard.png",
  INTERMEDIATE: "/f1-tyres/intermediate.png",
  WET: "/f1-tyres/wet.png",
  UNKNOWN: null,
}

/** 轮胎图标：使用官方配方轮胎图，未知配方回退为灰色问号 */
export function TyreIcon({
  compound,
  size = 22,
  className,
}: {
  compound: F1Compound
  size?: number
  className?: string
}) {
  const src = COMPOUND_IMAGE[compound] ?? null

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-black text-muted-foreground",
          className,
        )}
        style={{ width: size, height: size }}
      >
        ?
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      className={cn("shrink-0 select-none object-contain", className)}
      style={{ width: size, height: size }}
    />
  )
}

interface TyreStintBarProps {
  stints: F1Stint[]
  pits: F1Pit[]
  /** 本场总圈数（用于 stint 段宽度比例） */
  totalLaps: number
}

/** 亮色配方（硬胎/中性胎）用深色文字，暗色配方用白字 */
function readableTextColor(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? "#111111" : "#ffffff"
}

/**
 * F1 官方转播风格的轮胎策略条：
 * 每个 stint 按圈数比例铺满整行，配方色实心色块 + 高光渐变，
 * 下方给出配方图例与进站记录。
 */
export function TyreStintBar({ stints, pits, totalLaps }: TyreStintBarProps) {
  const t = useTranslations("sports.detail")
  if (stints.length === 0) return null

  const maxLap = Math.max(totalLaps, ...stints.map((stint) => stint.lapEnd || stint.lapStart), 1)
  const compoundLabel = (compound: F1Compound) => t(`compounds.${compound.toLowerCase()}`)

  /** 进站后换上的配方：第一条起点晚于进站圈数的 stint */
  const compoundAfterLap = (lap: number): F1Compound => {
    const next = stints.find((stint) => stint.lapStart > lap)
    return next?.compound ?? stints[stints.length - 1].compound
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {t("tyreStrategy")}
        </p>
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {maxLap} LAPS
        </span>
      </div>

      {/* stint 时间轴 */}
      <div className="flex h-8 w-full items-stretch gap-[3px]">
        {stints.map((stint, index) => {
          const lapStart = stint.lapStart || 1
          const lapEnd = Math.min(stint.lapEnd || maxLap, maxLap)
          const laps = Math.max(lapEnd - lapStart + 1, 1)
          const color = COMPOUND_STYLE[stint.compound]?.color ?? COMPOUND_STYLE.UNKNOWN.color
          return (
            <div
              key={`${stint.lapStart}-${index}`}
              className="relative flex min-w-0 basis-0 items-center justify-center overflow-hidden rounded-[3px]"
              style={{
                flexGrow: laps,
                backgroundColor: color,
                backgroundImage:
                  "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.22) 100%)",
                color: readableTextColor(color),
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.22)",
              }}
              title={`${compoundLabel(stint.compound)} · L${lapStart}-${lapEnd}`}
            >
              <span className="truncate px-1 text-xs font-black tabular-nums tracking-tight">
                L{lapStart}-{lapEnd}
              </span>
            </div>
          )
        })}
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-muted-foreground">
        {Array.from(new Set(stints.map((stint) => stint.compound))).map((compound) => (
          <span key={compound} className="flex items-center gap-2">
            <TyreIcon compound={compound} size={32} />
            <span className="font-semibold">{compoundLabel(compound)}</span>
          </span>
        ))}
      </div>

      {/* 进站记录 */}
      {pits.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {pits.map((pit, index) => (
            <span
              key={`${pit.lap}-${index}`}
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-sm font-medium tabular-nums text-muted-foreground"
            >
              <Wrench className="h-3.5 w-3.5 text-[var(--sport-brand)]" />
              <span className="font-semibold">L{pit.lap}</span>
              <TyreIcon compound={compoundAfterLap(pit.lap)} size={24} />
              {pit.duration != null ? `${pit.duration.toFixed(1)}s` : ""}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
