"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Bot, CalendarDays, ExternalLink, Facebook, Github, Globe, Instagram, Link2, Linkedin, Lock, MapPin, Sparkles, Twitter, Youtube } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import MastodonContent from "@/components/mastodon/MastodonContent"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileFollowButton } from "@/components/mastodon/profile/ProfileFollowButton"
import { Button } from "@/components/ui/button"
import { ProfileTabs } from "@/components/mastodon/profile/ProfileTabs"
import type { MastodonFeaturedTag } from "@/lib/mastodon/account"
import { normalizeAccountParam } from "@/lib/mastodon/account"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"
import { useProfileViewData } from "@/hooks/mastodon/useProfileViewData"
import { useAuth } from "@/components/auth/auth-provider"
import { useFormat } from "@/hooks/format"

function getFieldIcon(value: string) {
  const hrefMatch = value.match(/href="([^"]+)"/)
  const url = hrefMatch?.[1] ?? ""
  let hostname = ""
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "")
  } catch {
    // not a URL
  }
  const cls = "h-4 w-4 shrink-0 text-muted-foreground"
  if (!hostname) return <Link2 className={cls} />
  if (hostname === "x.com" || hostname === "twitter.com") return <Twitter className={cls} />
  if (hostname === "instagram.com") return <Instagram className={cls} />
  if (hostname === "github.com") return <Github className={cls} />
  if (hostname === "linkedin.com" || hostname === "linkedin.cn") return <Linkedin className={cls} />
  if (hostname === "youtube.com" || hostname === "youtu.be") return <Youtube className={cls} />
  if (hostname === "facebook.com" || hostname === "fb.com") return <Facebook className={cls} />
  return <Globe className={cls} />
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const params = useParams()
  const serverParam = params?.server
  const accountParam = params?.account
  const statusIdParam = params?.statusId
  const server = Array.isArray(serverParam) ? serverParam[0] : serverParam
  const rawAccount = Array.isArray(accountParam) ? accountParam[0] : accountParam
  const statusId = Array.isArray(statusIdParam) ? statusIdParam[0] : statusIdParam
  const { formatCompactNumber, formatRelativeTime } = useFormat()
  const { user } = useAuth()
  const t = useTranslations()

  if (statusId) {
    return <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">{children}</div>
  }

  const { data, query, normalizedAccount } = useProfileViewData({
    server,
    account: rawAccount,
  })

  const { isLoading, isError } = query

  useEffect(() => {
    if (isError) {
      router.replace("/not-found?type=user")
    }
  }, [isError, router])

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="overflow-hidden border border-border/70 bg-card/90 p-8">
          <div className="h-40 w-full animate-pulse rounded-2xl bg-border/60 dark:bg-muted-foreground/40" />
          {
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="mt-6 space-y-4">
                <div className="h-6 w-40 animate-pulse rounded bg-border/60 dark:bg-muted-foreground/40" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-border/60 dark:bg-muted-foreground/40" />
              </div>
            ))
          }
        </section>
      </div>
    )
  }

  const { account, relationship, featuredTags } = data
  const isSelfProfile = user?.id === account.id
  const baseHref = `/${server}/@${normalizedAccount}`
  const accountNameText = getDisplayNameText({
    displayName: account.displayName,
    username: account.username,
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="overflow-hidden bg-card/90 shadow-xl shadow-primary/5">
        <div className="relative h-44 overflow-hidden bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/20 sm:h-56">
          {account.header ? (
            <>
              <img
                src={account.header}
                alt={`${accountNameText} header`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 " />
            </>
          ) : null}
        </div>

        <div className="px-4">
          <div className="relative px-0 pb-5 sm:px-8 sm:pb-7">
            <div className="-mt-14 flex gap-5 sm:-mt-14 sm:flex-row items-end sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 md:h-28 md:w-28 border-2 border-card shadow-lg sm:h-32 sm:w-32">
                  <AvatarImage src={account.avatar} alt={accountNameText} />
                  <AvatarFallback>{accountNameText.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex flex-wrap gap-3">
                {isSelfProfile ? (
                  <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                    <Link href={`/${server}/settings`}>{t("account.editProfile")}</Link>
                  </Button>
                ) : (
                  <ProfileFollowButton
                    accountId={account.id}
                    accountUrl={account.url}
                    canInteract={relationship !== null}
                    initialRelationship={relationship}
                    locked={account.locked}
                  />
                )}
              </div>
            </div>

            <div className="pb-2 mt-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {renderDisplayName({
                    displayName: account.displayName,
                    username: account.username,
                    emojis: account.emojis,
                  })}
                </h1>
                {account.bot ? <Badge variant="outline" className="gap-1 py-1 rounded-sm text-muted-foreground"><Bot className="h-4 w-4" />{t("account.bot")}</Badge> : null}
                {account.locked ? <Badge variant="outline" className="gap-1 py-1 rounded-sm text-muted-foreground"><Lock className="h-4 w-4" />{t("account.locked")}</Badge> : null}
              </div>
              <p className="mt-1 text-base text-muted-foreground">@{account.acct}</p>
            </div>

            <div className="mt-2 space-y-5">
              {account.note ? (
                <div className="[&_.prose]:max-w-none [&_.prose]:text-[15px] [&_.prose_a]:text-primary [&_.prose_p]:my-2">
                  <MastodonContent content={account.note} emojis={account.emojis} />
                </div>
              ) : null}

              {featuredTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {featuredTags.map((tag: MastodonFeaturedTag) => (
                    <Link
                      key={tag.id}
                      href={`/${server}/tags/${tag.name}`}
                      rel="noreferrer"
                      className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              ) : null}

              {account.fields.length > 0 ? (
                <div className="grid gap-3 rounded-3xl bg-muted/40 p-4 sm:grid-cols-2">
                  {account.fields.map((field) => (
                    <div key={field.name} className="min-w-0 space-y-1">
                      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">
                        {field.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-sm text-foreground [&_.prose]:max-w-none [&_.prose]:text-sm [&_.prose_p]:my-0">
                        {getFieldIcon(field.value)}
                        <MastodonContent content={field.value} emojis={account.emojis} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {t("account.joinedIn", { time: formatRelativeTime(account.createdAt) })}
                </span>
                {account.lastStatusAt ? (
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t("account.recentlyActive", { time: formatRelativeTime(account.lastStatusAt) })}
                  </span>
                ) : null}
                {account.moved?.acct ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {t("account.movedTo")} @{account.moved.acct}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-5 text-sm">
                <span className="text-muted-foreground">
                  <strong className="mr-1 text-lg font-semibold text-foreground">{formatCompactNumber(account.statusesCount)}</strong>
                  {t("common.posts")}
                </span>
                <span className="text-muted-foreground">
                  <strong className="mr-1 text-lg font-semibold text-foreground">{formatCompactNumber(account.followingCount)}</strong>
                  {t("common.following")}
                </span>
                <span className="text-muted-foreground">
                  <strong className="mr-1 text-lg font-semibold text-foreground">{formatCompactNumber(account.followersCount)}</strong>
                  {t("common.followers")}
                </span>
              </div>
            </div>

            <ProfileTabs
              tabs={[
                { href: baseHref, label: t("common.posts"), count: formatCompactNumber(account.statusesCount), exact: true },
                { href: `${baseHref}/following`, label: t("common.following"), count: formatCompactNumber(account.followingCount) },
                { href: `${baseHref}/followers`, label: t("common.followers"), count: formatCompactNumber(account.followersCount) },
              ]}
            />
          </div>
        </div>
      </section>

      <div className="space-y-4 px-4">{children}</div>
    </div>
  )
}
