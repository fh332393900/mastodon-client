import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"
import { localeCookieName, resolveLocaleFromCookie, locales, defaultLocale } from "@/app/i18n"

async function resolveLocale(): Promise<string> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(localeCookieName)?.value
  if (cookieLocale && locales.includes(cookieLocale as (typeof locales)[number])) {
    return cookieLocale
  }

  const requestHeaders = await headers()
  const headerLocale = requestHeaders.get("accept-language")?.split(",")[0]?.trim()
  if (headerLocale && locales.includes(headerLocale as (typeof locales)[number])) {
    return headerLocale
  }

  return defaultLocale
}

export default getRequestConfig(async () => {
  const locale = resolveLocaleFromCookie(await resolveLocale())

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
