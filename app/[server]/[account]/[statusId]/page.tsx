"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import type { mastodon } from "masto"

import { StatusCard } from "@/components/mastodon/Status"
import { ComposeEditor, type ComposeEditorHandle } from "@/components/mastodon/compose-editor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/auth/login-modal"
import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "@/components/auth/masto-provider"
import { useComposeActions } from "@/hooks/mastodon/useComposeActions"
import MastodonContent from "@/components/mastodon/MastodonContent"
import { UserHoverCard } from "@/components/mastodon/user-hover-card"
import { formatRelativeTime, formatFullDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { getDisplayNameText } from "@/lib/mastodon/contentToReactNode"
import { getAccountProfileHref } from "@/lib/mastodon/account"
import { useStatusActions } from "@/hooks/mastodon/useStatusActions"
import { StatusActions } from "@/components/mastodon/Status/StatusActions"
import { StatusMedia } from "@/components/mastodon/Status/StatusMedia"
import { StatusPoll } from "@/components/mastodon/Status/StatusPoll"
import { StatusPreviewCard } from "@/components/mastodon/Status/StatusPreviewCard"

type ReplyGroup = {
  root: mastodon.v1.Status
  replies: mastodon.v1.Status[]
}

function buildReplyGroups(
  replies: mastodon.v1.Status[],
  rootId: string,
): ReplyGroup[] {
  const byId = new Map<string, mastodon.v1.Status>()
  replies.forEach((reply) => byId.set(reply.id, reply))

  const roots = replies.filter((reply) => reply.inReplyToId === rootId)
  const children = replies.filter((reply) => reply.inReplyToId && reply.inReplyToId !== rootId)

  const groups: ReplyGroup[] = roots.map((root) => ({ root, replies: [] }))
  const groupMap = new Map<string, ReplyGroup>()
  groups.forEach((group) => groupMap.set(group.root.id, group))

  children.forEach((reply) => {
    const parentId = reply.inReplyToId
    if (!parentId) return
    const group = groupMap.get(parentId)
    if (group) {
      group.replies.push(reply)
    }
  })

  groups.sort(
    (a, b) => new Date(a.root.createdAt).getTime() - new Date(b.root.createdAt).getTime(),
  )
  groups.forEach((group) => {
    group.replies.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
  })

  return groups
}

function ReplyItem({
  status,
  showThreadLine,
}: {
  status: mastodon.v1.Status
  showThreadLine?: boolean
}) {
  const { server } = useMasto()
  const {
    renderedStatus,
    isLoading,
    canReblog,
    toggleReblog,
    toggleFavourite,
    toggleBookmark,
  } = useStatusActions({ status })

  const author = renderedStatus.account
  const authorNameText = getDisplayNameText({
    displayName: author.displayName,
    username: author.username,
  })
  const profileHref = server ? getAccountProfileHref(author, server) : undefined
  const detailHref = server ? `/${server}/@${author.username}/${renderedStatus.id}` : undefined

  return (
  <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          {profileHref ? (
            <UserHoverCard account={author} profileHref={profileHref}>
              <Link href={profileHref}>
                <Avatar className="h-10 w-10 ring-2 ring-border/70 shrink-0">
                  <AvatarImage src={author.avatar} alt={authorNameText} />
                  <AvatarFallback>{authorNameText.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            </UserHoverCard>
          ) : (
            <Avatar className="h-10 w-10 ring-2 ring-border/70 shrink-0">
              <AvatarImage src={author.avatar} alt={authorNameText} />
              <AvatarFallback>{authorNameText.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          {showThreadLine ? (
            <div className="mt-2 w-0.5 flex-1 min-h-4 bg-border/60 rounded-full" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {detailHref ? (
            <Link href={detailHref} className="block group">
              <div className="flex gap-2 md:gap-4 justify-between items-center">
                <UserHoverCard account={author} profileHref={profileHref} className="" />
                <span
                  className="text-xs text-muted-foreground shrink-0 whitespace-nowrap group-hover:text-primary transition-colors"
                  title={formatFullDate(renderedStatus.createdAt)}
                >
                  {formatRelativeTime(renderedStatus.createdAt)}
                </span>
              </div>

              {renderedStatus.spoilerText ? (
                <div className="rounded-2xl bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
                  {renderedStatus.spoilerText}
                </div>
              ) : null}

              <div className="[&_.prose]:max-w-none [&_.prose]:text-sm [&_.prose_a]:text-primary [&_.prose_p]:my-2">
                <MastodonContent content={renderedStatus.content} emojis={renderedStatus.emojis} />
              </div>

              {renderedStatus.poll ? (
                <StatusPoll poll={renderedStatus.poll} />
              ) : null}

              <StatusMedia attachments={renderedStatus.mediaAttachments} />

              {renderedStatus.card ? (
                <StatusPreviewCard card={renderedStatus.card} />
              ) : null}
            </Link>
          ) : null}

          <StatusActions
            renderedStatus={renderedStatus}
            isLoading={isLoading}
            canReblog={canReblog}
            toggleReblog={toggleReblog}
            toggleFavourite={toggleFavourite}
            toggleBookmark={toggleBookmark}
          />
        </div>
      </div>

    </div>
  )
}

export default function StatusDetailPage() {
  const params = useParams()
  const serverParam = params?.server
  const accountParam = params?.account
  const statusParam = params?.statusId
  const server = Array.isArray(serverParam) ? serverParam[0] : serverParam
  const account = Array.isArray(accountParam) ? accountParam[0] : accountParam
  const statusId = Array.isArray(statusParam) ? statusParam[0] : statusParam

  const { client, isReady } = useMasto()
  const { user, isAuthenticated } = useAuth()
  const { createStatus } = useComposeActions()

  const [status, setStatus] = useState<mastodon.v1.Status | null>(null)
  const [replies, setReplies] = useState<mastodon.v1.Status[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const editorRef = useRef<ComposeEditorHandle | null>(null)

  useEffect(() => {
    if (!client || !isReady || !statusId) return

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const fetched = await client.v1.statuses.$select(statusId).fetch()
        const context = await client.v1.statuses.$select(statusId).context.fetch()
        if (cancelled) return
        setStatus(fetched)
        setReplies(context?.descendants ?? [])
      } catch (err) {
        if (cancelled) return
        setError("加载失败，请稍后重试")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [client, isReady, statusId])

  const replyGroups = useMemo(() => {
    if (!statusId) return []
    return buildReplyGroups(replies, statusId)
  }, [replies, statusId])

  const handleSubmit = async () => {
    if (!statusId) return
    if (!isAuthenticated) {
      setIsLoginOpen(true)
      return
    }
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      const created = await createStatus({
        status: replyContent.trim(),
        inReplyToId: statusId,
      })
      setReplyContent("")
      editorRef.current?.focus()
      setReplies((prev) => [created, ...prev])
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 rounded-3xl bg-muted/40 animate-pulse" />
        <div className="h-32 rounded-3xl bg-muted/40 animate-pulse" />
      </div>
    )
  }

  if (!status || error) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/90 p-6 text-sm text-muted-foreground">
        {error ?? "未找到该贴文"}
      </div>
    )
  }

  const author = status.account
  const authorNameText = getDisplayNameText({
    displayName: author.displayName,
    username: author.username,
  })

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <StatusCard status={status} />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">回复</h2>
        <div className="rounded-3xl border border-border/60 bg-card/90 p-4">
          <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
          <div className="flex gap-4">
            <Avatar className="h-11 w-11">
              <AvatarImage src={user?.avatar ?? author.avatar} alt={authorNameText} />
              <AvatarFallback>{authorNameText.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <ComposeEditor
                value={replyContent}
                onChange={setReplyContent}
                placeholder={isAuthenticated ? "写下你的回复..." : "登录后才能回复"}
                className="min-h-[120px]"
                editorRef={editorRef}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !replyContent.trim()}
                >
                  {isSubmitting ? "发送中..." : "发布回复"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 bg-card/90 px-4 py-6 rounded-3xl">
        <h3 className="text-base font-semibold text-muted-foreground">全部回复</h3>
        {replyGroups.length === 0 ? (
          <div className="rounded-3xl border border-border/60 bg-card/90 p-6 text-sm text-muted-foreground">
            还没有回复
          </div>
        ) : (
          <div className="space-y-6">
            {replyGroups.map((group) => (
              <div key={group.root.id} className="space-y-4">
                <ReplyItem status={group.root} showThreadLine={group.replies.length > 0} />
                {group.replies.length > 0 ? (
                  <div className="space-y-4 border-l border-border/50 pl-6">
                    {group.replies.map((reply) => (
                      <ReplyItem key={reply.id} status={reply} />
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
