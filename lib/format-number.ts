/**
 * 将数字格式化为本地化紧凑形式
 *
 * 示例：
 *   formatCompactNumber(1500, "zh-CN")  → "1,500"
 *   formatCompactNumber(15000, "zh-CN") → "1.5万"
 *   formatCompactNumber(15000, "en-US") → "15K"
 *   formatCompactNumber(1500000, "zh-CN") → "150万"
 *   formatCompactNumber(1500000, "en-US") → "1.5M"
 */
export function formatCompactNumber(value: number, locale?: string): string {
  const resolvedLocale = locale ?? "en-US"

  try {
    return new Intl.NumberFormat(resolvedLocale, {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(value)
  } catch {
    // 降级：直接返回原始数字字符串
    return String(value)
  }
}
