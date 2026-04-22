"use client"

import { useCallback, useMemo, useState } from "react"
import type { mastodon } from "masto"
import { useComposeActions } from "./useComposeActions"
import { useInstanceConfig } from "./useInstanceConfig"

// ─── Types ─────────────────────────────────────────────────────────────────────

export type LocalMedia = {
  id: string
  file: File
  previewUrl: string
  type: "image" | "video"
}

export type ThreadItem = {
  id: string
  content: string
  mediaList: LocalMedia[]
  pollEnabled: boolean
  pollOptions: string[]
  pollMultiple: boolean
  pollExpiresIn: number
  showSpoiler: boolean
  spoilerText: string
}

// ─── Factory ───────────────────────────────────────────────────────────────────

let _idCounter = 0
export function createEmptyPost(): ThreadItem {
  _idCounter += 1
  return {
    id: `post-${Date.now()}-${_idCounter}`,
    content: "",
    mediaList: [],
    pollEnabled: false,
    pollOptions: ["", ""],
    pollMultiple: false,
    pollExpiresIn: 60 * 60,
    showSpoiler: false,
    spoilerText: "",
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useComposeThread() {
  const { maxCharacters, maxMediaAttachments, maxPollOptions } = useInstanceConfig()
  const { isReady, uploadMedia, createStatus } = useComposeActions()

  const [posts, setPosts] = useState<ThreadItem[]>(() => [createEmptyPost()])
  const [visibility, setVisibility] = useState<mastodon.v1.StatusVisibility>("public")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittingIndex, setSubmittingIndex] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  // ── Derived ─────────────────────────────────────────────────────────────────

  const canSubmitAll = useMemo(() => {
    if (!isReady || isSubmitting) return false
    // Every post must have content, media, or poll — no empty boxes allowed
    const allFilled = posts.every(
      (p) => p.content.trim().length > 0 || p.mediaList.length > 0 || p.pollEnabled,
    )
    if (!allFilled) return false
    // No post exceeds character limit
    if (posts.some((p) => p.content.length > maxCharacters)) return false
    return true
  }, [posts, isReady, isSubmitting, maxCharacters])

  // ── Post management ─────────────────────────────────────────────────────────

  const updatePost = useCallback((id: string, update: Partial<ThreadItem>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...update } : p)))
  }, [])

  const addPost = useCallback(() => {
    setPosts((prev) => [...prev, createEmptyPost()])
    setNotice(null)
    setError(null)
  }, [])

  const removePost = useCallback((id: string) => {
    setPosts((prev) => {
      const removed = prev.find((p) => p.id === id)
      removed?.mediaList.forEach((m) => URL.revokeObjectURL(m.previewUrl))
      const next = prev.filter((p) => p.id !== id)
      return next.length === 0 ? [createEmptyPost()] : next
    })
  }, [])

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!canSubmitAll) return
    setError(null)
    setNotice(null)
    setIsSubmitting(true)

    let replyToId: string | null = null

    try {
      let published = 0

      for (let i = 0; i < posts.length; i++) {
        const post = posts[i]
        setSubmittingIndex(i)

        // Upload media files
        const mediaIds: string[] = []
        for (const media of post.mediaList) {
          const attachment = await uploadMedia(media.file)
          if (attachment?.id) mediaIds.push(attachment.id)
        }

        const validPollOptions = post.pollOptions.map((o) => o.trim()).filter(Boolean)

        const basePayload = {
          status: post.content,
          visibility,
          spoilerText: post.showSpoiler ? post.spoilerText.trim() : undefined,
          sensitive: post.showSpoiler && !!post.spoilerText.trim(),
          inReplyToId: replyToId ?? undefined,
        }

        const payload = mediaIds.length
          ? { ...basePayload, mediaIds }
          : {
              ...basePayload,
              poll:
                post.pollEnabled && validPollOptions.length >= 2
                  ? {
                      options: validPollOptions,
                      expiresIn: post.pollExpiresIn,
                      multiple: post.pollMultiple,
                    }
                  : undefined,
            }

        const result = await createStatus(payload)
        replyToId = result?.id ?? null
        published += 1
      }

      // Clean up object URLs and reset state
      posts.forEach((p) => p.mediaList.forEach((m) => URL.revokeObjectURL(m.previewUrl)))
      setPosts([createEmptyPost()])
      setNotice(published > 1 ? `已成功发布 ${published} 条嘟文串 🎉` : "已成功发布 🎉")
    } catch (err) {
      setError(err instanceof Error ? err.message : "发布失败，请重试")
    } finally {
      setIsSubmitting(false)
      setSubmittingIndex(-1)
    }
  }, [canSubmitAll, posts, visibility, uploadMedia, createStatus])

  return {
    // config
    maxCharacters,
    maxMediaAttachments,
    maxPollOptions,
    // state
    posts,
    visibility,
    setVisibility,
    isSubmitting,
    submittingIndex,
    error,
    notice,
    canSubmitAll,
    // actions
    updatePost,
    addPost,
    removePost,
    handleSubmit,
  }
}
