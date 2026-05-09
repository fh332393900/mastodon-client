import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, act, waitFor } from "@testing-library/react"
import type { mastodon } from "masto"
import { useStatusActions } from "@/hooks/mastodon/useStatusActions"

// ─── mocks ───────────────────────────────────────────────────────────────────

const mockFavourite = vi.fn()
const mockUnfavourite = vi.fn()
const mockReblog = vi.fn()
const mockUnreblog = vi.fn()

vi.mock("@/components/auth/masto-provider", () => ({
  useMasto: () => ({
    client: {
      v1: {
        statuses: {
          $select: (id: string) => ({
            favourite: mockFavourite,
            unfavourite: mockUnfavourite,
            reblog: mockReblog,
            unreblog: mockUnreblog,
          }),
        },
      },
    },
    isReady: true,
    server: "mastodon.social",
  }),
}))

vi.mock("@/components/auth/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    isInitialized: true,
  }),
}))

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeStatus(overrides: Partial<mastodon.v1.Status> = {}): mastodon.v1.Status {
  return {
    id: "100",
    createdAt: "2024-01-01T00:00:00.000Z",
    favourited: false,
    reblogged: false,
    bookmarked: false,
    muted: false,
    pinned: false,
    favouritesCount: 10,
    reblogsCount: 5,
    repliesCount: 0,
    sensitive: false,
    spoilerText: "",
    visibility: "public",
    content: "<p>Hello</p>",
    uri: "https://mastodon.social/users/alice/statuses/100",
    url: "https://mastodon.social/@alice/100",
    mediaAttachments: [],
    mentions: [],
    tags: [],
    emojis: [],
    reblog: null,
    poll: null,
    card: null,
    language: null,
    text: null,
    editedAt: null,
    application: null,
    filtered: [],
    account: {
      id: "user-2",
      username: "alice",
      acct: "alice",
      displayName: "Alice",
      url: "https://mastodon.social/@alice",
    } as mastodon.v1.Account,
    ...overrides,
  } as mastodon.v1.Status
}

