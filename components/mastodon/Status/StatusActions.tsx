"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MessageCircle, Repeat2, Heart, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"
import { LoginModal } from "@/components/auth/login-modal"
import type { mastodon } from "masto"

interface StatusActionsProps {
  renderedStatus: mastodon.v1.Status
  isLoading: { reblogged: boolean; favourited: boolean; bookmarked: boolean }
  canReblog: boolean
  toggleReblog: () => void
  toggleFavourite: () => void
  toggleBookmark: () => void
}

export function StatusActions({
  renderedStatus,
  isLoading,
  canReblog,
  toggleReblog,
  toggleFavourite,
  toggleBookmark,
}: StatusActionsProps) {
  const { isAuthenticated } = useAuth()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const router = useRouter()
  const params = useParams()
  const serverParam = params?.server
  const server = Array.isArray(serverParam) ? serverParam[0] : serverParam

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true)
      return
    }
    action()
  }

  return (
    <>
      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <div className="flex w-full items-center justify-between pt-3 mt-2 gap-4 text-sm text-muted-foreground">
        <div className="flex w-full justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              if (server) {
                router.push(`/${server}/@${renderedStatus.account.username}/${renderedStatus.id}`)
              }
            }}
            className={cn(
              "inline-flex items-center gap-1.5 transition-colors cursor-pointer group",
              "hover:text-primary",
            )}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-primary/10">
              <MessageCircle className="h-5 w-5" />
            </span>
            {renderedStatus.repliesCount}
          </button>

          <button
            type="button"
            onClick={() => requireAuth(toggleReblog)}
            disabled={!canReblog || isLoading.reblogged}
            className={cn(
              "inline-flex items-center gap-1.5 transition-colors cursor-pointer group",
              renderedStatus.reblogged ? "text-green-500" : "hover:text-green-500",
              (!canReblog || isLoading.reblogged) && "opacity-60 cursor-not-allowed",
            )}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-green-500/10">
              <Repeat2 className="h-5 w-5" />
            </span>
            {renderedStatus.reblogsCount}
          </button>

          <button
            type="button"
            onClick={() => requireAuth(toggleFavourite)}
            disabled={isLoading.favourited}
            className={cn(
              "inline-flex items-center gap-1.5 transition-colors cursor-pointer group",
              renderedStatus.favourited ? "text-red-500" : "hover:text-red-500",
              isLoading.favourited && "opacity-60 cursor-not-allowed",
            )}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-red-500/10">
              <Heart className={cn("h-5 w-5", renderedStatus.favourited && "fill-current")} />
            </span>
            {renderedStatus.favouritesCount}
          </button>

          <button
            type="button"
            onClick={() => requireAuth(toggleBookmark)}
            disabled={isLoading.bookmarked}
            className={cn(
              "inline-flex items-center gap-1.5 transition-colors cursor-pointer group",
              renderedStatus.bookmarked ? "text-yellow-500" : "hover:text-yellow-500",
              isLoading.bookmarked && "opacity-60 cursor-not-allowed",
            )}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-yellow-500/10">
              <Bookmark className={cn("h-5 w-5", renderedStatus.bookmarked && "fill-current")} />
            </span>
          </button>
        </div>
      </div>
    </>
  )
}
