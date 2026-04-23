"use client"

import { useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import type { mastodon } from "masto"
import { useQueryClient } from "@tanstack/react-query"

import { StatusCard } from "@/components/mastodon/Status"
import type { ComposeEditorHandle } from "@/components/mastodon/compose-editor"
import { useAuth } from "@/components/auth/auth-provider"
import { useComposeActions } from "@/hooks/mastodon/useComposeActions"
import { useStatusDetail } from "@/hooks/mastodon/useStatusDetail"
import {
  ReplyList,
  buildReplyGroups,
} from "@/components/mastodon/status-detail/ReplyList"
import { ReplyComposer } from "@/components/mastodon/status-detail/ReplyComposer"

export default function StatusDetailPage() {
  const params = useParams()
  const serverParam = params?.server
  const statusParam = params?.statusId
  const server = Array.isArray(serverParam) ? serverParam[0] : serverParam
  const statusId = Array.isArray(statusParam) ? statusParam[0] : statusParam

  const { user, isAuthenticated } = useAuth()
  const { createStatus } = useComposeActions()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useStatusDetail(server, statusId)

  const [replyContent, setReplyContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const editorRef = useRef<ComposeEditorHandle | null>(null)

  const replyGroups = useMemo(() => {
    if (!statusId) return []
    return buildReplyGroups(data?.replies ?? [], statusId)
  }, [data?.replies, statusId])

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
      queryClient.setQueryData(
        ["status-detail", server, statusId],
        (old: { status: mastodon.v1.Status; replies: mastodon.v1.Status[] } | null) => {
          if (!old) return old
          return {
            ...old,
            replies: [created, ...old.replies],
          }
        },
      )
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

  if (!data?.status || error) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/90 p-6 text-sm text-muted-foreground">
        {error ? "加载失败，请稍后重试" : "未找到该贴文"}
      </div>
    )
  }

  const author = data.status.account

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <StatusCard status={data.status} />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">回复</h2>
        <ReplyComposer
          user={user}
          fallbackAuthor={author}
          value={replyContent}
          onChange={setReplyContent}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isAuthenticated={isAuthenticated}
          isLoginOpen={isLoginOpen}
          onLoginOpenChange={setIsLoginOpen}
          editorRef={editorRef}
        />
      </section>

      <section className="space-y-4 bg-card/90 px-4 py-6 rounded-3xl">
        <h3 className="text-base font-semibold text-muted-foreground">全部回复</h3>
        <ReplyList groups={replyGroups} />
      </section>
    </div>
  )
}
