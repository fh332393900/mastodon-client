import { describe, expect, it } from "vitest"
import { parseRssItems } from "@/lib/sports/news"
import {
  FOOTBALL_LEAGUES,
  SPORT_THEMES,
  SPORTS_BACKGROUND_PRESETS,
} from "@/lib/sports/config"

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BBC Sport - Football</title>
    <item>
      <title><![CDATA[Arsenal win dramatic North London derby]]></title>
      <link>https://www.bbc.com/sport/football/articles/abc123</link>
      <description>Match report</description>
      <pubDate>Sat, 18 Oct 2026 18:30:00 GMT</pubDate>
      <guid>https://www.bbc.com/sport/football/articles/abc123</guid>
      <media:thumbnail width="240" height="135" url="https://ichef.bbci.co.uk/ace/standard/240/cpsprodpb/test.jpg"/>
    </item>
    <item>
      <title>Verstappen &amp; Norris battle continues</title>
      <link>https://www.bbc.com/sport/formula1/articles/def456</link>
      <pubDate>Sun, 19 Oct 2026 09:00:00 GMT</pubDate>
    </item>
    <item>
      <title></title>
      <link></link>
    </item>
  </channel>
</rss>`

describe("parseRssItems", () => {
  it("解析 item 并解码 CDATA 与 HTML 实体", () => {
    const items = parseRssItems(SAMPLE_RSS, "BBC Sport")
    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({
      title: "Arsenal win dramatic North London derby",
      link: "https://www.bbc.com/sport/football/articles/abc123",
      source: "BBC Sport",
    })
    expect(items[1].title).toBe("Verstappen & Norris battle continues")
    // 缩略图被解析并替换为大尺寸档位
    expect(items[0].image).toBe("https://ichef.bbci.co.uk/ace/standard/624/cpsprodpb/test.jpg")
    expect(items[1].image).toBe("")
    // 无 title/link 的 item 被跳过
    expect(items.some((item) => !item.title)).toBe(false)
  })

  it("空 XML 返回空数组", () => {
    expect(parseRssItems("", "BBC Sport")).toEqual([])
  })
})

describe("sports config", () => {
  it("五大联赛配置完整（英超/西甲/德甲/意甲/法甲）", () => {
    expect(FOOTBALL_LEAGUES.map((league) => league.code)).toEqual([
      "PL",
      "PD",
      "BL1",
      "SA",
      "FL1",
    ])
    for (const league of FOOTBALL_LEAGUES) {
      expect(league.hashtag).toBeTruthy()
      expect(league.officialSite).toMatch(/^https:\/\//)
      expect(league.brandColor).toMatch(/^#/)
    }
  })

  it("足球与 F1 主题均有话题与官网", () => {
    expect(SPORT_THEMES.f1.brandColor).toBe("#e10600")
    expect(SPORT_THEMES.football.hashtags.length).toBeGreaterThan(0)
    expect(SPORT_THEMES.f1.hashtags).toContain("F1")
    expect(SPORT_THEMES.f1.officialSites[0].url).toContain("formula1.com")
  })

  it("背景预设 id 不重复", () => {
    const ids = SPORTS_BACKGROUND_PRESETS.map((preset) => preset.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
