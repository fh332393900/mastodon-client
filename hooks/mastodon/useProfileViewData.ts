"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { getAccountLookupCandidates, normalizeAccountParam } from "@/lib/mastodon/account"

export type ProfileViewData = {
  account: mastodon.v1.Account
  relationship: mastodon.v1.Relationship | null
  featuredTags: mastodon.v1.FeaturedTag[]
}

export function useProfileViewData({
  server,
  account,
}: {
  server?: string
  account?: string
}) {
  const { client, isReady: isMastoReady } = useMasto()
  const { isInitialized } = useAuth()

  const isReady = isMastoReady && isInitialized

  const normalizedAccount = useMemo(
    () => (account ? normalizeAccountParam(account) : ""),
    [account],
  )

  const query = useQuery<ProfileViewData>({
    queryKey: ["profile", server, normalizedAccount],
    enabled: isReady && !!client && !!server && !!normalizedAccount,
    queryFn: async () => {
      if (!client || !server || !normalizedAccount) {
        throw new Error("Profile client is not ready")
      }

      const lookupCandidates = getAccountLookupCandidates(server, normalizedAccount)
      let profile: mastodon.v1.Account | null = null
      let lastError: unknown

      for (const acct of lookupCandidates) {
        try {
          profile = await client.v1.accounts.lookup({ acct })
          break
        } catch (error) {
          lastError = error
        }
      }

      if (!profile) {
        throw lastError ?? new Error("Unable to resolve Mastodon account")
      }

      const [relationships, featuredTags] = await Promise.all([
        (async () => {
          try {
            return await client.v1.accounts.relationships.fetch({ id: [profile!.id] })
          } catch {
            return [] as mastodon.v1.Relationship[]
          }
        })(),
        (async () => {
          try {
            return await client.v1.accounts.$select(profile!.id).featuredTags.list()
          } catch {
            return [] as mastodon.v1.FeaturedTag[]
          }
        })(),
      ])

      return {
        account: profile,
        relationship: relationships[0] ?? null,
        featuredTags,
      }
    },
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  })

  return {
    query,
    data: query.data,
    normalizedAccount,
    isReady,
  }
}
