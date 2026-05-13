"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Heart, Search, Settings, LogOut, PenSquare, ArrowLeft, User } from "lucide-react"
import { LoginModal } from "@/components/auth/login-modal"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "../auth/masto-provider"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"
import { useTranslations } from "next-intl"

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isInitialized } = useAuth()
  const { server } = useMasto()
  const t = useTranslations()

  const navigationItems = [
    { icon: Home, label: t("common.menu.home"), route: "timeline", color: "text-blue-300" },
    { icon: Heart, label: t("common.menu.favorites"), route: "favorites", color: "text-red-500" },
    { icon: PenSquare, label: t("common.menu.compose"), route: "compose", color: "text-purple-200" },
    { icon: Search, label: t("common.menu.explore"), route: "explore", color: "text-[#8eff43]" },
    { icon: Settings, label: t("common.menu.settings"), route: "settings", color: "text-orange-300" },
  ]

  const userNameText = user
    ? getDisplayNameText({ displayName: user.displayName, username: user.username })
    : ""

  const isMenuPage = navigationItems.some((item) => pathname === `/${server}/${item.route}`)
  const activeItem = navigationItems.find((item) => pathname === `/${server}/${item.route}`)
  const mobileTitle = activeItem?.label ?? t("common.menu.home")

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="sticky inset-x-0 top-0 z-40 flex items-center justify-between gap-2 border-b border-border/60 bg-card/90 px-4 py-2 backdrop-blur lg:hidden">
        <div className="flex min-w-0 items-center gap-2">
          {activeItem && <activeItem.icon className="h-4 w-4 text-muted-foreground" />}
          <span className="truncate text-sm font-semibold text-foreground">{mobileTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href={`/${server}/@${user.username}`} aria-label={userNameText || "Profile"}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={userNameText} />
                <AvatarFallback>{userNameText.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <LoginModal>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <User className="h-4 w-4" />
              </Button>
            </LoginModal>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/90 px-4 py-2 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          {navigationItems.map((item) => {
            const href = `/${server}/${item.route}`
            const isActive = pathname === href
            return (
              <Link key={item.route} href={href} aria-label={item.label} className="flex-1">
                <div
                  className={cn(
                    "flex h-10 items-center justify-center rounded-sm transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={cn(
          "hidden bg-card border-r border-border/60 lg:block",
          isCollapsed ? "w-20 lg:w-20" : "w-72 lg:w-72",
          "lg:sticky lg:top-0 lg:h-screen",
        )}
      >
        <div className="flex h-full flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/40">
            {!isCollapsed ? (
              <Link href="/" className="flex items-center space-x-2">
                <img
                  src="/icon.svg"
                  alt="MastoClient"
                  className="h-9 w-9 rounded-lg"
                />
                <span className="text-2xl font-bold text-foreground font-['Quicksand']">MastoClient</span>
              </Link>
            ) : (
              <div className="flex items-center justify-center w-full">
                <Link href="/">
                  <img
                    src="/icon.svg"
                    alt="MastoClient"
                    className="h-8 w-8 rounded-lg"
                  />
                </Link>
              </div>
            )}

            {!isCollapsed && !isMenuPage && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => router.back()}
                aria-label="返回上一级"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-3">
            {navigationItems.map((item) => {
              const href = `/${server}/${item.route}`
              const isActive = pathname === href
              return (
                <div key={item.route}>
                  <Link href={href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start transition-bg duration-200 hover:scale-[1.02] py-5",
                        isCollapsed && "px-2",
                      )}
                    >
                      <item.icon
                        size={28}
                        className={cn(
                          "!h-6 !w-6 transition-colors duration-200",
                          isActive ? item.color : "text-muted-foreground",
                          !isCollapsed && "mr-3",
                        )}
                      />
                      {!isCollapsed && <span className="font-bold text-base">{item.label}</span>}
                    </Button>
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* User Info */}
          {!isInitialized ? (
            /* 骨架屏：等待鉴权初始化完成，避免未登录/已登录状态闪烁 */
            <div className="border-t border-border/60 py-4 mx-4">
              <div className={cn("flex items-center space-x-3 p-3 rounded-lg", isCollapsed && "justify-center")}>
                <div className="h-12 w-12 shrink-0 rounded-full bg-border/60 dark:bg-muted-foreground/40 animate-pulse" />
                {!isCollapsed && (
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-3 w-24 rounded bg-border/60 dark:bg-muted-foreground/40 animate-pulse" />
                    <div className="h-3 w-32 rounded bg-border/60 dark:bg-muted-foreground/40 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          ) : !user ? (
            <div className="border-t border-border/60 py-4 mx-4">
              <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {t.rich("home.preview.sidebar.viewing", {
                        server: () => <span className="font-semibold text-foreground">{server}</span>,
                      })}
                    </p>
                <p className="text-xs text-muted-foreground/80">
                  {t("common.loginPrompt")}
                </p>
                <LoginModal>
                  <Button className="w-full">{t("common.loginButton")}</Button>
                </LoginModal>
              </div>
            </div>
          ) : (
            <div className="py-2 px-2 border-t border-border/60 mx-4">
              <div
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg",
                  isCollapsed && "justify-center",
                )}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={userNameText} />
                  <AvatarFallback>{userNameText.charAt(0)}</AvatarFallback>
                </Avatar>

                {!isCollapsed && (
                  <Link href={`/${server}/@${user.username}`} className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate text-primary mb-1">
                      {renderDisplayName({
                        displayName: user.displayName,
                        username: user.username,
                        emojis: user.emojis,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">@{user.username}@{server}</div>
                  </Link>
                )}

                {!isCollapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-8 w-8 text-muted-foreground hover:text-grey"
                  >
                    <LogOut className="!h-5 !w-5" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
