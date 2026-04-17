import Link from "next/link"
import { CalendarDays, ExternalLink, MapPin, Sparkles } from "lucide-react"
import { notFound } from "next/navigation"

import MastodonContent from "@/components/mastodon/MastodonContent"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ProfileFollowButton } from "@/components/mastodon/profile/ProfileFollowButton"
import { ProfileTabs } from "@/components/mastodon/profile/ProfileTabs"
import type { MastodonFeaturedTag } from "@/lib/mastodon/profile"
import { getProfileViewData, normalizeAccountParam } from "@/lib/mastodon/profile"

function formatCount(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value)
}

function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value))
}

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ server: string; account: string }>
}) {
  const { server, account: accountParam } = await params
  const normalizedAccount = normalizeAccountParam(accountParam)
  console.log(normalizedAccount, 'normalizedAccount')
  let data

  try {
    data = await getProfileViewData(server, normalizedAccount)
  } catch {
    notFound()
  }

  const { account, relationship, featuredTags } = data
  const baseHref = `/${server}/@${normalizedAccount}`

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-xl shadow-primary/5">
        <div className="relative h-44 overflow-hidden bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/20 sm:h-56">
          {account.header ? (
            <>
              <img
                src={account.header}
                alt={`${account.displayName} header`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/35 to-transparent" />
            </>
          ) : null}
        </div>

        <div className="relative px-5 pb-5 sm:px-8 sm:pb-7">
          <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="h-28 w-28 border-4 border-card shadow-lg sm:h-32 sm:w-32">
                <AvatarImage src={account.avatar} alt={account.displayName} />
                <AvatarFallback>{account.displayName?.charAt(0) || account.username.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {account.displayName || account.username}
                  </h1>
                  {account.bot ? <Badge variant="outline">Bot</Badge> : null}
                  {account.locked ? <Badge variant="outline">{"\u53d7\u4fdd\u62a4"}</Badge> : null}
                </div>
                <p className="mt-1 text-base text-muted-foreground">@{account.acct}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ProfileFollowButton
                accountId={account.id}
                accountUrl={account.url}
                canInteract={relationship !== null}
                initialRelationship={relationship}
                locked={account.locked}
              />
              <Link
                href={account.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border/70 px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {"\u6253\u5f00\u539f\u4e3b\u9875"}
              </Link>
            </div>
          </div>

          <div className="mt-6 space-y-5">
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
                    href={`https://${server}/tags/${tag.name}`}
                    target="_blank"
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
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {field.name}
                    </p>
                    <div className="text-sm text-foreground [&_.prose]:max-w-none [&_.prose]:text-sm [&_.prose_p]:my-0">
                      <MastodonContent content={field.value} emojis={account.emojis} />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {"\u52a0\u5165\u4e8e"} {formatJoinedDate(account.createdAt)}
              </span>
              {account.lastStatusAt ? (
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {"\u6700\u8fd1\u6d3b\u8dc3"} {account.lastStatusAt}
                </span>
              ) : null}
              {account.moved?.acct ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {"\u5df2\u8fc1\u79fb\u81f3"} @{account.moved.acct}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-5 text-sm">
              <span className="text-muted-foreground">
                <strong className="mr-1 text-lg font-semibold text-foreground">{formatCount(account.statusesCount)}</strong>
                {"\u8d34\u6587"}
              </span>
              <span className="text-muted-foreground">
                <strong className="mr-1 text-lg font-semibold text-foreground">{formatCount(account.followingCount)}</strong>
                {"\u6b63\u5728\u5173\u6ce8"}
              </span>
              <span className="text-muted-foreground">
                <strong className="mr-1 text-lg font-semibold text-foreground">{formatCount(account.followersCount)}</strong>
                {"\u5173\u6ce8\u8005"}
              </span>
            </div>
          </div>

          <ProfileTabs
            tabs={[
              { href: baseHref, label: "\u8d34\u6587", count: account.statusesCount, exact: true },
              { href: `${baseHref}/following`, label: "\u6b63\u5728\u5173\u6ce8", count: account.followingCount },
              { href: `${baseHref}/followers`, label: "\u5173\u6ce8\u8005", count: account.followersCount },
            ]}
          />
        </div>
      </section>

      <div className="space-y-4">{children}</div>
    </div>
  )
}
