"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Info, Settings, SlidersHorizontal, User } from "lucide-react"
import { useTranslations } from "next-intl"

export type SettingsSection = "profile" | "preferences" | "about"

type SettingsShellProps = {
  section: SettingsSection
  onSectionChange: (section: SettingsSection) => void
  children: ReactNode
}

export function SettingsShell({ section, onSectionChange, children }: SettingsShellProps) {
  const t = useTranslations("settings")
  const sections: Array<{
    id: SettingsSection
    label: string
    description: string
    icon: React.ComponentType<{ className?: string }>
  }> = [
    { id: "profile", label: t("sections.profile.label"), description: t("sections.profile.description"), icon: User },
    {
      id: "preferences",
      label: t("sections.preferences.label"),
      description: t("sections.preferences.description"),
      icon: SlidersHorizontal,
    },
    { id: "about", label: t("sections.about.label"), description: t("sections.about.description"), icon: Info },
  ]

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Settings className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="h-fit p-4">
          <div className="space-y-2">
            {sections.map((item) => {
              const Icon = item.icon
              const isActive = section === item.id
              return (
                <Button
                  key={item.id}
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                  className={cn("w-full items-start justify-start gap-3 text-left", !isActive && "text-muted-foreground")}
                  onClick={() => onSectionChange(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className={cn("text-xs", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {item.description}
                    </span>
                  </span>
                </Button>
              )
            })}
          </div>
        </Card>

        <div>{children}</div>
      </div>
    </div>
  )
}
