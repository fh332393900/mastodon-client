"use client"

import type { RefObject } from "react"
import type { mastodon } from "masto"

import { ComposeEditor, type ComposeEditorHandle } from "@/components/mastodon/compose-editor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/auth/login-modal"
import { getDisplayNameText } from "@/lib/mastodon/contentToReactNode"

export function ReplyComposer({
  user,
  fallbackAuthor,
  value,
  onChange,
  onSubmit,
  isSubmitting,
  isAuthenticated,
  isLoginOpen,
  onLoginOpenChange,
  editorRef,
}: {
  user: mastodon.v1.AccountCredentials | null
  fallbackAuthor: mastodon.v1.Account
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  isAuthenticated: boolean
  isLoginOpen: boolean
  onLoginOpenChange: (open: boolean) => void
  editorRef: RefObject<ComposeEditorHandle | null>
}) {
  const authorNameText = getDisplayNameText({
    displayName: user?.displayName ?? fallbackAuthor.displayName,
    username: user?.username ?? fallbackAuthor.username,
  })

  return (
    <div className="rounded-3xl border border-border/60 bg-card/90 p-4">
      <LoginModal open={isLoginOpen} onOpenChange={onLoginOpenChange} />
      <div className="flex gap-4">
        <Avatar className="h-11 w-11">
          <AvatarImage src={user?.avatar ?? fallbackAuthor.avatar} alt={authorNameText} />
          <AvatarFallback>{authorNameText.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <ComposeEditor
            value={value}
            onChange={onChange}
            placeholder={isAuthenticated ? "写下你的回复..." : "登录后才能回复"}
            className="min-h-[120px]"
            editorRef={editorRef}
          />
          <div className="flex justify-end">
            <Button onClick={onSubmit} disabled={isSubmitting || !value.trim()}>
              {isSubmitting ? "发送中..." : "发布回复"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
