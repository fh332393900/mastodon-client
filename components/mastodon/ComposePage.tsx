"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "@/components/auth/masto-provider"
import { useComposeThread } from "@/hooks/mastodon/useComposeThread"
import { ThreadPostItem } from "@/components/mastodon/compose/ThreadPostItem"

export function ComposePage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { server } = useMasto()
  const {
    posts,
    visibility,
    setVisibility,
    isSubmitting,
    submittingIndex,
    error,
    notice,
    canSubmitAll,
    maxCharacters,
    maxMediaAttachments,
    maxPollOptions,
    updatePost,
    addPost,
    removePost,
    handleSubmit,
  } = useComposeThread()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6 px-4 py-6">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <h1 className="text-xl font-semibold">请先登录</h1>
          <p className="mt-2 text-sm text-muted-foreground">登录后即可在 {server} 发布嘟文。</p>
        </div>
      </div>
    )
  }

  const userAvatar = (user as any)?.avatar as string | undefined
  const userDisplayName = ((user as any)?.displayName ?? (user as any)?.username ?? "M") as string

  return (
    <div className="space-y-6 px-4 py-6 overflow-x-hidden">
      <div className="space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold">撰写嘟文</h1>
          <p className="text-muted-foreground">在 {server} 发布新动态、媒体或投票。</p>
        </div>

        <div className="rounded-2xl border border-border bg-card px-5 pt-5 pb-3 shadow-sm">
          <div>
            {posts.map((post, index) => (
              <ThreadPostItem
                key={post.id}
                post={post}
                index={index}
                total={posts.length}
                maxCharacters={maxCharacters}
                maxMediaAttachments={maxMediaAttachments}
                maxPollOptions={maxPollOptions}
                visibility={visibility}
                onVisibilityChange={setVisibility}
                onChange={(update) => updatePost(post.id, update)}
                onRemove={() => removePost(post.id)}
                onSubmit={handleSubmit}
                onAddPost={addPost}
                isSubmittingThis={isSubmitting && submittingIndex === index}
                isSubmitting={isSubmitting}
                canSubmitAll={canSubmitAll}
                userAvatar={userAvatar}
                userDisplayName={userDisplayName}
                error={index === posts.length - 1 ? error : null}
                notice={index === posts.length - 1 ? notice : null}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 pb-1 pt-0.5">
            <div className="flex w-10 shrink-0 justify-center">
              <div className="h-5 w-0.5 rounded-full bg-border/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
