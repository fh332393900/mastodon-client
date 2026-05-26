"use client"

import { SlidersHorizontal, Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAppPreferences } from "@/hooks/mastodon/useAppPreferences"
import { cn } from "@/lib/utils"

export function PreferencesPanel() {
  const t = useTranslations("settings")
  const { prefs, toggleAutoPlay, toggleDataSaver } = useAppPreferences()

  const items = [
    {
      key: "autoPlayVideo",
      label: t("preferences.autoPlayVideo"),
      description: t("preferences.autoPlayVideoDescription"),
      checked: prefs.autoPlayVideo,
      disabled: prefs.dataSaver,
      onToggle: toggleAutoPlay,
    },
    {
      key: "dataSaver",
      label: t("preferences.dataSaver"),
      description: t("preferences.dataSaverDescription"),
      checked: prefs.dataSaver,
      disabled: false,
      onToggle: toggleDataSaver,
    },
  ]

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3 px-1 sm:px-2">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <SlidersHorizontal className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t("preferences.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("preferences.description")}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card divide-y divide-border/30 overflow-hidden shadow-sm">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={item.onToggle}
            disabled={item.disabled}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 transition-colors text-left",
              "group hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
              item.disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <div className="flex-1 flex items-center gap-4">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-foreground">{item.label}</span>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <span
              className={cn(
                "shrink-0 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                item.checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-transparent group-hover:border-muted-foreground/50",
              )}
            >
              {item.checked && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
