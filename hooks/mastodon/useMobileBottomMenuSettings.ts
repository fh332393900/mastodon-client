"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  DEFAULT_MOBILE_BOTTOM_MENU_ROUTES,
  MOBILE_BOTTOM_MENU_MAX_ITEMS,
  MOBILE_BOTTOM_MENU_MIN_ITEMS,
  MOBILE_BOTTOM_MENU_ROUTES,
  type MobileBottomMenuRoute,
} from "@/lib/mastodon/mobile-navigation"

const STORAGE_KEY = "settings:mobile-bottom-menu-routes:v1"
const CHANGE_EVENT = "settings:mobile-bottom-menu-updated"

function sanitizeRoutes(input: unknown): MobileBottomMenuRoute[] {
  const list = Array.isArray(input) ? input : []
  const allowed = new Set<MobileBottomMenuRoute>(MOBILE_BOTTOM_MENU_ROUTES)
  const used = new Set<MobileBottomMenuRoute>()

  const picked: MobileBottomMenuRoute[] = []
  for (const item of list) {
    if (typeof item !== "string") continue
    const route = item as MobileBottomMenuRoute
    if (!allowed.has(route) || used.has(route)) continue
    used.add(route)
    picked.push(route)
    if (picked.length >= MOBILE_BOTTOM_MENU_MAX_ITEMS) break
  }

  if (picked.length >= MOBILE_BOTTOM_MENU_MIN_ITEMS) return picked

  return DEFAULT_MOBILE_BOTTOM_MENU_ROUTES.slice(0, MOBILE_BOTTOM_MENU_MAX_ITEMS)
}

function saveRoutes(routes: MobileBottomMenuRoute[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routes))
  } catch {
    // Ignore storage errors (private mode/quota).
  }
}

function readRoutesFromStorage(): MobileBottomMenuRoute[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_MOBILE_BOTTOM_MENU_ROUTES
    return sanitizeRoutes(JSON.parse(raw))
  } catch {
    return DEFAULT_MOBILE_BOTTOM_MENU_ROUTES
  }
}

export function useMobileBottomMenuSettings() {
  const [routes, setRoutesState] = useState<MobileBottomMenuRoute[]>(DEFAULT_MOBILE_BOTTOM_MENU_ROUTES)

  useEffect(() => {
    const syncFromStorage = () => {
      setRoutesState(readRoutesFromStorage())
    }

    syncFromStorage()
    window.addEventListener(CHANGE_EVENT, syncFromStorage)
    window.addEventListener("storage", syncFromStorage)

    return () => {
      window.removeEventListener(CHANGE_EVENT, syncFromStorage)
      window.removeEventListener("storage", syncFromStorage)
    }
  }, [])

  const setRoutes = useCallback((next: MobileBottomMenuRoute[]) => {
    const sanitized = sanitizeRoutes(next)
    setRoutesState(sanitized)
    saveRoutes(sanitized)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  const resetRoutes = useCallback(() => {
    setRoutes(DEFAULT_MOBILE_BOTTOM_MENU_ROUTES)
  }, [setRoutes])

  const availableRoutes = useMemo(() => {
    const active = new Set(routes)
    return MOBILE_BOTTOM_MENU_ROUTES.filter((route) => !active.has(route))
  }, [routes])

  return {
    routes,
    availableRoutes,
    setRoutes,
    resetRoutes,
  }
}
