"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  BarChart3,
  Image as ImageIcon,
  Smile,
  Video,
  X,
} from "lucide-react"
import type { mastodon } from "masto"
import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "@/components/auth/masto-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ComposeEditor, type ComposeEditorHandle } from "@/components/mastodon/compose-editor"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useComposeActions } from "@/hooks/mastodon/useComposeActions"
import { useInstanceConfig } from "@/hooks/mastodon/useInstanceConfig"

type LocalMedia = {
  id: string
  file: File
  previewUrl: string
  type: "image" | "video"
}

type ToolbarButtonProps = {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  children?: React.ReactNode
}

const VISIBILITY_OPTIONS: Array<{ value: mastodon.v1.StatusVisibility; label: string }> = [
  { value: "public", label: "公开" },
  { value: "unlisted", label: "不公开列出" },
  { value: "private", label: "仅关注者" },
  { value: "direct", label: "私信" },
]

const EMOJI_LIST = [
  "😀",
  "😂",
  "😍",
  "🥳",
  "🤔",
  "😎",
  "😭",
  "🔥",
  "✨",
  "👍",
  "🙏",
  "🎉",
  "🍀",
  "💡",
  "📌",
  "❤️",
]

const POLL_EXPIRES = [
  { label: "1小时", value: 60 * 60 },
  { label: "6小时", value: 6 * 60 * 60 },
  { label: "1天", value: 24 * 60 * 60 },
  { label: "3天", value: 3 * 24 * 60 * 60 },
  { label: "7天", value: 7 * 24 * 60 * 60 },
]

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
            "inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition",
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

