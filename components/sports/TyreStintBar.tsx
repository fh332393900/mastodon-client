"use client"

import { Fragment } from "react"
import { useTranslations } from "next-intl"
import { Wrench } from "lucide-react"
import type { F1Compound, F1Pit, F1Stint } from "@/lib/sports/f1"

/** 轮胎配方视觉规范(与 F1 转播一致:红软/黄中/白硬/绿半雨/蓝全雨) */
export const COMPOUND_STYLE: Record<F1Compound, { color: string; letter: string }> = {
  SOFT: { color: "#e8002d", letter: "S" },
  MEDIUM: { color: "#ffd12e", letter: "M" },
  HARD: { color: "#e8e8e8", letter: "H" },
  INTERMEDIATE: { color: "#43b02a", letter: "I" },
  WET: { color: "#0067ad", letter: "W" },
  UNKNOWN: { color: "#8b8b8b", letter: "?" },
}

/** 轮胎图标:黑色胎面 + 配方色环(等效 F1 官方转播样式) */
export function TyreIcon({
  compound,
  size = 22,
}: {
  compound: F1Compound
  size?: number
}) {
  const style = COMPOUND_STYLE[compound] ?? COMPOUND_STYLE.UNKNOWN
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-black"
      style={{
        width: size,
        height: size,
        background: "#161616",
        border: `3px solid ${style.color}`,
        color: style.color,
        fontSize: Math.max(size * 0.42, 9),
        lineHeight: 1,
      }}
      aria-hidden
    >
      {style.letter}
    </span>
  )
}

interface TyreStintBarProps {
  stints: F1Stint[]
  pits: F1Pit[]
  /** 本场总圈数(用于 stint 段宽度比例) */
  totalLaps: number
}

/**
 * F1 Manager 风格轮胎策略时间轴:
 * 每个 stint 按圈数比例分段,背景为轮胎色的低透明填充,
 * 换胎点用轮胎图标分隔,下方标注进站圈数与耗时。
 */
export function TyreStintBar({ stints, pits, totalLaps }: TyreStintBarProps) {
  const t = useTranslations("sports.detail")
  if (stints.length === 0) return null

  const maxLap = Math.max(totalLaps, ...stints.map((s) => s.lapEnd || s.lapStart), 1)
  const compoundLabel = (compound: F1Compound) =>
    t(`compounds.${compound.toLowerCase()}`)

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold text-muted-foreground">
        {t("tyreStrategy")}
      </p>

      {/* stint 时间轴 */}
      <div className="flex h-9 w-full items-stretch gap-[3px]">
        {stints.map((stint, index) => {
          const lapStart = stint.lapStart || 1
          const lapEnd = stint.lapEnd || maxLap
          const widthPct = Math.max(((lapEnd - lapStart + 1) / maxLap) * 100, 6)
          const color = COMPOUND_STYLE[stint.compound]?.color ?? COMPOUND_STYLE.UNKNOWN.color
          return (
            <Fragment key={`${stint.lapStart}-${index}`}>
              <div
                className="relative flex min-w-0 items-center justify-center overflow-hidden rounded-lg px-1"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: `${color}26`,
                  borderBottom: `3px solid ${color}`,
                }}
                title={`${compoundLabel(stint.compound)} · L${lapStart}-${lapEnd}`}
              >
                <span className="truncate text-[10px] font-bold tabular-nums">
                  L{lapStart}-{lapEnd}
                </span>
              </div>
              {/* 换胎分隔点 */}
              {index < stints.length - 1 ? (
                <div className="flex items-center">
                  <TyreIcon compound={stints[index + 1].compound} size={20} />
                </div>
              ) : null}
            </Fragment>
          )
        })}
      </div>

      {/* 图例 + 进站记录 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {Array.from(new Set(stints.map((s) => s.compound))).map((compound) => (
          <span key={compound} className="flex items-center gap-1">
            <TyreIcon compound={compound} size={14} />
            {compoundLabel(compound)}
          </span>
        ))}
        {pits.length > 0 ? (
          <span className="ml-auto flex flex-wrap items-center gap-x-2 gap-y-1">
            {pits.map((pit, index) => (
              <span
                key={`${pit.lap}-${index}`}
                className="flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 tabular-nums"
              >
                <Wrench className="h-3 w-3 text-[var(--sport-brand)]" />
                L{pit.lap}
                {pit.duration != null ? ` · ${pit.duration.toFixed(1)}s` : ""}
              </span>
            ))}
          </span>
        ) : null}
      </div>
    </div>
  )
}
