"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette } from "lucide-react"
import { useTranslations } from "next-intl"

export function AppearancePanel() {
  const t = useTranslations("settings")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            {t("appearance.title")}
          </CardTitle>
          <CardDescription>{t("appearance.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
            {t("appearance.placeholder")}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
