"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Heart, Search, Settings, LogOut, PenSquare, ArrowLeft, User, Bell } from "lucide-react"
import { LoginModal } from "@/components/auth/login-modal"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "../auth/masto-provider"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"
import { useTranslations } from "next-intl"
import { useMobileBottomMenuSettings } from "@/hooks/mastodon/useMobileBottomMenuSettings"
import { MOBILE_BOTTOM_MENU_LABEL_KEY } from "@/lib/mastodon/mobile-navigation"

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isInitialized } = useAuth()
  const { server } = useMasto()
  const t = useTranslations()
  const { routes: mobileBottomMenuRoutes } = useMobileBottomMenuSettings()

  const navigationItems = [
    { icon: Home, label: t(MOBILE_BOTTOM_MENU_LABEL_KEY.timeline), route: "timeline", color: "text-sky-400" },
    { icon: Heart, label: t(MOBILE_BOTTOM_MENU_LABEL_KEY.favorites), route: "favorites", color: "text-rose-500" },
    { icon: Bell, label: t(MOBILE_BOTTOM_MENU_LABEL_KEY.notifications), route: "notifications", color: "text-amber-400" },
    { icon: PenSquare, label: t(MOBILE_BOTTOM_MENU_LABEL_KEY.compose), route: "compose", color: "text-violet-400" },
    { icon: Search, label: t(MOBILE_BOTTOM_MENU_LABEL_KEY.explore), route: "explore", color: "text-emerald-400" },
    { icon: Settings, label: t(MOBILE_BOTTOM_MENU_LABEL_KEY.settings), route: "settings", color: "text-slate-400" },
  ]

  const mobileNavigationItems = mobileBottomMenuRoutes
    .map((route) => navigationItems.find((item) => item.route === route))
    .filter((item): item is (typeof navigationItems)[number] => !!item)

  const userNameText = user
    ? getDisplayNameText({ displayName: user.displayName, username: user.username })
    : ""

  const activeItem = navigationItems.find((item) => pathname.includes(item.route))
  const mobileTitle = activeItem?.label ?? t("common.menu.home")

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="sticky inset-x-0 top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-border/40 bg-background/80 px-4 backdrop-blur-md lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="shrink-0">
            <img src="/icon.svg" alt="Logo" className="h-8 w-8 rounded-lg" />
          </Link>
          <div className="h-4 w-px bg-border/60" />
          <span className="truncate text-sm font-bold tracking-tight text-foreground/90">{mobileTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href={`/${server}/@${user.username}`} className="transition-transform active:scale-95">
              <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={userNameText} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{userNameText.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <LoginModal>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary">
                <User className="h-5 w-5" />
              </Button>
            </LoginModal>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/90 px-4 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          {mobileNavigationItems.map((item) => {
            const href = `/${server}/${item.route}`
            const isActive = pathname.includes(item.route)
            return (
              <Link key={item.route} href={href} aria-label={item.label} className="flex-1">
                <div
                  className={cn(
                    "flex h-11 items-center justify-center rounded-sm transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                  )}
                >
                  <item.icon className="h-6 w-6" />
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-card/50 border-r border-border/40 backdrop-blur-sm",
          isCollapsed ? "w-20" : "w-72",
          "sticky top-0 h-screen",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 p-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/icon.svg"
                  alt="MastoClient"
                  className="h-10 w-10 rounded-xl shadow-md transition-transform group-hover:scale-110 duration-300"
                />
                <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {!isCollapsed && (
                <span className="text-2xl font-black tracking-tighter text-foreground font-['Quicksand'] bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                  MastoClient
                </span>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-2">
            {navigationItems.map((item) => {
              const href = `/${server}/${item.route}`
              const isActive = pathname.includes(item.route)
              return (
                <Link key={item.route} href={href} className="block">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full group relative overflow-hidden transition-all duration-300 h-12",
                      isActive 
                        ? "bg-primary/10 text-primary hover:bg-primary/15" 
                        : "hover:bg-muted/80 text-muted-foreground hover:text-foreground",
                      isCollapsed ? "justify-center px-0" : "justify-start px-4",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-6 w-6 transition-all duration-300",
                        isActive ? item.color : "group-hover:text-foreground",
                        !isCollapsed && "mr-4",
                        isActive && "scale-110",
                      )}
                    />
                    {!isCollapsed && <span className="font-bold tracking-tight">{item.label}</span>}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 mt-auto">
            {!isInitialized ? (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 animate-pulse">
                <div className="h-11 w-11 rounded-full bg-muted" />
                {!isCollapsed && <div className="h-4 w-24 bg-muted rounded" />}
              </div>
            ) : !user ? (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                {!isCollapsed && (
                  <>
                    <p className="text-xs font-medium text-primary/80 uppercase tracking-widest">{server}</p>
                    <p className="text-sm font-semibold text-foreground/80 leading-snug">{t("common.loginPrompt")}</p>
                  </>
                )}
                <LoginModal>
                  <Button className="w-full shadow-lg shadow-primary/20 rounded-xl h-11">
                    {t("common.loginButton")}
                  </Button>
                </LoginModal>
              </div>
            ) : (
              <div className={cn(
                "group relative flex items-center gap-3 p-3 rounded-2xl transition-all duration-300",
                "hover:bg-primary/5 border border-transparent hover:border-primary/10",
                isCollapsed && "justify-center"
              )}>
                <Avatar className="h-11 w-11 ring-2 ring-background shadow-md">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={userNameText} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{userNameText.charAt(0)}</AvatarFallback>
                </Avatar>

                {!isCollapsed && (
                  <Link href={`/${server}/@${user.username}`} className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                      {renderDisplayName({
                        displayName: user.displayName,
                        username: user.username,
                        emojis: user.emojis,
                      })}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium truncate">@{user.username}</div>
                  </Link>
                )}

                {!isCollapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
