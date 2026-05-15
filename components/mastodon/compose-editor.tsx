"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useComposeSearch } from "@/hooks/mastodon/useComposeSearch"
import type { mastodon } from "masto"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"
import { useCustomEmojis } from "@/hooks/mastodon/useCustomEmojis"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bold, Code2, Italic, Wand2 } from "lucide-react"
import { EditorContent, ReactNodeViewRenderer, useEditor } from "@tiptap/react"
import { Node, mergeAttributes } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Placeholder from "@tiptap/extension-placeholder"
import { all, createLowlight } from "lowlight"
import { useTranslations } from "next-intl"
import { CodeBlockView } from "./compose/CodeBlockView"

const lowlight = createLowlight(all)

// ─── Custom EmojiNode ─────────────────────────────────────────────────────────

const MentionNode = Node.create({
  name: "mention",
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,
  addAttributes() {
    return {
      label: {
        default: "",
        parseHTML: (el: Element) => el.getAttribute("data-mention") ?? "",
        renderHTML: (attrs: Record<string, string>) => ({ "data-mention": attrs.label }),
      },
    }
  },
  parseHTML() {
    return [{ tag: "span[data-mention]" }]
  },
  renderHTML({ node, HTMLAttributes }: { node: { attrs?: Record<string, string> }; HTMLAttributes: Record<string, string> }) {
    const label = node.attrs?.label ?? ""
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "mention text-primary",
        contenteditable: "false",
      }),
      `@${label}`,
    ]
  },
})

const HashtagNode = Node.create({
  name: "hashtag",
  group: "inline",
  inline: true,
  atom: true,
  selectable: false,
  addAttributes() {
    return {
      label: {
        default: "",
        parseHTML: (el: Element) => el.getAttribute("data-hashtag") ?? "",
        renderHTML: (attrs: Record<string, string>) => ({ "data-hashtag": attrs.label }),
      },
    }
  },
  parseHTML() {
    return [{ tag: "span[data-hashtag]" }]
  },
  renderHTML({ node, HTMLAttributes }: { node: { attrs?: Record<string, string> }; HTMLAttributes: Record<string, string> }) {
    const label = node.attrs?.label ?? ""
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "hashtag text-primary",
        contenteditable: "false",
      }),
      `#${label}`,
    ]
  },
})

const EmojiNode = Node.create({
  name: "emoji",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return {
      shortcode: {
        default: null,
        parseHTML: (el: Element) => el.getAttribute("data-shortcode"),
        renderHTML: (attrs: Record<string, string>) => ({ "data-shortcode": attrs.shortcode }),
      },
      url: {
        default: null,
        parseHTML: (el: Element) => (el as HTMLImageElement).src,
        renderHTML: (attrs: Record<string, string>) => ({ src: attrs.url }),
      },
    }
  },
  parseHTML() {
    return [{ tag: "img[data-shortcode]" }]
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, string> }) {
    return [
      "img",
      mergeAttributes(HTMLAttributes, {
        class: "inline h-5 w-5 align-text-bottom",
        contenteditable: "false",
      }),
    ]
  },
})

// ─── Types ───────────────────────────────────────────────────────────────────

type TriggerType = "hashtags" | "accounts"
type TriggerState = { type: TriggerType; query: string }
type CaretPosition = { top: number; left: number }

export type ComposeEditorHandle = {
  insertText: (text: string) => void
  insertCustomEmoji: (shortcode: string, url: string) => void
  focus: () => void
}

type ComposeEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onLengthChange?: (length: number) => void
  editorRef?: React.RefObject<ComposeEditorHandle | null>
}

// ─── Extensions (static — created once at module level) ──────────────────────

const baseExtensions = [
  StarterKit.configure({
    codeBlock: false,
    heading: false,
    horizontalRule: false,
    blockquote: false,
  }),
  CodeBlockLowlight.extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockView)
    },
  }).configure({ lowlight, defaultLanguage: "auto" }),
  MentionNode,
  HashtagNode,
  EmojiNode,
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

type DocNode = {
  type?: string
  text?: string
  attrs?: Record<string, string>
  content?: DocNode[]
}

function docToPlainText(doc: DocNode): string {
  let text = ""
  function walk(node: DocNode) {
    if (!node) return
    if (node.type === "text") { text += node.text ?? ""; return }
    if (node.type === "hardBreak") { text += "\n"; return }
    // Custom emoji node → :shortcode:
    if (node.type === "emoji") { text += node.attrs?.shortcode ?? ""; return }
    if (node.type === "mention") { text += `@${node.attrs?.label ?? ""}`; return }
    if (node.type === "hashtag") { text += `#${node.attrs?.label ?? ""}`; return }
    if (node.type === "paragraph") {
      if (text.length > 0 && !text.endsWith("\n")) text += "\n"
      node.content?.forEach(walk)
      return
    }
    if (node.type === "codeBlock") {
      const lang = node.attrs?.language && node.attrs.language !== "auto" ? node.attrs.language : ""
      text += "\`\`\`" + lang + "\n"
      node.content?.forEach(walk)
      if (!text.endsWith("\n")) text += "\n"
      text += "\`\`\`\n"
      return
    }
    node.content?.forEach(walk)
  }
  walk(doc)
  return text.replace(/\n$/, "")
}

