"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search } from "lucide-react"
import type { mastodon } from "masto"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"
import { getAccountProfileHref } from "@/lib/mastodon/account"
import { useMasto } from "@/components/auth/masto-provider"
import { StatusCard } from "@/components/mastodon/Status/StatusCard"
import { useTranslations } from "next-intl"

type Props = {
  className?: string
  placeholder?: string
}

export function SearchPopover({ className, placeholder = "Search…" }: Props) {
  const router = useRouter()
  const { server, client, isReady } = useMasto()
  const t = useTranslations()

  const [query, setQuery] = useState("")
  const normalizedQuery = useMemo(() => query.trim(), [query])

  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<mastodon.v1.Account[]>([])
  const [statuses, setStatuses] = useState<mastodon.v1.Status[]>([])

  useEffect(() => {
    if (!open) return
    if (!isReady || !server || normalizedQuery.length === 0) {
      setAccounts([])
      setStatuses([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    const timer = setTimeout(async () => {
      try {
        if (!client) throw new Error("Mastodon client not ready")

        // Accounts via v2 search
        const accountsPromise = client.v2.search.list({
          q: normalizedQuery,
          type: "accounts",
          resolve: true,
          limit: 5,
        })

        // Statuses via v2 search
        const statusesPromise = client.v2.search.list({
          q: normalizedQuery,
          type: "statuses",
          resolve: true,
          limit: 5,
        })

        const [accountsResult, statusesResult] = await Promise.all([
          accountsPromise,
          statusesPromise,
        ])

        if (cancelled) return
        setAccounts(accountsResult.accounts ?? [])
        setStatuses(statusesResult.statuses ?? [])
      } catch {
        if (!cancelled) {
          setAccounts([])
          setStatuses([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [isReady, normalizedQuery, open, server])

  const hasQuery = normalizedQuery.length > 0
  const hasResults = accounts.length > 0 || statuses.length > 0

  const focusTest = () => {
    setOpen(true)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => focusTest}
            className="pl-10"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        className="w-full max-w-120 p-0 overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="p-3 border-b border-border/60 bg-background/70 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-foreground">{t("common.search")}</div>
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : null}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {hasQuery ? (
                <>Results for <span className="text-foreground">“{normalizedQuery}”</span></>
              ) : (
                <>Type to search accounts and posts</>
              )}
            </div>
          </div>

          {hasQuery && !isLoading && !hasResults ? (
            <div className="p-4 text-xs text-muted-foreground">No results.</div>
          ) : null}

          {accounts.length > 0 ? (
            <div className="p-3">
              <div className="text-[11px] font-semibold text-muted-foreground mb-2">Accounts</div>
              <div className="space-y-1">
                {accounts.map((a) => {
                  const href = server ? getAccountProfileHref(a, server) : undefined
                  const nameText = getDisplayNameText({ displayName: a.displayName, username: a.username })

                  return (
                    <button
                      key={a.id}
                      type="button"
                      className="w-full cursor-pointer text-left flex items-center gap-2 rounded-xl px-2.5 py-2 hover:bg-muted/90 transition-colors"
                      onClick={() => {
                        if (!href) return
                        setOpen(false)
                        router.push(href)
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={a.avatar} alt={nameText} />
                        <AvatarFallback>{nameText.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground truncate">
                          {renderDisplayName({
                            displayName: a.displayName,
                            username: a.username,
                            emojis: a.emojis,
                          })}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">@{a.acct}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}

          {statuses.length > 0 ? (
            <div className="p-3 pt-0">
              <div className="text-[11px] font-semibold text-muted-foreground mb-2">Posts</div>
              <div className="space-y-3">
                {statuses.map((s) => (
                  <div key={s.id} className="rounded-2xl">
                    <StatusCard status={s} showActions={false} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}
