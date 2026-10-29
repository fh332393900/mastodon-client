import { FOOTBALL_LEAGUES } from "@/lib/sports/config"
import { cn } from "@/lib/utils"

interface SportsMark {
  key: string
  emblem: string
  /** F1 官方标志是横版，单独控制宽度 */
  wide?: boolean
}

/** 轮播顺序：F1 → 英超 → 西甲 → 法甲 → 德甲 → 意甲 */
const ROLL_CODES = ["F1", "PL", "PD", "FL1", "BL1", "SA"]

const ROLL_MARKS: SportsMark[] = ROLL_CODES.flatMap((code) => {
  if (code === "F1") return [{ key: "F1", emblem: "/f1-logo.svg", wide: true }]
  const league = FOOTBALL_LEAGUES.find((item) => item.code === code)
  return league ? [{ key: league.code, emblem: league.emblem }] : []
})

/**
 * 侧边栏 Sports 入口图标：像轮播图一样纵向滑动轮播 F1 与五大联赛官方标志，
 * 每个标志停留 2 秒后滑动到下一个，首尾无缝循环，hover 暂停。
 */
export function SportsNavIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex h-6 w-6 shrink-0 overflow-hidden",
        "[mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]",
        className,
      )}
    >
      <span className="flex animate-sports-nav-roll flex-col motion-reduce:animate-none group-hover:[animation-play-state:paused]">
        {[...ROLL_MARKS, ...ROLL_MARKS].map((mark, index) => (
          <span key={`${mark.key}-${index}`} className="flex h-6 w-6 shrink-0 items-center justify-center">
            <img
              src={mark.emblem}
              alt=""
              className={cn("object-contain", mark.wide ? "w-6" : "h-5 w-5")}
              loading="eager"
              decoding="async"
            />
          </span>
        ))}
      </span>
    </span>
  )
}
