"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { mastodon } from "masto"
import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "@/components/auth/masto-provider"
import { useQueryCacheTools } from "@/hooks/cache/useQueryCacheTools"

interface Props {
  status: mastodon.v1.Status
}

export function useStatusMoreActions({ status }: Props) {
  const { client, server, isReady } = useMasto()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { queryClient, getQueriesByPrefix } = useQueryCacheTools()

  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const renderedStatus = useMemo(() => status.reblog ?? status, [status])
  const author = renderedStatus.account

  const isOwnStatus = useMemo(
    () => status.account.id === user?.id && !status.reblog,
    [status.account.id, status.reblog, user?.id],
  )

  const isAuthorSelf = useMemo(() => author.id === user?.id, [author.id, user?.id])

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const postUrl = useMemo(() => {
    if (!origin || !server) return ""
    return `${origin}/${server}/@${author.username}/${renderedStatus.id}`
  }, [author.username, origin, renderedStatus.id, server])

  const sourceUrl = useMemo(() => renderedStatus.url ?? postUrl, [postUrl, renderedStatus.url])

  const authorDomain = useMemo(() => {
    if (author.acct?.includes("@")) {
      return author.acct.split("@")[1]
    }
    if (author.url) {
      try {
        return new URL(author.url).hostname
      } catch {
        return ""
      }
    }
    return ""
  }, [author.acct, author.url])

  const removeStatusFromCache = useCallback(
    (predicate: (item: any) => boolean) => {
      const prefixes = ["timeline", "tag-timeline", "favorites"] as const
      for (const prefix of prefixes) {
        const queries = getQueriesByPrefix(prefix)
        for (const query of queries) {
          const key = query.queryKey
          if (!Array.isArray(key)) continue
          queryClient.setQueryData(key as any, (old: any) => {
            if (!old || !old.pages) return old
            const pages = old.pages.map((page: any) => page.filter((item: any) => !predicate(item)))
            return { ...old, pages }
          })
        }
      }
    },
    [getQueriesByPrefix, queryClient],
  )

  const requireAuth = useCallback(
    async (action: () => Promise<void>) => {
      if (!isAuthenticated) {
        setLoginOpen(true)
        return
      }
      await action()
    },
    [isAuthenticated],
  )

  const copyText = useCallback(async (text: string) => {
    if (!text || typeof navigator === "undefined" || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // ignore clipboard failure silently
    }
  }, [])

  const copyPostLink = useCallback(async () => {
    await copyText(postUrl)
    setMenuOpen(false)
  }, [copyText, postUrl])

  const copySourceLink = useCallback(async () => {
    await copyText(sourceUrl)
    setMenuOpen(false)
  }, [copyText, sourceUrl])

  const openSource = useCallback(() => {
    if (!sourceUrl) return
    window.open(sourceUrl, "_blank", "noreferrer")
    setMenuOpen(false)
  }, [sourceUrl])

  const deleteStatus = useCallback(async () => {
    if (!isReady || !client) return
    if (!status.id) return

    setIsActionLoading(true)
    setLoadingAction("delete")
    try {
      await (client.v1.statuses.$select(status.id) as any).delete()
      setDeleteConfirmOpen(false)
      setMenuOpen(false)
      removeStatusFromCache((item) => item.id === status.id || item.reblog?.id === status.id)
      router.refresh()
    } catch {
      // ignore errors here, the user can retry
    } finally {
      setIsActionLoading(false)
      setLoadingAction(null)
    }
  }, [client, isReady, removeStatusFromCache, router, status.id])

  const toggleMuteUser = useCallback(async () => {
    if (!isReady || !client) return
    const isMuted = (author as any).muting ?? false
    setIsActionLoading(true)
    setLoadingAction("mute")
    try {
      await (client.v1.accounts.$select(author.id) as any)[
        isMuted ? "unmute" : "mute"
      ]()
      setMenuOpen(false)
      if (!isMuted) {
        removeStatusFromCache(
          (item) =>
            item.account?.id === author.id || item.reblog?.account?.id === author.id,
        )
      }
    } catch {
      // ignore
    } finally {
      setIsActionLoading(false)
      setLoadingAction(null)
    }
  }, [author.id, client, isReady, removeStatusFromCache])

  const toggleBlockUser = useCallback(async () => {
    if (!isReady || !client) return
    const isBlocked = (author as any).blocking ?? false
    setIsActionLoading(true)
    setLoadingAction("blockUser")
    try {
      await (client.v1.accounts.$select(author.id) as any)[
        isBlocked ? "unblock" : "block"
      ]()
      setMenuOpen(false)
      removeStatusFromCache(
        (item) =>
          item.account?.id === author.id || item.reblog?.account?.id === author.id,
      )
    } catch {
      // ignore
    } finally {
      setIsActionLoading(false)
      setLoadingAction(null)
    }
  }, [author.id, client, isReady, removeStatusFromCache])

  const blockAuthorDomain = useCallback(async () => {
    if (!isReady || !client || !authorDomain) return
    setIsActionLoading(true)
    setLoadingAction("blockDomain")
    try {
      await ((client.v1 as any).domain_blocks as any).create({ domain: authorDomain })
      setMenuOpen(false)
      removeStatusFromCache((item) => {
        const statusAuthor = item.account ?? item.reblog?.account
        if (!statusAuthor) return false
        const acct = statusAuthor.acct ?? ""
        return acct.includes(`@${authorDomain}`) || statusAuthor.url?.includes(authorDomain)
      })
    } catch {
      // ignore
    } finally {
      setIsActionLoading(false)
      setLoadingAction(null)
    }
  }, [authorDomain, client, isReady])

  return {
    menuOpen,
    setMenuOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    loginOpen,
    setLoginOpen,
    isActionLoading,
    loadingAction,
    isOwnStatus,
    isAuthorSelf,
    authorDomain,
    postUrl,
    sourceUrl,
    copyPostLink: () => copyPostLink(),
    copySourceLink: () => copySourceLink(),
    openSource,
    deleteStatus: () => deleteStatus(),
    toggleMuteUser: () => requireAuth(toggleMuteUser),
    toggleBlockUser: () => requireAuth(toggleBlockUser),
    blockAuthorDomain: () => requireAuth(blockAuthorDomain),
  }
}
