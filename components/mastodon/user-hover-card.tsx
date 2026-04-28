"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import type { mastodon } from "masto"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"
import MastodonContent from "@/components/mastodon/MastodonContent"
import { formatCompactNumber } from "@/lib/format-number"
import { getAccountProfileHref } from "@/lib/mastodon/account"
import { FollowButton } from "@/components/mastodon/FollowButton"

export function UserHoverCard({
  account,
  profileHref,
  className,
  children,
  forceOpen,
}: {
  account: mastodon.v1.Account
  profileHref?: string
  className?: string
  children?: React.ReactNode
  forceOpen?: boolean
}) {
  const { client, server } = useMasto()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [relationship, setRelationship] = useState<mastodon.v1.Relationship | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const openTimer = useRef<number | null>(null)
  const closeTimer = useRef<number | null>(null)
  const fetchGuard = useRef(false)
  const canInteract = !!user && user.id !== account.id

  const nameText = getDisplayNameText({
    displayName: account.displayName,
    username: account.username,
  })

  const defaultHeaderImage = "https://mastodon.social/headers/original/missing.png"
  const hasCustomHeader = account.header && account.header !== defaultHeaderImage

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

  const stats = useMemo(() => {
    const base = server ? getAccountProfileHref(account, server) : profileHref ?? ""
    return [
      { label: "Posts", value: account.statusesCount, href: base || undefined },
      { label: "Following", value: account.followingCount, href: base ? `${base}/following` : undefined },
      { label: "Followers", value: account.followersCount, href: base ? `${base}/followers` : undefined },
    ]
  }, [account, server, profileHref])

  const trigger = children ? (
    <span className={className}>{children}</span>
  ) : profileHref ? (
    <Link href={profileHref} className="font-semibold text-foreground flex flex-1 flex-wrap md:flex-nowrap items-center min-w-0 w-full px-3 -ml-3 rounded-full hover:bg-primary-foreground dark:hover:bg-muted overflow-hidden">
      <span className="block md:shrink-0 line-clamp-1 truncate max-w-full">
        {renderDisplayName({
          displayName: account.displayName,
          username: account.username,
          emojis: account.emojis,
        })}
      </span>
      <span className="block text-sm ml-1 line-clamp-1 text-muted-foreground/70 truncate">@{account.acct}</span>
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

  useEffect(() => {
    if (forceOpen) {
      setOpen(true)
    }
  }, [forceOpen])

  useEffect(() => () => clearTimers(), [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          onFocus={scheduleOpen}
          onBlur={scheduleClose}
          className="inline-flex min-w-0"
        >
          {trigger}
        </span>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-92 rounded-xl px-0 pt-0 border border-border bg-card shadow-lg overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        onMouseEnter={clearTimers}
        onMouseLeave={scheduleClose}
      >
        <div className="absolute -top-2 left-0 h-2 w-full" />
        {hasCustomHeader ? (
          <div className="relative h-28 w-full overflow-hidden">
            <img
              src={account.header}
              alt={`${account.username} header`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-36"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom, transparent 0%, transparent 40%, var(--card) 75%)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
              <div className="flex items-center justify-between gap-3">
                {profileHref ? (
                  <Link
                    href={profileHref}
                    className="font-semibold text-foreground flex gap-2 flex-wrap md:flex-nowrap items-center min-w-0 w-full px-3 py-1 rounded-full hover:bg-muted-foreground/10 dark:hover:bg-muted/50 overflow-hidden"
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-border/70">
                      <AvatarImage src={account.avatar} alt={nameText} />
                      <AvatarFallback>{nameText.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {renderDisplayName({
                          displayName: account.displayName,
                          username: account.username,
                          emojis: account.emojis,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground/70 truncate">@{account.acct}</div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-border/70">
                      <AvatarImage src={account.avatar} alt={nameText} />
                      <AvatarFallback>{nameText.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {renderDisplayName({
                          displayName: account.displayName,
                          username: account.username,
                          emojis: account.emojis,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground/70 truncate">@{account.acct}</div>
                    </div>
                  </div>
                )}
                {canInteract ? (
                  <FollowButton
                    account={account}
                    initialRelationship={relationship}
                    className="h-8 text-xs"
                  />
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className={hasCustomHeader ? "space-y-4 px-4" : "space-y-4 p-4"}>
          {!hasCustomHeader ? (
            <div className="flex items-center gap-3">
              {profileHref ? (
                <Link
                  href={profileHref}
                  className="font-semibold text-foreground flex gap-2 flex-wrap md:flex-nowrap items-center min-w-0 w-full px-3 py-1 rounded-full hover:bg-primary-foreground dark:hover:bg-muted overflow-hidden"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={account.avatar} alt={nameText} />
                    <AvatarFallback>{nameText.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm truncate font-semibold text-foreground">
                      {renderDisplayName({
                        displayName: account.displayName,
                        username: account.username,
                        emojis: account.emojis,
                      })}
                    </div>
                    <div className="text-xs truncate text-muted-foreground/70">@{account.acct}</div>
                  </div>
                </Link>
              ) : (
                <>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={account.avatar} alt={nameText} />
                    <AvatarFallback>{nameText.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm truncate font-semibold text-foreground">
                      {renderDisplayName({
                        displayName: account.displayName,
                        username: account.username,
                        emojis: account.emojis,
                      })}
                    </div>
                    <div className="text-xs truncate text-muted-foreground">@{account.acct}</div>
                  </div>
                </>
              )}
              {canInteract ? (
                <FollowButton
                  account={account}
                  initialRelationship={relationship}
                  className="h-8 text-xs"
                />
               ) : null}
            </div>
          ) : null}

          {account.note ? (
            <div className="mt-3 max-h-56 overflow-y-auto text-xs text-muted-foreground">
              <MastodonContent content={account.note} emojis={account.emojis} />
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
            {stats.map((item) => {
              const inner = (
                <div key={item.label} className="text-center">
                  <div className="text-base font-semibold text-foreground">{formatCompactNumber(item.value)}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              )
              return item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-center rounded-md px-4 py-1 hover:bg-muted-foreground/10 dark:hover:bg-foreground/10 transition-colors"
                >
                  <div className="text-base font-semibold text-foreground">{formatCompactNumber(item.value)}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </Link>
              ) : inner
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
