"use client"

import { useEffect, useState } from "react"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { useTheme } from "next-themes"
import { useLocale } from "next-intl"
import type { mastodon } from "masto"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCustomEmojis } from "@/hooks/mastodon/useCustomEmojis"

// Map app locales to emoji-mart i18n locale keys
const LOCALE_MAP: Record<string, string> = {
  en: "en",
  fr: "fr",
  ja: "ja",
  ko: "ko",
  "zh-CN": "zh",
  "zh-TW": "zh",
}

/** Convert Mastodon custom emojis to emoji-mart custom category format */
function buildCustomEmojiCategory(emojis: mastodon.v1.CustomEmoji[]) {
  if (!emojis.length) return []
  return [
    {
      id: "mastodon-custom",
      name: "Custom",
      emojis: emojis.map((e) => ({
        id: e.shortcode,
        name: e.shortcode,
        keywords: [e.shortcode, ...(e.category ? [e.category] : [])],
        skins: [{ src: e.url }],
      })),
    },
  ]
}

type EmojiPickerProps = {
  onSelect: (emoji: string) => void
  /** Called when a custom (server) emoji is selected, insert as :shortcode: or image */
  onSelectCustom?: (shortcode: string, url: string) => void
  children: React.ReactNode
  disabled?: boolean
}

export function EmojiPicker({ onSelect, onSelectCustom, children, disabled }: EmojiPickerProps) {
  const { resolvedTheme } = useTheme()
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [i18n, setI18n] = useState<object | null>(null)

  // Use shared React Query cache — no separate fetch needed
  const customEmojis = useCustomEmojis()

  const emojiMartLocale = LOCALE_MAP[locale] ?? "en"

  // Load i18n when picker opens
  useEffect(() => {
    if (!open) return
    import(`@emoji-mart/data/i18n/${emojiMartLocale}.json`)
      .then((mod) => setI18n(mod.default ?? mod))
      .catch(() => {
        import("@emoji-mart/data/i18n/en.json").then((mod) => setI18n(mod.default ?? mod))
      })
  }, [open, emojiMartLocale])

  function handleEmojiSelect(emoji: {
    native?: string
    unified?: string
    id?: string
    src?: string
    customCategory?: string
  }) {
    // Custom (server) emoji — has src but no native
    if (!emoji.native && emoji.src && emoji.id) {
      if (onSelectCustom) {
        onSelectCustom(emoji.id, emoji.src)
      } else {
        // Default: insert as shortcode text
        onSelect(`:${emoji.id}:`)
      }
      setOpen(false)
      return
    }

    // Native unicode emoji
    const char =
      emoji.native ||
      (emoji.unified
        ? String.fromCodePoint(...emoji.unified.split("-").map((cp) => parseInt(cp, 16)))
        : null)
    if (char) {
      onSelect(char)
      setOpen(false)
    }
  }

  const customCategories = buildCustomEmojiCategory(customEmojis)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        className="w-auto border-none bg-transparent p-0 shadow-none max-h-[300px] overflow-y-auto"
        side="top"
        align="start"
        sideOffset={8}
      >
        {open && (
          <Picker
            data={data}
            custom={customCategories}
            set="native"
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            locale={emojiMartLocale}
            i18n={i18n ?? undefined}
            onEmojiSelect={handleEmojiSelect}
            previewPosition="none"
            skinTonePosition="toolbar"
            dynamicWidth={false}
            perLine={8}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
