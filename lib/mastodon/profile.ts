import { cache } from "react"
import type { mastodon } from "masto"

import { getScopedMastodonClient } from "@/app/api/_lib/mastodon"

export type MastodonAccount = mastodon.v1.Account
export type MastodonRelationship = mastodon.v1.Relationship
export type MastodonStatus = mastodon.v1.Status
export type MastodonFeaturedTag = mastodon.v1.FeaturedTag

export function normalizeAccountParam(account: string) {
  if (account.startsWith('%40')) {
    return account.slice(3)
  }

  if (account.startsWith('@')) {
    return account.slice(1)
  }

  return account
}

export const getProfileViewData = async (server: string, account: string) => {
  const client = await getScopedMastodonClient(server)
  console.log(client.v1, '-------------')
  const normalizedAccount = normalizeAccountParam(account)
  const lookupCandidates = getAccountLookupCandidates(server, normalizedAccount)

  let profile: MastodonAccount | null = null
  let lastError: unknown

  try {
    profile = await client.v1.accounts.lookup({ acct: account })
  } catch (error) {
    console.log(error, 'error********')
    lastError = error
  }
  console.log(profile, 'profile')

  if (!profile) {
    throw lastError ?? new Error("Unable to resolve Mastodon account")
  }

  const [relationships, featuredTags] = await Promise.all([
    (async () => {
      try {
        return await client.v1.accounts.relationships.fetch({ id: [profile.id] })
      } catch {
        return [] as MastodonRelationship[]
      }
    })(),
    (async () => {
      try {
        return await client.v1.accounts.$select(profile.id).featuredTags.list()
      } catch {
        return [] as MastodonFeaturedTag[]
      }
    })(),
  ])

  return {
    account: profile,
    relationship: relationships[0] ?? null,
    featuredTags,
  }
}

export async function getProfileStatuses(server: string, accountId: string) {
  const client = await getScopedMastodonClient(server)
  return client.v1.accounts.$select(accountId).statuses.list({
    limit: 20,
    excludeReplies: false,
  })
}

export async function getProfileAccountsList(
  server: string,
  accountId: string,
  type: "followers" | "following",
) {
  const client = await getScopedMastodonClient(server)
  return client.v1.accounts.$select(accountId)[type].list({
    limit: 40,
  })
}

export function getAccountProfileHref(account: MastodonAccount, fallbackServer: string) {
  const serverFromUrl = safeHostname(account.url)
  const server = serverFromUrl || acctServer(account.acct) || fallbackServer
  const routeAccount = account.acct || account.username
  return `/${server}/@${routeAccount}`
}

function safeHostname(url?: string | null) {
  if (!url) return null

  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function acctServer(acct: string) {
  if (!acct.includes("@")) return null
  return acct.split("@").at(-1) ?? null
}

function getAccountLookupCandidates(server: string, account: string) {
  const candidates = [account]
  const accountServer = acctServer(account)

  if (accountServer?.toLowerCase() === server.toLowerCase()) {
    const localUsername = account.split("@")[0]
    if (localUsername && localUsername !== account) {
      candidates.push(localUsername)
    }
  }

  return candidates
}
