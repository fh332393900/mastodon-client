/**
 * 燃动赛场（SportsPulse）静态配置：联赛、主题色、社区话题、官网与背景预设。
 * 该文件同时被服务端与客户端引用，不要引入 Node 专属依赖。
 */

export type SportId = "football" | "f1"

/** 欧战资格区：欧冠 / 欧联 / 欧协联 */
export type FootballZoneId = "ucl" | "uel" | "uecl"

export interface FootballZoneRange {
  id: FootballZoneId
  /** 起始名次（含） */
  from: number
  /** 结束名次（含） */
  to: number
}

export interface FootballZoneStyle {
  /** 资格区行的浅色背景 */
  bgClassName: string
  /** 资格区行 hover 时略深的背景 */
  hoverClassName: string
}

export const FOOTBALL_ZONE_STYLES: Record<FootballZoneId, FootballZoneStyle> = {
  ucl: {
    bgClassName: "bg-blue-500/[0.07]",
    hoverClassName: "hover:bg-blue-500/[0.14]",
  },
  uel: {
    bgClassName: "bg-amber-500/[0.08]",
    hoverClassName: "hover:bg-amber-500/[0.15]",
  },
  uecl: {
    bgClassName: "bg-emerald-500/[0.07]",
    hoverClassName: "hover:bg-emerald-500/[0.14]",
  },
}

export interface FootballLeague {
  /** football-data.org competition code */
  code: string
  name: string
  /** 联赛官方标志（football-data.org 徽标资源） */
  emblem: string
  /** 社区讨论使用的 Mastodon 话题 */
  hashtag: string
  brandColor: string
  officialSite: string
  /** 当前赛季欧战席位区间（含欧战表现席位），赛季规则调整时同步更新 */
  zones: FootballZoneRange[]
}

export const FOOTBALL_LEAGUES: FootballLeague[] = [
  {
    code: "PL",
    name: "Premier League",
    emblem: "https://crests.football-data.org/PL.png",
    hashtag: "PremierLeague",
    brandColor: "#3d195b",
    officialSite: "https://www.premierleague.com",
    // 英超近赛季获得欧战表现席位：前 5 进欧冠，第 6 欧联，第 7 欧协联
    zones: [
      { id: "ucl", from: 1, to: 5 },
      { id: "uel", from: 6, to: 6 },
      { id: "uecl", from: 7, to: 7 },
    ],
  },
  {
    code: "PD",
    name: "LaLiga",
    emblem: "https://crests.football-data.org/PD.png",
    hashtag: "LaLiga",
    brandColor: "#ff4b44",
    officialSite: "https://www.laliga.com/en-GB",
    // 西甲含欧战表现席位：前 5 进欧冠，第 6 欧联，第 7 欧协联
    zones: [
      { id: "ucl", from: 1, to: 5 },
      { id: "uel", from: 6, to: 6 },
      { id: "uecl", from: 7, to: 7 },
    ],
  },
  {
    code: "BL1",
    name: "Bundesliga",
    emblem: "https://crests.football-data.org/BL1.png",
    hashtag: "Bundesliga",
    brandColor: "#d20515",
    officialSite: "https://www.bundesliga.com/en/bundesliga",
    // 德甲：前 4 进欧冠，第 5 欧联，第 6 欧协联资格赛
    zones: [
      { id: "ucl", from: 1, to: 4 },
      { id: "uel", from: 5, to: 5 },
      { id: "uecl", from: 6, to: 6 },
    ],
  },
  {
    code: "SA",
    name: "Serie A",
    emblem: "https://crests.football-data.org/SA.png",
    hashtag: "SerieA",
    brandColor: "#0e8a4c",
    officialSite: "https://www.legaseriea.it/en",
    // 意甲：前 4 进欧冠，第 5 欧联，第 6 欧协联资格赛
    zones: [
      { id: "ucl", from: 1, to: 4 },
      { id: "uel", from: 5, to: 5 },
      { id: "uecl", from: 6, to: 6 },
    ],
  },
  {
    code: "FL1",
    name: "Ligue 1",
    emblem: "https://crests.football-data.org/FL1.png",
    hashtag: "Ligue1",
    brandColor: "#091f43",
    officialSite: "https://www.ligue1.com",
    // 法甲：前 3 直接进欧冠，第 4 打欧冠资格赛，第 5 欧联，第 6 欧协联资格赛
    zones: [
      { id: "ucl", from: 1, to: 4 },
      { id: "uel", from: 5, to: 5 },
      { id: "uecl", from: 6, to: 6 },
    ],
  },
]

