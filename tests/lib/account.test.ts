import {
  getAccountLookupCandidates,
  normalizeAccountParam,
  getAccountProfileHref,
} from "@/lib/mastodon/account"
import type { mastodon } from "masto"

// ─── getAccountLookupCandidates ───────────────────────────────────────────────

describe("getAccountLookupCandidates", () => {
  it("returns only the full acct when it belongs to a different server", () => {
    const result = getAccountLookupCandidates("mastodon.social", "elon@fosstodon.org")
    expect(result).toEqual(["elon@fosstodon.org"])
  })

  it("adds local username fallback when acct server matches current server", () => {
    const result = getAccountLookupCandidates("mastodon.social", "elon@mastodon.social")
    expect(result).toEqual(["elon@mastodon.social", "elon"])
  })

  it("server comparison is case-insensitive", () => {
    const result = getAccountLookupCandidates("Mastodon.Social", "elon@mastodon.social")
    expect(result).toEqual(["elon@mastodon.social", "elon"])
  })

  it("returns only the input when account has no @ (local username only)", () => {
    const result = getAccountLookupCandidates("mastodon.social", "elon")
    expect(result).toEqual(["elon"])
  })

  it("handles @-prefixed full acct with matching server and adds local @-prefixed fallback", () => {
    const result = getAccountLookupCandidates("mastodon.social", "@elon@mastodon.social")
    // split("@")[0] → "" (empty), so no local fallback is added
    expect(result).toEqual(["@elon@mastodon.social"])
  })

  it("returns only the input for @-prefixed acct on a different server", () => {
    const result = getAccountLookupCandidates("mastodon.social", "@elon@fosstodon.org")
    expect(result).toEqual(["@elon@fosstodon.org"])
  })

  it("returns only the input when account string is empty", () => {
    const result = getAccountLookupCandidates("mastodon.social", "")
    expect(result).toEqual([""])
  })
})

// ─── normalizeAccountParam ────────────────────────────────────────────────────

describe("normalizeAccountParam", () => {
  it("strips leading @ from account string", () => {
    expect(normalizeAccountParam("@alice")).toBe("alice")
  })

  it("returns the string unchanged when there is no leading @", () => {
    expect(normalizeAccountParam("alice@mastodon.social")).toBe("alice@mastodon.social")
  })

  it("decodes URL-encoded @ prefix (%40) and then strips it", () => {
    expect(normalizeAccountParam("%40alice")).toBe("alice")
  })

  it("decodes URL-encoded characters in the account string", () => {
    expect(normalizeAccountParam("alice%40mastodon.social")).toBe("alice@mastodon.social")
  })

  it("returns empty string unchanged", () => {
    expect(normalizeAccountParam("")).toBe("")
  })
})

// ─── getAccountProfileHref ────────────────────────────────────────────────────

const makeAccount = (overrides: Partial<mastodon.v1.Account>): mastodon.v1.Account =>
  ({
    id: "1",
    username: "alice",
    acct: "alice",
    url: "https://mastodon.social/@alice",
    displayName: "Alice",
    note: "",
    avatar: "",
    avatarStatic: "",
    header: "",
    headerStatic: "",
    locked: false,
    emojis: [],
    createdAt: "2020-01-01T00:00:00.000Z",
    followersCount: 0,
    followingCount: 0,
    statusesCount: 0,
    lastStatusAt: null,
    fields: [],
    bot: false,
    ...overrides,
  }) as mastodon.v1.Account

describe("getAccountProfileHref", () => {
  it("builds href using server from account URL", () => {
    const account = makeAccount({
      url: "https://mastodon.social/@alice",
      acct: "alice",
    })
    expect(getAccountProfileHref(account, "mastodon.social")).toBe("/mastodon.social/@alice")
  })

  it("prefers fallbackServer over server derived from account URL", () => {
    const account = makeAccount({
      url: "https://other.server/@alice",
      acct: "alice",
    })
    expect(getAccountProfileHref(account, "mastodon.social")).toBe("/mastodon.social/@alice")
  })

  it("uses acct over username when both are present", () => {
    const account = makeAccount({
      url: "https://fosstodon.org/@bob",
      acct: "bob@fosstodon.org",
      username: "bob",
    })
    expect(getAccountProfileHref(account, "mastodon.social")).toBe(
      "/mastodon.social/@bob@fosstodon.org",
    )
  })

  it("falls back to username when acct is empty", () => {
    const account = makeAccount({
      url: "https://mastodon.social/@carol",
      acct: "",
      username: "carol",
    })
    expect(getAccountProfileHref(account, "mastodon.social")).toBe("/mastodon.social/@carol")
  })

  it("uses server from account URL when fallbackServer is empty string", () => {
    const account = makeAccount({
      url: "https://fosstodon.org/@dave",
      acct: "dave",
    })
    expect(getAccountProfileHref(account, "")).toBe("/fosstodon.org/@dave")
  })

  it("handles invalid account URL gracefully and falls back to acct server", () => {
    const account = makeAccount({
      url: "not-a-url",
      acct: "eve@chaos.social",
    })
    expect(getAccountProfileHref(account, "")).toBe("/chaos.social/@eve@chaos.social")
  })
})
