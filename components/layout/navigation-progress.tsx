"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

/**
 * 全局路由切换进度条。
 *
 * 点击站内链接的瞬间立即出现，路由提交完成后收尾。
 * 目的：解决 dev 按需编译 / 慢网络下「点击后一段时间毫无反馈」的观感问题
 * （此时服务端尚未开始返回 RSC，loading.tsx 骨架还来不及出现）。
 */
export function NavigationProgress() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  const activeRef = useRef(false)
  const rampRef = useRef<number | null>(null)
  const safetyRef = useRef<number | null>(null)
  const hideRef = useRef<number | null>(null)

  const clearRamp = () => {
    if (rampRef.current !== null) {
      window.clearInterval(rampRef.current)
      rampRef.current = null
    }
  }

  const clearSafety = () => {
    if (safetyRef.current !== null) {
      window.clearTimeout(safetyRef.current)
      safetyRef.current = null
    }
  }

  const finish = useCallback(() => {
    if (!activeRef.current) return
    activeRef.current = false
    clearRamp()
    clearSafety()
    setProgress(100)
    if (hideRef.current !== null) window.clearTimeout(hideRef.current)
    hideRef.current = window.setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 220)
  }, [])

  const start = useCallback(() => {
    activeRef.current = true
    setVisible(true)
    setProgress(10)
    clearRamp()
    // 逐步逼近 90%，剩余 10% 留给路由提交完成
    rampRef.current = window.setInterval(() => {
      setProgress((p) => (p < 90 ? p + Math.max(1, (90 - p) * 0.15) : p))
    }, 200)
    clearSafety()
    // 兜底：异常/极慢导航（如 dev 按需编译）下避免进度条永久停留，30s 后自动收尾
    safetyRef.current = window.setTimeout(finish, 30000)
  }, [finish])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (!(event.target instanceof Element)) return

      const anchor = event.target.closest("a")
      if (!anchor) return
      if (anchor.target && anchor.target !== "_self") return
      if (anchor.hasAttribute("download")) return

      const href = anchor.getAttribute("href")
      if (!href || href.startsWith("#")) return

      let url: URL
      try {
        url = new URL(anchor.href, window.location.href)
      } catch {
        return
      }

      // 仅站内、且目标与当前地址不同的导航才触发
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return

      start()
    }

    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [start])

  // pathname 变化 → 路由已提交，收尾
  useEffect(() => {
    finish()
  }, [pathname, finish])

  return (
    <div
      aria-hidden="true"
      data-nav-progress={visible ? "active" : "idle"}
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      <div
        className="h-full rounded-r-full bg-primary shadow-sm"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? "width 160ms ease" : "width 220ms ease-out",
        }}
      />
    </div>
  )
}
