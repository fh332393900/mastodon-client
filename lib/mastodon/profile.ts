import { cache } from "react"
import type { mastodon } from "masto"

import { getScopedMastodonClient } from "@/app/api/_lib/mastodon"

export type MastodonAccount = mastodon.v1.Account
export type MastodonRelationship = mastodon.v1.Relationship
export type MastodonStatus = mastodon.v1.Status
export type MastodonFeaturedTag = mastodon.v1.FeaturedTag

export function normalizeAccountParam(account: string) {
  const decodeAccount = decodeURIComponent(account)
  if (decodeAccount.startsWith('@')) {
    return decodeAccount.slice(1)
  }

  return decodeAccount
}

export const getProfileViewData = async (server: string, account: string) => {
  const client = await getScopedMastodonClient(server)
  const normalizedAccount = normalizeAccountParam(account)
  const lookupCandidates = getAccountLookupCandidates(server, normalizedAccount)

  let profile: MastodonAccount | null = null
  let lastError: unknown
  console.log(lookupCandidates, 'lookupCandidates')
  for (const acct of lookupCandidates) {
    try {
      profile = await client.v1.accounts.lookup({ acct })
      break
    } catch (error) {
      lastError = error
    }
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

/**
 * Generate possible Mastodon account lookup candidates based on the current server context.
 * 处理本地服务器账号和其他服务器账号，并且添加备用账号
 *
 * Mastodon accounts can be represented in multiple formats:
 * - Full acct: "user@server.com"
 * - Local username: "user"
 * - UI format: "@user" or encoded "%40user"
 *
 * This function attempts to normalize and generate fallback candidates
 * to improve account lookup success rate across different input formats.
 *
 * @param server - Current Mastodon instance server (e.g. "mastodon.social")
 * @param account - User input account string (e.g. "@elon", "elon@mastodon.social")
 *
 * @returns A list of possible lookup candidates in priority order
 *
 * @example
 * // Case 1: Full remote account
 * getAccountLookupCandidates("mastodon.social", "elon@mastodon.social")
 * // returns:
 * // ["elon@mastodon.social", "elon"]
 *
 * @example
 * // Case 2: Different instance account
 * getAccountLookupCandidates("mastodon.social", "elon@fosstodon.org")
 * // returns:
 * // ["elon@fosstodon.org"]
 *
 * @example
 * // Case 3: Local username only
 * getAccountLookupCandidates("mastodon.social", "elon")
 * // returns:
 * // ["elon"]
 *
 * @example
 * // Case 4: UI input with prefix
 * getAccountLookupCandidates("mastodon.social", "@elon@mastodon.social")
 * // returns:
 * // ["@elon@mastodon.social", "@elon"]
 */
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
