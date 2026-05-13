export const MOBILE_BOTTOM_MENU_ROUTES = [
  "timeline",
  "favorites",
  "compose",
  "explore",
  "notifications",
  "settings",
] as const

export type MobileBottomMenuRoute = (typeof MOBILE_BOTTOM_MENU_ROUTES)[number]

export const MOBILE_BOTTOM_MENU_MIN_ITEMS = 1
export const MOBILE_BOTTOM_MENU_MAX_ITEMS = 5

export const DEFAULT_MOBILE_BOTTOM_MENU_ROUTES: MobileBottomMenuRoute[] = [
  "timeline",
  "favorites",
  "compose",
  "explore",
  "settings",
]

export const MOBILE_BOTTOM_MENU_LABEL_KEY: Record<
  MobileBottomMenuRoute,
  `common.menu.${string}`
> = {
  timeline: "common.menu.home",
  favorites: "common.menu.favorites",
  compose: "common.menu.compose",
  explore: "common.menu.explore",
  notifications: "common.menu.notifications",
  settings: "common.menu.settings",
}