function makeInfiniteData(pages: mastodon.v1.Status[][]) {
  return {
    pages,
    pageParams: pages.map((_, i) => (i === 0 ? undefined : String(i))),
  }
}

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe("useStatusActions", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  // ─── favourite ─────────────────────────────────────────────────────────────

  describe("toggleFavourite", () => {
    it("optimistically sets favourited=true and increments count", async () => {
      const status = makeStatus({ favourited: false, favouritesCount: 10 })
      mockFavourite.mockResolvedValue({ ...status, favourited: true, favouritesCount: 11 })

      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.toggleFavourite()
      })

      // Optimistic state applied synchronously
      expect(result.current.renderedStatus.favourited).toBe(true)
      expect(result.current.renderedStatus.favouritesCount).toBe(11)

      await waitFor(() => expect(result.current.isLoading.favourited).toBe(false))
      expect(result.current.renderedStatus.favourited).toBe(true)
    })

    it("optimistically sets favourited=false and decrements count when unfavoriting", async () => {
      const status = makeStatus({ favourited: true, favouritesCount: 10 })
      mockUnfavourite.mockResolvedValue({ ...status, favourited: false, favouritesCount: 9 })

      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.toggleFavourite()
      })

      expect(result.current.renderedStatus.favourited).toBe(false)
      expect(result.current.renderedStatus.favouritesCount).toBe(9)

      await waitFor(() => expect(result.current.isLoading.favourited).toBe(false))
    })

    it("removes the status from favorites cache when unfavoriting", async () => {
      const status = makeStatus({ id: "100", favourited: true, favouritesCount: 10 })
      mockUnfavourite.mockResolvedValue({ ...status, favourited: false, favouritesCount: 9 })

      queryClient.setQueryData(
        ["favorites", "authed"],
        makeInfiniteData([[status, makeStatus({ id: "200" })]]),
      )

      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })

      await act(async () => {
        result.current.toggleFavourite()
      })

      await waitFor(() => expect(result.current.isLoading.favourited).toBe(false))

      const cached = queryClient.getQueryData(["favorites", "authed"]) as any
      const ids = cached.pages[0].map((s: mastodon.v1.Status) => s.id)
      expect(ids).not.toContain("100")
      expect(ids).toContain("200")
    })

    it("prepends the post to the top of favorites cache when favoriting", async () => {
      const other = makeStatus({ id: "200" })
      const status = makeStatus({ id: "100", favourited: false, favouritesCount: 10 })
      mockFavourite.mockResolvedValue({ ...status, favourited: true, favouritesCount: 11 })

      // Favorites cache already has another post
      queryClient.setQueryData(
        ["favorites", "authed"],
        makeInfiniteData([[other]]),
      )

      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })

      await act(async () => {
        result.current.toggleFavourite()
      })

      await waitFor(() => expect(result.current.isLoading.favourited).toBe(false))

      const cached = queryClient.getQueryData(["favorites", "authed"]) as any
      // Newly favorited post should be at the top
      expect(cached.pages[0][0].id).toBe("100")
      expect(cached.pages[0][0].favourited).toBe(true)
      expect(cached.pages[0][1].id).toBe("200")
    })

    it("de-duplicates post already in favorites cache when re-favoriting", async () => {
      const status = makeStatus({ id: "100", favourited: false, favouritesCount: 10 })
      mockFavourite.mockResolvedValue({ ...status, favourited: true, favouritesCount: 11 })

      // Post is already in the favorites cache (edge case: inconsistent state)
      queryClient.setQueryData(
        ["favorites", "authed"],
        makeInfiniteData([[status, makeStatus({ id: "200" })]]),
      )

      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })

      await act(async () => {
        result.current.toggleFavourite()
      })

      await waitFor(() => expect(result.current.isLoading.favourited).toBe(false))

      const cached = queryClient.getQueryData(["favorites", "authed"]) as any
      // No duplicates; post moved to top with updated state
      const ids = cached.pages[0].map((s: mastodon.v1.Status) => s.id)
      expect(ids.filter((id: string) => id === "100")).toHaveLength(1)
      expect(cached.pages[0][0].id).toBe("100")
      expect(cached.pages[0][0].favourited).toBe(true)
    })

    it("does not add to favorites cache if cache does not exist", async () => {
      const status = makeStatus({ id: "100", favourited: false, favouritesCount: 10 })
      mockFavourite.mockResolvedValue({ ...status, favourited: true, favouritesCount: 11 })

      // No favorites cache seeded
      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })

      await act(async () => {
        result.current.toggleFavourite()
      })

      await waitFor(() => expect(result.current.isLoading.favourited).toBe(false))

      // Cache should still not exist — we don't create it from scratch
      expect(queryClient.getQueryData(["favorites", "authed"])).toBeUndefined()
    })

    it("updates the timeline cache when favoriting", async () => {
      const status = makeStatus({ id: "100", favourited: false, favouritesCount: 10 })
      mockFavourite.mockResolvedValue({ ...status, favourited: true, favouritesCount: 11 })

      queryClient.setQueryData(
        ["timeline", "home"],
        makeInfiniteData([[status]]),
      )

      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })

      await act(async () => {
        result.current.toggleFavourite()
      })

      await waitFor(() => expect(result.current.isLoading.favourited).toBe(false))

      const cached = queryClient.getQueryData(["timeline", "home"]) as any
      expect(cached.pages[0][0].favourited).toBe(true)
      expect(cached.pages[0][0].favouritesCount).toBe(11)
    })
  })

  // ─── reblog ────────────────────────────────────────────────────────────────

  describe("toggleReblog", () => {
    it("optimistically sets reblogged=true and increments count", async () => {
      const status = makeStatus({ reblogged: false, reblogsCount: 5 })
      mockReblog.mockResolvedValue({ ...status, reblogged: true, reblogsCount: 6 })

      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.toggleReblog()
      })

      expect(result.current.renderedStatus.reblogged).toBe(true)
      expect(result.current.renderedStatus.reblogsCount).toBe(6)

      await waitFor(() => expect(result.current.isLoading.reblogged).toBe(false))
    })

    it("optimistically sets reblogged=false and decrements count when unreblogging", async () => {
      const status = makeStatus({ reblogged: true, reblogsCount: 5 })
      // The production code calls res.reblog! on unreblog response —
      // simulate Mastodon returning a boost-wrapper whose .reblog is the updated original
      const updatedOriginal = makeStatus({ id: "100", reblogged: false, reblogsCount: 4 })
      mockUnreblog.mockResolvedValue({ ...status, reblog: updatedOriginal })

      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.toggleReblog()
      })

      expect(result.current.renderedStatus.reblogged).toBe(false)
      expect(result.current.renderedStatus.reblogsCount).toBe(4)

      await waitFor(() => expect(result.current.isLoading.reblogged).toBe(false))
    })

    it("updates reblogged status in timeline cache", async () => {
      const status = makeStatus({ id: "100", reblogged: false, reblogsCount: 5 })
      mockReblog.mockResolvedValue({ ...status, reblogged: true, reblogsCount: 6 })

      queryClient.setQueryData(
        ["timeline", "home"],
        makeInfiniteData([[status]]),
      )

      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })

      await act(async () => {
        result.current.toggleReblog()
      })

      await waitFor(() => expect(result.current.isLoading.reblogged).toBe(false))

      const cached = queryClient.getQueryData(["timeline", "home"]) as any
      expect(cached.pages[0][0].reblogged).toBe(true)
      expect(cached.pages[0][0].reblogsCount).toBe(6)
    })

    it("updates reblogged status in favorites cache", async () => {
      const status = makeStatus({ id: "100", reblogged: false, reblogsCount: 5 })
      mockReblog.mockResolvedValue({ ...status, reblogged: true, reblogsCount: 6 })

      queryClient.setQueryData(
        ["favorites", "authed"],
        makeInfiniteData([[status]]),
      )

      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })

      await act(async () => {
        result.current.toggleReblog()
      })

      await waitFor(() => expect(result.current.isLoading.reblogged).toBe(false))

      const cached = queryClient.getQueryData(["favorites", "authed"]) as any
      expect(cached.pages[0][0].reblogged).toBe(true)
    })

    it("does not allow reblog of direct messages", () => {
      const status = makeStatus({ visibility: "direct" })
      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })
      expect(result.current.canReblog).toBe(false)
    })

    it("does not allow reblog of other user's private posts", () => {
      const status = makeStatus({ visibility: "private", account: { id: "other-user" } as mastodon.v1.Account })
      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })
      expect(result.current.canReblog).toBe(false)
    })

    it("allows reblog of own private posts", () => {
      const status = makeStatus({
        visibility: "private",
        account: { id: "user-1" } as mastodon.v1.Account,
      })
      const { result } = renderHook(() => useStatusActions({ status }), {
        wrapper: makeWrapper(queryClient),
      })
      expect(result.current.canReblog).toBe(true)
    })
  })
})
