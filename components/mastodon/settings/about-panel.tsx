"use client"

import { version } from "@/package.json"
import { Github, Info } from "lucide-react"
import { useTranslations } from "next-intl"

import { useMasto } from "@/components/auth/masto-provider"
import { AboutDialog } from "@/components/mastodon/settings/about-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const APP_NAME = "MastoClient"
const GITHUB_REPO = "https://github.com/fh332393900/v0-mastodon-client"

export function AboutPanel() {
  const t = useTranslations("settings")
  const { server } = useMasto()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          {t("about.title")}
        </CardTitle>
        <CardDescription>{t("about.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/40 p-4">
          <img src="/icon.svg" alt={APP_NAME} className="h-14 w-14 shrink-0 rounded-xl" />
          <div className="min-w-0">
            <p className="text-base font-semibold text-foreground">{APP_NAME}</p>
            <p className="text-xs text-muted-foreground">
              v{version} · {t("about.dialog.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <AboutDialog server={server}>
            <Button>{t("about.openButton")}</Button>
          </AboutDialog>
          <Button asChild variant="outline">
            <a href={GITHUB_REPO} target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
              {t("about.dialog.repoLink")}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
