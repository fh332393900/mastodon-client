"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import type { mastodon } from "masto"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"
import MastodonContent from "@/components/mastodon/MastodonContent"

export function UserHoverCard({
  account,
  profileHref,
  className,
  children,
}: {
  account: mastodon.v1.Account
  profileHref?: string
  className?: string
  children?: React.ReactNode
}) {
  const { client } = useMasto()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [relationship, setRelationship] = useState<mastodon.v1.Relationship | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHoveringButton, setIsHoveringButton] = useState(false)
  const openTimer = useRef<number | null>(null)
  const closeTimer = useRef<number | null>(null)
  const fetchGuard = useRef(false)
  const canInteract = !!user && user.id !== account.id

  const nameText = getDisplayNameText({
    displayName: account.displayName,
    username: account.username,
  })

  useEffect(() => {
    if (!open || !canInteract || !client || isLoaded) return

    let cancelled = false
    const load = async () => {
      try {
        const relationships = await client.v1.accounts.relationships.fetch({
          id: [account.id],
        })
        if (!cancelled) {
          setRelationship(relationships[0] ?? null)
          setIsLoaded(true)
        }
      } catch {
        if (!cancelled) {
          setRelationship(null)
          setIsLoaded(true)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [account.id, canInteract, client, isLoaded, open])

  const isFollowing = !!relationship?.following
  const isRequested = !!relationship?.requested

  const handleToggleFollow = async () => {
    if (!client || !canInteract || isPending) return
    setIsPending(true)
    try {
      const nextRelationship = isFollowing
        ? await client.v1.accounts.$select(account.id).unfollow()
        : await client.v1.accounts.$select(account.id).follow()
      setRelationship(nextRelationship)
    } finally {
      setIsPending(false)
      setIsHoveringButton(false)
    }
  }

  const stats = useMemo(
    () => [
      { label: "贴文", value: account.statusesCount },
      { label: "关注", value: account.followingCount },
      { label: "粉丝", value: account.followersCount },
    ],
    [account.followersCount, account.followingCount, account.statusesCount],
  )

  const trigger = children ? (
    <span className={className}>{children}</span>
  ) : profileHref ? (
    <Link href={profileHref} className="font-semibold text-foreground flex flex-wrap md:flex-nowrap items-center min-w-0 px-2 rounded-xl hover:bg-primary-foreground dark:hover:bg-muted">
      <span className="block md:shrink-0 truncate">
        {renderDisplayName({
          displayName: account.displayName,
          username: account.username,
          emojis: account.emojis,
        })}
      </span>
      <span className="block text-sm ml-1 text-muted-foreground truncate">@{account.acct}</span>
    </Link>
  ) : (
    <span className={className}>
      {renderDisplayName({
        displayName: account.displayName,
        username: account.username,
        emojis: account.emojis,
      })}
    </span>
  )

  const clearTimers = () => {
    fetchGuard.current = false
    if (openTimer.current) window.clearTimeout(openTimer.current)
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
  }

  const scheduleOpen = () => {
    clearTimers()
    openTimer.current = window.setTimeout(async () => {
      // 不需要拉取关系（未登录 / 自己 / 已加载），直接打开
      if (!canInteract || !client || isLoaded) {
        setOpen(true)
        return
      }
      // 先拉取关注关系，完成后再显示卡片
      fetchGuard.current = true
      try {
        const rels = await client.v1.accounts.relationships.fetch({ id: [account.id] })
        if (fetchGuard.current) {
          setRelationship(rels[0] ?? null)
          setIsLoaded(true)
          setOpen(true)
        }
      } catch {
        if (fetchGuard.current) {
          setRelationship(null)
          setIsLoaded(true)
          setOpen(true)
        }
      }
    }, 150)
  }

  const scheduleClose = () => {
    clearTimers()
    closeTimer.current = window.setTimeout(() => setOpen(false), 150)
  }

  useEffect(() => () => clearTimers(), [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          onFocus={scheduleOpen}
          onBlur={scheduleClose}
          className="inline-flex"
        >
          {trigger}
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-92 rounded-xl border border-border bg-card p-4 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        onMouseEnter={clearTimers}
        onMouseLeave={scheduleClose}
      >
        {/* 触发区与卡片之间的缓冲区，防止鼠标经过间隙时卡片关闭 */}
        <div className="absolute -top-2 left-0 h-2 w-full" />
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={account.avatar} alt={nameText} />
            <AvatarFallback>{nameText.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="text-sm line-clamp-1 font-semibold text-foreground">
              {renderDisplayName({
                displayName: account.displayName,
                username: account.username,
                emojis: account.emojis,
              })}
            </div>
            <div className="text-xs text-muted-foreground">@{account.acct}</div>
          </div>
          {canInteract ? (
            <Button
              size="sm"
              onClick={handleToggleFollow}
              disabled={isPending}
              variant={isFollowing || isRequested ? "outline" : "default"}
              className={cn(
                "h-8 w-20 shrink-0 rounded-full px-3 text-xs",
                isFollowing || isRequested ? "border-border text-foreground" : "bg-primary text-primary-foreground",
              )}
              onMouseEnter={() => setIsHoveringButton(true)}
              onMouseLeave={() => setIsHoveringButton(false)}
            >
              {isFollowing
                ? isHoveringButton
                  ? "取消关注"
                  : "已关注"
                : isRequested
                  ? "请求中"
                  : "关注"}
            </Button>
          ) : null}
        </div>

        {account.note ? (
          <div className="mt-3 max-h-56 overflow-y-auto text-xs text-muted-foreground">
            <MastodonContent content={account.note} emojis={account.emojis} />
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
          {stats.map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-base font-semibold text-foreground">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
