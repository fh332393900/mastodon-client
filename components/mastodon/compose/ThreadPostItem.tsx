"use client"

import { useRef } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ComposeEditor, type ComposeEditorHandle } from "@/components/mastodon/compose-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { ToolbarButton } from "@/components/mastodon/compose/ComposeToolbar"
import { useComposePostActions } from "@/components/mastodon/compose/useComposePostActions"
import type { ThreadItem } from "@/hooks/mastodon/useComposeThread"

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

export function ThreadPostItem({
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
  const {
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
  } = useComposePostActions()

  const pollLimit = Math.min(maxPollOptions, 4)
  const remaining = maxCharacters - post.content.length
  const isLast = index === total - 1

  return (
    <div className="flex gap-3">
      <div className="flex shrink-0 w-10 flex-col items-center">
        <Avatar className="h-10 w-10 ring-2 ring-border/50">
          <AvatarImage src={userAvatar} alt={userDisplayName ?? "me"} />
          <AvatarFallback>{(userDisplayName ?? "M")[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        {!isLast && <div className="mt-1.5 w-0.5 flex-1 min-h-6 rounded-full bg-border/50" />}
      </div>

      <div className="min-w-0 flex-1 pb-4">
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

        <ComposeEditor
          value={post.content}
          onChange={(value) => onChange({ content: value })}
          editorRef={editorRef}
          placeholder="在想些什么？"
        />

        {post.mediaList.length > 0 && (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {post.mediaList.map((media) => (
              <div key={media.id} className="group relative overflow-hidden rounded-xl border border-border/60 bg-muted/40">
                {media.type === "image" ? (
                  <img src={media.previewUrl} alt="预览" className="h-36 w-full object-cover" />
                ) : (
                  <video src={media.previewUrl} className="h-36 w-full object-cover" controls />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(media.id, post, onChange)}
                  className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="移除媒体"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

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
                    onChange={(e) => updatePollOption(e.target.value, idx, post, onChange)}
                    placeholder={`选项 ${idx + 1}`}
                    className="h-8 text-sm"
                  />
                  {post.pollOptions.length > 2 && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => removePollOption(idx, post, onChange)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => addPollOption(post, maxPollOptions, onChange)} disabled={post.pollOptions.length >= pollLimit}>
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

        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        {!error && notice && <p className="mt-1.5 text-xs text-muted-foreground">{notice}</p>}

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
                    onClick={() => handleInsertEmoji(emoji, post, onChange)}
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
            onClick={() => togglePoll(post, onChange)}
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

          <span className={cn("text-xs tabular-nums", remaining < 0 ? "font-medium text-destructive" : "text-muted-foreground")}>
            {post.content.length}/{maxCharacters}
          </span>

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

          <div className="flex items-center rounded-lg bg-muted/60">
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
            {isLast && <div className="h-4 w-px bg-border/60" />}
            <span className={cn("px-2 py-1 text-xs tabular-nums text-muted-foreground", !isLast && "rounded-l-lg", total === 1 && "rounded-r-lg")}>
              <span className="text-foreground/70">{index + 1}</span>/{total}
            </span>
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

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleMediaSelect(e.target.files, "image", post, onChange, maxMediaAttachments)
            e.currentTarget.value = ""
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            handleMediaSelect(e.target.files, "video", post, onChange, maxMediaAttachments)
            e.currentTarget.value = ""
          }}
        />
      </div>
    </div>
  )
}
