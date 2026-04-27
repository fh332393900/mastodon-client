"use client"

import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { localeCookieName, locales, localeLabels, type Locale } from "@/app/i18n"

export function LocaleSwitcher() {
  const locale = useLocale() as Locale
  const t = useTranslations("common")
  const router = useRouter()

  const handleLocaleChange = (value: string) => {
    if (value === locale) return
    document.cookie = `${localeCookieName}=${value}; path=/; max-age=31536000; samesite=lax`
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground">{t("language")}</span>
      <Select value={locale} onValueChange={handleLocaleChange}>
        <SelectTrigger className="h-8 w-[9rem] text-xs">
          <SelectValue aria-label={t("switchLanguage")}>
            {localeLabels[locale]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {locales.map((item) => (
            <SelectItem key={item} value={item}>
              {localeLabels[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
