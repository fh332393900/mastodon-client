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
export function formatRelativeTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return "刚刚"
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay < 30) return `${diffDay}天前`
  if (diffMonth < 12) return `${diffMonth}个月前`
  return `${diffYear}年前`
}

/**
 * 完整日期时间，用于 title tooltip
 */
export function formatFullDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
