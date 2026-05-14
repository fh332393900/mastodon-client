"use client"

import { useState, useEffect } from "react"
import { NextIntlClientProvider } from "next-intl"
import { resolveLocaleFromCookie, defaultLocale, localeCookieName } from "@/app/i18n"
import type { Locale } from "@/app/i18n"
// 静态 import 默认语言包：预渲染/SSR 阶段直接可用，消除 MISSING_MESSAGE 警告
import defaultMessages from "../../messages/en.json"

function getLocaleFromCookie(): Locale {
  if (typeof document === "undefined") return defaultLocale
  const raw = document.cookie.match(new RegExp(`(?:^|; )${localeCookieName}=([^;]+)`))?.[1]
  return resolveLocaleFromCookie(raw)
}

export function ClientIntlProvider({ children }: { children: React.ReactNode }) {
  // SSR / hydration 阶段统一使用 defaultLocale + 静态 messages，避免 hydration mismatch
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const [messages, setMessages] = useState<Record<string, unknown>>(defaultMessages)

  useEffect(() => {
    const resolved = getLocaleFromCookie()
    // 同步设置 <html lang>
    document.documentElement.lang = resolved
    setLocale(resolved)
    if (resolved === defaultLocale) return // 已是默认语言，无需再加载
    import(`../../messages/${resolved}.json`).then((m) => {
      setMessages(m.default)
    })
  }, [])

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  )
}
