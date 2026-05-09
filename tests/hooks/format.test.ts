import { renderHook } from "@testing-library/react"
import { useFormat } from "@/hooks/format"

// ─── mocks ───────────────────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
  useLocale: () => "en-US",
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = { "common.justNow": "just now" }
    return map[key] ?? key
  },
}))

// ─── helpers ─────────────────────────────────────────────────────────────────

function getFormat() {
  return renderHook(() => useFormat()).result.current
}

/** Returns a Date that is `seconds` seconds before now */
function secsAgo(seconds: number): Date {
  return new Date(Date.now() - seconds * 1000)
}

// ─── formatCompactNumber ─────────────────────────────────────────────────────

describe("useFormat", () => {
  describe("formatCompactNumber", () => {
    it("formats numbers below 1000 as-is", () => {
      const { formatCompactNumber } = getFormat()
      expect(formatCompactNumber(0)).toBe("0")
      expect(formatCompactNumber(999)).toBe("999")
    })

    it("formats thousands with K suffix", () => {
      const { formatCompactNumber } = getFormat()
      const result = formatCompactNumber(1000)
      expect(result).toMatch(/1K/i)
    })

    it("formats 1500 as 1.5K", () => {
      const { formatCompactNumber } = getFormat()
      const result = formatCompactNumber(1500)
      expect(result).toMatch(/1\.5K/i)
    })

    it("formats millions with M suffix", () => {
      const { formatCompactNumber } = getFormat()
      const result = formatCompactNumber(1_000_000)
      expect(result).toMatch(/1M/i)
    })

    it("formats negative numbers", () => {
      const { formatCompactNumber } = getFormat()
      const result = formatCompactNumber(-5000)
      expect(result).toMatch(/-5K/i)
    })
  })

  // ─── formatRelativeTime ────────────────────────────────────────────────────

  describe("formatRelativeTime", () => {
    it("returns empty string for null", () => {
      const { formatRelativeTime } = getFormat()
      expect(formatRelativeTime(null)).toBe("")
    })

    it("returns empty string for undefined", () => {
      const { formatRelativeTime } = getFormat()
      expect(formatRelativeTime(undefined)).toBe("")
    })

    it("returns empty string for an invalid date string", () => {
      const { formatRelativeTime } = getFormat()
      expect(formatRelativeTime("not-a-date")).toBe("")
    })

    it("returns 'just now' for timestamps less than 60 seconds ago", () => {
      const { formatRelativeTime } = getFormat()
      expect(formatRelativeTime(secsAgo(0))).toBe("just now")
      expect(formatRelativeTime(secsAgo(30))).toBe("just now")
      expect(formatRelativeTime(secsAgo(59))).toBe("just now")
    })

    it("returns 'just now' for ISO string less than 60 seconds ago", () => {
      const { formatRelativeTime } = getFormat()
      expect(formatRelativeTime(secsAgo(10).toISOString())).toBe("just now")
    })

    it("returns minute-relative string for 1–59 minutes ago", () => {
      const { formatRelativeTime } = getFormat()
      const result = formatRelativeTime(secsAgo(60))
      expect(result).toMatch(/minute/i)
    })

    it("returns '3 minutes ago' for 3 minutes ago", () => {
      const { formatRelativeTime } = getFormat()
      const result = formatRelativeTime(secsAgo(3 * 60))
      expect(result).toMatch(/3 minutes? ago/i)
    })

    it("returns hour-relative string for 1–23 hours ago", () => {
      const { formatRelativeTime } = getFormat()
      const result = formatRelativeTime(secsAgo(2 * 3600))
      expect(result).toMatch(/2 hours? ago/i)
    })

    it("returns day-relative string for 1–29 days ago", () => {
      const { formatRelativeTime } = getFormat()
      const result = formatRelativeTime(secsAgo(3 * 86400))
      expect(result).toMatch(/3 days? ago/i)
    })

    it("returns month-relative string for 1–11 months ago", () => {
      const { formatRelativeTime } = getFormat()
      const result = formatRelativeTime(secsAgo(60 * 86400))
      expect(result).toMatch(/2 months? ago/i)
    })

    it("returns year-relative string for 1+ years ago", () => {
      const { formatRelativeTime } = getFormat()
      const result = formatRelativeTime(secsAgo(400 * 86400))
      expect(result).toMatch(/last year|1 year ago/i)
    })

    it("accepts a Date object directly", () => {
      const { formatRelativeTime } = getFormat()
      const result = formatRelativeTime(secsAgo(5))
      expect(result).toBe("just now")
    })
  })

  // ─── formatFullDate ────────────────────────────────────────────────────────

  describe("formatFullDate", () => {
    it("returns empty string for an invalid date string", () => {
      const { formatFullDate } = getFormat()
      expect(formatFullDate("not-a-date")).toBe("")
    })

    it("formats a Date object with year, month, day, hour, minute", () => {
      const { formatFullDate } = getFormat()
      // Fixed point in time: 2024-06-15 at 14:30 UTC
      const date = new Date("2024-06-15T14:30:00.000Z")
      const result = formatFullDate(date)
      expect(result).toMatch(/2024/)
      expect(result).toMatch(/June|Jun/)
      expect(result).toMatch(/15/)
    })

    it("formats an ISO string", () => {
      const { formatFullDate } = getFormat()
      const result = formatFullDate("2024-01-01T00:00:00.000Z")
      expect(result).toMatch(/2024/)
      expect(result).toMatch(/January|Jan/)
    })

    it("includes time (hour and minute) in the output", () => {
      const { formatFullDate } = getFormat()
      // Use a fixed time with obvious values
      const result = formatFullDate(new Date("2024-03-10T09:05:00.000Z"))
      // Should contain at least a digit followed by a colon pattern or AM/PM
      expect(result).toMatch(/\d{1,2}[:.]\d{2}/)
    })
  })
})
