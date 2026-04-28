"use client"

import { useEffect, useState } from "react"
import { Loader2, UserCheck, UserPlus, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import type { mastodon } from "masto"

interface FollowButtonProps {
  account: mastodon.v1.Account
  /** 外部传入的初始关注关系，可为 null（未加载） */
  initialRelationship: mastodon.v1.Relationship | null
  /** 外部正在加载关系时显示 loading 态 */
  loadingRel?: boolean
  /** 按钮额外 className */
  className?: string
  /** 按钮尺寸，默认 "sm" */
  size?: "sm" | "default" | "lg" | "icon"
}

export function FollowButton({
  account,
  initialRelationship,
  loadingRel = false,
  className,
  size = "sm",
}: FollowButtonProps) {
  const { client } = useMasto()
  const { user } = useAuth()
  const canInteract = !!client && !!user && user.id !== account.id

  const [relationship, setRelationship] = useState<mastodon.v1.Relationship | null>(
    initialRelationship,
  )
  const [isPending, setIsPending] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // 当外部首次拿到关系数据时同步进来（不覆盖用户操作后的本地状态）
  const [synced, setSynced] = useState(false)
  useEffect(() => {
    if (!synced && initialRelationship !== null) {
      setRelationship(initialRelationship)
      setSynced(true)
    }
  }, [initialRelationship, synced])

  const isFollowing = !!relationship?.following
  const isRequested = !!relationship?.requested

  const handleToggleFollow = async () => {
    if (!client || !canInteract || isPending) return
    setIsPending(true)
    try {
      const next = isFollowing
        ? await client.v1.accounts.$select(account.id).unfollow()
        : await client.v1.accounts.$select(account.id).follow()
      setRelationship(next)
    } finally {
      setIsPending(false)
      setIsHovering(false)
    }
  }

  const content = () => {
    if (isPending || loadingRel)
      return <><Loader2 className="h-4 w-4 animate-spin" /><span className="inline-block w-16">Requesting</span></>
    if (isFollowing) {
      return isHovering ? (
        <><UserX className="h-4 w-4" /><span className="inline-block w-12">Unfollow</span></>
      ) : (
        <><UserCheck className="h-4 w-4" /><span className="inline-block w-12">Following</span></>
      )
    }
    if (isRequested) return <><Loader2 className="h-4 w-4" /><span className="inline-block w-12">Pending</span></>
    return <><UserPlus className="h-4 w-4" /><span className="inline-block w-12">Follow</span></>
  }

  return (
    <Button
      size={size}
      variant={isFollowing || isRequested ? "outline" : "default"}
      className={cn(
        "shrink-0 w-28 gap-1.5 rounded-full transition-all",
        isFollowing && isHovering && "hover:text-destructive",
        !canInteract && "opacity-50 cursor-not-allowed",
        className,
      )}
      disabled={!canInteract || isPending || loadingRel || isRequested}
      onClick={handleToggleFollow}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {content()}
    </Button>
  )
}
