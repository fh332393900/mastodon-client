"use client"

import { useRef, useState } from "react"
import {
  AlertTriangle,
  BarChart3,
  Image as ImageIcon,
  Loader2,
  MessageSquarePlus,
  Smile,
  Video,
  X,
} from "lucide-react"
import type { mastodon } from "masto"
import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "@/components/auth/masto-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ComposeEditor, type ComposeEditorHandle } from "@/components/mastodon/compose-editor"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useComposeThread, type LocalMedia, type ThreadItem } from "@/hooks/mastodon/useComposeThread"

// ─── Local types ────────────────────────────────────────────────────────────────

type ToolbarButtonProps = {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  children?: React.ReactNode
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const VISIBILITY_OPTIONS: Array<{ value: mastodon.v1.StatusVisibility; label: string }> = [
  { value: "public", label: "公开" },
  { value: "unlisted", label: "不公开列出" },
  { value: "private", label: "仅关注者" },
  { value: "direct", label: "私信" },
]

const EMOJI_LIST = [
  "😀", "😂", "😍", "🥳", "🤔", "😎",
  "😭", "🔥", "✨", "👍", "🙏", "🎉",
  "🍀", "💡", "📌", "❤️",
]

const POLL_EXPIRES = [
  { label: "1小时", value: 60 * 60 },
  { label: "6小时", value: 6 * 60 * 60 },
  { label: "1天", value: 24 * 60 * 60 },
  { label: "3天", value: 3 * 24 * 60 * 60 },
  { label: "7天", value: 7 * 24 * 60 * 60 },
]

let _idCounter = 0
function createEmptyPost(): ThreadItem {
  _idCounter += 1
  return {
    id: `post-${Date.now()}-${_idCounter}`,
    content: "",
    mediaList: [],
    pollEnabled: false,
    pollOptions: ["", ""],
    pollMultiple: false,
    pollExpiresIn: POLL_EXPIRES[0].value,
    showSpoiler: false,
    spoilerText: "",
  }
}

// ─── ToolbarButton ──────────────────────────────────────────────────────────────

function ToolbarButton({ icon, label, onClick, disabled, active, children }: ToolbarButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={cn(
            "inline-flex cursor-pointer h-8 w-8 items-center justify-center rounded-full text-foreground transition",
            "hover:bg-muted/70",
            active && "bg-muted/70 text-primary",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {icon}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="w-auto px-3 py-2 text-xs"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children ?? label}
      </PopoverContent>
    </Popover>
  )
}

// ─── ThreadPostItem ─────────────────────────────────────────────────────────────

type ThreadPostItemProps = {
  post: ThreadItem
  index: number
  total: number
  maxCharacters: number
  maxMediaAttachments: number
  maxPollOptions: number
  visibility: mastodon.v1.StatusVisibility
  onVisibilityChange: (v: mastodon.v1.StatusVisibility) => void
  onChange: (update: Partial<ThreadItem>) => void
  onRemove: () => void
  onSubmit: () => void
  onAddPost: () => void
  isSubmittingThis: boolean
  isSubmitting: boolean
  canSubmitAll: boolean
  userAvatar?: string
  userDisplayName?: string
  error?: string | null
  notice?: string | null
}

function ThreadPostItem({
  post,
  index,
  total,
  maxCharacters,
  maxMediaAttachments,
  maxPollOptions,
  visibility,
  onVisibilityChange,
  onChange,
  onRemove,
  onSubmit,
  onAddPost,
  isSubmittingThis,
  isSubmitting,
  canSubmitAll,
  userAvatar,
  userDisplayName,
  error,
  notice,
}: ThreadPostItemProps) {
  const editorRef = useRef<ComposeEditorHandle | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  const pollLimit = Math.min(maxPollOptions, 4)
  const remaining = maxCharacters - post.content.length
  const isLast = index === total - 1

  const handleInsertEmoji = (emoji: string) => {
    if (editorRef.current) {
      editorRef.current.insertText(emoji)
    } else {
      onChange({ content: post.content + emoji })
    }
  }

  const handleMediaSelect = (files: FileList | null, type: "image" | "video") => {
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

  const removeMedia = (id: string) => {
    const target = post.mediaList.find((item) => item.id === id)
    if (target) URL.revokeObjectURL(target.previewUrl)
    onChange({ mediaList: post.mediaList.filter((item) => item.id !== id) })
  }

  const addPollOption = () => {
    if (post.pollOptions.length >= pollLimit) return
    onChange({ pollOptions: [...post.pollOptions, ""] })
  }

  const updatePollOption = (value: string, idx: number) => {
    onChange({ pollOptions: post.pollOptions.map((opt, i) => (i === idx ? value : opt)) })
  }

  const removePollOption = (idx: number) => {
    onChange({ pollOptions: post.pollOptions.filter((_, i) => i !== idx) })
  }

  const togglePoll = () => {
    if (post.mediaList.length > 0) return
    onChange({ pollEnabled: !post.pollEnabled })
  }

  return (
    <div className="flex gap-3">
      {/* Left column: avatar + thread line */}
      <div className="flex shrink-0 w-10 flex-col items-center">
        <Avatar className="h-10 w-10 ring-2 ring-border/50">
          <AvatarImage src={userAvatar} alt={userDisplayName ?? "me"} />
          <AvatarFallback>{(userDisplayName ?? "M")[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        {!isLast && (
          <div className="mt-1.5 w-0.5 flex-1 min-h-6 rounded-full bg-border/50" />
        )}
      </div>

      {/* Right column: content + toolbar */}
      <div className="min-w-0 flex-1 pb-4">
        {/* Spoiler input */}
        {post.showSpoiler && (
          <div className="mb-2">
            <Input
              value={post.spoilerText}
              onChange={(e) => onChange({ spoilerText: e.target.value })}
              placeholder="输入警示提示（可选）"
              className="h-8 text-sm"
            />
          </div>
        )}

        {/* Text editor */}
        <ComposeEditor
          value={post.content}
          onChange={(value) => onChange({ content: value })}
          editorRef={editorRef}
          placeholder="在想些什么？"
        />

        {/* Media previews */}
        {post.mediaList.length > 0 && (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {post.mediaList.map((media) => (
              <div
                key={media.id}
                className="group relative overflow-hidden rounded-xl border border-border/60 bg-muted/40"
              >
                {media.type === "image" ? (
                  <img src={media.previewUrl} alt="预览" className="h-36 w-full object-cover" />
                ) : (
                  <video src={media.previewUrl} className="h-36 w-full object-cover" controls />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(media.id)}
                  className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="移除媒体"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Poll settings */}
        {post.pollEnabled && (
          <div className="mt-2 space-y-2 rounded-xl border border-border/70 bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">投票设置</h3>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onChange({ pollEnabled: false })}>
                关闭
              </Button>
            </div>
            <div className="space-y-1.5">
              {post.pollOptions.map((option, idx) => (
                <div key={`poll-${post.id}-${idx}`} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updatePollOption(e.target.value, idx)}
                    placeholder={`选项 ${idx + 1}`}
                    className="h-8 text-sm"
                  />
                  {post.pollOptions.length > 2 && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => removePollOption(idx)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={addPollOption} disabled={post.pollOptions.length >= pollLimit}>
                添加选项
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                <Switch checked={post.pollMultiple} onCheckedChange={(v) => onChange({ pollMultiple: v })} />
                <span className="text-xs">多选</span>
              </div>
              <Select value={String(post.pollExpiresIn)} onValueChange={(v) => onChange({ pollExpiresIn: Number(v) })}>
                <SelectTrigger className="h-7 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POLL_EXPIRES.map((item) => (
                    <SelectItem key={item.value} value={String(item.value)}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Error / notice (only on last post) */}
        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        {!error && notice && <p className="mt-1.5 text-xs text-muted-foreground">{notice}</p>}

        {/* Toolbar */}
        <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-border/40 pt-2">
          <ToolbarButton icon={<Smile className="h-4 w-4" />} label="Emoji">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Emoji</div>
              <div className="grid grid-cols-8 gap-1.5 text-base">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="rounded p-0.5 hover:bg-muted"
                    onClick={() => handleInsertEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </ToolbarButton>

          <ToolbarButton
            icon={<ImageIcon className="h-4 w-4" />}
            label="图片"
            onClick={() => imageInputRef.current?.click()}
            disabled={post.pollEnabled}
          />

          <ToolbarButton
            icon={<Video className="h-4 w-4" />}
            label="视频"
            onClick={() => videoInputRef.current?.click()}
            disabled={post.pollEnabled}
          />

          <ToolbarButton
            icon={<BarChart3 className="h-4 w-4" />}
            label="投票"
            onClick={togglePoll}
            disabled={post.mediaList.length > 0}
            active={post.pollEnabled}
          />

          <ToolbarButton
            icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
            label="警示"
            onClick={() => onChange({ showSpoiler: !post.showSpoiler })}
            active={post.showSpoiler}
          />

          <div className="flex-1" />

          {/* Character count */}
          <span
            className={cn(
              "text-xs tabular-nums",
              remaining < 0 ? "font-medium text-destructive" : "text-muted-foreground",
            )}
          >
            {post.content.length}/{maxCharacters}
          </span>

          {/* Visibility selector — only on last post */}
          {isLast && (
            <Select value={visibility} onValueChange={(v) => onVisibilityChange(v as mastodon.v1.StatusVisibility)}>
              <SelectTrigger className="h-7 w-28 border-none bg-transparent px-2 text-xs shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Post index badge + add / delete actions */}
          <div className="flex items-center rounded-lg bg-muted/60">
            {/* Add post button — only on last post */}
            {isLast && (
              <button
                type="button"
                onClick={onAddPost}
                disabled={isSubmitting}
                aria-label="继续嘟文串"
                className="group cursor-pointer flex items-center gap-1 rounded-l-lg px-2 py-1 transition hover:bg-primary/10 disabled:opacity-40"
              >
                <MessageSquarePlus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition" />
              </button>
            )}
            {/* Separator */}
            {isLast && <div className="h-4 w-px bg-border/60" />}
            {/* Index */}
            <span className={cn("px-2 py-1 text-xs tabular-nums text-muted-foreground", !isLast && "rounded-l-lg", total === 1 && "rounded-r-lg")}>
              <span className="text-foreground/70">{index + 1}</span>/{total}
            </span>
            {/* Delete button — only when thread has > 1 post */}
            {total > 1 && (
              <>
                <div className="h-4 w-px bg-border/60" />
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={isSubmitting}
                  aria-label="删除此条"
                  className="group cursor-pointer flex items-center rounded-r-lg px-2 py-1 transition hover:bg-destructive/15 disabled:opacity-40"
                >
                  <X className="h-3 w-3 text-muted-foreground group-hover:text-destructive transition" />
                </button>
              </>
            )}
          </div>

          {/* Publish button — only on last post, with left margin */}
          {isLast && (
            <Button
              size="lg"
              className="ml-1 h-7 px-5 text-xs rounded-full"
              onClick={onSubmit}
              disabled={!canSubmitAll || isSubmitting}
            >
              {isSubmittingThis ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  发布中…
                </>
              ) : total > 1 ? "发布串" : "发布"}
            </Button>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleMediaSelect(e.target.files, "image")
            e.currentTarget.value = ""
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            handleMediaSelect(e.target.files, "video")
            e.currentTarget.value = ""
          }}
        />
      </div>
    </div>
  )
}

// ─── ComposePage ────────────────────────────────────────────────────────────────

export default function ComposePage() {
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

  // ── Loading / auth guard ────────────────────────────────────────────────────

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
          <p className="mt-2 text-sm text-muted-foreground">
            登录后即可在 {server} 发布嘟文。
          </p>
        </div>
      </div>
    )
  }

  const userAvatar = (user as any)?.avatar as string | undefined
  const userDisplayName = ((user as any)?.displayName ?? (user as any)?.username ?? "M") as string

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 px-4 py-6 overflow-x-hidden">
      <div className="space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold">撰写嘟文</h1>
          <p className="text-muted-foreground">在 {server} 发布新动态、媒体或投票。</p>
        </div>

        <div className="rounded-2xl border border-border bg-card px-5 pt-5 pb-3 shadow-sm">
          {/* Thread posts */}
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

          {/* Thread connector tail */}
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
