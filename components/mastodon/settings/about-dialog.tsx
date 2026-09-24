"use client"

import { version } from "@/package.json"
import { Bug, ExternalLink, Github, Sparkles, X } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const APP_NAME = "MastoClient"
const DEVELOPER_NAME = "fh332393900"
const GITHUB_PROFILE = "https://github.com/fh332393900"
const GITHUB_REPO = "https://github.com/fh332393900/v0-mastodon-client"
const GITHUB_ISSUES = `${GITHUB_REPO}/issues`

type AboutDialogProps = {
  children: ReactNode
  /** 当前 Mastodon 实例域名，传入时在「应用信息」中展示 */
  server?: string
}

export function AboutDialog({ children, server }: AboutDialogProps) {
  const t = useTranslations("settings.about")

  const appInfo = [
    { label: t("dialog.versionLabel"), value: version },
    { label: t("dialog.techStackLabel"), value: "Next.js · React · TypeScript" },
    ...(server ? [{ label: t("dialog.instanceLabel"), value: server }] : []),
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/*
        外层只负责圆角与裁剪，滚动交给内部的滚动容器，
        这样滚动条被限制在弹窗内部，关闭按钮也不会跟随内容滚动。
      */}
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg"
      >
        <DialogClose className="absolute top-3 right-6 z-10 cursor-pointer rounded-full bg-muted/80 p-1.5 text-muted-foreground opacity-90 backdrop-blur-sm transition hover:bg-muted hover:text-foreground hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="max-h-[85vh] overflow-y-auto overscroll-contain">
          <div className="flex flex-col items-center px-6 pt-8 pb-2 text-center">
            <img src="/icon.svg" alt={APP_NAME} className="h-16 w-16 rounded-2xl shadow-sm" />
            <DialogTitle className="mt-4 text-2xl font-bold tracking-tight">{APP_NAME}</DialogTitle>
            <DialogDescription className="mt-2 text-xs text-muted-foreground">
              v{version} · {t("dialog.subtitle")}
            </DialogDescription>
          </div>

          <div className="space-y-3 px-6 py-4 text-sm leading-relaxed text-muted-foreground">
            <p>{t("dialog.intro")}</p>
            <p className="flex gap-2 rounded-xl border border-border/60 bg-muted/40 p-3 font-medium text-foreground">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{t("dialog.notice")}</span>
            </p>
            <p>{t("dialog.openSource")}</p>
          </div>

          <div className="space-y-4 px-6 pb-6">
            <section className="rounded-2xl border border-border/60 bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">{t("dialog.appSection")}</h3>
              <dl className="space-y-2">
                {appInfo.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 text-xs">
                    <dt className="shrink-0 text-muted-foreground">{row.label}</dt>
                    <dd className="min-w-0 text-right font-medium text-foreground break-words">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="rounded-2xl border border-border/60 bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">{t("dialog.developerSection")}</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Github className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{DEVELOPER_NAME}</p>
                  <p className="truncate text-xs text-muted-foreground">{t("dialog.developerRole")}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <a href={GITHUB_PROFILE} target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" />
                    {t("dialog.profileLink")}
                  </a>
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-border/60 bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">{t("dialog.contributeSection")}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{t("dialog.contributeDesc")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <a href={GITHUB_REPO} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    {t("dialog.repoLink")}
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <a href={GITHUB_ISSUES} target="_blank" rel="noreferrer">
                    <Bug className="h-4 w-4" />
                    {t("dialog.issuesLink")}
                  </a>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
