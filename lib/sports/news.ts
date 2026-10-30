/**
 * 体育资讯：抓取多家体育媒体 RSS（足球 / F1），服务端解析并交叉混排。
 * 无需 token，单源失败时忽略该源，全部失败返回空数组由调用方降级。
 */

interface RssFeed {
  url: string
  source: string
}

const RSS_SOURCES: Record<string, RssFeed[]> = {
  football: [
    { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC Sport" },
    { url: "https://www.theguardian.com/football/rss", source: "The Guardian" },
    { url: "https://www.skysports.com/rss/12040", source: "Sky Sports" },
  ],
  f1: [
    { url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml", source: "BBC Sport" },
    { url: "https://www.autosport.com/rss/f1/news/", source: "Autosport" },
    { url: "https://www.theguardian.com/sport/formulaone/rss", source: "The Guardian" },
    { url: "https://www.skysports.com/rss/12433", source: "Sky Sports" },
  ],
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

/** BBC 缩略图默认很小，替换为大尺寸档位 */
function upgradeImage(url: string): string {
  return url.replace("/240/", "/624/")
}

/** 从 media:thumbnail / media:content / enclosure 中提取配图（忽略视频） */
function extractImage(xml: string): string {
  const thumbnail = xml.match(/<media:thumbnail[^>]*\burl="([^"]+)"/)
  if (thumbnail) return upgradeImage(decodeXml(thumbnail[1]))

  let best = ""
  let bestWidth = -1
  for (const tag of xml.match(/<media:content\b[^>]*>/g) ?? []) {
    if (/\btype="video\//.test(tag)) continue
    const url = tag.match(/\burl="([^"]+)"/)?.[1]
    if (!url) continue
    const width = Number(tag.match(/\bwidth="(\d+)"/)?.[1] ?? 0)
    if (width > bestWidth) {
      bestWidth = width
      best = url
    }
  }
  if (best) return upgradeImage(decodeXml(best))

  const enclosure = xml.match(/<enclosure\b[^>]*\btype="image\/[^"]*"[^>]*>/)
  const enclosureUrl = enclosure?.[0].match(/\burl="([^"]+)"/)?.[1]
  return enclosureUrl ? upgradeImage(decodeXml(enclosureUrl)) : ""
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
      image: extractImage(raw),
    })
  }

  return items
}

/** 图片用途：hero 首屏大图、thumb 列表缩略图 */
export type NewsImageUsage = "hero" | "thumb"

export interface NewsImageSources {
  src: string
  /** 多档位候选，配合 sizes 让浏览器按视口/DPR 取最小可用图 */
  srcSet?: string
}

/** BBC ichef 支持的宽度档位（该 CDN 不提供 WebP/AVIF 变体，宽度越大 PNG 体积翻倍，故封顶 624） */
const BBC_WIDTHS: Record<NewsImageUsage, number[]> = {
  hero: [480, 624],
  thumb: [240, 320, 480],
}

/** Sky Sports 365dm 仅支持固定的 16:9 档位 */
const SKY_SIZES: Record<NewsImageUsage, Array<[number, number]>> = {
  hero: [
    [320, 180],
    [768, 432],
    [1280, 720],
  ],
  thumb: [[320, 180]],
}

/**
 * 把资讯配图重写为更小的 CDN 档位并生成 srcSet，避免 1920px 大图缩到 96px 展示。
 * Guardian（guim.co.uk）使用签名 URL，改动参数会 401，因此保持原样。
 */
export function newsImage(url: string, usage: NewsImageUsage): NewsImageSources {
  if (!url) return { src: "" }

  try {
    const parsed = new URL(url)

    // BBC: /ace/standard|ws/{width}/...
    if (parsed.hostname.endsWith("bbci.co.uk")) {
      const matched = parsed.pathname.match(/^(\/ace\/(?:standard|ws)\/)(\d+)(\/.*)$/)
      if (matched) {
        const widths = BBC_WIDTHS[usage]
        const build = (width: number) => `${parsed.origin}${matched[1]}${width}${matched[3]}${parsed.search}`
        return {
          src: build(usage === "hero" ? 624 : 320),
          srcSet: widths.map((width) => `${build(width)} ${width}w`).join(", "),
        }
      }
    }

    // Sky Sports: /{yyyy}/{mm}/{W}x{H}/name.jpg
    if (/(^|\.)365dm\.com$/.test(parsed.hostname)) {
      const matched = parsed.pathname.match(/^(\/.+\/)(\d+x\d+)\/(.+)$/)
      if (matched) {
        const sizes = SKY_SIZES[usage]
        const build = ([width, height]: [number, number]) =>
          `${parsed.origin}${matched[1]}${width}x${height}/${matched[3]}${parsed.search}`
        return {
          src: build(usage === "hero" ? sizes[sizes.length - 2] : sizes[0]),
          srcSet: sizes.map((size) => `${build(size)} ${size[0]}w`).join(", "),
        }
      }
    }
  } catch {
    // URL 解析失败时按原图返回
  }

  return { src: url }
}

async function fetchFeed(feed: RssFeed): Promise<SportsNewsItem[]> {
  try {
    const response = await fetch(feed.url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "user-agent": "Mozilla/5.0 (compatible; SportsPulse/1.0)" },
    })
    if (!response.ok) return []
    return parseRssItems(await response.text(), feed.source)
  } catch {
    return []
  }
}

/** 多源交叉混排（按来源轮询），去重后截断，避免单一媒体占据整屏 */
function mergeFeeds(lists: SportsNewsItem[][]): SportsNewsItem[] {
  const merged: SportsNewsItem[] = []
  const seen = new Set<string>()
  const longest = Math.max(0, ...lists.map((list) => list.length))

  for (let position = 0; position < longest && merged.length < MAX_ITEMS; position += 1) {
    for (const list of lists) {
      const item = list[position]
      if (!item || seen.has(item.link)) continue
      seen.add(item.link)
      merged.push(item)
      if (merged.length >= MAX_ITEMS) break
    }
  }

  return merged
}

/** 拉取指定运动方向的最新资讯（多源并发，单个源失败不影响整体）。 */
export async function fetchSportsNews(sport: string): Promise<SportsNewsItem[]> {
  const feeds = RSS_SOURCES[sport]
  if (!feeds?.length) return []

  const lists = await Promise.all(feeds.map(fetchFeed))
  return mergeFeeds(lists)
}
