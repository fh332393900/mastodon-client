"use client"

import { useCallback, useEffect, useState } from "react"

export interface AppPreferences {
  autoPlayVideo: boolean
  dataSaver: boolean
}

const STORAGE_KEY = "settings:app-preferences:v1"
const CHANGE_EVENT = "settings:app-preferences-updated"

const DEFAULTS: AppPreferences = {
  autoPlayVideo: true,
  dataSaver: false,
}

function sanitize(raw: unknown): AppPreferences {
  if (!raw || typeof raw !== "object") return DEFAULTS
  const obj = raw as Record<string, unknown>
  return {
    autoPlayVideo: typeof obj.autoPlayVideo === "boolean" ? obj.autoPlayVideo : DEFAULTS.autoPlayVideo,
    dataSaver: typeof obj.dataSaver === "boolean" ? obj.dataSaver : DEFAULTS.dataSaver,
  }
}

function save(prefs: AppPreferences) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // Ignore storage errors.
  }
}

function readFromStorage(): AppPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return sanitize(JSON.parse(raw))
  } catch {
    return DEFAULTS
  }
}

export function useAppPreferences() {
  const [prefs, setPrefsState] = useState<AppPreferences>(DEFAULTS)

  useEffect(() => {
    const sync = () => setPrefsState(readFromStorage())
    sync()
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const setPrefs = useCallback((next: Partial<AppPreferences>) => {
    setPrefsState((prev) => {
      const merged = { ...prev, ...next }
      save(merged)
      window.dispatchEvent(new Event(CHANGE_EVENT))
      return merged
    })
  }, [])

  const toggleAutoPlay = useCallback(() => {
    setPrefsState((prev) => {
      const autoPlayVideo = !prev.autoPlayVideo
      const merged: AppPreferences = { ...prev, autoPlayVideo }
      save(merged)
      window.dispatchEvent(new Event(CHANGE_EVENT))
      return merged
    })
  }, [])

  const toggleDataSaver = useCallback(() => {
    setPrefsState((prev) => {
      const dataSaver = !prev.dataSaver
      const merged: AppPreferences = {
        ...prev,
        dataSaver,
        autoPlayVideo: dataSaver ? false : prev.autoPlayVideo,
      }
      save(merged)
      window.dispatchEvent(new Event(CHANGE_EVENT))
      return merged
    })
  }, [])

  return {
    prefs,
    setPrefs,
    toggleAutoPlay,
    toggleDataSaver,
  }
}