// ─── FormatToolbar ────────────────────────────────────────────────────────────

type EditorInstance = NonNullable<ReturnType<typeof useEditor>>

function FormatToolbar({ editor }: { editor: EditorInstance }) {
  const t = useTranslations("compose.editor")
  const [open, setOpen] = useState(false)

  const isBold = editor.isActive("bold")
  const isItalic = editor.isActive("italic")
  const isCode = editor.isActive("codeBlock")

  const tools = [
    {
      key: "codeBlock",
      icon: Code2,
      label: t("codeBlock"),
      active: isCode,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      key: "bold",
      icon: Bold,
      label: t("bold"),
      active: isBold,
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      key: "italic",
      icon: Italic,
      label: t("italic"),
      active: isItalic,
      action: () => editor.chain().focus().toggleItalic().run(),
    },
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            (isBold || isItalic || isCode) && "text-primary",
          )}
          title={t("format")}
        >
          <Wand2 className="h-3.5 w-3.5" />
          <span>{t("format")}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-auto p-1 flex flex-row gap-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {tools.map(({ key, icon: Icon, label, active, action }) => (
          <button
            key={key}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              action()
              setOpen(false)
            }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            title={label}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// ─── ComposeEditor ────────────────────────────────────────────────────────────

export function ComposeEditor({
  value,
  onChange,
  placeholder = "说点什么吧…",
  className,
  onLengthChange,
  editorRef,
}: ComposeEditorProps) {
  const placeholderRef = useRef(placeholder)
  const [trigger, setTrigger] = useState<TriggerState | null>(null)
  const [caretPosition, setCaretPosition] = useState<CaretPosition | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const serverEmojis = useCustomEmojis()
  const customEmojiMap = useMemo(
    () => Object.fromEntries(serverEmojis.map((e) => [e.shortcode, e.url])),
    [serverEmojis],
  )

  const { isLoading, accounts, hashtags } = useComposeSearch(
    trigger?.query ?? "",
    trigger?.type ?? null,
  )

  useEffect(() => {
    placeholderRef.current = placeholder
  }, [placeholder])

  // ── Trigger detection ──────────────────────────────────────────────────────

  const detectTrigger = useCallback((e: EditorInstance) => {
    const { state } = e
    const { from } = state.selection
    const textBefore = state.doc.textBetween(Math.max(0, from - 50), from, "\n", "\0")
  const match = textBefore.match(/(^|\s)([#@])([\p{L}\p{N}._-]{1,30})$/u)

    if (!match) {
      setTrigger(null)
      setCaretPosition(null)
      return
    }

    setTrigger({ type: match[2] === "#" ? "hashtags" : "accounts", query: match[3] })

    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0).cloneRange()
      range.collapse(false)
      const rect = range.getBoundingClientRect()
      const wrapRect = wrapperRef.current?.getBoundingClientRect()
      if (wrapRect) {
        setCaretPosition({ top: rect.bottom - wrapRect.top + 6, left: rect.left - wrapRect.left })
      }
    }
  }, [])

  // ── Editor ────────────────────────────────────────────────────────────────

  const extensions = useMemo(
    () => [
      ...baseExtensions,
      Placeholder.configure({
        placeholder: () => placeholderRef.current,
      }),
    ],
    [],
  )

  const editor = useEditor({
    extensions,
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap min-h-[140px] w-full outline-none text-sm",
      },
    },
    onUpdate({ editor: e }) {
      // 一旦用户开始编辑，禁止初始化 effect 再覆盖内容（修复首次插入 emoji/代码块被还原为字符的 bug）
      initializedRef.current = true
      const json = e.getJSON() as DocNode
      const text = docToPlainText(json)
      onChange(text)
      onLengthChange?.(text.length)
      detectTrigger(e)
    },
    onSelectionUpdate({ editor: e }) {
      detectTrigger(e)
    },
  })

  // Sync external reset (empty submit)
  useEffect(() => {
    if (!editor || value !== "") return
    editor.commands.clearContent()
  }, [value, editor])

  // Initialize with existing value (e.g. bio pre-fill).
  // Wait until both editor is ready AND value is non-empty, to handle the
  // case where data loads after the editor mounts (e.g. page refresh).
  const initializedRef = useRef(false)
  useEffect(() => {
    if (!editor || initializedRef.current || !value) return
    initializedRef.current = true
    const paragraphs = value.split("\n").map((line) => ({
      type: "paragraph" as const,
      content: line ? [{ type: "text" as const, text: line }] : [],
    }))
    editor.commands.setContent({ type: "doc", content: paragraphs }, false)
    onLengthChange?.(value.length)
  }, [editor, value, onLengthChange])

  // ── EditorRef ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!editorRef || !editor) return
    editorRef.current = {
      insertText: (text: string) => {
        editor.chain().focus().insertContent(text).run()
      },
      insertCustomEmoji: (shortcode: string, url: string) => {
        editor.chain().focus().insertContent({
          type: "emoji",
          attrs: { shortcode: `:${shortcode}:`, url },
        }).run()
      },
      focus: () => editor.commands.focus(),
    }
  }, [editorRef, editor])

  // ── Insert entity ─────────────────────────────────────────────────────────

  const insertEntity = useCallback((label: string, type: TriggerType) => {
    if (!editor) return
    const { state } = editor
    const { from } = state.selection
    const textBefore = state.doc.textBetween(Math.max(0, from - 50), from, "\n", "\0")
    const match = textBefore.match(/(^|\s)([#@])([\p{L}\p{N}._-]{1,30})$/u)
    const command = editor.chain().focus()
    if (match) {
      const deleteLen = match[2].length + match[3].length
      command.deleteRange({ from: from - deleteLen, to: from })
    }
    command
      .insertContent(
        type === "hashtags"
          ? { type: "hashtag", attrs: { label } }
          : { type: "mention", attrs: { label } },
      )
      .run()
    setTrigger(null)
    setCaretPosition(null)
  }, [editor])

  // ── Render suggestions ────────────────────────────────────────────────────

  const renderAccount = (account: mastodon.v1.Account) => {
    const nameText = getDisplayNameText({ displayName: account.displayName, username: account.username })
    return (
      <button
        key={account.id}
        type="button"
        onMouseDown={(e) => { e.preventDefault(); insertEntity(account.acct, "accounts") }}
        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-foreground/8 transition-colors"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={account.avatar} alt={nameText} />
          <AvatarFallback>{nameText.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">
            {renderDisplayName({ displayName: account.displayName, username: account.username, emojis: account.emojis })}
          </div>
          <div className="truncate text-xs text-muted-foreground">@{account.acct}</div>
        </div>
      </button>
    )
  }

  const renderHashtagTrend = (tag: mastodon.v1.Tag) => {
    const history = tag.history?.slice(-7) ?? []
    if (history.length === 0) return null
    const values = history.map((item) => Number(item.uses ?? 0))
    const max = Math.max(...values, 1)
    const points = values
      .map((value, index) => {
        const x = (index / Math.max(values.length - 1, 1)) * 60
        const y = 24 - (value / max) * 20
        return `${x},${y}`
      })
      .join(" ")
    return (
      <svg width="64" height="28" viewBox="0 0 60 24" className="text-primary">
        <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
      </svg>
    )
  }

  const renderHashtag = (tag: mastodon.v1.Tag) => {
    const people = tag.history?.[0]?.accounts ?? tag.history?.[0]?.uses ?? 0
    return (
      <button
        key={tag.name}
        type="button"
        onMouseDown={(e) => { e.preventDefault(); insertEntity(tag.name, "hashtags") }}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-foreground/8 transition-colors"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg font-bold text-primary">#</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-medium text-foreground">#{tag.name}</span>
            {renderHashtagTrend(tag)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">过去 2 天 {people} 人访问</div>
        </div>
      </button>
    )
  }

  const showPopover = !!trigger && (isLoading || accounts.length > 0 || hashtags.length > 0)

  const popoverContent = useMemo(() => {
    if (!trigger) return null
    if (isLoading) {
      return (
        <div className="space-y-2 p-2">
          <div className="h-8 w-full animate-pulse rounded-md bg-foreground/10" />
          <div className="h-8 w-5/6 animate-pulse rounded-md bg-foreground/10" />
          <div className="h-8 w-2/3 animate-pulse rounded-md bg-foreground/10" />
        </div>
      )
    }
    if (trigger.type === "accounts") {
      return (
        <div className="max-h-64 space-y-1 overflow-y-auto p-1">
          {accounts.length === 0
            ? <div className="px-2 py-2 text-xs text-muted-foreground">没有匹配用户</div>
            : accounts.map(renderAccount)}
        </div>
      )
    }
    return (
      <div className="max-h-64 space-y-1 overflow-y-auto p-1">
        {hashtags.length === 0
          ? <div className="px-2 py-2 text-xs text-muted-foreground">没有匹配话题</div>
          : hashtags.map(renderHashtag)}
      </div>
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, hashtags, isLoading, trigger])

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <div ref={wrapperRef} className="relative">
      <div className={cn("rounded-xl border border-border/70 bg-background px-4 py-3 text-sm", className)}>
        {editor && <EditorContent editor={editor} />}

        {/* Format toolbar */}
        {editor && (
          <div className="mt-2 flex items-center border-t border-border/40 pt-2">
            <FormatToolbar editor={editor} />
          </div>
        )}
      </div>

      {/* @ / # suggestions */}
      {showPopover && caretPosition ? (
        <div
          className="absolute z-50 w-80 rounded-lg border border-border bg-popover text-popover-foreground shadow-xl ring-1 ring-border/50"
          style={{ top: caretPosition.top, left: caretPosition.left }}
        >
          {popoverContent}
        </div>
      ) : null}
    </div>
  )
}
