"use client"

import { useTranslations } from "next-intl"
import { Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import type { F1Compound, F1Pit, F1Stint } from "@/lib/sports/f1"

/** 轮胎配方视觉规范（与 F1 官方转播一致：红软/黄中/白硬/绿半雨/蓝全雨） */
export const COMPOUND_STYLE: Record<F1Compound, { color: string; letter: string }> = {
  SOFT: { color: "#e8002d", letter: "S" },
  MEDIUM: { color: "#ffd12e", letter: "M" },
  HARD: { color: "#e8e8e8", letter: "H" },
  INTERMEDIATE: { color: "#43b02a", letter: "I" },
  WET: { color: "#0067ad", letter: "W" },
  UNKNOWN: { color: "#8b8b8b", letter: "?" },
}

const TYRE_TICKS = Array.from({ length: 16 }, (_, index) => (index * 360) / 16)

/** 轮胎图标：胎面刻纹 + 配方色胎壁 + 配方字母，贴近 F1 官方图形 */
export function TyreIcon({
  compound,
  size = 22,
  className,
}: {
  compound: F1Compound
  size?: number
  className?: string
}) {
  const style = COMPOUND_STYLE[compound] ?? COMPOUND_STYLE.UNKNOWN
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      {/* 胎体 */}
      <circle cx="16" cy="16" r="15.4" fill="#0e0e0e" />
      <circle cx="16" cy="16" r="15.1" fill="none" stroke="#3a3a3a" strokeWidth="0.9" />
      {/* 胎面刻纹 */}
      <g stroke="#4a4a4a" strokeWidth="1.5" strokeLinecap="round">
        {TYRE_TICKS.map((angle) => {
          const rad = (angle * Math.PI) / 180
          const inner = 12.1
          const outer = 14.6
          return (
            <line
              key={angle}
              x1={16 + Math.cos(rad) * inner}
              y1={16 + Math.sin(rad) * inner}
              x2={16 + Math.cos(rad) * outer}
              y2={16 + Math.sin(rad) * outer}
            />
          )
        })}
      </g>
      {/* 配方色胎壁 */}
      <circle cx="16" cy="16" r="10.4" fill="#141414" />
      <circle cx="16" cy="16" r="10.4" fill="none" stroke={style.color} strokeWidth="3.1" />
      {/* 轮毂中心 + 配方字母 */}
      <circle cx="16" cy="16" r="7.1" fill="#070707" />
      <text
        x="16"
        y="16"
        dy="0.36em"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="900"
        fill={style.color}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {style.letter}
      </text>
    </svg>
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
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t("tyreStrategy")}
        </p>
        <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
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
              className="relative flex min-w-0 basis-0 items-center justify-center overflow-hidden rounded-md shadow-sm"
              style={{
                flexGrow: laps,
                backgroundColor: color,
                backgroundImage:
                  "linear-gradient(180deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.18) 100%)",
                color: readableTextColor(color),
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
              }}
              title={`${compoundLabel(stint.compound)} · L${lapStart}-${lapEnd}`}
            >
              <span className="truncate px-1 text-[10px] font-black tabular-nums tracking-tight">
                L{lapStart}-{lapEnd}
              </span>
            </div>
          )
        })}
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {Array.from(new Set(stints.map((stint) => stint.compound))).map((compound) => (
          <span key={compound} className="flex items-center gap-1">
            <TyreIcon compound={compound} size={14} />
            {compoundLabel(compound)}
          </span>
        ))}
      </div>

      {/* 进站记录 */}
      {pits.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {pits.map((pit, index) => (
            <span
              key={`${pit.lap}-${index}`}
              className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground"
            >
              <Wrench className="h-3 w-3 text-[var(--sport-brand)]" />
              L{pit.lap}
              <TyreIcon compound={compoundAfterLap(pit.lap)} size={12} />
              {pit.duration != null ? `${pit.duration.toFixed(1)}s` : ""}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
