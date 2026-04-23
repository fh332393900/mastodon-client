"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import type { mastodon } from "masto"

import { StatusCard } from "@/components/mastodon/Status"
import { StatusThread } from "@/components/mastodon/Status/StatusThread"
import { ComposeEditor, type ComposeEditorHandle } from "@/components/mastodon/compose-editor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/auth/login-modal"
import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "@/components/auth/masto-provider"
import { useComposeActions } from "@/hooks/mastodon/useComposeActions"
import { getDisplayNameText } from "@/lib/mastodon/contentToReactNode"
import { groupThreadPosts } from "@/lib/mastodon/groupThreads"

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

  const replyGroups = useMemo(() => groupThreadPosts(replies), [replies])

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
        <p className="text-xs text-muted-foreground/70">
          @{account}@{server} · 帖文详情
        </p>
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

      <section className="space-y-4">
        <h3 className="text-base font-semibold text-muted-foreground">全部回复</h3>
        {replyGroups.length === 0 ? (
          <div className="rounded-3xl border border-border/60 bg-card/90 p-6 text-sm text-muted-foreground">
            还没有回复
          </div>
        ) : (
          <div className="space-y-5 pl-6">
            {replyGroups.map((group) => (
              <StatusThread key={group[0].id} statuses={group} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