export interface SportTheme {
  id: SportId
  /** 品牌主色（F1 红 / 足球草皮绿） */
  brandColor: string
  /** hero 区域默认渐变（未设置自定义背景图时使用） */
  heroGradient: string
  /** 社区热议默认话题列表 */
  hashtags: string[]
  officialSites: { label: string; url: string }[]
}

export const SPORT_THEMES: Record<SportId, SportTheme> = {
  football: {
    id: "football",
    brandColor: "#16a34a",
    heroGradient:
      "linear-gradient(135deg, #04120a 0%, #14532d 45%, #16a34a 85%, #4ade80 130%)",
    hashtags: [
      "Football",
      "PremierLeague",
      "LaLiga",
      "Bundesliga",
      "SerieA",
      "Ligue1",
      "ChampionsLeague",
    ],
    officialSites: FOOTBALL_LEAGUES.map((league) => ({
      label: league.name,
      url: league.officialSite,
    })),
  },
  f1: {
    id: "f1",
    brandColor: "#e10600",
    heroGradient:
      "linear-gradient(135deg, #150505 0%, #7f1d1d 40%, #e10600 85%, #ff7a66 130%)",
    hashtags: ["F1", "Formula1", "GrandPrix", "Motorsport"],
    officialSites: [
      { label: "Formula 1", url: "https://www.formula1.com" },
      { label: "FIA", url: "https://www.fia.com" },
    ],
  },
}

export interface SportsBackgroundPreset {
  id: string
  css: string
}

/** 预设背景（活力渐变），用于 hero 区域自定义。 */
export const SPORTS_BACKGROUND_PRESETS: SportsBackgroundPreset[] = [
  {
    id: "stadium-night",
    css: "radial-gradient(ellipse at top, #14532d 0%, #04120a 70%)",
  },
  {
    id: "pit-lane",
    css: "radial-gradient(ellipse at top, #7f1d1d 0%, #150505 70%)",
  },
  {
    id: "sunset-turf",
    css: "linear-gradient(160deg, #0f172a 0%, #166534 55%, #eab308 140%)",
  },
  {
    id: "neon-grid",
    css: "linear-gradient(160deg, #111827 0%, #312e81 55%, #e10600 140%)",
  },
]

export const SPORTS_IDS: SportId[] = ["football", "f1"]

/** F1 举办国 → 国旗 emoji,用于赛历与赛果点缀。 */
export const F1_COUNTRY_FLAGS: Record<string, string> = {
  Australia: "🇦🇺",
  China: "🇨🇳",
  Japan: "🇯🇵",
  Bahrain: "🇧🇭",
  "Saudi Arabia": "🇸🇦",
  USA: "🇺🇸",
  "United States": "🇺🇸",
  Italy: "🇮🇹",
  Monaco: "🇲🇨",
  Spain: "🇪🇸",
  Canada: "🇨🇦",
  Austria: "🇦🇹",
  UK: "🇬🇧",
  "Great Britain": "🇬🇧",
  Belgium: "🇧🇪",
  Hungary: "🇭🇺",
  Netherlands: "🇳🇱",
  Azerbaijan: "🇦🇿",
  Singapore: "🇸🇬",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Qatar: "🇶🇦",
  UAE: "🇦🇪",
  "United Arab Emirates": "🇦🇪",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Portugal: "🇵🇹",
  Turkey: "🇹🇷",
  Malaysia: "🇲🇾",
}

/** Jolpica circuitId → F1 官网赛道缩略图文件名（media.formula1.com 素材命名）。 */
const F1_TRACK_SLUGS: Record<string, string> = {
  albert_park: "melbourne",
  shanghai: "shanghai",
  suzuka: "suzuka",
  miami: "miami",
  villeneuve: "montreal",
  monaco: "montecarlo",
  catalunya: "catalunya",
  red_bull_ring: "spielberg",
  silverstone: "silverstone",
  spa: "spafrancorchamps",
  hungaroring: "hungaroring",
  zandvoort: "zandvoort",
  monza: "monza",
  madring: "madring",
  baku: "baku",
  sepang: "kualalumpur",
  marina_bay: "singapore",
  americas: "austin",
  rodriguez: "mexicocity",
  interlagos: "interlagos",
  vegas: "lasvegas",
  losail: "lusail",
  yas_marina: "yasmarinacircuit",
}

/** 赛道缩略图：F1 官网当赛季赛道图（黑色描边 SVG，深色底可配合 invert 使用）。 */
export function f1TrackImage(circuitId: string | undefined, season: string | undefined): string | null {
  const slug = circuitId ? F1_TRACK_SLUGS[circuitId] : undefined
  if (!slug) return null
  const year = season || "2026"
  return `https://media.formula1.com/image/upload/c_lfill,w_3392/v1740000001/common/f1/${year}/track/${year}track${slug}blackoutline.svg`
}
