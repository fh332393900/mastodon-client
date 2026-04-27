import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 将日期字符串格式化为相对时间，例如：
 * 刚刚 / 3分钟前 / 2小时前 / 5天前 / 3个月前 / 2年前
 * 超过 1 年时追加完整日期作为 title 属性可用
 */
function toValidDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null
  }
  if (typeof value === "string") {
    const d = new Date(value)
    return Number.isFinite(d.getTime()) ? d : null
  }
  return null
}

export function formatRelativeTime(
  value: string | Date | null | undefined,
  locale: string = "en",
): string {
  const date = toValidDate(value)
  if (!date) return ""

  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (diffSec < 60) {
    return locale.startsWith("zh") ? "刚刚" : "just now"
  }
  if (diffMin < 60) return rtf.format(-diffMin, "minute")
  if (diffHour < 24) return rtf.format(-diffHour, "hour")
  if (diffDay < 30) return rtf.format(-diffDay, "day")
  if (diffMonth < 12) return rtf.format(-diffMonth, "month")
  return rtf.format(-diffYear, "year")
}

/**
 * 完整日期时间，用于 title tooltip
 */
export function formatFullDate(value: string | Date): string {
  const date = toValidDate(value)
  if (!date) return ""
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
