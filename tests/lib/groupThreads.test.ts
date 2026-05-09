import type { mastodon } from "masto"
import { groupThreadPosts } from "@/lib/mastodon/groupThreads"

// ─── helpers ─────────────────────────────────────────────────────────────────

let _seq = 0
const nextId = () => String(++_seq)

beforeEach(() => {
  _seq = 0
})

function makeStatus(
  overrides: {
    id?: string
    accountId?: string
    inReplyToId?: string | null
    inReplyToAccountId?: string | null
    createdAt?: string
  } = {},
): mastodon.v1.Status {
  const id = overrides.id ?? nextId()
  const accountId = overrides.accountId ?? "user-a"
  return {
    id,
    createdAt: overrides.createdAt ?? `2024-01-01T00:0${id.padStart(1, "0")}:00.000Z`,
    inReplyToId: overrides.inReplyToId ?? null,
    inReplyToAccountId: overrides.inReplyToAccountId ?? null,
    account: { id: accountId } as mastodon.v1.Account,
    // minimum fields to satisfy the type
    uri: "",
    url: null,
    content: "",
    visibility: "public",
    sensitive: false,
    spoilerText: "",
    mediaAttachments: [],
    application: null,
    mentions: [],
    tags: [],
    emojis: [],
    reblogsCount: 0,
    favouritesCount: 0,
    repliesCount: 0,
    reblog: null,
    poll: null,
    card: null,
    language: null,
    text: null,
    editedAt: null,
    favourited: false,
    reblogged: false,
    muted: false,
    bookmarked: false,
    pinned: false,
    filtered: [],
  } as unknown as mastodon.v1.Status
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe("groupThreadPosts", () => {
  it("returns empty array for empty input", () => {
    expect(groupThreadPosts([])).toEqual([])
  })

  it("wraps a single post in a one-element group", () => {
    const post = makeStatus()
    const result = groupThreadPosts([post])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual([post])
  })

  it("returns two independent posts as two separate groups", () => {
    const a = makeStatus({ id: "1", createdAt: "2024-01-01T00:01:00.000Z" })
    const b = makeStatus({ id: "2", createdAt: "2024-01-01T00:02:00.000Z" })
    // timeline API: newest first
    const result = groupThreadPosts([b, a])
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual([b])
    expect(result[1]).toEqual([a])
  })

  it("groups a simple two-post thread (same author) in chronological order", () => {
    // root post
    const root = makeStatus({
      id: "10",
      accountId: "user-a",
      inReplyToId: null,
      createdAt: "2024-01-01T00:01:00.000Z",
    })
    // reply from same author
    const reply = makeStatus({
      id: "20",
      accountId: "user-a",
      inReplyToId: "10",
      inReplyToAccountId: "user-a",
      createdAt: "2024-01-01T00:02:00.000Z",
    })
    // timeline order: newest first
    const result = groupThreadPosts([reply, root])
    expect(result).toHaveLength(1)
    // chronological order: root → reply
    expect(result[0][0].id).toBe("10")
    expect(result[0][1].id).toBe("20")
  })

  it("groups a three-post thread (same author) in chronological order", () => {
    const root = makeStatus({ id: "1", accountId: "user-a", inReplyToId: null, createdAt: "2024-01-01T00:01:00.000Z" })
    const r1 = makeStatus({ id: "2", accountId: "user-a", inReplyToId: "1", inReplyToAccountId: "user-a", createdAt: "2024-01-01T00:02:00.000Z" })
    const r2 = makeStatus({ id: "3", accountId: "user-a", inReplyToId: "2", inReplyToAccountId: "user-a", createdAt: "2024-01-01T00:03:00.000Z" })
    // newest first
    const result = groupThreadPosts([r2, r1, root])
    expect(result).toHaveLength(1)
    expect(result[0].map((p) => p.id)).toEqual(["1", "2", "3"])
  })

  it("does NOT group a reply to a different account (cross-user mention breaks chain)", () => {
    const root = makeStatus({ id: "1", accountId: "user-a", inReplyToId: null, createdAt: "2024-01-01T00:01:00.000Z" })
    // user-a replies to user-b — inReplyToAccountId !== account.id
    const crossReply = makeStatus({
      id: "2",
      accountId: "user-a",
      inReplyToId: "1",
      inReplyToAccountId: "user-b",   // different account
      createdAt: "2024-01-01T00:02:00.000Z",
    })
    const result = groupThreadPosts([crossReply, root])
    // getRootId stops at the cross-reply boundary → two groups
    expect(result).toHaveLength(2)
  })

  it("does NOT group when parent post is by a different account", () => {
    const root = makeStatus({ id: "1", accountId: "user-b", inReplyToId: null, createdAt: "2024-01-01T00:01:00.000Z" })
    const reply = makeStatus({
      id: "2",
      accountId: "user-a",
      inReplyToId: "1",
      inReplyToAccountId: "user-b",
      createdAt: "2024-01-01T00:02:00.000Z",
    })
    const result = groupThreadPosts([reply, root])
    expect(result).toHaveLength(2)
  })

  it("handles mixed timeline: one thread and one standalone post", () => {
    const standalone = makeStatus({ id: "99", accountId: "user-c", inReplyToId: null, createdAt: "2024-01-01T01:00:00.000Z" })
    const root = makeStatus({ id: "1", accountId: "user-a", inReplyToId: null, createdAt: "2024-01-01T00:01:00.000Z" })
    const reply = makeStatus({ id: "2", accountId: "user-a", inReplyToId: "1", inReplyToAccountId: "user-a", createdAt: "2024-01-01T00:02:00.000Z" })

    // newest first: standalone, reply, root
    const result = groupThreadPosts([standalone, reply, root])
    expect(result).toHaveLength(2)
    // first group = standalone (it appeared first in the list)
    expect(result[0]).toEqual([standalone])
    // second group = thread, chronological
    expect(result[1].map((p) => p.id)).toEqual(["1", "2"])
  })

  it("preserves group order based on first appearance in input (timeline order)", () => {
    const root1 = makeStatus({ id: "1", accountId: "user-a", inReplyToId: null, createdAt: "2024-01-01T00:01:00.000Z" })
    const reply1 = makeStatus({ id: "2", accountId: "user-a", inReplyToId: "1", inReplyToAccountId: "user-a", createdAt: "2024-01-01T00:02:00.000Z" })
    const root2 = makeStatus({ id: "3", accountId: "user-b", inReplyToId: null, createdAt: "2024-01-01T00:00:00.000Z" })

    // newest first: reply1, root1, root2
    const result = groupThreadPosts([reply1, root1, root2])
    expect(result).toHaveLength(2)
    // thread for root1 appeared first (index 0 → reply1 maps to root1)
    expect(result[0].map((p) => p.id)).toEqual(["1", "2"])
    expect(result[1].map((p) => p.id)).toEqual(["3"])
  })

  it("stops chain when parent is not present in the input posts", () => {
    // reply whose parent is NOT in the list
    const orphan = makeStatus({
      id: "5",
      accountId: "user-a",
      inReplyToId: "999",
      inReplyToAccountId: "user-a",
      createdAt: "2024-01-01T00:01:00.000Z",
    })
    const result = groupThreadPosts([orphan])
    // treated as a standalone group
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual([orphan])
  })
})
