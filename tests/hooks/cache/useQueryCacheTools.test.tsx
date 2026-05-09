import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, act } from "@testing-library/react"
import { useQueryCacheTools } from "@/hooks/cache/useQueryCacheTools"

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function makeInfiniteData(pages: object[][]) {
  return {
    pages,
    pageParams: pages.map((_, i) => (i === 0 ? undefined : String(i))),
  }
}

describe("useQueryCacheTools", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  })

  afterEach(() => {
    queryClient.clear()
  })

  // ─── getQueriesByPrefix ────────────────────────────────────────────────────

  describe("getQueriesByPrefix", () => {
    it("finds queries matching a string prefix", () => {
      queryClient.setQueryData(["timeline", "home"], makeInfiniteData([[{ id: "1" }]]))
      queryClient.setQueryData(["favorites", "authed"], makeInfiniteData([[{ id: "2" }]]))

      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })

      const found = result.current.getQueriesByPrefix("timeline")
      expect(found).toHaveLength(1)
      expect(found[0].queryKey).toEqual(["timeline", "home"])
    })

    it("finds queries matching an array prefix", () => {
      queryClient.setQueryData(["timeline", "home"], makeInfiniteData([[{ id: "1" }]]))
      queryClient.setQueryData(["timeline", "local"], makeInfiniteData([[{ id: "2" }]]))

      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })

      const found = result.current.getQueriesByPrefix(["timeline", "home"])
      expect(found).toHaveLength(1)
    })

    it("returns empty array when no queries match", () => {
      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })
      expect(result.current.getQueriesByPrefix("does-not-exist")).toHaveLength(0)
    })
  })

  // ─── updateInfiniteQueryPages ──────────────────────────────────────────────

  describe("updateInfiniteQueryPages", () => {
    it("maps each item in all matched query pages", () => {
      queryClient.setQueryData(
        ["timeline", "home"],
        makeInfiniteData([[{ id: "1", favourited: false }, { id: "2", favourited: false }]]),
      )

      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.updateInfiniteQueryPages("timeline", (item) =>
          item.id === "1" ? { ...item, favourited: true } : item,
        )
      })

      const data = queryClient.getQueryData(["timeline", "home"]) as any
      expect(data.pages[0][0].favourited).toBe(true)
      expect(data.pages[0][1].favourited).toBe(false)
    })

    it("updates items across multiple pages", () => {
      queryClient.setQueryData(
        ["timeline", "home"],
        makeInfiniteData([
          [{ id: "1", reblogged: false }],
          [{ id: "2", reblogged: false }],
        ]),
      )

      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.updateInfiniteQueryPages("timeline", (item) => ({
          ...item,
          reblogged: true,
        }))
      })

      const data = queryClient.getQueryData(["timeline", "home"]) as any
      expect(data.pages[0][0].reblogged).toBe(true)
      expect(data.pages[1][0].reblogged).toBe(true)
    })

    it("only updates queries matching the prefix", () => {
      queryClient.setQueryData(
        ["timeline", "home"],
        makeInfiniteData([[{ id: "1", favourited: false }]]),
      )
      queryClient.setQueryData(
        ["favorites", "authed"],
        makeInfiniteData([[{ id: "1", favourited: false }]]),
      )

      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.updateInfiniteQueryPages("timeline", (item) => ({
          ...item,
          favourited: true,
        }))
      })

      const timeline = queryClient.getQueryData(["timeline", "home"]) as any
      const favorites = queryClient.getQueryData(["favorites", "authed"]) as any
      expect(timeline.pages[0][0].favourited).toBe(true)
      // favorites should be untouched
      expect(favorites.pages[0][0].favourited).toBe(false)
    })
  })

  // ─── removeFromInfiniteQueryPages ─────────────────────────────────────────

  describe("removeFromInfiniteQueryPages", () => {
    it("removes items matching the predicate", () => {
      queryClient.setQueryData(
        ["favorites", "authed"],
        makeInfiniteData([[{ id: "1" }, { id: "2" }, { id: "3" }]]),
      )

      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.removeFromInfiniteQueryPages("favorites", (item) => item.id === "2")
      })

      const data = queryClient.getQueryData(["favorites", "authed"]) as any
      expect(data.pages[0]).toHaveLength(2)
      expect(data.pages[0].map((i: any) => i.id)).toEqual(["1", "3"])
    })

    it("removes items from multiple pages independently", () => {
      queryClient.setQueryData(
        ["favorites", "authed"],
        makeInfiniteData([
          [{ id: "1" }, { id: "2" }],
          [{ id: "3" }, { id: "4" }],
        ]),
      )

      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.removeFromInfiniteQueryPages(
          "favorites",
          (item) => item.id === "2" || item.id === "3",
        )
      })

      const data = queryClient.getQueryData(["favorites", "authed"]) as any
      expect(data.pages[0].map((i: any) => i.id)).toEqual(["1"])
      expect(data.pages[1].map((i: any) => i.id)).toEqual(["4"])
    })

    it("leaves pages empty but intact when all items are removed", () => {
      queryClient.setQueryData(
        ["favorites", "authed"],
        makeInfiniteData([[{ id: "1" }]]),
      )

      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.removeFromInfiniteQueryPages("favorites", () => true)
      })

      const data = queryClient.getQueryData(["favorites", "authed"]) as any
      expect(data.pages[0]).toHaveLength(0)
    })

    it("does not affect unrelated query prefixes", () => {
      queryClient.setQueryData(
        ["favorites", "authed"],
        makeInfiniteData([[{ id: "1" }]]),
      )
      queryClient.setQueryData(
        ["timeline", "home"],
        makeInfiniteData([[{ id: "1" }]]),
      )

      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.removeFromInfiniteQueryPages("favorites", (item) => item.id === "1")
      })

      const timeline = queryClient.getQueryData(["timeline", "home"]) as any
      expect(timeline.pages[0]).toHaveLength(1)
    })
  })

  // ─── prependToInfiniteQueryFirstPage ──────────────────────────────────────

  describe("prependToInfiniteQueryFirstPage", () => {
    it("prepends item to the first page of matching queries", () => {
      queryClient.setQueryData(
        ["favorites", "authed"],
        makeInfiniteData([[{ id: "2" }, { id: "3" }]]),
      )

      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.prependToInfiniteQueryFirstPage("favorites", { id: "1" })
      })

      const data = queryClient.getQueryData(["favorites", "authed"]) as any
      expect(data.pages[0].map((i: any) => i.id)).toEqual(["1", "2", "3"])
    })

    it("only prepends to first page, leaving later pages untouched", () => {
      queryClient.setQueryData(
        ["favorites", "authed"],
        makeInfiniteData([[{ id: "2" }], [{ id: "3" }]]),
      )

      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.prependToInfiniteQueryFirstPage("favorites", { id: "1" })
      })

      const data = queryClient.getQueryData(["favorites", "authed"]) as any
      expect(data.pages[0].map((i: any) => i.id)).toEqual(["1", "2"])
      expect(data.pages[1].map((i: any) => i.id)).toEqual(["3"])
    })

    it("does nothing when no matching queries exist", () => {
      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })

      // Should not throw
      act(() => {
        result.current.prependToInfiniteQueryFirstPage("favorites", { id: "1" })
      })

      expect(queryClient.getQueryData(["favorites", "authed"])).toBeUndefined()
    })

    it("does not affect unrelated query prefixes", () => {
      queryClient.setQueryData(
        ["favorites", "authed"],
        makeInfiniteData([[{ id: "2" }]]),
      )
      queryClient.setQueryData(
        ["timeline", "home"],
        makeInfiniteData([[{ id: "2" }]]),
      )

      const { result } = renderHook(() => useQueryCacheTools(), {
        wrapper: makeWrapper(queryClient),
      })

      act(() => {
        result.current.prependToInfiniteQueryFirstPage("favorites", { id: "1" })
      })

      const timeline = queryClient.getQueryData(["timeline", "home"]) as any
      expect(timeline.pages[0]).toHaveLength(1)
      expect(timeline.pages[0][0].id).toBe("2")
    })
  })
})
