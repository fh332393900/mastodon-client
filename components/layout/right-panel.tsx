"use client"

import { Github, Shield, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingTagsPanel } from "@/components/layout/trending-tags-panel"
import { SearchPopover } from "@/components/search/search-popover"
import { useTranslations } from "next-intl"

export function RightPanel() {
  const t = useTranslations("common")

  return (
    <aside className="hidden lg:flex lg:w-[18rem] lg:flex-col lg:sticky lg:top-0 lg:self-start h-screen bg-card/50 border-l border-border overflow-hidden">
      <div className="flex h-full flex-col p-4 space-y-4 overflow-hidden">
        {/* Search Section */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg shadow-primary/5 px-0">
          <CardContent className="pt-0 px-4">
            <SearchPopover placeholder="Search" />
          </CardContent>
        </Card>

        {/* Trending Tags */}
        <div className="min-h-0">
          <TrendingTagsPanel />
        </div>

        {/* Footer Section */}
        <div className="space-y-4 mt-auto">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("Theme")}</span>
            <ThemeToggle />
          </div>

          {/* Language Switcher */}
          <LocaleSwitcher />

          {/* Links */}
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <Shield className="h-3 w-3 mr-2" />
              Privacy Policy
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <Info className="h-3 w-3 mr-2" />
              Terms of Service
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <Info className="h-3 w-3 mr-2" />
              About
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
            >
              <a
                href="https://github.com/fh332393900/v0-mastodon-client"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-3 w-3 mr-2" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
  </aside>
  )
}
