"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useComposeSearch } from "@/hooks/mastodon/useComposeSearch"
import type { mastodon } from "masto"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"

type TriggerType = "hashtags" | "accounts"

type TriggerState = {
  type: TriggerType
  query: string
  start: number
  end: number
}

type CaretPosition = {
  top: number
  left: number
}

export type ComposeEditorHandle = {
  insertText: (text: string) => void
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

function getCaretIndex(root: HTMLElement) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return 0
  const range = selection.getRangeAt(0)
  const preRange = range.cloneRange()
  preRange.selectNodeContents(root)
  preRange.setEnd(range.endContainer, range.endOffset)
  return preRange.toString().length
}

function getRangeForTextIndices(root: HTMLElement, start: number, end: number) {
  const range = document.createRange()
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  let currentIndex = 0
  let startNode: Text | null = null
  let startOffset = 0
  let endNode: Text | null = null
  let endOffset = 0

  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    const nextIndex = currentIndex + node.data.length

    if (!startNode && start <= nextIndex) {
      startNode = node
      startOffset = Math.max(0, start - currentIndex)
    }

    if (end <= nextIndex) {
      endNode = node
      endOffset = Math.max(0, end - currentIndex)
      break
    }

    currentIndex = nextIndex
  }

  if (!startNode || !endNode) {
    range.selectNodeContents(root)
    range.collapse(false)
    return range
  }

  range.setStart(startNode, startOffset)
  range.setEnd(endNode, endOffset)
  return range
}

export function ComposeEditor({
  value,
  onChange,
  placeholder = "说点什么吧…",
  className,
  onLengthChange,
  editorRef,
}: ComposeEditorProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [trigger, setTrigger] = useState<TriggerState | null>(null)
  const [caretPosition, setCaretPosition] = useState<CaretPosition | null>(null)
  const searchTimer = useRef<number | null>(null)

  const { isLoading, accounts, hashtags } = useComposeSearch(
    trigger?.query ?? "",
    trigger?.type ?? null,
  )

  useEffect(() => {
    if (!rootRef.current) return
    if (value === "") {
      rootRef.current.innerHTML = ""
    }
  }, [value])

  useEffect(() => {
    if (!editorRef) return
    editorRef.current = {
      insertText: (text: string) => {
        const root = rootRef.current
        if (!root) return
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) {
          root.focus()
          return
        }
        const range = selection.getRangeAt(0)
        range.deleteContents()
        const node = document.createTextNode(text)
        range.insertNode(node)
        range.setStartAfter(node)
        range.setEndAfter(node)
        selection.removeAllRanges()
        selection.addRange(range)
        handleInput()
      },
      focus: () => rootRef.current?.focus(),
    }
  }, [editorRef])

  const handleInput = () => {
    const root = rootRef.current
    if (!root) return
    const text = root.textContent ?? ""
    onChange(text)
    onLengthChange?.(text.length)

    const caretIndex = getCaretIndex(root)
    const textBefore = text.slice(0, caretIndex)
    const match = textBefore.match(/(^|\s)([#@])([\p{L}\p{N}_-]{1,30})$/u)

    if (!match) {
      setTrigger(null)
      setCaretPosition(null)
      return
    }

    const symbol = match[2]
    const queryText = match[3]
    const start = caretIndex - (symbol.length + queryText.length)

    setTrigger({
      type: symbol === "#" ? "hashtags" : "accounts",
      query: queryText,
      start,
      end: caretIndex,
    })

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0).cloneRange()
      range.collapse(false)
      const rect = range.getBoundingClientRect()
      const rootRect = root.getBoundingClientRect()
      setCaretPosition({
        top: rect.bottom - rootRect.top + root.scrollTop + 6,
        left: rect.left - rootRect.left + root.scrollLeft,
      })
    }
  }

  const insertEntity = (label: string, type: TriggerType) => {
    const root = rootRef.current
    if (!root || !trigger) return

    const replacement = type === "hashtags" ? `#${label}` : `@${label}`
    const range = getRangeForTextIndices(root, trigger.start, trigger.end)
    range.deleteContents()

    const span = document.createElement("span")
    span.textContent = replacement
    span.setAttribute("data-entity", type)
    span.className = "text-primary font-semibold"
    span.contentEditable = "false"

    range.insertNode(span)
    const space = document.createTextNode(" ")
    range.setStartAfter(span)
    range.insertNode(space)
    range.setStartAfter(space)
    range.setEndAfter(space)

    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)

    setTrigger(null)
    handleInput()
  }

  const renderAccount = (account: mastodon.v1.Account) => {
    const nameText = getDisplayNameText({
      displayName: account.displayName,
      username: account.username,
    })

    return (
      <button
        key={account.id}
        type="button"
        onClick={() => insertEntity(account.acct, "accounts")}
        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-foreground/8 transition-colors"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={account.avatar} alt={nameText} />
          <AvatarFallback>{nameText.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">
            {renderDisplayName({
              displayName: account.displayName,
              username: account.username,
              emojis: account.emojis,
            })}
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
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
        />
      </svg>
    )
  }

  const renderHashtag = (tag: mastodon.v1.Tag) => {
    const days = tag.history?.length ?? 0
    const people = tag.history?.[0]?.accounts ?? tag.history?.[0]?.uses ?? 0

    return (
    <button
      key={tag.name}
      type="button"
      onClick={() => insertEntity(tag.name, "hashtags")}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-foreground/8 transition-colors"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg font-bold text-primary">
        #
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium text-foreground">#{tag.name}</span>
          {renderHashtagTrend(tag)}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          过去 {days} 天 {people} 人访问
        </div>
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
          {accounts.length === 0 ? (
            <div className="px-2 py-2 text-xs text-muted-foreground">没有匹配用户</div>
          ) : (
            accounts.map(renderAccount)
          )}
        </div>
      )
    }

    return (
      <div className="max-h-64 space-y-1 overflow-y-auto p-1">
        {hashtags.length === 0 ? (
          <div className="px-2 py-2 text-xs text-muted-foreground">没有匹配话题</div>
        ) : (
          hashtags.map(renderHashtag)
        )}
      </div>
    )
  }, [accounts, hashtags, isLoading, trigger])

  return (
    <div className="relative">
      <div
        ref={rootRef}
        role="textbox"
        aria-label="编辑器"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={cn(
          "min-h-[160px] w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm outline-none",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground",
          "empty:before:pointer-events-none",
          className,
        )}
        onInput={() => {
          if (searchTimer.current) {
            window.clearTimeout(searchTimer.current)
          }
          searchTimer.current = window.setTimeout(handleInput, 150)
        }}
        onKeyUp={handleInput}
        onBlur={() => {
          if (searchTimer.current) {
            window.clearTimeout(searchTimer.current)
          }
        }}
      />
      {showPopover && caretPosition ? (
        <div
          className="absolute z-50 w-80 rounded-lg border border-border bg-popover text-popover-foreground shadow-xl ring-1 ring-border/50"
          style={{
            top: caretPosition.top,
            left: caretPosition.left,
          }}
          onMouseDown={(event) => event.preventDefault()}
        >
          {popoverContent}
        </div>
      ) : null}
    </div>
  )
}
