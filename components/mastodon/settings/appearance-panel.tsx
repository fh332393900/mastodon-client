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
import { Reorder, AnimatePresence } from "framer-motion"
import { Bell, Heart, Home, Palette, PenSquare, Search, Settings, GripVertical } from "lucide-react"
import { useTranslations } from "next-intl"

const routeIconMap: Record<MobileBottomMenuRoute, ComponentType<{ className?: string }>> = {
  timeline: Home,
  favorites: Heart,
  compose: PenSquare,
  explore: Search,
  notifications: Bell,
  settings: Settings,
}

export function AppearancePanel() {
  const t = useTranslations("settings")
  const { routes, availableRoutes, setRoutes, resetRoutes } = useMobileBottomMenuSettings()
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

  const removeRoute = (route: MobileBottomMenuRoute) => {
    if (routes.length <= MOBILE_BOTTOM_MENU_MIN_ITEMS) return
    setRoutes(routes.filter((item) => item !== route))
  }

  const addRoute = (route: MobileBottomMenuRoute) => {
    if (routes.length >= MOBILE_BOTTOM_MENU_MAX_ITEMS) return
    setRoutes([...routes, route])
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Palette className="h-6 w-6 text-primary" />
            {t("appearance.title")}
          </CardTitle>
          <CardDescription className="text-base">{t("appearance.description")}</CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-8">
          <div className="rounded-2xl border border-border/50 bg-muted/30 p-6 transition-all hover:bg-muted/40">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">{t("preferences.mobileMenu.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("preferences.mobileMenu.description")}</p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={resetRoutes}
                className="rounded-full px-4 hover:bg-background"
              >
                {t("preferences.mobileMenu.reset")}
              </Button>
            </div>

            <div className="mx-auto mb-8 w-full max-w-lg">
              <div className="relative rounded-[32px] border-4 border-muted bg-background p-4 shadow-2xl">
                <div className="mb-4 h-32 rounded-2xl border border-dashed border-border/40 bg-muted/20 flex items-center justify-center text-xs text-muted-foreground italic">
                  Preview Area
                </div>
                
                <div className="rounded-2xl bg-muted/10 p-2">
                  <Reorder.Group
                    axis="x"
                    values={routes}
                    onReorder={setRoutes}
                    className="flex items-center justify-around gap-1"
                  >
                    {routeOptions.map((item) => {
                      const key = `menu:${item.route}`
                      return (
                        <Reorder.Item
                          key={item.route}
                          value={item.route}
                          className="relative"
                        >
                          <Popover open={popoverKey === key}>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                onMouseEnter={() => setPopoverKey(key)}
                                onMouseLeave={() => setPopoverKey(null)}
                                className={cn(
                                  "flex h-14 w-14 items-center justify-center rounded-2xl border transition-all active:scale-95 touch-none",
                                  "border-transparent text-muted-foreground hover:bg-background hover:text-primary hover:shadow-sm",
                                  "cursor-grab active:cursor-grabbing"
                                )}
                                aria-label={item.label}
                              >
                                <item.Icon className="h-6 w-6" />
                                {routes.length > MOBILE_BOTTOM_MENU_MIN_ITEMS && (
                                  <button
                                    type="button"
                                    aria-label={t("preferences.mobileMenu.remove")}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      removeRoute(item.route)
                                    }}
                                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-[10px] text-muted-foreground hover:bg-destructive hover:text-destructive-foreground shadow-sm transition-colors"
                                  >
                                    ×
                                  </button>
                                )}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              side="top"
                              className="w-auto px-3 py-1.5 text-xs font-medium rounded-full"
                            >
                              {item.label}
                              <PopoverArrow />
                            </PopoverContent>
                          </Popover>
                        </Reorder.Item>
                      )
                    })}
                  </Reorder.Group>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("preferences.mobileMenu.availableLabel")}
                </span>
                <div className="h-px flex-1 bg-border/50" />
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <AnimatePresence mode="popLayout">
                  {availableOptions.map((item) => {
                    const key = `available:${item.route}`
                    return (
                      <Popover key={item.route} open={popoverKey === key}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            onClick={() => addRoute(item.route)}
                            onMouseEnter={() => setPopoverKey(key)}
                            onMouseLeave={() => setPopoverKey(null)}
                            className={cn(
                              "group relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background transition-all hover:border-primary hover:text-primary active:scale-90",
                              routes.length >= MOBILE_BOTTOM_MENU_MAX_ITEMS && "opacity-50 cursor-not-allowed grayscale"
                            )}
                            disabled={routes.length >= MOBILE_BOTTOM_MENU_MAX_ITEMS}
                            aria-label={item.label}
                          >
                            <item.Icon className="h-5 w-5" />
                            <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              +
                            </div>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          side="top"
                          className="w-auto px-3 py-1.5 text-xs font-medium rounded-full"
                        >
                          {item.label}
                          <PopoverArrow />
                        </PopoverContent>
                      </Popover>
                    )
                  })}
                </AnimatePresence>
                {availableOptions.length === 0 && (
                  <p className="text-sm text-muted-foreground italic py-2">
                    {t("preferences.mobileMenu.noAvailable")}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground bg-background/50 py-2 px-4 rounded-full border border-border/40">
                <GripVertical className="h-3 w-3" />
                {t("preferences.mobileMenu.hint", {
                  max: MOBILE_BOTTOM_MENU_MAX_ITEMS,
                  min: MOBILE_BOTTOM_MENU_MIN_ITEMS,
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
