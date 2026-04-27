export const locales = ["en", "fr", "ja", "ko", "zh-CN", "zh-TW"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"
export const localeCookieName = "NEXT_LOCALE"

export const localeLabels: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ja: "日本語",
  ko: "한국어",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale)
}

export function resolveLocaleFromCookie(value: string | undefined | null): Locale {
  if (value && isLocale(value)) {
    return value
  }
  return defaultLocale
}