export default function ComposePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { server } = useMasto()
  const { maxCharacters, maxMediaAttachments, maxPollOptions } = useInstanceConfig()
  const { isReady, uploadMedia, createStatus } = useComposeActions()

  const editorRef = useRef<ComposeEditorHandle | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)

  const [content, setContent] = useState("")
  const [showSpoiler, setShowSpoiler] = useState(false)
  const [spoilerText, setSpoilerText] = useState("")
  const [visibility, setVisibility] = useState<mastodon.v1.StatusVisibility>(
    "public",
  )
  const [mediaList, setMediaList] = useState<LocalMedia[]>([])
  const [pollEnabled, setPollEnabled] = useState(false)
  const [pollOptions, setPollOptions] = useState(["", ""])
  const [pollMultiple, setPollMultiple] = useState(false)
  const [pollExpiresIn, setPollExpiresIn] = useState(POLL_EXPIRES[0].value)
  const [threadMode, setThreadMode] = useState(false)
  const [threadReplyToId, setThreadReplyToId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const remaining = maxCharacters - content.length
  const pollLimit = Math.min(maxPollOptions, 4)

  useEffect(() => {
    if (!threadMode) {
      setThreadReplyToId(null)
    }
  }, [threadMode])

  const canSubmit = useMemo(() => {
    if (!isReady || isSubmitting) return false
    if (content.trim().length === 0 && mediaList.length === 0 && !pollEnabled) {
      return false
    }
    if (remaining < 0) return false
    return true
  }, [content, isReady, isSubmitting, mediaList.length, pollEnabled, remaining])

  const handleInsertEmoji = (emoji: string) => {
    if (editorRef.current) {
      editorRef.current.insertText(emoji)
    } else {
      setContent((prev) => prev + emoji)
    }
  }

  const resetMedia = () => {
    mediaList.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setMediaList([])
  }

  const resetPoll = () => {
    setPollEnabled(false)
    setPollOptions(["", ""])
    setPollMultiple(false)
    setPollExpiresIn(POLL_EXPIRES[0].value)
  }

  const handleMediaSelect = (files: FileList | null, type: "image" | "video") => {
    if (!files || files.length === 0) return
    if (pollEnabled) {
      setError("投票和图片/视频不能同时发布")
      return
    }

    const incoming = Array.from(files)
    const maxCount = Math.max(1, maxMediaAttachments)
    const hasVideo = type === "video"

    if (hasVideo && (incoming.length > 1 || mediaList.length > 0)) {
      setError("视频只能单独上传一条")
      return
    }

    if (mediaList.length + incoming.length > maxCount) {
      setError(`最多只能上传 ${maxCount} 个媒体文件`)
      return
    }

    const items: LocalMedia[] = incoming.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
      type,
    }))

    setMediaList((prev) => [...prev, ...items])
  }

  const removeMedia = (id: string) => {
    setMediaList((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((item) => item.id !== id)
    })
  }

  const addPollOption = () => {
    if (pollOptions.length >= pollLimit) return
    setPollOptions((prev) => [...prev, ""])
  }

  const updatePollOption = (value: string, index: number) => {
    setPollOptions((prev) => prev.map((item, idx) => (idx === index ? value : item)))
  }

  const removePollOption = (index: number) => {
    setPollOptions((prev) => prev.filter((_, idx) => idx !== index))
  }

  const togglePoll = () => {
    if (mediaList.length > 0) {
      setError("投票和图片/视频不能同时发布")
      return
    }
    setPollEnabled((prev) => !prev)
  }

  const handleSubmit = async () => {
    setError(null)
    setNotice(null)

    if (!canSubmit) return

    if (pollEnabled) {
      const validOptions = pollOptions.map((opt) => opt.trim()).filter(Boolean)
      if (validOptions.length < 2) {
        setError("投票至少需要两个选项")
        return
      }
    }

    setIsSubmitting(true)

    try {
      let mediaIds: string[] = []

      if (mediaList.length > 0) {
        for (const media of mediaList) {
          const attachment = await uploadMedia(media.file)
          if (attachment?.id) {
            mediaIds.push(attachment.id)
          }
        }
      }

      const validOptions = pollOptions.map((opt) => opt.trim()).filter(Boolean)

      const basePayload = {
        status: content,
        visibility,
        spoilerText: showSpoiler ? spoilerText.trim() : undefined,
        sensitive: showSpoiler && !!spoilerText.trim(),
        inReplyToId: threadMode ? threadReplyToId ?? undefined : undefined,
      }

      const payload = mediaIds.length
        ? {
            ...basePayload,
            mediaIds,
          }
        : {
            ...basePayload,
            poll: pollEnabled
              ? {
                  options: validOptions,
                  expiresIn: pollExpiresIn,
                  multiple: pollMultiple,
                }
              : undefined,
          }

      const data = await createStatus(payload)

      if (threadMode) {
        setThreadReplyToId(data?.id ?? null)
        setContent("")
        setNotice("已发布，继续嘟文串…")
      } else {
        setThreadReplyToId(null)
        setContent("")
        setNotice("已发布")
      }

      resetMedia()
      resetPoll()
      setShowSpoiler(false)
      setSpoilerText("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "发布失败")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  return (
  <div className="space-y-6 px-4 py-6 overflow-x-hidden">
      <div className="space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold">撰写嘟文</h1>
          <p className="text-muted-foreground">在 {server} 发布新动态、媒体或投票。</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          {showSpoiler ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                警示提示
              </label>
              <Input
                value={spoilerText}
                onChange={(event) => setSpoilerText(event.target.value)}
                placeholder="输入警示提示（可选）"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <ComposeEditor
              value={content}
              onChange={setContent}
              editorRef={editorRef}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{notice ?? ""}</span>
              <span className={remaining < 0 ? "text-destructive" : ""}>
                {content.length}/{maxCharacters}
              </span>
            </div>
          </div>

          {mediaList.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {mediaList.map((media) => (
                <div
                  key={media.id}
                  className="group relative overflow-hidden rounded-xl border border-border/60 bg-muted/40"
                >
                  {media.type === "image" ? (
                    <img
                      src={media.previewUrl}
                      alt="upload preview"
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <video
                      src={media.previewUrl}
                      className="h-40 w-full object-cover"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(media.id)}
                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100"
                    aria-label="移除媒体"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {pollEnabled ? (
            <div className="space-y-3 rounded-xl border border-border/70 bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">投票设置</h3>
                <Button size="sm" variant="ghost" onClick={() => setPollEnabled(false)}>
                  关闭投票
                </Button>
              </div>
              <div className="space-y-2">
                {pollOptions.map((option, index) => (
                  <div key={`poll-${index}`} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(event) => updatePollOption(event.target.value, index)}
                      placeholder={`选项 ${index + 1}`}
                    />
                    {pollOptions.length > 2 ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removePollOption(index)}
                        aria-label="删除选项"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={addPollOption}
                  disabled={pollOptions.length >= pollLimit}
                >
                  添加选项
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                  <span className="text-sm">多选投票</span>
                  <Switch checked={pollMultiple} onCheckedChange={setPollMultiple} />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">投票倒计时</p>
                  <Select
                    value={String(pollExpiresIn)}
                    onValueChange={(value) => setPollExpiresIn(Number(value))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="选择倒计时" />
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
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="border-t border-border pt-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <ToolbarButton
                icon={<Smile className="h-4 w-4" />}
                label="Emoji"
              >
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">Emoji</div>
                  <div className="grid grid-cols-8 gap-2 text-lg">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="rounded-md p-1 hover:bg-muted"
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
                disabled={pollEnabled}
              />

              <ToolbarButton
                icon={<Video className="h-4 w-4" />}
                label="视频"
                onClick={() => videoInputRef.current?.click()}
                disabled={pollEnabled}
              />

              <ToolbarButton
                icon={<BarChart3 className="h-4 w-4" />}
                label="投票"
                onClick={togglePoll}
                disabled={mediaList.length > 0}
                active={pollEnabled}
              />

              <ToolbarButton
                icon={<AlertTriangle className="h-4 w-4" />}
                label="警示"
                onClick={() => setShowSpoiler((prev) => !prev)}
                active={showSpoiler}
              />

              <div className="ml-auto flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-border/70 px-3 py-1">
                  <span className="text-xs text-muted-foreground">嘟文串</span>
                  <Switch checked={threadMode} onCheckedChange={setThreadMode} />
                </div>

                <Select
                  value={visibility}
                  onValueChange={(value) => setVisibility(value as mastodon.v1.StatusVisibility)}
                >
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue placeholder="可见范围" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIBILITY_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {threadMode && threadReplyToId ? (
              <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                正在嘟文串模式中：下一条会回复上一条。
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {pollEnabled || mediaList.length > 0
                  ? "投票与媒体互斥：请保持其中一种"
                  : ""}
              </span>
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                {isSubmitting ? "发布中…" : "发布"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          handleMediaSelect(event.target.files, "image")
          event.currentTarget.value = ""
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          handleMediaSelect(event.target.files, "video")
          event.currentTarget.value = ""
        }}
      />
    </div>
  )
}
