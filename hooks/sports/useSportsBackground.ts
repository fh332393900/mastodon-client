"use client"

import { useCallback, useState } from "react"

const STORAGE_KEY = "sports:background:v1"

export interface SportsBackgroundState {
  /** 预设渐变 id（SPORTS_BACKGROUND_PRESETS），null 表示跟随主题默认 */
  presetId: string | null
  /** 自定义背景图 URL，优先级高于预设 */
  imageUrl: string | null
}

const DEFAULT_STATE: SportsBackgroundState = { presetId: null, imageUrl: null }

function readStored(): SportsBackgroundState {
  if (typeof window === "undefined") return DEFAULT_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as Partial<SportsBackgroundState>
    return {
      presetId: typeof parsed.presetId === "string" ? parsed.presetId : null,
      imageUrl: typeof parsed.imageUrl === "string" ? parsed.imageUrl : null,
    }
  } catch {
    return DEFAULT_STATE
  }
}

/** 体育板块 hero 背景偏好（localStorage 持久化）。 */
export function useSportsBackground() {
  const [background, setBackground] = useState<SportsBackgroundState>(readStored)

  const update = useCallback((next: SportsBackgroundState) => {
    setBackground(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // 忽略写入失败（隐私模式等）
    }
  }, [])

  const setPreset = useCallback(
    (presetId: string | null) => update({ presetId, imageUrl: null }),
    [update],
  )
  const setImageUrl = useCallback(
    (imageUrl: string | null) =>
      update({ presetId: null, imageUrl: imageUrl?.trim() || null }),
    [update],
  )
  const reset = useCallback(() => update(DEFAULT_STATE), [update])

  return { background, setPreset, setImageUrl, reset }
}
