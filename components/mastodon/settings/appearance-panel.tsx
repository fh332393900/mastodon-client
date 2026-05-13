"use client"

import { useMemo, useState, type ComponentType } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useMobileBottomMenuSettings } from "@/hooks/mastodon/useMobileBottomMenuSettings"
import {
  MOBILE_BOTTOM_MENU_LABEL_KEY,
  MOBILE_BOTTOM_MENU_MAX_ITEMS,
  MOBILE_BOTTOM_MENU_MIN_ITEMS,
  type MobileBottomMenuRoute,
} from "@/lib/mastodon/mobile-navigation"
import { cn } from "@/lib/utils"
import { Bell, Heart, Home, Palette, PenSquare, Search, Settings } from "lucide-react"
import { useTranslations } from "next-intl"

const routeIconMap: Record<MobileBottomMenuRoute, ComponentType<{ className?: string }>> = {
  timeline: Home,
  favorites: Heart,
  compose: PenSquare,
  explore: Search,
  notifications: Bell,
  settings: Settings,
}

type DragSource = {
  route: MobileBottomMenuRoute
}

export function AppearancePanel() {
  const t = useTranslations("settings")
  const { routes, availableRoutes, setRoutes, resetRoutes } = useMobileBottomMenuSettings()
  const [dragSource, setDragSource] = useState<DragSource | null>(null)
  const [dragTarget, setDragTarget] = useState<MobileBottomMenuRoute | null>(null)
  const [popoverKey, setPopoverKey] = useState<string | null>(null)

  const routeOptions = useMemo(() => {
    return routes.map((route) => ({ route, label: t(MOBILE_BOTTOM_MENU_LABEL_KEY[route]), Icon: routeIconMap[route] }))
  }, [routes, t])

  const availableOptions = useMemo(() => {
    return availableRoutes.map((route) => ({
      route,
      label: t(MOBILE_BOTTOM_MENU_LABEL_KEY[route]),
      Icon: routeIconMap[route],
    }))
  }, [availableRoutes, t])

  const handleDropToSlot = (targetIndex: number) => {
    if (!dragSource) return
    const sourceIndex = routes.indexOf(dragSource.route)
    const next = [...routes]

    if (sourceIndex >= 0) {
      next.splice(sourceIndex, 1)
      const adjustedIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
      next.splice(adjustedIndex, 0, dragSource.route)
    } else {
      if (next.length >= MOBILE_BOTTOM_MENU_MAX_ITEMS) {
        next.splice(targetIndex, 0, dragSource.route)
        next.pop()
      } else {
        next.splice(targetIndex, 0, dragSource.route)
      }
    }

    setRoutes(next)
    setDragSource(null)
    setDragTarget(null)
  }

  const removeRoute = (route: MobileBottomMenuRoute) => {
    if (routes.length <= MOBILE_BOTTOM_MENU_MIN_ITEMS) return
    setRoutes(routes.filter((item) => item !== route))
  }

  const handleDragStart = (route: MobileBottomMenuRoute) => {
    setDragSource({ route })
  }

  const handleDragEnd = () => {
    setDragSource(null)
    setDragTarget(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            {t("appearance.title")}
          </CardTitle>
          <CardDescription>{t("appearance.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
              {t("appearance.placeholder")}
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("preferences.mobileMenu.title")}</p>
                  <p className="text-xs text-muted-foreground">{t("preferences.mobileMenu.description")}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={resetRoutes}>
                  {t("preferences.mobileMenu.reset")}
                </Button>
              </div>

              <div className="mx-auto mb-4 w-full max-w-2xl rounded-[28px] border border-border/70 bg-gradient-to-b from-background to-muted/40 p-3 shadow-sm">
                <div className="mb-3 h-24 rounded-2xl border border-dashed border-border/50 bg-background/70" />
                <div className="rounded-2xl border border-border/70 bg-card/80 px-2 py-2">
                  <div className="flex items-center justify-between gap-2 rounded-xl p-1">
                    {routeOptions.map((item, index) => {
                      const key = `menu:${item.route}`
                      return (
                        <Popover key={item.route} open={popoverKey === key}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              draggable
                              onDragStart={() => handleDragStart(item.route)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(event) => {
                                event.preventDefault()
                                setDragTarget(item.route)
                              }}
                              onDragLeave={() =>
                                setDragTarget((current) => (current === item.route ? null : current))
                              }
                              onDrop={(event) => {
                                event.preventDefault()
                                handleDropToSlot(index)
                              }}
                              onMouseEnter={() => setPopoverKey(key)}
                              onMouseLeave={() => setPopoverKey((current) => (current === key ? null : current))}
                              className={cn(
                                "relative flex h-14 w-14 items-center justify-center rounded-xl border transition",
                                dragSource?.route === item.route
                                  ? "border-primary/60 bg-primary/5 text-primary/80"
                                  : dragTarget === item.route
                                    ? "border-primary bg-primary/15 text-primary"
                                    : "border-transparent text-muted-foreground hover:bg-muted/70",
                              )}
                              aria-label={item.label}
                            >
                              <item.Icon className="h-6 w-6" />
                              {routes.length > MOBILE_BOTTOM_MENU_MIN_ITEMS && (
                                <span
                                  role="button"
                                  aria-label={t("preferences.mobileMenu.remove")}
                                  onClick={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    removeRoute(item.route)
                                  }}
                                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background text-[10px] leading-none text-muted-foreground hover:text-foreground"
                                >
                                  ×
                                </span>
                              )}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            side="top"
                            className="w-auto px-2 py-1 text-xs"
                            onMouseEnter={() => setPopoverKey(key)}
                            onMouseLeave={() => setPopoverKey((current) => (current === key ? null : current))}
                          >
                            {item.label}
                            <PopoverArrow />
                          </PopoverContent>
                        </Popover>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-3">
                <p className="mb-2 text-xs font-medium text-foreground">{t("preferences.mobileMenu.availableLabel")}</p>
                {availableOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableOptions.map((item) => {
                      const key = `available:${item.route}`
                      return (
                        <Popover key={item.route} open={popoverKey === key}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              draggable
                              onDragStart={() => handleDragStart(item.route)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(event) => {
                                event.preventDefault()
                                setDragTarget(item.route)
                              }}
                              onDragLeave={() =>
                                setDragTarget((current) => (current === item.route ? null : current))
                              }
                              onDrop={(event) => {
                                event.preventDefault()
                                setDragTarget(null)
                              }}
                              onMouseEnter={() => setPopoverKey(key)}
                              onMouseLeave={() => setPopoverKey((current) => (current === key ? null : current))}
                              className={cn(
                                "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition",
                                dragTarget === item.route ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted",
                              )}
                              aria-label={item.label}
                            >
                              <item.Icon className="h-5 w-5" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            side="top"
                            className="w-auto px-2 py-1 text-xs"
                            onMouseEnter={() => setPopoverKey(key)}
                            onMouseLeave={() => setPopoverKey((current) => (current === key ? null : current))}
                          >
                            {item.label}
                            <PopoverArrow />
                          </PopoverContent>
                        </Popover>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{t("preferences.mobileMenu.noAvailable")}</p>
                )}
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                {t("preferences.mobileMenu.hint", {
                  max: MOBILE_BOTTOM_MENU_MAX_ITEMS,
                  min: MOBILE_BOTTOM_MENU_MIN_ITEMS,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
