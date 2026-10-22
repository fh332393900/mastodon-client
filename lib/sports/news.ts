/**
 * 体育资讯：抓取 BBC Sport RSS（足球 / F1），服务端解析。
 * 无需 token，失败时返回空数组由调用方降级。
 */

const RSS_SOURCES: Record<string, { url: string; source: string }> = {
  football: {
    url: "https://feeds.bbci.co.uk/sport/football/rss.xml",
    source: "BBC Sport",
  },
  f1: {
    url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml",
    source: "BBC Sport",
  },
}

const REVALIDATE_SECONDS = 1800
const MAX_ITEMS = 12

export interface SportsNewsItem {
  id: string
  title: string
  link: string
  publishedAt: string
  source: string
  /** 配图缩略图（BBC media:thumbnail），可能为空 */
  image: string
}

function decodeXml(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim()
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return match ? decodeXml(match[1]) : ""
}

function extractThumbnail(xml: string): string {
  const match = xml.match(/<media:thumbnail[^>]*url="([^"]+)"/)
  if (!match) return ""
  // BBC 缩略图默认很小，替换为大尺寸档位
  return decodeXml(match[1]).replace("/240/", "/624/")
}

/** 解析 RSS XML 文本为资讯列表（独立导出便于测试）。 */
export function parseRssItems(xml: string, source: string): SportsNewsItem[] {
  const items: SportsNewsItem[] = []
  const itemPattern = /<item[\s>]([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null

  while ((match = itemPattern.exec(xml)) !== null && items.length < MAX_ITEMS) {
    const raw = match[1]
    const title = extractTag(raw, "title")
    const link = extractTag(raw, "link")
    if (!title || !link) continue
    items.push({
      id: extractTag(raw, "guid") || link,
      title,
      link,
      publishedAt: extractTag(raw, "pubDate"),
      source,
      image: extractThumbnail(raw),
    })
  }

  return items
}

/** 拉取指定运动方向的最新资讯。 */
export async function fetchSportsNews(sport: string): Promise<SportsNewsItem[]> {
  const feed = RSS_SOURCES[sport]
  if (!feed) return []

  try {
    const response = await fetch(feed.url, {
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!response.ok) return []
    const xml = await response.text()
    return parseRssItems(xml, feed.source)
  } catch {
    return []
  }
}
