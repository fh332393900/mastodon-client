"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Heart, Search, Settings, Menu, X, LogOut, PenSquare, MessageCircle } from "lucide-react"
import { LoginModal } from "@/components/auth/login-modal"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "../auth/masto-provider"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"

const navigationItems = [
  { icon: Home, label: "Home", route: "timeline", color: "text-blue-300" },
  { icon: Heart, label: "Favorites", route: "favorites", color: "text-red-500" },
  { icon: PenSquare, label: "Compose", route: "compose", color: "text-purple-200" },
  { icon: Search, label: "Explore", route: "explore", color: "text-green-300" },
  { icon: Settings, label: "Settings", route: "settings", color: "text-orange-300" },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(true)
  const pathname = usePathname()
  const { user, logout, isInitialized } = useAuth()
  const { server } = useMasto()
  const userNameText = user
    ? getDisplayNameText({ displayName: user.displayName, username: user.username })
    : ""

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card/80 backdrop-blur-sm"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          isMobileOpen ? "fixed inset-y-0 left-0 z-50 bg-card border-r border-border" : "hidden lg:block bg-card border-r border-border",
          isCollapsed ? "w-20 lg:w-20" : "w-72 lg:w-72",
          "transition-all duration-200 lg:sticky lg:top-0 lg:h-screen",
        )}
      >
        <div className="flex h-full flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            {!isCollapsed ? (
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600  rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">MastoClient</span>
              </Link>
            ) : (
              <div className="flex items-center justify-center w-full">
                <Link href="/">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary-foreground" />
                  </div>
                </Link>
              </div>
            )}

            {/* <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex">
              <Menu className="h-5 w-5" />
            </Button> */}
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
                        "w-full justify-start transition-all duration-200 hover:scale-[1.02] py-5",
                        isCollapsed && "px-2",
                      )}
                      onClick={() => setIsMobileOpen(false)}
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
            <div className="border-t border-border py-4 mx-4">
              <div className={cn("flex items-center space-x-3 p-3 rounded-lg", isCollapsed && "justify-center")}>
                <div className="h-12 w-12 shrink-0 rounded-full bg-muted animate-pulse" />
                {!isCollapsed && (
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          ) : !user ? (
            <div className="border-t border-border py-4 mx-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  正在查看 <span className="font-semibold text-foreground">{server}</span> 的公共数据
                </p>
                <p className="text-xs text-muted-foreground/80">
                  登录后可关注其他人或标签、点赞、分享和回复帖文，或与不同服务器上的账号交互。
                </p>
                <LoginModal>
                  <Button className="w-full">登录</Button>
                </LoginModal>
              </div>
            </div>
          ) : (
            <div className="py-2 px-2 border-t border-border mx-4">
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
