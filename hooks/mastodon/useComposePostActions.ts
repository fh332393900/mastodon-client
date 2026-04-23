"use client"

import { useRef } from "react"
import type { ComposeEditorHandle } from "@/components/mastodon/compose-editor"
import type { LocalMedia, ThreadItem } from "@/hooks/mastodon/useComposeThread"

export function useComposePostActions() {
  const editorRef = useRef<ComposeEditorHandle | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  const handleInsertEmoji = (emoji: string, post: ThreadItem, onChange: (update: Partial<ThreadItem>) => void) => {
    if (editorRef.current) {
      editorRef.current.insertText(emoji)
    } else {
      onChange({ content: post.content + emoji })
    }
  }

  const handleMediaSelect = (
    files: FileList | null,
    type: "image" | "video",
    post: ThreadItem,
    onChange: (update: Partial<ThreadItem>) => void,
    maxMediaAttachments: number,
  ) => {
    if (!files || files.length === 0) return
    if (post.pollEnabled) return

    const incoming = Array.from(files)
    const maxCount = Math.max(1, maxMediaAttachments)
    if (type === "video" && (incoming.length > 1 || post.mediaList.length > 0)) return
    if (post.mediaList.length + incoming.length > maxCount) return

    const items: LocalMedia[] = incoming.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      previewUrl: URL.createObjectURL(file),
      type,
    }))

    onChange({ mediaList: [...post.mediaList, ...items] })
  }

  const removeMedia = (id: string, post: ThreadItem, onChange: (update: Partial<ThreadItem>) => void) => {
    const target = post.mediaList.find((item) => item.id === id)
    if (target) URL.revokeObjectURL(target.previewUrl)
    onChange({ mediaList: post.mediaList.filter((item) => item.id !== id) })
  }

  const addPollOption = (post: ThreadItem, maxPollOptions: number, onChange: (update: Partial<ThreadItem>) => void) => {
    if (post.pollOptions.length >= maxPollOptions) return
    onChange({ pollOptions: [...post.pollOptions, ""] })
  }

  const updatePollOption = (value: string, idx: number, post: ThreadItem, onChange: (update: Partial<ThreadItem>) => void) => {
    onChange({ pollOptions: post.pollOptions.map((opt, i) => (i === idx ? value : opt)) })
  }

  const removePollOption = (idx: number, post: ThreadItem, onChange: (update: Partial<ThreadItem>) => void) => {
    onChange({ pollOptions: post.pollOptions.filter((_, i) => i !== idx) })
  }

  const togglePoll = (post: ThreadItem, onChange: (update: Partial<ThreadItem>) => void) => {
    if (post.mediaList.length > 0) return
    onChange({ pollEnabled: !post.pollEnabled })
  }

  return {
    editorRef,
    imageInputRef,
    videoInputRef,
    handleInsertEmoji,
    handleMediaSelect,
    removeMedia,
    addPollOption,
    updatePollOption,
    removePollOption,
    togglePoll,
  }
}
